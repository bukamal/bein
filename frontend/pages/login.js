import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await axios.post("http://localhost:5000/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            router.push("/profile");
        } catch (err) {
            setError("فشل تسجيل الدخول. تحقق من بياناتك.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-white text-2xl font-bold mb-4 text-center">تسجيل الدخول</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleLogin} className="flex flex-col">
                    <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-2 bg-gray-700 text-white rounded" />
                    <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 bg-gray-700 text-white rounded" />
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">تسجيل الدخول</button>
                </form>
            </div>
        </div>
    );
}
