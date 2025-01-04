import mongoose, { Schema, Document, Model } from "mongoose";
import fileProps from "../types/file.type";

export interface IFile extends fileProps, Document<Schema.Types.ObjectId> {
};

const FileSchema = new Schema({
    upLoader: { type: String, require: [true, "Must provide a uploader name"] },
    fieldname: { type: String, require: [true, "Must provide a fieldname"] },
    filename: { type: String, require: [true, "Must provide a filename"] },
    originalname: String,
    encoding: String,
    mimetype: String,
    destination: String,
    path: String,
    size: Number,
}, { timestamps: true });

const Files: Model<IFile> = mongoose.models.files ||
    mongoose.model<IFile>("files", FileSchema);

export default Files;