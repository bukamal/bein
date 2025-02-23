const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ تسجيل مستخدم جديد
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
            [username, email, hashedPassword]
        );

        const token = generateToken(newUser.rows[0].id);
        res.json({ user: newUser.rows[0], token });
    } catch (err) {
        console.error("❌ خطأ في التسجيل:", err.message);
        res.status(500).json({ error: "حدث خطأ أثناء التسجيل." });
    }
});

// ✅ تسجيل الدخول
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(400).json({ error: "المستخدم غير موجود." });

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) return res.status(400).json({ error: "كلمة المرور غير صحيحة." });

        const token = generateToken(user.rows[0].id);
        res.json({ user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email }, token });
    } catch (err) {
        console.error("❌ خطأ في تسجيل الدخول:", err.message);
        res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول." });
    }
});

// ✅ جلب بيانات المستخدم المصادق عليه
router.get("/me", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "غير مصرح به." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await pool.query("SELECT id, username, email FROM users WHERE id = $1", [decoded.userId]);

        res.json(user.rows[0]);
    } catch (err) {
        console.error("❌ خطأ في جلب المستخدم:", err.message);
        res.status(500).json({ error: "فشل في جلب بيانات المستخدم." });
    }
});

module.exports = router;
