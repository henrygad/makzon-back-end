import { body, param, query } from "express-validator";

export const getCommentsValidator_queries = [
  query("author").optional().isString().withMessage("Author must be a string").escape(),
    query("postId").optional().isMongoId().withMessage("PostId must be a mongoId").escape(),
    query("replyId").optional().isMongoId().withMessage("ReplyId must be a mongoId").escape(),
    query("skip").optional().isNumeric().withMessage("Skip must be a number").escape(),
    query("limit").optional().isNumeric().withMessage("Limit must be a number").escape(),
    query("updatedAt").optional().isString().withMessage("UpdatedAt must be a string").escape(),
];
export const getCommentValidator_param = [
  param("id").isMongoId().withMessage("Id must be a mongoId").escape(),
];
export const addCommentValidator = [
    body("postId").isMongoId().withMessage("PostId must be a mongoId").escape(),
    body("replyId").isMongoId().withMessage("ReplyId must be a mongoId").escape(),
    body("body").isObject().withMessage("Body must be an object"),
    body("body.text").isString().withMessage("Body.text must be a string").escape(),
    body("body._html").isString().withMessage("Body._html must be a string").escape(),
    body("url_leading_to_comment_parent").isString().withMessage("url_leading_to_comment_parent must be a string").escape(),
    body("replingTo").isString().withMessage("ReplingTo must be a string").escape(),
];
export const editCommentValidator = [
    param("id").isMongoId().withMessage("Id must be a mongoId").escape(),
    body("body").isObject().withMessage("Body must be an object"),
    body("body.text").isString().withMessage("Body.text must be a string").escape(),
    body("body._html").isString().withMessage("Body._html must be a string").escape(),
    body("likes").isArray().withMessage("Likes must be an array"),
    body("likes.*").isString().withMessage("Likes must be a string").escape(),
];
