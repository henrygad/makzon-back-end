"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.editComment = exports.addComment = exports.getComment = exports.getComments = void 0;
const comment_model_1 = __importDefault(require("../models/comment.model"));
const error_1 = __importDefault(require("../utils/error"));
const decode_1 = require("../utils/decode");
const express_validator_1 = require("express-validator");
// Get all comments
const getComments = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { author, postId, replyId, skip, limit, updatedAt } = req.query;
        const filterBytime = updatedAt === "1" ? 1 : -1;
        const fillterCommentBy = ({ author, postId, replyId, }) => {
            if (author && postId && replyId) {
                return { author, postId, replyId };
            }
            else if (author && postId) {
                return { author, postId };
            }
            else if (author && replyId) {
                return { author, replyId };
            }
            else if (postId && replyId) {
                return { postId, replyId };
            }
            else if (author || postId || replyId) {
                return { author, postId, replyId };
            }
            else {
                return {};
            }
        };
        const comments = await comment_model_1.default.find(fillterCommentBy({ author, postId, replyId }))
            .skip(skip ? Number(skip) : 0)
            .limit(limit ? Number(limit) : 0)
            .sort({ updatedAt: filterBytime });
        if (!comments)
            (0, error_1.default)({ message: "Comments not found", statusCode: 404 });
        res.status(200).json({
            message: "Comments found",
            data: comments.map((comment) => ({
                ...comment,
                body: {
                    _html: (0, decode_1.decodeHtmlEntities)(comment.body._html),
                    text: comment.body.text,
                },
            })),
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getComments = getComments;
// Get single comment
const getComment = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const comment = await comment_model_1.default.findById(id);
        if (!comment)
            (0, error_1.default)({ message: "Comment not found", statusCode: 404 });
        res.status(200).json({
            message: "Comment found",
            data: {
                ...comment,
                body: {
                    _html: (0, decode_1.decodeHtmlEntities)(comment?.body._html || ""),
                    text: comment?.body.text,
                },
            },
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getComment = getComment;
// Add new comment
const addComment = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const user = req.user;
        const { postId, replyId = null, body, url_leading_to_comment_parent, replingTo, } = req.body;
        let comment = new comment_model_1.default({
            postId,
            replyId: replyId || null,
            author: user.userName,
            body,
            url_leading_to_comment_parent,
            replingTo,
        });
        comment = await comment.save();
        if (!comment)
            (0, error_1.default)({ message: "Comment not saved", statusCode: 500 });
        res.status(201).json({
            message: "Comment added",
            data: {
                ...comment,
                body: {
                    _html: (0, decode_1.decodeHtmlEntities)(comment.body._html),
                    text: comment.body.text,
                },
            },
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addComment = addComment;
// Edit comment
const editComment = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const { body, likes } = req.body;
        const comment = await comment_model_1.default.findByIdAndUpdate(id, {
            body,
            likes,
        }, { new: true });
        if (!comment)
            (0, error_1.default)({ message: "Comment not found", statusCode: 404 });
        res.status(200).json({
            message: "Comment edited",
            data: {
                ...comment,
                body: {
                    _html: (0, decode_1.decodeHtmlEntities)(comment?.body._html || ""),
                    text: comment?.body.text,
                },
            },
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.editComment = editComment;
// Delete comment
const deleteComment = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const comment = await comment_model_1.default.findByIdAndDelete(id);
        if (!comment)
            (0, error_1.default)({ message: "Comment not found", statusCode: 404 });
        res.status(200).json({
            message: "Comment deleted",
            data: comment,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteComment = deleteComment;
