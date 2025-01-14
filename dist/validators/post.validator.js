"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPostValidator = exports.addPostValidator = exports.validatePostQueries = exports.validatePostParam = exports.getPostsValidator = void 0;
const express_validator_1 = require("express-validator");
exports.getPostsValidator = [
    (0, express_validator_1.query)(["author", "status", "catigory", "updatedAt"]).optional().trim().isString().withMessage("author, status, catigory, updatedAt, must all be a string").escape(),
    (0, express_validator_1.query)(["skip", "limit"]).optional().trim().isNumeric().withMessage("Skip, Limit must be a number").escape(),
];
exports.validatePostParam = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid post id").escape(),
];
exports.validatePostQueries = [
    (0, express_validator_1.query)(["skip", "limit"]).optional().trim().isNumeric().withMessage("Skip, Limit must be a number").escape(),
];
exports.addPostValidator = [
    (0, express_validator_1.body)("publishedId").optional().isMongoId().withMessage("Invalid post id").escape(),
    (0, express_validator_1.body)("image").optional().trim().isString().withMessage("Image must be a string").escape(),
    (0, express_validator_1.body)("title").optional().trim().isString().withMessage("Title must be a string").escape(),
    (0, express_validator_1.body)("body").optional().trim().isString().withMessage("Body must be a string").escape(),
    (0, express_validator_1.body)("_html").optional().isObject().withMessage("HTML must be an object").escape(),
    (0, express_validator_1.body)("_html.title").optional().trim().isString().withMessage("HTML title must be a string").escape(),
    (0, express_validator_1.body)("_html.body").optional().trim().isString().withMessage("HTML body must be a string").escape(),
    (0, express_validator_1.body)("slug").trim().isString().withMessage("Slug must be a string").escape(),
    (0, express_validator_1.body)("catigories").optional().isArray().withMessage("Catigories must be an array"),
    (0, express_validator_1.body)("catigories.*").isString().withMessage("Catigories must be a string").escape(),
    (0, express_validator_1.body)("mentions").optional().isArray().withMessage("Mentions must be an array"),
    (0, express_validator_1.body)("mentions.*").isString().withMessage("Mentions must be a string").escape(),
];
exports.editPostValidator = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Invalid post id").escape(),
    (0, express_validator_1.body)("publishedId").optional().isMongoId().withMessage("Invalid post id").escape(),
    (0, express_validator_1.body)("image").optional().trim().isString().withMessage("Image must be a string").escape(),
    (0, express_validator_1.body)("title").optional().trim().isString().withMessage("Title must be a string").escape(),
    (0, express_validator_1.body)("body").optional().trim().isString().withMessage("Body must be a string").escape(),
    (0, express_validator_1.body)("_html").optional().isObject().withMessage("HTML must be an object"),
    (0, express_validator_1.body)("_html.title").optional().trim().isString().withMessage("HTML title must be a string").escape(),
    (0, express_validator_1.body)("_html.body").optional().trim().isString().withMessage("HTML body must be a string").escape(),
    (0, express_validator_1.body)("catigories").optional().isArray().withMessage("Catigories must be an array"),
    (0, express_validator_1.body)("catigories.*").isString().withMessage("Catigories must be a string").escape(),
    (0, express_validator_1.body)("mentions").optional().isArray().withMessage("Mentions must be an array"),
    (0, express_validator_1.body)("mentions.*").isString().withMessage("Mentions must be a string").escape(),
    (0, express_validator_1.body)("likes").optional().isArray().withMessage("Likes must be an array"),
    (0, express_validator_1.body)("likes.*").isString().withMessage("Likes must be a string").escape(),
    (0, express_validator_1.body)("views").optional().isArray().withMessage("Views must be an array"),
    (0, express_validator_1.body)("views.*").isString().withMessage("Views must be a string").escape(),
    (0, express_validator_1.body)("shares").optional().isArray().withMessage("Shares must be an array"),
    (0, express_validator_1.body)("shares.*").isString().withMessage("Shares must be a string").escape(),
    (0, express_validator_1.body)("status").optional().trim().isString().withMessage("Status must be a string").escape(),
];
