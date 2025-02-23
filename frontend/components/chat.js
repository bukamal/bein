import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // الاتصال بالسيرفر الخلفي

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const senderId = 1; // **يجب استبداله بالمستخدم الحقيقي**
    const receiverId = 2; // **يجب استبداله بالمستخدم الحقيقي**

    useEffect(() => {
        socket.on("newMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.off("newMessage");
    }, []);

    const sendMessage = () => {
        if (message.trim() === "") return;

        socket.emit("sendMessage", { sender_id: senderId, receiver_id: receiverId, message });

        setMessages((prev) => [...prev, { sender_id: senderId, message }]); // تحديث الرسائل محليًا
        setMessage("");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-white text-2xl font-bold mb-4 text-center">💬 الدردشة</h2>

                <div className="messages bg-gray-700 p-4 h-64 overflow-y-auto rounded-lg">
                    {messages.map((msg, index) => (
                        <p key={index} className={`mb-2 p-2 rounded ${msg.sender_id === senderId ? "bg-blue-500 text-white self-end" : "bg-gray-500 text-white self-start"}`}>
                            {msg.message}
                        </p>
                    ))}
                </div>

                <div className="flex mt-4">
                    <input
                        type="text"
                        placeholder="اكتب رسالتك..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                    <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white p-2 rounded">إرسال</button>
                </div>
            </div>
        </div>
    );
}
