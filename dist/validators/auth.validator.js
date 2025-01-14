"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidator_changeEmail = exports.authValidator_changeEmail_request = exports.authValidator_changePassword = exports.authValidator_resetPassword = exports.authValidator_varification_query = exports.authValidator_varification_body = exports.authValidator_login = exports.authValidator_register = void 0;
const express_validator_1 = require("express-validator");
exports.authValidator_register = [
    (0, express_validator_1.body)("userName")
        .trim()
        .isString().withMessage("Username must be a string").withMessage("Field must be a string")
        .isLength({ min: 5 }).withMessage("Username must be at least 5 characters long.")
        .toLowerCase()
        .escape(),
    (0, express_validator_1.body)("email")
        .trim()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .toLowerCase()
        .escape(),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&#^]/).withMessage("Password must contain at least one special character")
        .isStrongPassword().withMessage("Password must meet all strength requirements")
        .escape()
];
exports.authValidator_login = [
    (0, express_validator_1.body)("userName")
        .trim()
        .escape(),
    (0, express_validator_1.body)("password")
        .trim()
        .escape()
];
exports.authValidator_varification_body = [
    (0, express_validator_1.body)("email")
        .trim()
        .isString().withMessage("Field must be a string")
        .toLowerCase()
        .escape(),
];
exports.authValidator_varification_query = [
    (0, express_validator_1.query)("email")
        .trim()
        .isString().withMessage("Field must be a string")
        .toLowerCase()
        .escape(),
    (0, express_validator_1.query)("otp")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape(),
];
exports.authValidator_resetPassword = [
    (0, express_validator_1.body)("email")
        .trim()
        .toLowerCase()
        .escape(),
    (0, express_validator_1.body)("newPassword")
        .trim()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&#^]/).withMessage("Password must contain at least one special character")
        .isStrongPassword().withMessage("Password must meet all strength requirements")
        .escape()
];
exports.authValidator_changePassword = [
    (0, express_validator_1.body)("oldPassword")
        .trim()
        .escape(),
    (0, express_validator_1.body)("newPassword")
        .trim()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&#^]/).withMessage("Password must contain at least one special character")
        .isStrongPassword().withMessage("Password must meet all strength requirements")
        .escape()
];
exports.authValidator_changeEmail_request = [
    (0, express_validator_1.body)("newEmail")
        .trim()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .toLowerCase()
        .escape()
];
exports.authValidator_changeEmail = [
    (0, express_validator_1.body)("newEmail")
        .trim()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .toLowerCase()
        .escape(),
    (0, express_validator_1.body)("otp")
        .trim().
        isString().withMessage("Field must be a string")
        .escape()
];
