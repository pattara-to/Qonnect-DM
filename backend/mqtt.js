const mqtt = require("mqtt");
const mysql = require("mysql2/promise");
const line = require("./line");

const client = mqtt.connect("mqtt://localhost:1883");
const topic = "#";

let conn = null;

const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "TestOne",
        database: "device_manager",
    });
};

client.on("connect", async () => {
    await initMySQL();
    console.log("Connected to broker.");
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${topic}`);
        } else {
            console.error(`Failed to subscribe: ${err}`);
        }
    });
});

client.on("message", async (topic, message) => {
    try {
        const messageStr = message.toString();
        console.log(`Received message on topic ${topic}: ${messageStr}`);

        const [uboxName, type] = topic.split("/");

        if (type === "status") {
            const mac = messageStr.split(" ")[1].slice(4, 21);
            await handleDeviceStatus(uboxName, mac);
        } else if (type === "DI") {
            const io = messageStr.slice(3, 7);
            const io_status = invertIOStatus(io);
            await handleIOStatus(uboxName, io_status);
        }
    } catch (err) {
        console.error(`Error processing message: ${err}`);
    }
});

client.on("error", (err) => {
    console.error(`Connection error: ${err}`);
});

const invertIOStatus = (io) => {
    return io
        .split("")
        .map((char) => (char === "0" ? "1" : "0"))
        .join("");
};

const handleDeviceStatus = async (uboxName, mac) => {
    try {
        const [device] = await conn.query("SELECT UboxName FROM devices_status WHERE UboxName = ?", [uboxName]);

        if (device.length === 0) {
            await conn.query("INSERT INTO devices_status (UboxName, mac) VALUES (?, ?)", [uboxName, mac]);
        } else {
            await conn.query("UPDATE devices_status SET mac = ? WHERE UboxName = ?", [mac, uboxName]);
        }
    } catch (err) {
        console.error(`Error updating device status: ${err}`);
    }
};

const handleIOStatus = async (uboxName, io_status) => {
    try {
        const [device] = await conn.query("SELECT mac FROM devices_status WHERE UboxName = ?", [uboxName]);

        if (device.length > 0) {
            const mac = device[0].mac;

            await conn.query(
                `
                UPDATE devices_status 
                SET status = 1, io_status = ?, LastestTime = NOW() 
                WHERE UboxName = ?`,
                [io_status, uboxName]
            );

            await checkIOAlerts(mac, io_status);
        }
    } catch (err) {
        console.error(`Error updating IO status: ${err}`);
    }
};

const checkIOAlerts = async (mac, io_status) => {
    try {
        const [alerts] = await conn.query("SELECT AlertStatus, AlertMessage, UserID FROM devices_alert WHERE mac = ?", [mac]);

        for (const alert of alerts) {
            if (alert.AlertStatus === io_status) {
                const [users] = await conn.query("SELECT LineToken FROM users WHERE ID = ?", [alert.UserID]);
                if (users.length > 0) {
                    await line.callLineApi(users[0].LineToken, alert.AlertMessage);
                }
            }
        }
    } catch (err) {
        console.error(`Error checking IO alerts: ${err}`);
    }
};

const CHECK_INTERVAL = 10000; // Check every 10 seconds
const DISCONNECT_THRESHOLD = 120000; // 2 minute in milliseconds

setInterval(async () => {
    const currentTime = new Date();

    const [results] = await conn.query("SELECT status, StatusID, LastestTime FROM devices_status");

    results.forEach(async (status) => {
        const timeDifference = currentTime - new Date(status.LastestTime);
        if (timeDifference > DISCONNECT_THRESHOLD) {
            await conn.query("UPDATE devices_status SET status = 0 WHERE StatusID = ?", status.StatusID);
        } else {
            await conn.query("UPDATE devices_status SET status = 1 WHERE StatusID = ?", status.StatusID);
        }
    });
}, CHECK_INTERVAL);
