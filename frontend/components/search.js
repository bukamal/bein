import { useState } from "react";
import axios from "axios";
import UserCard from "../components/UserCard";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchUsers = async () => {
        if (query.trim() === "") return;

        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(`http://localhost:5000/users/search?query=${query}`);
            setUsers(res.data);
        } catch (err) {
            setError("حدث خطأ أثناء البحث. حاول مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">🔍 البحث عن مستخدمين</h1>
            
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="ادخل اسم المستخدم أو البريد الإلكتروني..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                />
                <button onClick={searchUsers} className="bg-blue-500 text-white p-2 rounded">بحث</button>
            </div>

            {loading && <p className="text-gray-400 mt-4">جاري البحث...</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}

            <div className="mt-4 space-y-2">
                {users.length > 0 ? (
                    users.map((user) => <UserCard key={user.id} user={user} />)
                ) : (
                    <p className="text-gray-400 mt-4">لا توجد نتائج.</p>
                )}
            </div>
        </div>
    );
}
