import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useRouter } from "next/router";
import Message from "../components/Message";
import ChatInput from "../components/ChatInput";
import UserList from "../components/UserList";
import { showNotification } from "../components/Notification";

const socket = io("http://localhost:5000");

export default function Messages() {
    const [userId, setUserId] = useState(null);
    const [receiverId, setReceiverId] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchUserId = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/");
                return;
            }

            try {
                const res = await axios.get("http://localhost:5000/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserId(res.data.id);
                socket.emit("userOnline", res.data.id);
            } catch (err) {
                console.error("❌ خطأ في جلب بيانات المستخدم.");
            }
        };

        fetchUserId();
    }, [router]);

    useEffect(() => {
        if (receiverId) {
            fetchMessages();
        }
    }, [receiverId]);

    useEffect(() => {
        socket.on("newMessage", (newMsg) => {
            if (newMsg.sender_id === receiverId || newMsg.receiver_id === receiverId) {
                setMessages((prev) => [...prev, newMsg]);
            }

            if (newMsg.sender_id !== userId) {
                showNotification(newMsg.message, newMsg.sender_id);
            }
        });

        socket.on("updateUsers", (updatedUsers) => {
            setUsers(updatedUsers);
        });

        return () => {
            socket.off("newMessage");
            socket.off("updateUsers");
        };
    }, [receiverId, userId]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/messages/${userId}/${receiverId}`);
            setMessages(res.data);

            // تحديث الرسائل كمقروءة
            await axios.post("http://localhost:5000/messages/mark-as-read", {
                sender_id: receiverId,
                receiver_id: userId,
            });
        } catch (err) {
            console.error("❌ خطأ في جلب الرسائل:", err.message);
        }
    };

    const sendMessage = async (message, file) => {
        if (!message && !file) return;
        const newMsg = { sender_id: userId, receiver_id: receiverId, message };
        socket.emit("sendMessage", newMsg);
    };

    return (
        <div className="flex">
            <UserList users={users} setReceiverId={setReceiverId} />

            <div className="w-3/4 p-6 bg-gray-900 text-white min-h-screen">
                <h1 className="text-2xl font-bold mb-4">💬 الدردشة الفورية</h1>

                {receiverId ? (
                    <>
                        <div className="h-80 overflow-y-auto bg-gray-800 p-4 rounded">
                            {messages.map((msg, index) => (
                                <Message key={index} msg={msg} userId={userId} />
                            ))}
                        </div>
                        <ChatInput sendMessage={sendMessage} />
                    </>
                ) : (
                    <p className="text-gray-400">اختر مستخدمًا لبدء الدردشة.</p>
                )}
            </div>
        </div>
    );
}
