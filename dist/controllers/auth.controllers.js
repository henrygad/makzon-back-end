"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutRest = exports.logout = exports.login = exports.register = void 0;
const error_1 = __importDefault(require("../utils/error"));
const OTP_1 = __importDefault(require("../utils/OTP"));
const email_config_1 = __importDefault(require("../config/email.config"));
require("dotenv/config");
const user_model_1 = __importDefault(require("../models/user.model"));
const express_validator_1 = require("express-validator");
// Register new user
const register = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { userName, email, password, } = req.body;
        // If user exist by either username or email then throw an error
        let user = await user_model_1.default.findOne({ email });
        if (user)
            (0, error_1.default)({
                // By email
                statusCode: 401,
                message: "There is an account with this email. Try log in instead with this email",
            });
        user = await user_model_1.default.findOne({ userName });
        if (user)
            (0, error_1.default)({
                // By username
                statusCode: 401,
                message: "This username is not available",
            });
        // Resgister new user
        user = new user_model_1.default({ userName, email, password });
        await user.save();
        if (!user)
            (0, error_1.default)({ statusCode: 500, message: "Failed to create user" });
        // Generate OTP token and send a welcome email to user along the otp to verify account
        const otp = (0, OTP_1.default)(4);
        const expireOn = Date.now() + 15 * 60 * 1000; // expires in 15 minutes
        const url = process.env.DOMAIN_NAME +
            `/api/auth/verify?email=${user?.email}&otp=${otp}`;
        const result = await (0, email_config_1.default)({
            emailTo: email,
            subject: "Email Verification",
            template: `Welcome ${user?.userName}. Your verification code is: ${otp}. or click this url ${url}`,
        });
        if (!result.sent)
            (0, error_1.default)({
                statusCode: 500,
                message: "Failed to send welcome email to new",
            });
        // Store OTP to user data
        user.verificationToken = otp;
        user.verificationTokenExpiringdate = expireOn;
        await user.save();
        const hideEmail = (email) => {
            // Function to hide user email
            const [username, domain] = email.split("@");
            return `${username.slice(0, 3)}***@${domain}`;
        };
        res.status(201).json({
            message: `Welcome ${user.userName}, you've successfully created your account. Next step is to verify your account`,
            email: hideEmail(user.email),
            verifyUrl: "/api/auth/verify",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
// Loign user
const login = async (req, res, next) => {
    try {
        const user = req.user;
        // Check if user was Authenticated
        if (!user || !req.session.id)
            (0, error_1.default)({
                statusCode: 401,
                message: "Authentication failed: Session not found",
            });
        // Create new session
        const userSession = {
            token: req.session.id,
            toExpire: new Date(req.session.cookie.expires).getTime(),
        };
        // Add current user session id to user.session array
        user.sessions.push(userSession);
        req.user = await user.save();
        res.status(200).json({
            message: `Welcome back ${user.userName}, you've successfully login into your account`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
// Logout current user
const logout = async (req, res, next) => {
    try {
        // Logout user from db
        const user = req.user;
        user.sessions = user.sessions.filter((session) => session.token !== req.session.id);
        req.user = await user.save();
        req.logOut(async (err) => {
            // Logout user from server
            if (err)
                next((0, error_1.default)({ statusCode: 500, message: "Logout error" }));
            req.user = undefined;
            req.session.passport = { user: undefined };
            req.session.save((err) => {
                if (err)
                    next((0, error_1.default)({ statusCode: 500, message: "Failed to save session" }));
                res.status(200).json({
                    message: "You've successfully logout",
                });
            });
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
// Logout rest user expect current user
const logoutRest = async (req, res, next) => {
    try {
        const user = req.user;
        if (user) {
            // Logout the rest users from db but keep current user
            user.sessions = user.sessions.filter((session) => session.token === req.session.id);
            req.user = await user.save();
        }
        res.status(200).json({
            message: "You've successfully logged out the rest users",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logoutRest = logoutRest;
