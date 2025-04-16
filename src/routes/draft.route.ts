import { Router } from "express";
import { addDraft, deleteDraft, editDraft, getDraft, getDrafts } from "../controllers/draft.controllers";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { addPostValidator, editPostValidator, validatePostId } from "../validators/post.validator";
import uploadMedia from "../middlewares/uploadMedia.config";


const router = Router();

// Draft routes
router.get("/", isAuthenticated, getDrafts);
router.get("/:id", validatePostId, isAuthenticated, getDraft);
router.post("/", addPostValidator, isAuthenticated,uploadMedia.single("post"), addDraft);
router.patch("/:id", editPostValidator, isAuthenticated, uploadMedia.single("post"), editDraft);
router.delete("/:id", validatePostId, isAuthenticated, deleteDraft);

export default router;