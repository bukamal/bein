export default function UnreadBadge({ unreadCount }) {
    return (
        unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
            </span>
        )
    );
}
