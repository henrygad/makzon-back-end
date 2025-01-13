import { Router } from "express";
import { addDraft, deleteDraft, editDraft, getDraft, getDrafts } from "../controllers/draft.controllers";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { addPostValidator, editPostValidator, validatePostParam } from "../validators/post.validator";


const router = Router();

// Draft routes
router.get("/", isAuthenticated, getDrafts);
router.get("/:id", validatePostParam, isAuthenticated, getDraft);
router.post("/", addPostValidator, isAuthenticated, addDraft);
router.patch("/:id", editPostValidator, isAuthenticated, editDraft);
router.delete("/:id", validatePostParam, isAuthenticated, deleteDraft);

export default router;