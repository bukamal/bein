const express = require("express");
const pool = require("../db");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// 🔹 إعداد تخزين الصور الشخصية
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });

// ✅ جلب جميع المستخدمين (مرتبة حسب الحالة)
router.get("/", async (req, res) => {
    try {
        const users = await pool.query("SELECT id, username, email, is_online, last_seen, avatar FROM users ORDER BY is_online DESC, last_seen DESC");
        res.json(users.rows);
    } catch (err) {
        console.error("❌ خطأ في جلب المستخدمين:", err.message);
        res.status(500).json({ error: "فشل في جلب قائمة المستخدمين." });
    }
});

// ✅ جلب بيانات مستخدم معين
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await pool.query("SELECT id, username, email, is_online, last_seen, avatar FROM users WHERE id = $1", [id]);
        if (user.rows.length === 0) return res.status(404).json({ error: "المستخدم غير موجود." });

        res.json(user.rows[0]);
    } catch (err) {
        console.error("❌ خطأ في جلب المستخدم:", err.message);
        res.status(500).json({ error: "فشل في جلب بيانات المستخدم." });
    }
});

// ✅ البحث عن المستخدمين
router.get("/search", async (req, res) => {
    const { query } = req.query;

    try {
        const users = await pool.query(
            "SELECT id, username, is_online, avatar FROM users WHERE username ILIKE $1 ORDER BY is_online DESC LIMIT 10",
            [`%${query}%`]
        );
        res.json(users.rows);
    } catch (err) {
        console.error("❌ خطأ في البحث عن المستخدمين:", err.message);
        res.status(500).json({ error: "فشل في البحث عن المستخدمين." });
    }
});

// ✅ تحديث بيانات المستخدم (الاسم والبريد الإلكتروني)
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    try {
        await pool.query("UPDATE users SET username = $1, email = $2 WHERE id = $3", [username, email, id]);
        res.json({ message: "✅ تم تحديث بيانات المستخدم." });
    } catch (err) {
        console.error("❌ خطأ في تحديث المستخدم:", err.message);
        res.status(500).json({ error: "فشل في تحديث بيانات المستخدم." });
    }
});

// ✅ تحديث صورة الملف الشخصي
router.post("/:id/avatar", upload.single("avatar"), async (req, res) => {
    const { id } = req.params;
    const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        if (avatarPath) {
            await pool.query("UPDATE users SET avatar = $1 WHERE id = $2", [avatarPath, id]);
            res.json({ message: "✅ تم تحديث الصورة الشخصية.", avatar: avatarPath });
        } else {
            res.status(400).json({ error: "❌ لم يتم رفع صورة." });
        }
    } catch (err) {
        console.error("❌ خطأ في تحديث الصورة:", err.message);
        res.status(500).json({ error: "فشل في تحديث الصورة الشخصية." });
    }
});

// ✅ تحديث حالة المستخدم عند تسجيل الدخول والخروج
router.post("/status", async (req, res) => {
    const { user_id, is_online } = req.body;

    try {
        await pool.query("UPDATE users SET is_online = $1, last_seen = NOW() WHERE id = $2", [is_online, user_id]);
        res.json({ message: "✅ تم تحديث حالة المستخدم." });
    } catch (err) {
        console.error("❌ خطأ في تحديث حالة المستخدم:", err.message);
        res.status(500).json({ error: "❌ حدث خطأ أثناء تحديث حالة المستخدم." });
    }
});

module.exports = router;
