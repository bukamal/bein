import { useState, useEffect } from "react";
import axios from "axios";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get("http://localhost:5000/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserId(res.data.id);
                fetchNotifications(res.data.id);
            } catch (err) {
                console.error("❌ خطأ في جلب بيانات المستخدم.");
            }
        };

        fetchUserId();
    }, []);

    const fetchNotifications = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/notifications/${userId}`);
            setNotifications(res.data);
        } catch (err) {
            console.error("❌ خطأ في جلب الإشعارات:", err.message);
        }
    };

    const markAsRead = async () => {
        try {
            await axios.post("http://localhost:5000/notifications/mark-as-read", { user_id: userId });
            setNotifications([]); // تحديث القائمة بعد قراءة الإشعارات
        } catch (err) {
            console.error("❌ خطأ في تحديث الإشعارات:", err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6">🔔 الإشعارات</h1>

            <button onClick={markAsRead} className="mb-4 bg-blue-500 text-white px-4 py-2 rounded">
                تعليم الكل كمقروء
            </button>

            <div className="w-1/3 bg-gray-800 p-6 rounded-lg shadow-md">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div key={notif.id} className="p-3 mb-2 bg-gray-700 rounded">
                            <p><strong>💬 رسالة من:</strong> المستخدم {notif.sender_id}</p>
                            <p>{notif.message}</p>
                            <p className="text-gray-400 text-sm">{new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">لا توجد إشعارات جديدة.</p>
                )}
            </div>
        </div>
    );
}
