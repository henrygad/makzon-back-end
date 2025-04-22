import mongoose from "mongoose";

type notificationProps = {
    _id: mongoose.Schema.Types.ObjectId,
    type: string
    message: string
    options?: unknown
    url: string
    from: string
    to: string
    checked: boolean
    targetTitle?: string
};

export default notificationProps;
