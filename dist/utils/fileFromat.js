"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// MIME type
const acceptedFiles = {
    // Image
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    // Videos
    ".mp4": "video/mp4",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    // Audio
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".flac": "audio/flac",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".m4a": "audio/x-m4a",
    ".wma": "audio/x-ms-wma",
    ".amr": "audio/amr",
    // Document
    ".txt": "application/txt",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // Ebook
    ".epub": "application/epub",
    ".mobi": "application/mobi",
    // Folder (e.g zip)
    ".zip": "application/zip",
    ".rar": "application/rar",
};
exports.default = acceptedFiles;
