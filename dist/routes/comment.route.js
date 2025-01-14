"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controllers_1 = require("../controllers/comment.controllers");
const comment_validator_1 = require("../validators/comment.validator");
const router = (0, express_1.Router)();
router.get("/", comment_validator_1.getCommentsValidator_queries, comment_controllers_1.getComments);
router.get("/:id", comment_validator_1.getCommentValidator_param, comment_controllers_1.getComment);
router.post("/", comment_validator_1.addCommentValidator, comment_controllers_1.addComment);
router.patch("/:id", comment_validator_1.editCommentValidator, comment_controllers_1.editComment);
router.delete("/:id", comment_validator_1.getCommentValidator_param, comment_controllers_1.deleteComment);
exports.default = router;
