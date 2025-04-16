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
router.post("/", isAuthenticated,  uploadMedia.single("media"), storeMediaToDB, sendMedia); // Images
router.delete("/:filename", fileValidate_param, isAuthenticated, deleteMedia);

export default router;