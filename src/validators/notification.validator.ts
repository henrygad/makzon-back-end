import { body, param} from "express-validator";

export const addNotificationValidator = [   
    body("type").isString().withMessage("Type must be a mongoId").escape(),
    body("to").isString().withMessage("To must be a string").escape(),
    body("message").isString().withMessage("Message must be an string").escape(),
    body("url").isString().withMessage("Url must be a string").escape(),
    body("targetTitle").optional().isString().withMessage("Target title must be a string").escape(),
    body("options").optional(),
];
export const notificationValidator_param = [
    param("id").isMongoId().withMessage("Id must be a mongoId").escape(),
];