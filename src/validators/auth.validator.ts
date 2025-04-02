import { body, query } from "express-validator";

export const authValidator_register = [
    body("userName")
        .trim()
        .isString().withMessage("Username must be a string").withMessage("Field must be a string")
        .isLength({ min: 5 }).withMessage("Username must be at least 5 characters long.")
        .toLowerCase()
        .escape(),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .toLowerCase()
        .escape(),

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
export const authValidator_login = [
    body("identity")
        .trim()
        .escape(),

    body("password")
        .trim()    
        .escape()
];
export const authValidator_varification_body = [
    body("email")
        .trim()
        .isString().withMessage("Field must be a string")
        .toLowerCase()
        .escape(),
];
export const authValidator_varification_query = [
    query("email")
        .trim()
        .isString().withMessage("Field must be a string")
        .toLowerCase()
        .escape(),
    
    query("otp")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape(),
];
export const authValidator_resetPassword = [
    body("email")
        .trim()  
        .toLowerCase()
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
export const authValidator_changePassword = [
    body("oldPassword")
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
export const authValidator_changeEmail_request = [
    body("newEmail")
        .trim()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .toLowerCase()
        .escape()
];
export const authValidator_changeEmail = [
        body("newEmail")
        .trim()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .toLowerCase()
        .escape(),
    
        body("otp")
        .trim().
        isString().withMessage("Field must be a string")
        .escape()
];