import { useRouter } from "next/router";
import Link from "next/link";
import { HomeIcon, ChatBubbleLeftEllipsisIcon, BellIcon, MagnifyingGlassIcon, UserIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
    const router = useRouter();

    const navItems = [
        { href: "/chat", icon: <HomeIcon className="h-6 w-6" />, label: "الرئيسية" },
        { href: "/messages", icon: <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />, label: "الرسائل" },
        { href: "/notifications", icon: <BellIcon className="h-6 w-6" />, label: "الإشعارات" },
        { href: "/search", icon: <MagnifyingGlassIcon className="h-6 w-6" />, label: "البحث" },
        { href: "/profile", icon: <UserIcon className="h-6 w-6" />, label: "الملف الشخصي" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-black border-b border-gray-800 shadow-md flex items-center justify-between px-6 py-3">
            {/* الشعار */}
            <div className="text-white text-xl font-bold">𝕏</div>

            {/* روابط التنقل */}
            <ul className="flex space-x-6">
                {navItems.map(({ href, icon, label }) => (
                    <li key={href}>
                        <Link href={href} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition 
                        ${router.pathname === href ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}>
                            {icon} <span className="hidden sm:inline">{label}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            {/* زر تسجيل الخروج */}
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white">
                <ArrowLeftOnRectangleIcon className="h-6 w-6" /> <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
        </nav>
    );
}
