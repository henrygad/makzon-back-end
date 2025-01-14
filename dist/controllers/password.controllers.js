"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.verifyForgetPasswordOTP = exports.sendForgetPasswordOTP = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const error_1 = __importDefault(require("../utils/error"));
const OTP_1 = __importDefault(require("../utils/OTP"));
const email_config_1 = __importDefault(require("../config/email.config"));
require("dotenv/config");
const hideEmail_1 = __importDefault(require("../utils/hideEmail"));
const express_validator_1 = require("express-validator");
// Send reset password otp
const sendForgetPasswordOTP = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { email } = req.body;
        // Find user
        const user = await user_model_1.default.findOne({ email });
        if (!user)
            (0, error_1.default)({ statusCode: 404, message: "User not found" });
        // Generate and send OTP token
        const otp = (0, OTP_1.default)(4);
        const expireOn = Date.now() + 15 * 60 * 1000; // expires in 15 minutes
        const url = process.env.DOMAIN_NAME +
            `/api/auth/password/forget?email=${user?.email}&otp=${otp}`;
        // Send OTP token to user mail box
        const result = await (0, email_config_1.default)({
            emailTo: email,
            subject: "Reset password OTP request",
            template: `Hi ${user?.userName}. Your Reset password OTP is: ${otp}. or click this url ${url}`,
        });
        if (!result.sent)
            (0, error_1.default)({
                statusCode: 500,
                message: "Failed to send verification email",
            });
        // Store OTP to user data
        if (user) {
            user.forgetPassWordToken = otp;
            user.forgetPassWordTokenExpiringdate = expireOn;
            await user.save();
        }
        res.status(200).json({
            message: "An OTP token has been sent to your email to reset your password",
            email: (0, hideEmail_1.default)(user?.email || ""),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendForgetPasswordOTP = sendForgetPasswordOTP;
// Verify otp
const verifyForgetPasswordOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.query;
        // Verify OTP token sent by user
        const user = await user_model_1.default.findOne({
            email,
            forgetPassWordToken: otp,
            forgetPassWordTokenExpiringdate: { $gt: Date.now() },
        });
        if (!user)
            (0, error_1.default)({
                statusCode: 404,
                message: "Invalid or expired verification token",
            });
        // Update user verification data
        if (user) {
            user.forgetPassWordToken = "";
            await user.save();
        }
        res.status(200).json({
            message: "Email verification successful for reseting your password",
            resetPasswordUrl: "/api/auth/password/reset",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyForgetPasswordOTP = verifyForgetPasswordOTP;
// Reset password
const resetPassword = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { email, newPassword } = req.body;
        // Find user
        const user = await user_model_1.default.findOne({
            email,
            forgetPassWordTokenExpiringdate: { $gt: Date.now() },
        });
        if (!user)
            (0, error_1.default)({
                statusCode: 404,
                message: "User not found or time out to reset password. Please send new request",
            });
        if (user) {
            const sameAsOld = await user.isValidPassword(newPassword);
            if (sameAsOld)
                (0, error_1.default)({
                    statusCode: 400,
                    message: "New password cannot be the same as old password",
                });
            user.forgetPassWordTokenExpiringdate = 0;
            user.password = newPassword;
            user.markModified("password");
            await user.save();
        }
        res.status(200).json({
            message: "Password has been successfully reset. You can now login with your new password.",
            loginUrl: "/api/auth/login",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
// chnage passwprd
const changePassword = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { oldPassword, newPassword } = req.body;
        const user = req.user;
        // Check if old password is valid
        const isMatch = await user.isValidPassword(oldPassword);
        if (!isMatch)
            (0, error_1.default)({ statusCode: 401, message: "Invalid password" });
        // Check if new password is the same as old password
        const sameAsOld = await user.isValidPassword(newPassword);
        if (sameAsOld)
            (0, error_1.default)({
                statusCode: 400,
                message: "New password cannot be the same as old password",
            });
        // Change user password
        user.password = newPassword;
        user.markModified("password");
        req.user = await user.save();
        res.status(200).json({
            message: "Password has been successfully changed. Would you like to logout from all devise, but keep you login on this devise?",
            logOutAllDeviseUrl: "/api/auth/logout/rest",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
