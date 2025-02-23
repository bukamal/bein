export default function UserList({ users, setReceiverId }) {
    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return "غير متصل";
        const lastSeenDate = new Date(lastSeen);
        const now = new Date();
        const diffInMinutes = Math.floor((now - lastSeenDate) / 60000);

        if (diffInMinutes < 1) return "الآن";
        if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
        if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
        return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
    };

    return (
        <div className="w-1/4 bg-gray-800 p-4 min-h-screen">
            <h2 className="text-xl font-semibold mb-4">🟢 المستخدمون المتصلون</h2>
            {users.length > 0 ? (
                users.map((user) => (
                    <div
                        key={user.id}
                        className="flex justify-between p-2 border-b border-gray-600 cursor-pointer hover:bg-gray-700 rounded"
                        onClick={() => setReceiverId(user.id)}
                    >
                        <div>
                            <p>{user.username}</p>
                            <p className="text-gray-400 text-sm">
                                {user.is_online ? "متصل الآن" : `آخر ظهور: ${formatLastSeen(user.last_seen)}`}
                            </p>
                        </div>
                        <p className={`text-sm ${user.is_online ? "text-green-400" : "text-red-400"}`}>
                            {user.is_online ? "🟢 متصل" : "🔴 غير متصل"}
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-gray-400">لا يوجد مستخدمون متصلون الآن</p>
            )}
        </div>
    );
}
