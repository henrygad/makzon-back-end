"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = exports.sendVerificationOTP = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const error_1 = __importDefault(require("../utils/error"));
const OTP_1 = __importDefault(require("../utils/OTP"));
const email_config_1 = __importDefault(require("../config/email.config"));
require("dotenv/config");
const hideEmail_1 = __importDefault(require("../utils/hideEmail"));
const express_validator_1 = require("express-validator");
// Send verification otp 
const sendVerificationOTP = async (req, res, next) => {
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
        const url = process.env.DOMAIN_NAME + `/api/auth/verify?email=${user?.email}&otp=${otp}`;
        // Send OTP token to user mail box
        const result = await (0, email_config_1.default)({
            emailTo: email,
            subject: "Email Verification",
            template: `Hi ${user?.userName}. Your verification code is: ${otp}. or click this url ${url}`,
        });
        if (!result.sent)
            (0, error_1.default)({
                statusCode: 500,
                message: "Failed to send verification email",
            });
        // Store OTP to user data
        if (user) {
            user.verificationToken = otp;
            user.verificationTokenExpiringdate = expireOn;
            await user.save();
        }
        res.status(200).json({
            message: "An OTP token has been sent to your email",
            email: (0, hideEmail_1.default)(user?.email || ""),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendVerificationOTP = sendVerificationOTP;
// Verify user
const verifyUser = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { email, otp } = req.query;
        // Verify OTP token sent by user
        const user = await user_model_1.default.findOne({
            email,
            verificationToken: otp,
            verificationTokenExpiringdate: { $gt: Date.now() },
        });
        if (!user)
            (0, error_1.default)({
                statusCode: 404,
                message: "Invalid or expired verification token. Please request for another token or check whether you're alread verirfied",
            });
        // Update user verification data
        if (user) {
            user.userVerified = true;
            user.verificationToken = "";
            user.verificationTokenExpiringdate = 0;
            await user.save();
        }
        // Send successful verification email (optional)
        res.status(200).json({
            message: "Email verification successful",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyUser = verifyUser;
