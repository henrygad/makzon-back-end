"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editCommentValidator = exports.addCommentValidator = exports.getCommentValidator_param = exports.getCommentsValidator_queries = void 0;
const express_validator_1 = require("express-validator");
exports.getCommentsValidator_queries = [
    (0, express_validator_1.query)("author").optional().isString().withMessage("Author must be a string").escape(),
    (0, express_validator_1.query)("postId").optional().isMongoId().withMessage("PostId must be a mongoId").escape(),
    (0, express_validator_1.query)("replyId").optional().isMongoId().withMessage("ReplyId must be a mongoId").escape(),
    (0, express_validator_1.query)("skip").optional().isNumeric().withMessage("Skip must be a number").escape(),
    (0, express_validator_1.query)("limit").optional().isNumeric().withMessage("Limit must be a number").escape(),
    (0, express_validator_1.query)("updatedAt").optional().isString().withMessage("UpdatedAt must be a string").escape(),
];
exports.getCommentValidator_param = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Id must be a mongoId").escape(),
];
exports.addCommentValidator = [
    (0, express_validator_1.body)("postId").isMongoId().withMessage("PostId must be a mongoId").escape(),
    (0, express_validator_1.body)("replyId").isMongoId().withMessage("ReplyId must be a mongoId").escape(),
    (0, express_validator_1.body)("body").isObject().withMessage("Body must be an object"),
    (0, express_validator_1.body)("body.text").isString().withMessage("Body.text must be a string").escape(),
    (0, express_validator_1.body)("body._html").isString().withMessage("Body._html must be a string").escape(),
    (0, express_validator_1.body)("url_leading_to_comment_parent").isString().withMessage("url_leading_to_comment_parent must be a string").escape(),
    (0, express_validator_1.body)("replingTo").isString().withMessage("ReplingTo must be a string").escape(),
];
exports.editCommentValidator = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Id must be a mongoId").escape(),
    (0, express_validator_1.body)("body").isObject().withMessage("Body must be an object"),
    (0, express_validator_1.body)("body.text").isString().withMessage("Body.text must be a string").escape(),
    (0, express_validator_1.body)("body._html").isString().withMessage("Body._html must be a string").escape(),
    (0, express_validator_1.body)("likes").isArray().withMessage("Likes must be an array"),
    (0, express_validator_1.body)("likes.*").isString().withMessage("Likes must be a string").escape(),
];
