import { body } from "express-validator";

export const userValidate_body_update = [
    body([
        "name.familyName",
        "name.givenName",
        "dateOfBirth",
        "displayPhoneNumber",
        "website",
        "country",
        "sex",
        "bio",
    ])
        .optional()
        .trim()
        .isString().withMessage("Field must be a string")
        .escape(),

    body("displayEmail")
        .trim()
        .isEmail()
        .withMessage("Email must be a valid email address")
        .normalizeEmail(),

    body("displayDateOfBirth")
        .optional()
        .isBoolean().withMessage("Field must be a boolean"),

    body(["profession", "interest"])
        .optional()
        .isArray().withMessage("Field must be an array"),
    
    body(["profession.*", "interest.*"])
        .optional()
        .isString().withMessage("Each items must be a string"),
];

export const userValidate_body_delete = [
    body("password")
        .trim()
        .escape()
];