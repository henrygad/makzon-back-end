import mongoose from "mongoose";


type imageUser = {
    _id: mongoose.ObjectId
    buffer: Buffer<ArrayBufferLike>
    mimetype:  string
    originalname: string
    filename: string
    size: number
    fieldname: string
    path: string
    stream: ReadableStream
    destination: string
    encoding: string
    upLoader: string
    
};

export default imageUser;