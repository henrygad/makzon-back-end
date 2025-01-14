"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeEmail = exports.sendChangeEmailOTP = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const error_1 = __importDefault(require("../utils/error"));
const OTP_1 = __importDefault(require("../utils/OTP"));
const email_config_1 = __importDefault(require("../config/email.config"));
require("dotenv/config");
const hideEmail_1 = __importDefault(require("../utils/hideEmail"));
const express_validator_1 = require("express-validator");
// Send otp for changing email request
const sendChangeEmailOTP = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { newEmail } = req.body;
        const user = req.user;
        // Check if the new email is the same as the current email
        let cannotUseEmail = user.email === newEmail;
        if (cannotUseEmail)
            (0, error_1.default)({ statusCode: 400, message: "New email cannot be the same as current email" });
        cannotUseEmail = await user_model_1.default.findOne({ email: newEmail });
        if (cannotUseEmail)
            (0, error_1.default)({ statusCode: 400, message: "Email is already in use" });
        // Send email to the current email box
        await (0, email_config_1.default)({
            emailTo: user.email,
            subject: "Change account email request",
            template: `Hi ${user.userName}. 
            You recently requested to change your account email ${user.email} to ${newEmail}.
           If you didn't make this requst please contact us or login to you account and change your password`,
        });
        // Generate OTP token 
        const otp = (0, OTP_1.default)(4);
        const expireOn = Date.now() + 15 * 60 * 1000; // expires in 15 minutes
        // Send OTP to new email
        const result = await (0, email_config_1.default)({
            emailTo: newEmail,
            subject: "Change account email OTP request",
            template: `Hi ${user.userName}. 
            You requested to change your account email ${user.email} to ${newEmail}.
            Here is your OTP to change your email: ${otp}`,
        });
        if (!result.sent)
            (0, error_1.default)({
                statusCode: 500,
                message: "Failed to send verification email",
            });
        // Store OTP to user data       
        user.changeEmailVerificationToken = otp;
        user.changeEmailVerificationTokenExpiringdate = expireOn;
        user.requestChangeEmail = newEmail;
        req.user = await user.save();
        res.status(200).json({
            message: "An OTP token has been sent to your mail box to change your email",
            email: (0, hideEmail_1.default)(newEmail || ""),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendChangeEmailOTP = sendChangeEmailOTP;
// Chnage email
const changeEmail = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { newEmail, otp } = req.body;
        const user = req.user;
        // Verify OTP token sent by user
        if (user.requestChangeEmail !== newEmail ||
            user.changeEmailVerificationToken !== otp ||
            user.changeEmailVerificationTokenExpiringdate < Date.now())
            (0, error_1.default)({
                statusCode: 401,
                message: "Invalid or expired OTP token"
            });
        // Change user email
        if (user) {
            user.changeEmailVerificationToken = "";
            user.changeEmailVerificationTokenExpiringdate = 0;
            user.requestChangeEmail = "";
            user.email = newEmail;
            req.user = await user.save();
        }
        ;
        res.status(200).json({
            message: "Email changed successfully"
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changeEmail = changeEmail;
