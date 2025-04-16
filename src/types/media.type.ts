import mongoose from "mongoose";

/* type mediaProps = {
    _id?:  mongoose.Schema.Types.ObjectId
    uploader: string
    filename: string
    originalname: string
    fieldname: string
    mimetype: string
    size: number
    data: Buffer,
    encoding: string
    destination: string
    path: string
}; */
interface mediaProps {
    uploader: string;
    filename: string;
    originalname: string;
    fieldname: string;
    mimetype: string;
    size: number;
    data: Buffer;
    encoding: string;
    destination: string;
    path: string;
}

export interface frontEndMediaProps {
    _id: mongoose.Schema.Types.ObjectId,
    filename: string;
    fieldname: string;
    mimetype: string;
    size: number;
    uploader: string
}
export default mediaProps;
