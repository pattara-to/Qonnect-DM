const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mysql = require("mysql2/promise");
const session = require("express-session");
const cookieParser = require("cookie-parser");
var fs = require("fs");
const path = require("path");

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({
    storage: storage,
});

const { PrismaClient } = require("@prisma/client");
const { cos } = require("three/tsl");
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: ["http://localhost:5173", "http://localhost:80"],
    })
);

const port = 8081;
const secret = "ptonyisreal";

const getImage = (imageName) => {
    try {
        if (!imageName) {
            return null;
        }

        const imagePath = path.join(__dirname, "./uploads/", imageName);

        if (!fs.existsSync(imagePath)) {
            return null; // File not found
        }

        const data = fs.readFileSync(imagePath); // Read file synchronously
        const ext = path.extname(imageName).toLowerCase();

        const mimeType =
            ext === ".png"
                ? "image/png"
                : ext === ".jpg" || ext === ".jpeg"
                ? "image/jpeg"
                : ext === ".gif"
                ? "image/gif"
                : "application/octet-stream";

        return `data:${mimeType};base64,${data.toString("base64")}`;
    } catch (err) {
        console.error("Error reading image:", err);
        return null;
    }
};

function deleteImage(filename) {
    const filePath = path.join(__dirname, "uploads", filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
        }
    });
}

app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await prisma.users.create({
        data: {
            email,
            password: hash,
        },
    });
    res.send("Register Successfully");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.users.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        return res.status(400).send("Wrong Email");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(400).send("Wrong Email or Password");
    }
    const token = jwt.sign({ email, user_id: user.id, role: "admin" }, secret, { expiresIn: "1h" });

    res.json({
        message: "Login Successfully",
        token,
        isOk: true,
    });
});

app.get("/user", async (req, res) => {
    try {
        const user = isLogin(req);
        if (!user) {
            throw { message: "Auth Fail" };
        }
        const result = await prisma.users.findUnique({
            where: {
                id: user.user_id,
            },
        });
        result.imageName = result.image;
        result.image = getImage(result.image);
        res.send(result);
    } catch (error) {
        console.log("error", error);
        res.status(401).send("Session Expired");
    }
});

app.post("/edit-user", upload.single("image"), async (req, res) => {
    try {
        const { email, username, company, phone, address, lineToken, imageName } = JSON.parse(req.body.data);
        const user = isLogin(req);
        if (!user) {
            throw { message: "Auth Fail" };
        }
        if (req.file.filename) {
            await prisma.users.update({
                data: {
                    email,
                    username,
                    company,
                    phone,
                    address,
                    image: req.file.filename,
                },
                where: {
                    id: Number(user.user_id),
                },
            });
            deleteImage(imageName);
        } else {
            await prisma.users.update({
                data: {
                    email,
                    username,
                    company,
                    phone,
                    address,
                },
                where: {
                    id: user.userID,
                },
            });
        }
        res.send("Edit User Successfully");
    } catch (error) {
        console.error("Error in /edit-user:", error);
        res.status(500).send("An error occurred");
    }
});

app.post("/edit-linetoken", async (req, res) => {
    // try {
    //     const { lineToken } = req.body;
    //     const user = isLogin(req);
    //     if (!user) {
    //         throw { message: "Auth Fail" };
    //     }
    //     await conn.query("UPDATE users SET LineToken = ? WHERE ID = ?", [lineToken, user.userID]);
    //     conn.release();
    // } catch (error) {
    //     console.log("error", error);
    // }
});

app.post("/reset-password", async (req, res) => {
    try {
        const { pass } = req.body;
        const user = isLogin(req);
        if (!user) {
            throw { message: "Auth Fail" };
        }
        const hash = await bcrypt.hash(pass, 10);
        await prisma.users.update({
            data: {
                password,
            },
            where: {
                id: user.userID,
            },
        });
        res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
        console.log("error", error);
        res.status(500).send({ message: "An error occurred" });
    }
});

