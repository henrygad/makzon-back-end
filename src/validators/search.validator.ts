import {body, query, param } from "express-validator";

export const searchValidator = [
    query([
        "title",
        "body",
        "catigory",
        "userName",
        "updatedAt"
    ]).optional().trim().isString().withMessage("title, body, catigory, username, updatedAt, must all be a string").escape(),
    query(["skip", "limit"]).optional().trim().isNumeric().withMessage("Skip, Limit must be a number").escape(),
]; 
 
export const searchHistoryValidator_query = [
    body("Searched").trim().isString().withMessage("Searched must be a string").escape(),
];
 
export const searchHistoryValidator_param = [
    param("id").isString().withMessage("Invalid post id").escape(),
];