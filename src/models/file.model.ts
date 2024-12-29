import mongoose, { Schema , Document, Model} from "mongoose";
import fileProps from "../@types/file.types";

export interface IFile extends fileProps, Document<Schema.Types.ObjectId> { 

};

const FileSchema = new Schema({
    buffer: Buffer,
    mimetype: String,
    originalname: String,
    fileName: String,
    size: Number,
    fieldname: String,
    path: String,
    stream: ReadableStream,
    destination: String,
    encoding: String,
    upLoader: String
});

const Files: Model<IFile> = mongoose.models.images ||
    mongoose.model<IFile>("files", FileSchema);

export default Files;