"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fileFromat_1 = __importDefault(require("../utils/fileFromat"));
const error_1 = __importDefault(require("../utils/error"));
// Config media storage
const storage = multer_1.default.diskStorage({
    destination(_, file, callback) {
        let folderName = "";
        // RegEx for files types
        const fileType_images = /jpeg|jpg|png|gif/;
        const fileType_videos = /mp4|avi|mkv|webm|mov/;
        const fileType_audios = /mp3|wav|flac|aac|ogg|m4a|wma|amr/;
        const fileType_docs = /pdf|docx|doc|txt/;
        const fileType_ebooks = /epub|mobi/;
        const fileType_archives = /zip|rar/;
        // Logic to determine file destination
        if (fileType_images.test(path_1.default.extname(file.originalname).toLowerCase())) {
            folderName = "images";
        }
        else if (fileType_videos.test(path_1.default.extname(file.originalname).toLowerCase())) {
            folderName = "videos";
        }
        else if (fileType_docs.test(path_1.default.extname(file.originalname).toLowerCase())) {
            folderName = "docs";
        }
        else if (fileType_ebooks.test(path_1.default.extname(file.originalname).toLowerCase())) {
            folderName = "ebooks";
        }
        else if (fileType_archives.test(path_1.default.extname(file.originalname).toLowerCase())) {
            folderName = "archives";
        }
        else if (fileType_audios.test(path_1.default.extname(file.originalname).toLowerCase())) {
            folderName = "audios";
        }
        callback(null, path_1.default.join(__dirname, "..", "assets", folderName));
    },
    filename(_, file, callback) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}${path_1.default.extname(file.originalname)}`;
        callback(null, filename);
    },
});
// Filter file and create new instanceof multer
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
    fileFilter(_, file, callback) {
        // Validate file
        const fileExt = path_1.default.extname(file.originalname).toLocaleLowerCase();
        const accepted_ext = fileFromat_1.default[fileExt]; // Validate the file extention
        const accepted_mimeType = accepted_ext === file.mimetype; // Validate the file mime type
        if (!accepted_mimeType)
            callback((0, error_1.default)({ statusCode: 415, message: "Unsupported file type" }), false);
        callback(null, true);
    },
});
exports.default = upload;