app.get("/devices", async (req, res) => {
    try {
        const user = isLogin(req);
        if (!user) {
            return res.status(401).send("Authentication Failed");
        }
        const result = await prisma.devices.findMany({
            where: { user_id: user.userID },
        });

        result.forEach((device) => {
            device.image = getImage(device.image);
        });
        res.send(result);
    } catch (error) {
        console.log("error", error);
    }
});

app.get("/device/:id", async (req, res) => {
    try {
        const user = isLogin(req);
        if (!user) {
            return res.status(401).send("Authentication Failed");
        }
        const result = await prisma.devices.findUnique({
            where: {
                id: Number(req.params.id),
            },
        });
        result.imageName = result.image;
        result.image = getImage(result.image);
        res.json(result);
    } catch (error) {
        console.log("error", error);
    }
});

app.post("/devices", upload.single("image"), async (req, res) => {
    try {
        const user = isLogin(req);
        if (!user) {
            return res.status(401).send("Authentication Failed");
        }
        const { name, mac, location, description } = JSON.parse(req.body.data);
        const role = req.body.role || "User";
        await prisma.devices.create({
            data: {
                name,
                mac,
                location,
                description,
                user_id: user.user_id,
                status: false,
                io_status: "0000",
                image: req.file.filename,
            },
        });
        res.status(201).send("Insert Device Successfully");
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.send("Duplicate mac");
        }
        console.error("Error in /devices:", error);
        res.status(500).send("An internal server error occurred");
    }
});

app.post("/edit-device/:id", upload.single("image"), async (req, res) => {
    const { name, mac, location, description, imageName } = JSON.parse(req.body.data);
    try {
        if (req.file.filename) {
            await prisma.devices.update({
                data: {
                    name,
                    mac,
                    location,
                    description,
                    image: req.file.filename,
                },
                where: { id: Number(req.params.id) },
            });
            deleteImage(imageName);
        } else {
            await prisma.devices.update({
                data: {
                    name,
                    mac,
                    location,
                    description,
                },
                where: { id: Number(req.params.id) },
            });
        }
        res.send("Edit Device Successfully");
    } catch (error) {
        console.error("Error editing device:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.send("Duplicate Mac");
        } else {
            res.status(401).send("Session Expired");
        }
    }
});

app.post("/remove-device/:id", async (req, res) => {
    try {
        await prisma.devices.delete({
            where: {
                id: Number(req.params.id),
            },
        });
        await prisma.alerts.deleteMany({
            where: {
                device_id: Number(req.params.id),
            },
        });
        res.send("Remove Device Successfully");
    } catch (error) {
        console.log("error", error);
    }
});

app.get("/alerts/:id", async (req, res) => {
    const result = await prisma.alerts.findMany({
        where: {
            device_id: Number(req.params.id),
        },
    });
    res.send(result);
});

app.post("/alerts", async (req, res) => {
    try {
        const user = isLogin(req);
        if (!user) {
            throw { message: "Auth Fail" };
        }
        const { status, message, device_id, mac } = req.body;
        await prisma.alerts.create({
            data: {
                status,
                message,
                device_id,
                mac,
            },
        });
        res.send("Insert Alert Successfully");
    } catch (error) {
        console.log("error", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.send("Duplicate Alert");
        } else {
            res.status(401).send("Session Expired");
        }
    }
});

app.post("/edit-alert/:id", async (req, res) => {
    const { status, message } = req.body;
    try {
        await prisma.alerts.update({
            data: {
                status,
                message,
            },
            where: {
                id: Number(req.params.id),
            },
        });
        res.send("Edit Alert Succesfully");
    } catch (error) {
        console.log("error", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.send("Duplicate Alert");
        } else {
            res.status(401).send("Session Expired");
        }
    }
});

app.post("/remove-alert/:id", async (req, res) => {
    await prisma.alerts.delete({
        where: {
            id: Number(req.params.id),
        },
    });
    res.send("Remove Alert Successfully");
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

app.listen(port, async () => {
    console.log("run at" + port);
});
