import Link from "next/link";

export default function UserCard({ user }) {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex items-center justify-between">
            <div>
                <h2 className="text-lg font-bold">{user.username}</h2>
                <p className="text-gray-400">{user.email}</p>
            </div>
            <Link href={`/profile/${user.id}`} className="bg-blue-500 text-white p-2 rounded">عرض الملف</Link>
        </div>
    );
}
