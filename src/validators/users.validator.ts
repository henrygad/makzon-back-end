import { body, param, query } from "express-validator";

export const userValidatorQueries = [
    query(["skip", "limit"]).optional().trim().isNumeric().withMessage("Skip, Limit must be a number").escape(),
];
export const userValidatorParam = [
    param("userName")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape()
];
export const editUserValidator = [
    body("name").optional().isObject().withMessage("Name must be an object"),
    body("name.familyName").optional().trim().isString().withMessage("Family name Field must be a string").escape(),
    body("name.givenName").optional().trim().isString().withMessage("Given name must be a string").escape(),
    body("avatar").optional().isString().withMessage("Avaer must be a string"),
    body("dateOfBirth").optional().trim().isString().withMessage("Date of birth must be a string").escape(),
    body("displayDateOfBirth").optional().trim().isBoolean().withMessage("Field must be a boolean"),
    body("displayEmail").optional().trim().isEmail().withMessage("Email must be a valid email address").escape(),
    body("displayPhoneNumber").optional().trim().isString().withMessage("Phone number must be a string").escape(),
    //body("displayPhoneNumber").optional().trim().isMobilePhone("any").withMessage("Phone number must be a valid phone number").escape(),
    body("website").optional().trim().isString().withMessage("displayDateOfBirth must be a string").escape(),
    body("profession").optional().isString().withMessage("Profession must be a string"), 
    body("country").optional().trim().isString().withMessage("Country must be a string").escape(),
    body("sex").optional().trim().isString().withMessage("Sex must be a string").escape(),
    body("bio").optional().trim().isString().withMessage("Bio must be a string")
];
export const deleteUserValidator = [
    query("password")
        .trim()
        .isString().withMessage("Password must be a string")
        .escape()
];
export const savesUserValidator = [
    body("save")
        .trim()
        .isMongoId().withMessage("Field must be a MongoId")
        .escape()
];
export const followUserValidator = [
    body("friendUserName")
        .trim()
        .isString().withMessage("Field must be a string")
        .escape()
];