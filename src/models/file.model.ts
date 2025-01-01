import mongoose, { Schema, Document, Model } from "mongoose";
import fileProps from "../@types/file.types";

export interface IFile extends fileProps, Document<Schema.Types.ObjectId> {

};

const FileSchema = new Schema({
    fieldname: String,
    originalname: String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    path: String,
    size: Number,
    upLoader: String,
});

const Files: Model<IFile> = mongoose.models.images ||
    mongoose.model<IFile>("files", FileSchema);

export default Files;