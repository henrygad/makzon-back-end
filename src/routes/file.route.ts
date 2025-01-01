import { Router } from "express";
import upload from "../config/uploadMedia.config";
import { uploadFile, sendFile, deleteFile, sendFilesInfo } from "../controllers/file.controllers";
import { fileValidate_param, fileValidate_query } from "../validators/file.validator";

const router = Router();

// All File route 
router.get("/?fieldname", fileValidate_query, sendFilesInfo);
router.get("/:fieldname/:filename", fileValidate_param, sendFile);
router.delete("/:folder/:filename", fileValidate_param, deleteFile);
router.post("/image", upload.array("images", 10), uploadFile); // Images
router.post("/video", upload.single("videos"), uploadFile); // Vidoes
router.post("/audio", upload.single("audios"), uploadFile); // Audio
router.post("/doc", upload.single("docs"), uploadFile); // Docs
router.post("/ebook", upload.single("ebooks"), uploadFile); // Ebooks
router.post("/archive", upload.single("archives"), uploadFile); // Archives

export default router;
