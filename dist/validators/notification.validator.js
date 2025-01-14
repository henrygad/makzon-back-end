"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationValidator_param = exports.addNotificationValidator = void 0;
const express_validator_1 = require("express-validator");
exports.addNotificationValidator = [
    (0, express_validator_1.body)("type").isMongoId().withMessage("Type must be a mongoId").escape(),
    (0, express_validator_1.body)("to").isString().withMessage("To must be a string").escape(),
    (0, express_validator_1.body)("message").isObject().withMessage("Message must be an object"),
    (0, express_validator_1.body)("url").isString().withMessage("Url must be a string").escape(),
];
exports.notificationValidator_param = [
    (0, express_validator_1.param)("id").isMongoId().withMessage("Id must be a mongoId").escape(),
];
