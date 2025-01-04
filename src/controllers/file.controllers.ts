import { NextFunction, Request, Response } from "express";
import Files from "../models/file.model";
import createError from "../utils/error";
import path from "path";
import acceptedFiles from "../utils/fileFromat";
import fs from "fs";

// Send files info from db
export const sendFilesInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { fieldname = "" } = req.query;
        let files = null;

        if (fieldname) {
            files = await Files.find({ fieldname });
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
// Stream single file
export const sendFile = (req: Request, res: Response, next: NextFunction) => {
    try {

        const { fieldname, filename } = req.params;
        // The requested file path
        const filePath = path.join(__dirname, "..", "assets", fieldname, filename);
        if (!fs.existsSync(filePath)) createError({ statusCode: 404, message: "File path not found" }); // Check if file exist

        // The requested file info
        const fileExt = path.extname(filename).toLocaleLowerCase();
        const fileContentType = acceptedFiles[fileExt as keyof typeof acceptedFiles] || "application/octet-stream";
        const fileStat = fs.statSync(filePath);
        const fileSize = fileStat.size;
        const fileRequestedRange = req.headers.range;

        if (!fileRequestedRange) {  //  Stream all file size to client            
            res.writeHead(200, {
                "Content-Type": fileContentType,
                "content-length": fileSize,
            });
            fs.createReadStream(filePath).pipe(res);
        } else { // Stream partialy

            // Validate file requested range
            const parts = fileRequestedRange.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            if (start >= fileSize || end >= fileSize) createError({ statusCode: 416, message: "Requested range not satisfiable" });

            const chunkSize = end - start + 1;
            res.writeHead(206, {
                "Content-Type": fileContentType,
                "Content-Length": chunkSize,
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
            });
            fs.createReadStream(filePath, { start, end }).pipe(res);
        };

    } catch (error) {
        next(error);
    }
};
// Upload file
export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.file && !req.files?.length) createError({ statusCode: 400, message: "No file uploaded" });
        const getFiles = req.file || req.files;
        const files = new Files({ ...getFiles, uploader: "henry" });
        await files.save();

        res.status(201).json({
            message: "Successfuly uploader file",
            success: true,
            data: { ...getFiles }
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
        const file = await Files.findOneAndDelete({ filename });
        if (!file) createError({ statusCode: 404, message: "File not found" });

        fs.unlink(filePath, (err) => {
            if (err) {
                return next(createError({ statusCode: 404, message: err.message }));
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
