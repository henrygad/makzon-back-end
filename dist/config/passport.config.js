"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const user_model_1 = __importDefault(require("../models/user.model"));
const generateUserName_1 = __importDefault(require("../utils/generateUserName"));
passport_1.default.use(
// Validate and local login user
new passport_local_1.Strategy({ usernameField: "userName", passwordField: "password" }, // Define username and password fields
async (userName, password, done) => {
    // Check if user exist by username or email
    const user = await user_model_1.default.findOne({ $or: [{ userName }, { email: userName }] });
    if (!user)
        return done({
            message: "Username: Invalid credentials", statusCode: 401, status: "fail", isOperational: true
        }, false);
    // Comapre incoming passwords with hashed password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch)
        return done({
            message: "Password: Invalid credentials", statusCode: 401, status: "fail", isOperational: true
        }, false);
    return done(null, user);
}));
passport_1.default.use(
// Validate and Goodle login user
new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
}, async (_accessToken, _refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const emailValue = emails?.[0].value;
    // Check if user exist by goolge id or email
    let user = await user_model_1.default.findOne({
        $or: [{ googleId: id }, { email: emailValue }],
    });
    // If no user was found, register new user
    if (!user) {
        user = new user_model_1.default({
            googleId: profile.id,
            email: emailValue,
            userName: (0, generateUserName_1.default)(displayName), // Generate a unique username
            userVerified: true,
        });
        await user.save();
    }
    ;
    return done(null, user); // Send user data
}));
passport_1.default.serializeUser(
// Serialize user data to session storage
(user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser(async (_id, done) => {
    // Deserialize user data from session storage
    const user = await user_model_1.default.findById(_id);
    done(null, user);
});
exports.default = passport_1.default;
