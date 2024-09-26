const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mysql = require("mysql2/promise");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);

const port = 8000;
const secret = "ptonyisreal";
let conn = null;

const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "device_manager",
  });
};

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await conn.query(
    `INSERT INTO users (email, password) 
        VALUES ("${email}", "${hash}")`
  );
  res.send("Register Successfully");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [result] = await conn.query(
    "SELECT id, password from users WHERE email = ?",
    email
  );
  if (result.length == 0) {
    return res.status(400).send("Wrong Email");
  }
  const match = await bcrypt.compare(password, result[0].password);
  if (!match) {
    return res.status(400).send("Wrong Email or Password");
  }
  const token = jwt.sign(
    { email, userID: result[0].id, role: "admin" },
    secret,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login Successfully",
    token,
    isOk: match,
  });
});

app.get("/user", async (req, res) => {
  try {
    const user = isLogin(req);
    if (!user) {
      throw { message: "Auth Fail" };
    }
    const [result] = await conn.query(
      `SELECT * FROM users WHERE ID = ${user.userID}`
    );
    res.send(result[0]);
  } catch (error) {
    console.log("error", error);
    res.status(401).send("Session Expired");
  }
});

app.post("/edit-user", async (req, res) => {
  try {
    const { email, username, company, phone, address, lineToken, ProfilePic } =
      req.body;
    const user = isLogin(req);
    const query = ProfilePic
      ? "UPDATE users SET Email = ?, Username = ?, Company = ?, Phone = ?, Address = ?, ProfilePic = ? WHERE ID = ?"
      : "UPDATE users SET Email = ?, Username = ?, Company = ?, Phone = ?, Address = ? WHERE ID = ?";

    const params = ProfilePic
      ? [email, username, company, phone, address, ProfilePic, user.userID]
      : [email, username, company, phone, address, user.userID];

    await conn.query(query, params);
    res.send("Edit User Successfully");
  } catch (error) {
    console.error("Error in /edit-user:", error);
    res.status(500).send("An error occurred");
  }
});

app.post("/edit-linetoken", async (req, res) => {
  try {
    const { lineToken } = req.body;
    const user = isLogin(req);
    if (!user) {
      throw { message: "Auth Fail" };
    }
    await conn.query("UPDATE users SET LineToken = ? WHERE ID = ?", [
      lineToken,
      user.userID,
    ]);
  } catch (error) {
    console.log("error", error);
  }
});

app.get("/devices", async (req, res) => {
  try {
    const user = isLogin(req);
    if (!user) {
      throw { message: "Auth Fail" };
    }
    const [result] = await conn.query(
      `SELECT DeviceID, Name, devices.MAC, Location, Status, IOStatus, Description,MachinePic FROM devices
            LEFT JOIN devices_status
            ON devices.MAC = devices_status.MAC
            LEFT JOIN users
            ON devices.UserID = users.id
            WHERE email = "${user.email}"`
    );
    res.send(result);
  } catch (error) {
    console.log("error", error);
    res.status(401).send("Session Expired");
  }
});

app.get("/device/:id", async (req, res) => {
  try {
    const user = isLogin(req);
    if (!user) {
      throw { message: "Auth Fail" };
    }
    const [result] = await conn.query(
      `SELECT DeviceID, Name, devices.MAC, Location, MachinePic, 
                    Status, IOStatus, Description 
             FROM devices
             LEFT JOIN devices_status
               ON devices.MAC = devices_status.MAC
             LEFT JOIN users
               ON devices.UserID = users.id
             WHERE DeviceID = ?`,
      [req.params.id]
    );
    if (result.length === 0) {
      return res.status(404).send("Device not found");
    }
    res.json(result[0]);
  } catch (error) {
    console.log("error", error);
    res.status(401).send(error.message || "Session Expired");
  }
});

app.post("/devices", async (req, res) => {
  try {
    const user = isLogin(req);
    if (!user) {
      return res.status(401).send("Authentication Failed");
    }

    const { name, MAC, location, description, MachinePic } = req.body;
    const role = req.body.role || "User";

    let query = `INSERT INTO devices (Name, MAC, Location, Role, Description, UserID`;
    let params = [name, MAC, location, role, description, user.userID];

    if (MachinePic) {
      query += `, MachinePic) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      params.push(MachinePic);
    } else {
      query += `) VALUES (?, ?, ?, ?, ?, ?)`;
    }

    await conn.query(query, params);
    const statusQuery = `INSERT INTO devices_status (Status, IOStatus, MAC) VALUES (?, ?, ?)`;
    const statusParams = [false, "0000", MAC];
    await conn.query(statusQuery, statusParams);
    res.status(201).send("Insert Device Successfully");
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.send("Duplicate MAC");
    }
    console.error("Error in /devices:", error);
    res.status(500).send("An internal server error occurred");
  }
});

app.post("/edit-device/:id", async (req, res) => {
  const { name, MAC, location, description, MachinePic } = req.body;
  const { id } = req.params;
  try {
    let query = `UPDATE devices SET Name = ?, MAC = ?, Description = ?, Location = ?`;
    const params = [name, MAC, description, location];
    if (MachinePic) {
      query += `, MachinePic = ?`;
      params.push(MachinePic);
    }
    query += ` WHERE DeviceID = ?;`;
    params.push(id);
    await conn.query(query, params);
    res.send("Edit Device Successfully");
  } catch (error) {
    console.error("Error editing device:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/remove-device/:id", async (req, res) => {
  try {
    await conn.query(
      `DELETE FROM devices_alert
            WHERE DeviceID = ${req.params.id};`
    );
    await conn.query(
      `DELETE FROM devices
            WHERE DeviceID = ${req.params.id};`
    );
    res.send("Remove Device Successfully");
  } catch (error) {
    console.log("error", error);
  }
});

app.get("/alerts/:id", async (req, res) => {
  const [result] = await conn.query(
    `SELECT AlertID, AlertStatus, AlertMessage FROM devices_alert
        WHERE DeviceID = ${req.params.id}`
  );
  res.send(result);
});

app.post("/alerts", async (req, res) => {
  try {
    const user = isLogin(req);
    if (!user) {
      throw { message: "Auth Fail" };
    }
    const { alertStatus, alertMessage, deviceID, MAC } = req.body;
    await conn.query(
      `INSERT INTO devices_alert (AlertStatus, AlertMessage, DeviceID, MAC, UserID) 
            VALUES (?, ?, ?, ?, ?)`,
      [alertStatus, alertMessage, deviceID, MAC, user.userID]
    );
    res.send("Insert Alert Successfully");
  } catch (error) {
    console.log("error", error);
    res.status(401).send("Session Expired");
  }
});

app.post("/edit-alert/:id", async (req, res) => {
  const { alertStatus, alertMessage } = req.body;
  await conn.query(
    `UPDATE devices_alert SET AlertStatus = "${alertStatus}", 
        AlertMessage = "${alertMessage}"
        WHERE AlertID = ${req.params.id};`
  );
  res.send("Edit Alert Succesfully");
});

app.post("/remove-alert/:id", async (req, res) => {
  await conn.query(
    `DELETE FROM devices_alert
        WHERE AlertID = ${req.params.id};`
  );
  res.send("Remove Alert Successfully");
});

app.listen(port, async () => {
  await initMySQL();
  console.log("run at" + port);
});

const isLogin = (req) => {
  const authHeader = req.headers["authorization"];
  let authToken = "";
  if (authHeader) {
    authToken = authHeader.split(" ")[1];
  }
  const user = jwt.verify(authToken, secret);

  if (authToken) {
    return user;
  } else {
    return null;
  }
};
