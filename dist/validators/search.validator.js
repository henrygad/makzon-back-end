"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchHistoryValidator_param = exports.searchHistoryValidator_query = exports.searchValidator = void 0;
const express_validator_1 = require("express-validator");
exports.searchValidator = [
    (0, express_validator_1.query)([
        "title",
        "body",
        "catigory",
        "userName",
        "updatedAt"
    ]).optional().trim().isString().withMessage("title, body, catigory, username, updatedAt, must all be a string").escape(),
    (0, express_validator_1.query)(["skip", "limit"]).optional().trim().isNumeric().withMessage("Skip, Limit must be a number").escape(),
];
exports.searchHistoryValidator_query = [
    (0, express_validator_1.body)("Searched").trim().isString().withMessage("Searched must be a string").escape(),
];
exports.searchHistoryValidator_param = [
    (0, express_validator_1.param)("id").isString().withMessage("Invalid post id").escape(),
];
