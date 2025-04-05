import mongoose, { Schema, Document, Model } from "mongoose";
import mediaProps from "../types/media.type";

export interface IMedia extends mediaProps, Document<Schema.Types.ObjectId> {
};

const mediaSchema = new Schema({
    uploader: { type: String, require: [true, "Must provide a uploader name"] },
    filename: { type: String, unique: [true, "filename alread exist"], require: [true, "Must provide a filename"] },
    originalname: String,
    fieldname: String,
    mimetype: { type: String, require: [true, "Must provide a mimetype"] },
    size: Number,
    data: { type: Buffer, require: [true, "Must provide a media raw data"] },   
    encoding: String,
    destination: String,
    path: String,
}, { timestamps: true });

const Media: Model<IMedia> = mongoose.models.files ||
    mongoose.model<IMedia>("media", mediaSchema);

export default Media;