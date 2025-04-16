import { body, param, query } from "express-validator";

export const getPostsValidator = [
    query(["author", "status", "catigory", "updatedAt"]).optional().trim().isString().withMessage("author, status, catigory, updatedAt, must all be a string").escape(),
    query(["skip", "limit"]).optional().trim().isNumeric().withMessage("Skip, Limit must be a number").escape(),
];
export const validatePostParam = [
    param("author").isString().withMessage("Author name must be a string").escape(),
    param("slug").isString().withMessage("Blogpost slug must be a string").escape(),
];
export const validatePostId = [
    param("id").isMongoId().withMessage("Invalid post id").escape(),
];
export const validatePostQueries = [
    query(["skip", "limit"]).optional().trim().isNumeric().withMessage("Skip, Limit must be a number").escape(),
];
export const addPostValidator = [
    body("publishedId").optional().isMongoId().withMessage("Invalid post id").escape(),
    body("image").optional().trim().isString().withMessage("Image must be a string").escape(),
    body("title").optional().trim().isString().withMessage("Title must be a string").escape(),
    body("body").optional().trim().isString().withMessage("Body must be a string").escape(),
    body("_html").optional().isObject().withMessage("HTML must be an object").escape(),
    body("_html.title").optional().trim().isString().withMessage("HTML title must be a string").escape(),
    body("_html.body").optional().trim().isString().withMessage("HTML body must be a string").escape(),
    body("slug").trim().isString().withMessage("Slug must be a string").escape(),
    body("catigories").optional().isArray().withMessage("Catigories must be an array"),
    body("catigories.*").isString().withMessage("Catigories must be a string").escape(),
    body("mentions").optional().isArray().withMessage("Mentions must be an array"),
    body("mentions.*").isString().withMessage("Mentions must be a string").escape(),
];
export const editPostValidator = [
    param("id").isMongoId().withMessage("Invalid post id").escape(),
    body("publishedId").optional().isMongoId().withMessage("Invalid post id").escape(),
    body("image").optional().trim().isString().withMessage("Image must be a string").escape(),
    body("title").optional().trim().isString().withMessage("Title must be a string").escape(),
    body("body").optional().trim().isString().withMessage("Body must be a string").escape(),
    body("_html").optional().isObject().withMessage("HTML must be an object"),
    body("_html.title").optional().trim().isString().withMessage("HTML title must be a string").escape(),
    body("_html.body").optional().trim().isString().withMessage("HTML body must be a string").escape(),
    body("catigories").optional().isArray().withMessage("Catigories must be an array"),
    body("catigories.*").isString().withMessage("Catigories must be a string").escape(),
    body("mentions").optional().isArray().withMessage("Mentions must be an array"),
    body("mentions.*").isString().withMessage("Mentions must be a string").escape(),    
    body("likes").optional().isArray().withMessage("Likes must be an array"),
    body("likes.*").isString().withMessage("Likes must be a string").escape(),
    body("views").optional().isArray().withMessage("Views must be an array"),
    body("views.*").isString().withMessage("Views must be a string").escape(),
    body("shares").optional().isArray().withMessage("Shares must be an array"),
    body("shares.*").isString().withMessage("Shares must be a string").escape(),
    body("status").optional().trim().isString().withMessage("Status must be a string").escape(),
];
