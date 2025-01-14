"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileValidate_param = exports.fileValidate_query = void 0;
const express_validator_1 = require("express-validator");
const fileValidate_query = [
    (0, express_validator_1.query)("fieldname")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape(),
];
exports.fileValidate_query = fileValidate_query;
const fileValidate_param = [
    (0, express_validator_1.param)(["fieldname", "filename"])
        .trim()
        .isString().withMessage("fieldname, filename must be a string")
        .escape(),
];
exports.fileValidate_param = fileValidate_param;
