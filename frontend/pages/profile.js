import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get("http://localhost:5000/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser(res.data);
                setUsername(res.data.username);
                setEmail(res.data.email);
                setAvatar(res.data.avatar || "/default-avatar.png"); // صورة افتراضية
            } catch (err) {
                console.error("❌ خطأ في جلب بيانات المستخدم.");
            }
        };

        fetchUser();
    }, []);

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/users/${user.id}`, { username, email });
            alert("✅ تم تحديث البيانات بنجاح!");
        } catch (err) {
            console.error("❌ خطأ في تحديث البيانات:", err.message);
        }
        setLoading(false);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const res = await axios.post(`http://localhost:5000/users/${user.id}/avatar`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setAvatar(res.data.avatar);
            alert("✅ تم تحديث الصورة الشخصية!");
        } catch (err) {
            console.error("❌ خطأ في رفع الصورة:", err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6">👤 الملف الشخصي</h1>

            {user ? (
                <div className="w-1/3 bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    {/* الصورة الشخصية */}
                    <img 
                        src={avatar} 
                        alt="الصورة الشخصية" 
                        className="w-24 h-24 mx-auto rounded-full mb-4 border border-gray-700"
                    />

                    {/* رفع صورة جديدة */}
                    <label className="text-sm text-gray-400 cursor-pointer">
                        🖼️ تغيير الصورة الشخصية
                        <input type="file" onChange={handleAvatarUpload} className="hidden" />
                    </label>

                    {/* تعديل الاسم */}
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 my-2 bg-gray-700 text-white rounded"
                    />

                    {/* تعديل البريد الإلكتروني */}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 my-2 bg-gray-700 text-white rounded"
                    />

                    {/* زر الحفظ */}
                    <button
                        onClick={handleUpdateProfile}
                        className="w-full bg-blue-500 p-2 rounded mt-2"
                        disabled={loading}
                    >
                        {loading ? "⏳ جاري التحديث..." : "حفظ التعديلات"}
                    </button>
                </div>
            ) : (
                <p className="text-gray-400">جاري تحميل البيانات...</p>
            )}
        </div>
    );
}
