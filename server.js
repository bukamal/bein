require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./db");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.post("/upload", upload.single("profile_pic"), (req, res) => {
    res.json({ message: "تم رفع الصورة بنجاح!", filename: req.file.filename });
});

io.on("connection", (socket) => {
    console.log("🔵 مستخدم متصل:", socket.id);

    socket.on("sendMessage", async ({ sender_id, receiver_id, message }) => {
        try {
            const newMessage = await pool.query(
                "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *",
                [sender_id, receiver_id, message]
            );

            io.to(receiver_id).emit("newMessage", newMessage.rows[0]);
        } catch (err) {
            console.error(err.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 مستخدم غادر:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
