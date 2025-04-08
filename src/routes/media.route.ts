import { Router } from "express";
import uploadMedia, { storeMediaToDB } from "../middlewares/uploadMedia.config";
import {  deleteMedia, getSingleMedia, getUserMedia, sendMedia } from "../controllers/mediafromdb.controllers";
import { fileValidate_param } from "../validators/media.validator";
import { isAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

// Public route to get single media
router.get("/:filename", fileValidate_param, getSingleMedia);

// Private routes
router.get("/", isAuthenticated, getUserMedia);
router.delete("/:filename", fileValidate_param, isAuthenticated, deleteMedia);
router.post("/image", isAuthenticated,  uploadMedia.single("images"), storeMediaToDB, sendMedia); // Images
router.post("/video", isAuthenticated, uploadMedia.single("videos"), storeMediaToDB, sendMedia); // Vidoes
router.post("/audio", isAuthenticated, uploadMedia.single("audios"), storeMediaToDB, sendMedia); // Audio
router.post("/doc", isAuthenticated, uploadMedia.single("docs"), storeMediaToDB, sendMedia); // Docs
router.post("/ebook", isAuthenticated, uploadMedia.single("ebooks"), storeMediaToDB, sendMedia); // Ebooks
router.post("/archive", isAuthenticated, uploadMedia.single("archives"), storeMediaToDB, sendMedia); // Archives

export default router;
