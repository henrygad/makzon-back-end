import { body, param} from "express-validator";

export const addNotificationValidator = [   
    body("type").isMongoId().withMessage("Type must be a mongoId").escape(),
    body("to").isString().withMessage("To must be a string").escape(),
    body("message").isObject().withMessage("Message must be an object"),
    body("url").isString().withMessage("Url must be a string").escape(),
];
export const notificationValidator_param = [
    param("id").isMongoId().withMessage("Id must be a mongoId").escape(),
];