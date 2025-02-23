import { toast } from "react-toastify";

export const showNotification = (message, sender) => {
    toast.info(`💬 رسالة جديدة من ${sender}: ${message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
};
