import "../styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import axios from "axios";

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/");
                return;
            }

            try {
                await axios.get("http://localhost:5000/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (err) {
                if (err.response?.data?.error === "jwt expired") {
                    alert("⚠️ انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.");
                    localStorage.removeItem("token");
                    router.push("/");
                }
            }
        };

        checkAuth();
    }, [router]);

    return (
        <>
            <Navbar />
            <div className="mt-14"> {/* لضمان عدم تداخل المحتوى مع شريط التنقل */}
                <Component {...pageProps} />
            </div>
            <ToastContainer />
        </>
    );
}

export default MyApp;
