import { query, param } from "express-validator";

const fileValidate_query = [
    query("fieldname")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape(),
];
const fileValidate_param = [
    param("filename")
        .trim()
        .isString().withMessage("_id, _id must be a string")
        .escape(),
];

export { 
    fileValidate_query,
    fileValidate_param
};