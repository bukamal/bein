const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db");

// تحميل المتغيرات من `.env`
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // دعم JSON للطلبات

// ✅ التحقق من الاتصال بقاعدة البيانات
pool.connect()
    .then(() => console.log("✅ Connected to PostgreSQL"))
    .catch(err => console.error("❌ Database connection error:", err.message));

// ✅ استيراد المسارات
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

// ✅ استخدام المسارات
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

// ✅ التحقق من عمل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
