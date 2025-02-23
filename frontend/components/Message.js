export default function Message({ msg, userId }) {
    return (
        <div className={`p-2 my-2 rounded-lg max-w-xs ${msg.sender_id === userId ? "bg-blue-500 text-white self-end" : "bg-gray-700 text-white self-start"}`}>
            <p className="text-sm">{msg.sender_id === userId ? "أنت" : `مستخدم ${msg.sender_id}`}</p>
            <p className="text-lg">{msg.message}</p>
        </div>
    );
}
