import mongoose, { Schema, Document, Model } from "mongoose";
import notificationProps from "../types/notification.type";

export interface INotification
  extends notificationProps,
    Document<Schema.Types.ObjectId> {}

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, "Must provide a notification type"],
    },
    message: String,
    url: { type: String, required: [true, "Must provide a notification url"] },
    from: {
      type: String,
      required: [true, "Must provide a notification from"],
    },
    to: { type: String, required: [true, "Must provide a notification to"] },
    checked: {
      type: Boolean,
      default: false,
      required: [true, "Must provide a notification checked"],
    },
  },
  { timestamps: true }
);

const Notifications: Model<INotification> =
  mongoose.models.notifications ||
  mongoose.model<INotification>("notifications", notificationSchema);

export default Notifications;
