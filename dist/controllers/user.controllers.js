"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAuthUser = exports.editAuthUserFollowings = exports.streamUserFollowers = exports.editAuthUserSaves = exports.editAuthUser = exports.getAuthUser = exports.getSingleUser = exports.getAllUsers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const error_1 = __importDefault(require("../utils/error"));
const express_validator_1 = require("express-validator");
// Get all users controller
const getAllUsers = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { skip = 0, limit = 0 } = req.query;
        const users = await user_model_1.default.find()
            .skip(Number(skip))
            .limit(Number(limit))
            .select("-password -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v");
        if (!users.length)
            (0, error_1.default)({ statusCode: 404, message: "Users not found" });
        res.status(200).json({
            success: true,
            data: users,
            message: "Users found successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
// Get single user controller
const getSingleUser = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { userName } = req.params;
        const user = await user_model_1.default.findById({ userName }).select("-password -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v");
        if (!user)
            (0, error_1.default)({ statusCode: 404, message: "User not found" });
        res.status(200).json({
            success: true,
            data: user,
            message: "User found successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSingleUser = getSingleUser;
// Get authenticated user controller
const getAuthUser = async (req, res, next) => {
    try {
        const user = await user_model_1.default.findById(req.user._id).select("-password  -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v");
        if (!user)
            (0, error_1.default)({ statusCode: 404, message: "User not found" });
        res.status(200).json({
            success: true,
            data: user,
            message: "Auth User found successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAuthUser = getAuthUser;
// Edit and update authenticated user controller
const editAuthUser = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { name, dateOfBirth, displayDateOfBirth, displayEmail, displayPhoneNumber, website, profession, country, sex, bio, } = req.body;
        const user = req.user;
        const image = (req.file?.filename + "/" + req.file?.filename).trim();
        const updatedUser = await user_model_1.default.findByIdAndUpdate(user._id, {
            avatar: image ? image : user.avatar,
            name,
            dateOfBirth,
            displayDateOfBirth,
            displayEmail,
            displayPhoneNumber,
            website,
            profession,
            country,
            sex,
            bio,
        }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: updatedUser,
            message: "User updated Successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.editAuthUser = editAuthUser;
// Edit authenticated user saves controller
const editAuthUserSaves = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { save } = req.body;
        const user = req.user;
        user.saves.push(save);
        req.user = await user.save();
        res.status(200).json({
            success: true,
            data: { save },
            message: "User saves updated Successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.editAuthUserSaves = editAuthUserSaves;
// Stream user followers
const streamUserFollowers = async (req, res, next) => {
    try {
        const { userName } = req.params;
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        });
        res.flushHeaders(); // Flush the headers to establish SSE with client
        const pipeline = [
            { $match: { "fullDocument.userName": userName } },
            { $match: { "operationType": { $in: ["insert", "update", "delete"] } } },
            { $match: { "updateDescription.updatedFields.followers": { $exists: true } } },
        ];
        const watchUser = user_model_1.default.watch(pipeline); // Watch user followers
        watchUser.on("change", (change) => {
            const eventType = change.operationType;
            const followers = change.updateDescription.updatedFields.followers;
            res.write(`data: ${JSON.stringify({ eventType, followers })}\n\n`);
        });
        watchUser.on("error", (error) => {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        });
        req.on("close", () => {
            watchUser.close();
            res.end();
        });
    }
    catch (error) {
        next(error);
    }
};
exports.streamUserFollowers = streamUserFollowers;
// Edit authenticated user followings controller
const editAuthUserFollowings = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { userName } = req.body;
        const user = req.user;
        // Check if already followed user
        const isFollowing = user.followings.includes(userName);
        if (isFollowing) {
            // Remove follower
            const followedUser = await user_model_1.default.findOneAndUpdate({ userName }, { $pull: { followers: user.userName } }, { runValidators: true });
            if (!followedUser)
                (0, error_1.default)({
                    statusCode: 404,
                    message: "User not found or User not unfollowed",
                });
            // Unfollow user
            user.followings.filter((name) => name !== userName);
            user.markModified("followings");
            req.user = await user.save();
        }
        else {
            // Add follower
            const followedUser = await user_model_1.default.findOneAndUpdate({ userName }, { $push: { followers: user.userName } }, { runValidators: true });
            if (!followedUser)
                (0, error_1.default)({
                    statusCode: 404,
                    message: "User not found or User not followed",
                });
            // Follow user
            user.followings.push(userName);
            user.markModified("followings");
            req.user = await user.save();
        }
        res.status(200).json({
            success: true,
            data: { userName },
            message: isFollowing
                ? "User unfollowed Successfully"
                : "User followed Successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.editAuthUserFollowings = editAuthUserFollowings;
// Delete authenticated user controller
const deleteAuthUser = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { password } = req.body;
        const user = req.user;
        // Comfirm user password
        const isMatch = user.isValidPassword(password);
        if (!isMatch)
            (0, error_1.default)({ statusCode: 401, message: "Invalid password" });
        // Delete user
        const deletedUser = await user_model_1.default.findByIdAndDelete(user._id);
        if (!deletedUser)
            (0, error_1.default)({ statusCode: 404, message: "User not found" });
        // Logout user
        req.logOut(() => {
            req.user = undefined;
            req.session.passport = { user: undefined };
            req.session.save(() => {
                res.status(200).json({
                    success: true,
                    message: "User deleted successfully",
                });
            });
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAuthUser = deleteAuthUser;
