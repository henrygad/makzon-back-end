import multer from "multer";
import path from "path";

// Storage for local files
export const fileStorage = multer.diskStorage({
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
    if (fileType_images.test(path.extname(file.originalname).toLowerCase())) {
      folderName = "images";
    } else if (
      fileType_videos.test(path.extname(file.originalname).toLowerCase())
    ) {
      folderName = "videos";
    } else if (
      fileType_docs.test(path.extname(file.originalname).toLowerCase())
    ) {
      folderName = "docs";
    } else if (
      fileType_ebooks.test(path.extname(file.originalname).toLowerCase())
    ) {
      folderName = "ebooks";
    } else if (
      fileType_archives.test(path.extname(file.originalname).toLowerCase())
    ) {
      folderName = "archives";
    } else if (
      fileType_audios.test(path.extname(file.originalname).toLowerCase())
    ) {
      folderName = "audios";
    }

    callback(null, path.join(__dirname, "..", "assets", folderName));
  },
  filename(_, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${path.extname(file.originalname)}`;
    callback(null, filename);
  },
});

// Memory storage 
export const keepInMemoryStorage = multer.memoryStorage();