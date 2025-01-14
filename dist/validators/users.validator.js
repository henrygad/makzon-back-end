"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followUserValidator = exports.savesUserValidator = exports.deleteUserValidator = exports.editUserValidator = exports.userValidatorParam = exports.userValidatorQueries = void 0;
const express_validator_1 = require("express-validator");
exports.userValidatorQueries = [
    (0, express_validator_1.query)(["skip", "limit"]).optional().trim().isNumeric().withMessage("Skip, Limit must be a number").escape(),
];
exports.userValidatorParam = [
    (0, express_validator_1.param)("userName")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape()
];
exports.editUserValidator = [
    (0, express_validator_1.body)("name").optional().isObject().withMessage("Name must be an object"),
    (0, express_validator_1.body)("name.familyName").optional().trim().isString().withMessage("Family name Field must be a string").escape(),
    (0, express_validator_1.body)("name.givenName").optional().trim().isString().withMessage("Given name must be a string").escape(),
    (0, express_validator_1.body)("dateOfBirth").optional().trim().isDate().withMessage("Date of birth must be a valid date").escape(),
    (0, express_validator_1.body)("displayDateOfBirth").optional().trim().isBoolean().withMessage("Field must be a boolean"),
    (0, express_validator_1.body)("displayEmail").optional().trim().isEmail().withMessage("Email must be a valid email address").escape(),
    (0, express_validator_1.body)("displayPhoneNumber").optional().trim().isMobilePhone("any").withMessage("Phone number must be a valid phone number").escape(),
    (0, express_validator_1.body)("website").optional().trim().isString().withMessage("displayDateOfBirth must be a string").escape(),
    (0, express_validator_1.body)("profession").optional().isArray().withMessage("Profession must be an array"),
    (0, express_validator_1.body)("profession.*").isString().withMessage("Each items must be a string").escape(),
    (0, express_validator_1.body)("country").optional().trim().isString().withMessage("Country must be a string").escape(),
    (0, express_validator_1.body)("sex").optional().trim().isString().withMessage("Sex must be a string").escape(),
    (0, express_validator_1.body)("bio").optional().trim().isString().withMessage("Bio must be a string").escape(),
];
exports.deleteUserValidator = [
    (0, express_validator_1.body)("password")
        .trim()
        .isString().withMessage("Password must be a string")
        .escape()
];
exports.savesUserValidator = [
    (0, express_validator_1.body)("save")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape()
];
exports.followUserValidator = [
    (0, express_validator_1.body)("userName")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape()
];
