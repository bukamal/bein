import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatBox({ senderId, receiverId }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        socket.on("newMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.off("newMessage");
    }, []);

    const sendMessage = () => {
        socket.emit("sendMessage", { sender_id: senderId, receiver_id: receiverId, message });
        setMessage("");
    };

    return (
        <div className="p-4 bg-gray-900 text-white">
            <h2 className="text-2xl font-bold mb-4">💬 الدردشة</h2>
            <div className="bg-gray-800 p-4 rounded-lg h-64 overflow-y-auto">
                {messages.map((msg, index) => (
                    <p key={index} className="mb-2">{msg.message}</p>
                ))}
            </div>
            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 mt-2 bg-gray-700 text-white rounded"
            />
            <button onClick={sendMessage} className="w-full bg-blue-500 text-white p-2 mt-2 rounded">إرسال</button>
        </div>
    );
}
