import mongoose, { Schema } from "mongoose";

const SessionSchema = new Schema({
    expires: Date,
    session: {
        cookie: String,
        originalMaxAge: Number,
        priority: String,
        secure: Boolean,
        httpOnly: Boolean,
        path: String,
        sameSite: String,
        Passport: {
            user: {
                type: Schema.Types.ObjectId,
                ref: "users",
            }
        }
    }
}, { timestamps: true });

const Sessions = mongoose.models.sessions ||
    mongoose.model("sessions", SessionSchema);

export default Sessions;
