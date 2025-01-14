"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFile = exports.sendFile = exports.sendFilesInfo = void 0;
const file_model_1 = __importDefault(require("../models/file.model"));
const error_1 = __importDefault(require("../utils/error"));
const path_1 = __importDefault(require("path"));
const fileFromat_1 = __importDefault(require("../utils/fileFromat"));
const fs_1 = __importDefault(require("fs"));
// Send files info from db
const sendFilesInfo = async (req, res, next) => {
    try {
        const { fieldname = "" } = req.query;
        let files = null;
        if (fieldname) {
            files = await file_model_1.default.find({ fieldname });
        }
        else {
            files = await file_model_1.default.find();
        }
        ;
        if (!files.length)
            (0, error_1.default)({ statusCode: 404, message: "No files found" });
        res.status(200).json({
            message: "Fetch successfully",
            success: true,
            data: files
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendFilesInfo = sendFilesInfo;
// Stream single file
const sendFile = (req, res, next) => {
    try {
        const { fieldname, filename } = req.params;
        // The requested file path
        const filePath = path_1.default.join(__dirname, "..", "assets", fieldname, filename);
        if (!fs_1.default.existsSync(filePath))
            (0, error_1.default)({ statusCode: 404, message: "File path not found" }); // Check if file exist
        // The requested file info
        const fileExt = path_1.default.extname(filename).toLocaleLowerCase();
        const fileContentType = fileFromat_1.default[fileExt] || "application/octet-stream";
        const fileStat = fs_1.default.statSync(filePath);
        const fileSize = fileStat.size;
        const fileRequestedRange = req.headers.range;
        if (!fileRequestedRange) { //  Stream all file size to client            
            res.writeHead(200, {
                "Content-Type": fileContentType,
                "content-length": fileSize,
            });
            fs_1.default.createReadStream(filePath).pipe(res);
        }
        else { // Stream partialy
            // Validate file requested range
            const parts = fileRequestedRange.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            if (start >= fileSize || end >= fileSize)
                (0, error_1.default)({ statusCode: 416, message: "Requested range not satisfiable" });
            const chunkSize = end - start + 1;
            res.writeHead(206, {
                "Content-Type": fileContentType,
                "Content-Length": chunkSize,
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
            });
            fs_1.default.createReadStream(filePath, { start, end }).pipe(res);
        }
        ;
    }
    catch (error) {
        next(error);
    }
};
exports.sendFile = sendFile;
// Upload file
const uploadFile = async (req, res, next) => {
    try {
        if (!req.file && !req.files?.length)
            (0, error_1.default)({ statusCode: 400, message: "No file uploaded" });
        const getFiles = req.file || req.files;
        const files = new file_model_1.default({ ...getFiles, uploader: "henry" });
        await files.save();
        res.status(201).json({
            message: "Successfuly uploader file",
            success: true,
            data: { ...getFiles }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadFile = uploadFile;
// Delete file
const deleteFile = async (req, res, next) => {
    try {
        const { fieldname, filename } = req.params;
        const filePath = path_1.default.join(__dirname, "..", "assets", fieldname, filename);
        // Check if file exist
        if (!fs_1.default.existsSync(filePath))
            (0, error_1.default)({ statusCode: 404, message: "File not found" });
        const file = await file_model_1.default.findOneAndDelete({ filename });
        if (!file)
            (0, error_1.default)({ statusCode: 404, message: "File not found" });
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                return next((0, error_1.default)({ statusCode: 404, message: err.message }));
            }
            res.status(200).json({
                message: "File deleted successfully",
                success: true
            });
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFile = deleteFile;
