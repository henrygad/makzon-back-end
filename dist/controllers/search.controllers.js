"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSearchHistory = exports.addSearchHistory = exports.getSearchHistoris = exports.search = void 0;
const error_1 = __importDefault(require("../utils/error"));
const post_model_1 = __importDefault(require("../models/post.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const decode_1 = require("../utils/decode");
const express_validator_1 = require("express-validator");
// Search user and post controller
const search = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { title, body, catigory, userName, skip = 0, limit = 0, updatedAt, } = req.query;
        const post = []; // Post array for search conditions logic
        if (title)
            post.push({ title: { $regex: title, $options: "i" } });
        if (body)
            post.push({ body: { $regex: body, $options: "i" } });
        if (catigory)
            post.push({ catigories: { $regex: catigory, $options: "i" } });
        const user = []; // User array for search conditions logic
        if (userName)
            user.push({ userName: { $regex: userName, $options: "i" } });
        const filterByTime = updatedAt === "1" ? 1 : -1;
        const posts = await post_model_1.default.find({
            $or: post,
            status: "published",
        })
            .skip(skip ? Number(skip) : 0)
            .limit(limit ? Number(limit) : 0)
            .sort({ updatedAt: filterByTime });
        const users = await user_model_1.default.find({ $or: user })
            .skip(skip ? Number(skip) : 0)
            .limit(limit ? Number(limit) : 0)
            .sort({ updatedAt: filterByTime })
            .select("-password -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v");
        if (!posts.length && !users.length)
            (0, error_1.default)({ statusCode: 404, message: "No search results found" });
        res.status(200).json({
            message: "Search results found",
            data: {
                users,
                posts: posts.map((post) => ({
                    ...post,
                    _html: {
                        title: (0, decode_1.decodeHtmlEntities)(post._html.title),
                        body: (0, decode_1.decodeHtmlEntities)(post._html.body),
                    },
                })),
            },
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.search = search;
// Get search history
const getSearchHistoris = (req, res, next) => {
    const { session } = req;
    if (session.searchHistory && session.searchHistory.length) {
        const { searchHistory } = session;
        res.status(200).json({
            message: "Search history retrieved successfully",
            data: searchHistory,
            success: true,
        });
    }
    else {
        next((0, error_1.default)({ statusCode: 404, message: "No search history found" }));
    }
};
exports.getSearchHistoris = getSearchHistoris;
// Add new search history
const addSearchHistory = (req, res, next) => {
    // Validate user input
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        next((0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 }));
    const { searched } = req.body;
    if (typeof req.session.searchHistory !== "object") {
        req.session.searchHistory = [{ _id: "", search: "" }];
    }
    const { searchHistory } = req.session;
    if (!searchHistory?.find((history) => history.search === searched)) {
        searchHistory.push({
            _id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
            search: searched,
        });
        req.session.save();
    }
    res.status(201).json({
        message: "Search history updated",
        data: searchHistory.find((history) => history.search === searched),
        success: true,
    });
};
exports.addSearchHistory = addSearchHistory;
// Delete search history
const deleteSearchHistory = (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const { searchHistory } = req.session;
        if (!searchHistory?.find((history) => history._id === id))
            (0, error_1.default)({
                statusCode: 404,
                message: "Search history item not found",
            });
        req.session.searchHistory = searchHistory?.filter((history) => history._id !== id);
        req.session.save();
        res.status(200).json({
            message: "Search history item deleted",
            data: { _id: id },
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSearchHistory = deleteSearchHistory;
