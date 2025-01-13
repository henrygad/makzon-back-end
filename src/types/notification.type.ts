import mongoose from "mongoose";

type notificationProps = {
    _id: mongoose.Schema.Types.ObjectId,
    type: string,
    message: string,
    url: string,
    from: string,
    to: string
    checked: boolean,
};

export default notificationProps;
