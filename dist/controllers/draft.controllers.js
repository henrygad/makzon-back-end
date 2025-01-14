"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDraft = exports.editDraft = exports.addDraft = exports.getDraft = exports.getDrafts = void 0;
const express_validator_1 = require("express-validator");
const error_1 = __importDefault(require("../utils/error"));
const draft_model_1 = __importDefault(require("../models/draft.model"));
const decode_1 = require("../utils/decode");
// Get user drafts controller
const getDrafts = async (req, res, next) => {
    try {
        const { userName } = req.user;
        const drafts = await draft_model_1.default.find({ author: userName });
        if (!drafts.length)
            (0, error_1.default)({ message: "Draft not found", statusCode: 404 });
        res.status(200).json({
            data: drafts.map((draft) => ({
                ...draft,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(draft._html.title),
                    body: (0, decode_1.decodeHtmlEntities)(draft._html.body),
                },
            })),
            message: "Draft fetched successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDrafts = getDrafts;
// Get single draft controller
const getDraft = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const draft = await draft_model_1.default.findById(id);
        if (!draft)
            (0, error_1.default)({ message: "Draft not found", statusCode: 404 });
        res.status(200).json({
            data: {
                ...draft,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(draft?._html.title || ""),
                    body: (0, decode_1.decodeHtmlEntities)(draft?._html.body || ""),
                },
            },
            message: "Draft fetched successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDraft = getDraft;
// Add drafts controller
const addDraft = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const user = req.user;
        const image_from_multer = (req.file?.filename +
            "/" +
            req.file?.filename).trim();
        const { publishedId, image, title, body, _html, slug, catigories, mentions, } = req.body;
        const filteredSlug = slug.toLocaleLowerCase().replace(/\//g, "");
        let draft = new draft_model_1.default({
            publishedId,
            title,
            body,
            _html,
            slug: filteredSlug,
            catigories,
            mentions,
            author: user.userName,
            image: image_from_multer || image,
            status: "draft",
        });
        draft = await draft.save();
        if (!draft)
            (0, error_1.default)({ message: "Draft not added", statusCode: 400 });
        res.status(201).json({
            data: {
                ...draft,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(draft._html.title),
                    body: (0, decode_1.decodeHtmlEntities)(draft._html.body),
                },
            },
            message: "Draft added successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addDraft = addDraft;
// Edit posts controller
const editDraft = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const image_from_multer = (req.file?.filename +
            "/" +
            req.file?.filename).trim();
        const { publishedId, image, title, body, _html, catigories, mentions, } = req.body;
        const draft = await draft_model_1.default.findByIdAndUpdate(id, {
            publishedId,
            image: image_from_multer || image,
            title,
            body,
            _html,
            catigories,
            mentions,
            status: "draft",
        }, { new: true });
        if (!draft)
            (0, error_1.default)({ message: "Draft not found", statusCode: 404 });
        res.status(200).json({
            data: {
                ...draft,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(draft?._html.title || ""),
                    body: (0, decode_1.decodeHtmlEntities)(draft?._html.body || ""),
                },
            },
            message: "draft updated successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.editDraft = editDraft;
// Delete drafts controller
const deleteDraft = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const draft = await draft_model_1.default.findByIdAndDelete(id);
        if (!draft)
            (0, error_1.default)({ message: "Draft not found", statusCode: 404 });
        res.status(200).json({
            data: draft,
            message: "Draft deleted successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDraft = deleteDraft;
