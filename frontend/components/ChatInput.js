import { useState } from "react";

export default function ChatInput({ sendMessage }) {
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);

    const handleSend = () => {
        if (message.trim() || file) {
            sendMessage(message, file);
            setMessage("");
            setFile(null);
        }
    };

    return (
        <div className="flex mt-4">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-white" />
            <input
                type="text"
                placeholder="📝 اكتب رسالتك..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
            />
            <button onClick={handleSend} className="bg-blue-500 text-white p-2 rounded ml-2">
                إرسال 🚀
            </button>
        </div>
    );
}
