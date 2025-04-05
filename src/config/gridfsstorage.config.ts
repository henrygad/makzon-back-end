
import { GridFsStorage } from "multer-gridfs-storage";
//import mongoose from "mongoose";

const getStorage = new GridFsStorage({
    //db: Promise.resolve(mongoose.connection.db ),
    url: process.env.MONGO_URI!,
    file: (request, file) => {
        return new Promise((resolve, reject) => {
            try {
                const filename = `${Date.now()}-${file.originalname}`;
                const fileInfo = {
                    filename,
                    bucketName: "media",
                    metadata: {
                        fieldname: file.fieldname,
                        originalname: file.originalname,
                        uploader: request.session?.user?.userName || "anonymous",
                    },
                };
                console.log(fileInfo, "fileInfo");
                resolve(fileInfo);
            } catch (err) {
                reject(err);
            }
        });
    },
});

export default getStorage;

