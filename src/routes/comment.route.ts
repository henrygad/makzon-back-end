import { Router } from "express";
import { addComment, deleteComment, editComment, getComment, getComments } from "../controllers/comment.controllers";
import { addCommentValidator, editCommentValidator, getCommentsValidator_queries, getCommentValidator_param } from "../validators/comment.validator";

const router = Router();

router.get("/", getCommentsValidator_queries, getComments);
router.get("/:id", getCommentValidator_param, getComment);
router.post("/", addCommentValidator, addComment);
router.patch("/:id", editCommentValidator, editComment);
router.delete("/:id", getCommentValidator_param, deleteComment);

export default router;
