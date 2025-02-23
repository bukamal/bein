import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Home() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            router.push("/chat");
        } catch (err) {
            console.error("❌ خطأ في تسجيل الدخول:", err.response?.data?.error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6">🚀 تسجيل الدخول</h1>
            <form onSubmit={handleLogin} className="w-1/3 bg-gray-800 p-6 rounded-lg shadow-md">
                <input
                    type="email"
                    placeholder="📧 البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="🔑 كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                    required
                />
                <button type="submit" className="w-full bg-blue-500 p-2 rounded">تسجيل الدخول</button>
            </form>
        </div>
    );
}
