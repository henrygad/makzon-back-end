import { Request, Response, NextFunction } from "express";
import upload from "../config/uploadMedia.config";
import createError from "../utils/error";


// Middleware to upload multipart form-data (files)
const uploadMedia = (fieldname: string, max: number, callback: (files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[]; } | undefined) => void = () => null) => {
    return async (req: Request, res: Response, next: NextFunction) =>
        upload.array(fieldname, max)(req, res, async (err) => {
            try {
                if (err) {
                    // Check if File(s) exceeds the file size limit to accept
                    if (err.code === "LIMIT_FILE_SIZE") createError({ statusCode: 400, message: "File size is too large" });
                    createError({ statusCode: 400, message: "An error occurred!" });
                };

                // callback 
                callback(req.files);

                res.status(201).json({
                    message: "File uploaded successfully",
                    files: req.files
                });
            } catch (error) {

                next(error);
            }

        });
};


export default uploadMedia;
