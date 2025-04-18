import { Router } from "express";
import { addComment, deleteComment, editComment, getComment, getComments } from "../controllers/comment.controllers";
import { addCommentValidator, editCommentValidator, getCommentsValidator_queries, getCommentValidator_param } from "../validators/comment.validator";
import { isAuthenticated } from "../middlewares/auth.middleware";


/* Comment routes. */
const router = Router();

// Puplic comment routes
router.get("/", getCommentsValidator_queries, getComments);
router.get("/:id", getCommentValidator_param, getComment);

// Authorize comment routes
router.post("/", addCommentValidator, isAuthenticated, addComment);
router.patch("/:id", editCommentValidator, isAuthenticated, editComment);
router.delete("/:id", getCommentValidator_param, isAuthenticated, deleteComment);

export default router;
