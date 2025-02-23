import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("❌ كلمة المرور غير متطابقة!");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await axios.post("http://localhost:5000/auth/register", {
                username,
                email,
                password,
            });

            console.log("✅ تسجيل ناجح:", res.data);
            router.push("/login"); // إعادة توجيه إلى صفحة تسجيل الدخول بعد النجاح
        } catch (err) {
            setError(err.response?.data?.error || "❌ حدث خطأ أثناء التسجيل!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">🔹 إنشاء حساب جديد</h2>

                {error && <p className="text-red-500">{error}</p>}

                <input
                    type="text"
                    placeholder="اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
                />

                <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
                />

                <input
                    type="password"
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
                />

                <input
                    type="password"
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
                />

                <button
                    onClick={handleRegister}
                    className="w-full bg-blue-500 text-white p-2 mt-4 rounded"
                    disabled={loading}
                >
                    {loading ? "⏳ جاري التسجيل..." : "✅ تسجيل"}
                </button>
            </div>
        </div>
    );
}
