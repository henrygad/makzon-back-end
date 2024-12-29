import mongoose, { Schema , Document, Model} from "mongoose";
import imageProps from "../@types/image.types";

export interface IImage extends imageProps, Document<Schema.Types.ObjectId> { 

};

const ImageSchema = new Schema({
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

const Images: Model<IImage> = mongoose.models.images ||
    mongoose.model<IImage>("images", ImageSchema);

export default Images;