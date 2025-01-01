import mongoose from "mongoose";


type imageUser = {
    _id: mongoose.ObjectId
    fieldname: string
    originalname: string
    encoding: string
    mimetype:  string
    destination: string
    filename: string
    path: string
    size: number
    upLoader: string
};


export default imageUser;