import { useState, useEffect } from "react";
import axios from "axios";

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/users/search?query=${query}`);
                setResults(res.data);
            } catch (err) {
                console.error("❌ خطأ في البحث عن المستخدمين:", err.response?.data?.error || err.message);
            }
            setLoading(false);
        };

        const delayDebounce = setTimeout(fetchResults, 500); // تأخير البحث أثناء الكتابة
        return () => clearTimeout(delayDebounce); // تنظيف `setTimeout` عند تحديث الإدخال
    }, [query]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6">🔍 البحث عن المستخدمين</h1>
            <input
                type="text"
                placeholder="📝 اكتب اسم المستخدم..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-1/3 p-2 mb-4 bg-gray-700 text-white rounded"
            />
            {loading && <p className="text-gray-400">جاري البحث...</p>}

            <div className="w-1/3">
                {results.length > 0 ? (
                    results.map((user) => (
                        <div key={user.id} className="p-4 bg-gray-800 rounded mb-2 flex justify-between items-center">
                            <p className="text-lg">{user.username}</p>
                            <span className={`text-sm px-2 py-1 rounded ${user.is_online ? "bg-green-500" : "bg-red-500"}`}>
                                {user.is_online ? "🟢 متصل" : "🔴 غير متصل"}
                            </span>
                        </div>
                    ))
                ) : (
                    query.length > 1 && !loading && <p className="text-gray-400">لم يتم العثور على مستخدمين.</p>
                )}
            </div>
        </div>
    );
}
