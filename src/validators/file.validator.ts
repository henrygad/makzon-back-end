import { query, param } from "express-validator";

const fileValidate_query = [
    query("fieldname")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape(),
];
const fileValidate_param = [
    param(["fieldname","filename"])
        .trim()
        .isString().withMessage("Fields must be a string")
        .escape(),
];

export { 
    fileValidate_query,
    fileValidate_param
};