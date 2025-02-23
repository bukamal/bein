const express = require("express");
const pool = require("../db");
const router = express.Router();

// ✅ جلب جميع الرسائل بين مستخدمين
router.get("/:sender_id/:receiver_id", async (req, res) => {
    const { sender_id, receiver_id } = req.params;

    try {
        const messages = await pool.query(
            "SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC",
            [sender_id, receiver_id]
        );
        res.json(messages.rows);
    } catch (err) {
        console.error("❌ خطأ في جلب الرسائل:", err.message);
        res.status(500).json({ error: "فشل في جلب الرسائل." });
    }
});

// ✅ إرسال رسالة جديدة
router.post("/", async (req, res) => {
    const { sender_id, receiver_id, message } = req.body;

    try {
        const newMessage = await pool.query(
            "INSERT INTO messages (sender_id, receiver_id, message, is_read) VALUES ($1, $2, $3, FALSE) RETURNING *",
            [sender_id, receiver_id, message]
        );

        res.json(newMessage.rows[0]);
    } catch (err) {
        console.error("❌ خطأ في إرسال الرسالة:", err.message);
        res.status(500).json({ error: "فشل في إرسال الرسالة." });
    }
});

// ✅ تحديث حالة الرسائل كمقروءة
router.post("/mark-as-read", async (req, res) => {
    const { sender_id, receiver_id } = req.body;

    try {
        await pool.query(
            "UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2",
            [sender_id, receiver_id]
        );

        await pool.query("UPDATE users SET unread_count = 0 WHERE id = $1", [receiver_id]);

        res.json({ message: "✅ تم تحديث الرسائل كمقروءة" });
    } catch (err) {
        console.error("❌ خطأ في تحديث حالة القراءة:", err.message);
        res.status(500).json({ error: "❌ حدث خطأ أثناء تحديث القراءة" });
    }
});

module.exports = router;
