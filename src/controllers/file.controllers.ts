import { NextFunction, Request, Response } from "express";
import Files from "../models/file.model";
import createError from "../utils/error";
import path from "path";
import acceptedFiles from "../utils/fileFromat";
import fs from "fs";

// Send files info
export const sendFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fieldname = "" } = req.query;
        let files = null;

        if (fieldname) {
             files = await Files.find({fieldname});
        } else { 
            files = await Files.find();
        };
        
        if (!files.length) createError({ statusCode: 404, message: "No files found" });

        res.status(200).json({ 
            message: "Fetch successfully",
            success: true,
            data: files
         });

    } catch (error) {
        next(error);
    }
};
// Send single file
export const sendFile = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fieldname, filename } = req.params;

        // The request file info
        const fileExt = path.extname(filename).toLocaleLowerCase();
        const fileContentType = acceptedFiles[fileExt as keyof typeof acceptedFiles] || "application/octet-stream";
        const filePath = path.join(__dirname, "..", "assets", fieldname, filename);

        // Check if file exist
        if (!fs.existsSync(filePath)) createError({ statusCode: 404, message: "File not found" });

        res.setHeader("Content-Type", fileContentType);
        res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
};
// Upload file
export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.file || req.files);
        if (!req.file && !req.files?.length) createError({ statusCode: 400, message: "No file uploaded" });
        const getFiles = req.file || req.files;
        const files = new Files({ ...getFiles, uploader: "henry" });
        await files.save();

        res.status(201).json({
            message: "Successfuly uploader file",
            success: true,
            data: { ...files }
        });
    } catch (error) {
        next(error);
    }
};
// Delete file
export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fieldname, filename } = req.params;
        const filePath = path.join(__dirname, "..", "assets", fieldname, filename);

        // Check if file exist
        if (!fs.existsSync(filePath)) createError({ statusCode: 404, message: "File not found" });
        const file = await Files.findOneAndDelete({filename});
        if (!file) createError({ statusCode: 404, message: "File not found" });

        fs.unlink(filePath, (err) => {
            if (err) {
                return next(createError({ statusCode: 404, message: err.message}));
            }
            
            res.status(200).json({
                message: "File deleted successfully",
                success: true
            });
        });
        
    } catch (error) {
        next(error);
    }
};
