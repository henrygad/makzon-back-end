import { Router } from "express";
import upload from "../config/uploadMedia.config";
import {uploadFile, sendFile, deleteFile, sendFiles} from "../controllers/file.controllers";

const router = Router();

// All File route 
router.get("?fieldname", sendFiles);
router.get("/:fieldname/:filename", sendFile);
router.delete("/:folder/:filename", deleteFile);
router.post("/image", upload.array("images", 10), uploadFile); // Images
router.post("/vidoe", upload.single("vidoes"), uploadFile); // Vidoes
router.post("/audio", upload.single("audios"), uploadFile); // Audio
router.post("/doc", upload.single("docs"), uploadFile); // Docs
router.post("/ebook", upload.single("ebooks"), uploadFile); // Ebooks
router.post("/archive", upload.single("archives"), uploadFile); // Archives

export default router;
