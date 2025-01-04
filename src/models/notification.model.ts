import mongoose, { Schema, Document, Model } from "mongoose";
import notificationProps from "../types/notification.type";

export interface INotification extends notificationProps, Document<Schema.Types.ObjectId> {
};

const notificationSchema = new Schema({
    type: String,
    message: String,
    url: { type: String, unique: [true, "Must provide a notification url"] },
    from: String,
    checked: Boolean,
}, { timestamps: true });

const Notifications: Model<INotification> = mongoose.models.notifications ||
    mongoose.model<INotification>("notifications", notificationSchema);

export default Notifications;
