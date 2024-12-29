import { body, query } from "express-validator";

export const authValidate_register = [
    body("userName")
        .trim()
        .isString().withMessage("Username must be a string").withMessage("Field must be a string")
        .isLength({ min: 5 }).withMessage("Username must be at least 5 characters long.")
        .escape(),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .normalizeEmail(),

    body("password")
        .trim()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&#^]/).withMessage("Password must contain at least one special character")
        .isStrongPassword().withMessage("Password must meet all strength requirements")
        .escape()
];

export const authValidate_login = [
    body("userName")
        .trim()
        .escape(),

    body("password")
        .trim()    
        .escape()
];

export const authValidate_varification_body = [
    body("email")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape(),
];

export const authValidate_varification_query = [
    query(["email", "otp"])
        .trim()
        .isString().withMessage("Field must be a string")
        .escape(),
];

export const authValidate_resetPassword = [
    body("email")
        .trim()        
        .escape(),
    
    body("newPassword")
        .trim()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&#^]/).withMessage("Password must contain at least one special character")
        .isStrongPassword().withMessage("Password must meet all strength requirements")
        .escape()
];

export const authValidate_changePassword = [
    body("newPassword")
        .trim()
        .escape(),
    
    body("newPassword")
        .trim()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&#^]/).withMessage("Password must contain at least one special character")
        .isStrongPassword().withMessage("Password must meet all strength requirements")
        .escape()
];

export const authValidate_changeEmail_request = [
    body("newEmail")
        .trim()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .normalizeEmail(),
];

export const authValidate_changeEmail = [
        body(["newEmail","otp"])
        .trim().
        isString().withMessage("Field must be a string")
        .escape()
];