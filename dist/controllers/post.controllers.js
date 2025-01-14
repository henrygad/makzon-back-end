"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.editPost = exports.addPost = exports.getPost = exports.getSavePosts = exports.streamTimelinePosts = exports.getTimelinePosts = exports.getTrendingPosts = exports.getPosts = void 0;
const post_model_1 = __importDefault(require("../models/post.model"));
const error_1 = __importDefault(require("../utils/error"));
const express_validator_1 = require("express-validator");
const decode_1 = require("../utils/decode");
// Get posts controller
const getPosts = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { status = "published", author = "", catigory, updatedAt = "-1", skip = 0, limit = 0, } = req.query;
        const filterBytime = updatedAt === "1" ? 1 : -1;
        const fillterPostBy = ({ status, author, }) => {
            if (status && author && catigory)
                return { status, author, catigories: { $in: [catigory] } };
            else if (status && author)
                return { status, author };
            else if (status && catigory)
                return { status, catigories: { $in: [catigory] } };
            else if (author && catigory)
                return { author, catigories: { $in: [catigory] } };
            else if (author)
                return { author, catigories: { $in: [catigory] } };
            else if (status)
                return { status, catigories: { $in: [catigory] } };
            else if (catigory)
                return { author, catigories: { $in: [catigory] } };
            else
                return {};
        };
        const posts = await post_model_1.default.find(fillterPostBy({ status, author }))
            .sort({ updatedAt: filterBytime })
            .skip(Number(skip))
            .limit(Number(limit));
        if (!posts.length)
            (0, error_1.default)({ message: "Posts not found", statusCode: 404 });
        res.status(200).json({
            data: posts.map((post) => ({
                ...post,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(post._html.title),
                    body: (0, decode_1.decodeHtmlEntities)(post._html.body),
                },
            })),
            message: "Posts fetched successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPosts = getPosts;
// Get treading posts controller
const getTrendingPosts = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { skip = 0, limit = 0 } = req.query;
        const posts = await post_model_1.default.find({ status: "published" })
            .sort({ views: -1 })
            .skip(Number(skip))
            .limit(Number(limit));
        if (!posts.length)
            (0, error_1.default)({ message: "Posts not found", statusCode: 404 });
        res.status(200).json({
            data: posts.map((post) => ({
                ...post,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(post._html.title),
                    body: (0, decode_1.decodeHtmlEntities)(post._html.body),
                },
            })),
            message: "Trending posts fetched successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTrendingPosts = getTrendingPosts;
// Get timeline posts controller
const getTimelinePosts = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { skip = 0, limit = 0 } = req.query;
        const { timeline, userName } = req.user;
        const posts = await post_model_1.default.find({
            author: { $in: [...timeline, userName] },
            status: "published",
        })
            .sort({ updatedAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit));
        if (!posts.length)
            (0, error_1.default)({ message: "Posts not found", statusCode: 404 });
        res.status(200).json({
            data: posts.map((post) => ({
                ...post,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(post._html.title),
                    body: (0, decode_1.decodeHtmlEntities)(post._html.body),
                },
            })),
            message: "Timeline posts fetched successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTimelinePosts = getTimelinePosts;
// Stream timeline posts controller
const streamTimelinePosts = async (req, res, next) => {
    try {
        const { timeline } = req.user;
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        res.flushHeaders(); // flush the headers to establish SSE with client
        const pipeline = [{ $match: { operationType: { $in: ["insert", "update", "delete"] } } }];
        const watchPost = post_model_1.default.watch(pipeline); // watch for changes in posts collection
        watchPost.on("change", async (change) => {
            // Listen for changes and send updated posts to client
            const eventType = change.operationType;
            const post = change.fullDocument;
            if (eventType === "delete") {
                // send post id to client when post is deleted
                const _id = change.documentKey._id;
                res.write(`data: ${JSON.stringify({ eventType, post: { _id } })}\n\n`);
            }
            else {
                // send post to client when post is inserted or updated
                if (timeline.includes(post.author) && post.status === "published") {
                    res.write(`data: ${JSON.stringify({
                        eventType,
                        post: {
                            ...post,
                            _html: {
                                title: (0, decode_1.decodeHtmlEntities)(post._html.title),
                                body: (0, decode_1.decodeHtmlEntities)(post._html.body),
                            },
                        },
                    })}\n\n`);
                }
            }
        });
        watchPost.on("error", (error) => {
            // listen for errors in posts collection
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        });
        req.on("close", () => {
            // End the stream when client closes connection
            watchPost.close();
            res.end();
        });
    }
    catch (error) {
        next(error);
    }
};
exports.streamTimelinePosts = streamTimelinePosts;
// Get save posts controller
const getSavePosts = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { skip = 0, limit = 0 } = req.query;
        const { saves } = req.user;
        const posts = await post_model_1.default.find({
            _id: { $in: saves },
            status: "published",
        })
            .sort({ updatedAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit));
        if (!posts.length)
            (0, error_1.default)({ message: "Posts not found", statusCode: 404 });
        res.status(200).json({
            data: posts.map((post) => ({
                ...post,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(post._html.title),
                    body: (0, decode_1.decodeHtmlEntities)(post._html.body),
                },
            })),
            message: "Save posts fetched successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSavePosts = getSavePosts;
// Get single post controller
const getPost = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const post = await post_model_1.default.findById(id, {
            status: "published",
        });
        if (!post)
            (0, error_1.default)({ message: "Post not found", statusCode: 404 });
        res.status(200).json({
            data: {
                ...post,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(post?._html.title || ""),
                    body: (0, decode_1.decodeHtmlEntities)(post?._html.body || ""),
                },
            },
            message: "Post fetched successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPost = getPost;
// Add Publish posts controller
const addPost = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const user = req.user;
        const image_from_multer = (req.file?.filename +
            "/" +
            req.file?.filename).trim();
        const { image, title, body, _html, slug, catigories, mentions } = req.body;
        const filteredSlug = slug.toLocaleLowerCase().replace(/\//g, "");
        let post = new post_model_1.default({
            title,
            body,
            _html,
            slug: filteredSlug,
            catigories,
            mentions,
            author: user.userName,
            image: image_from_multer || image,
            url: user.userName + "/" + filteredSlug,
            status: "published",
        });
        post = await post.save();
        if (!post)
            (0, error_1.default)({ message: "Post not added", statusCode: 400 });
        res.status(201).json({
            data: {
                ...post,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(post._html.title),
                    body: (0, decode_1.decodeHtmlEntities)(post._html.body),
                },
            },
            message: "Post added successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addPost = addPost;
// Edit posts controller
const editPost = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const image_from_multer = (req.file?.filename +
            "/" +
            req.file?.filename).trim();
        const { image, title, body, _html, catigories, mentions, likes, views, shares, status, } = req.body;
        const post = await post_model_1.default.findByIdAndUpdate(id, {
            image: image_from_multer || image,
            title,
            body,
            _html,
            catigories,
            mentions,
            likes,
            views,
            shares,
            status,
        }, { new: true });
        if (!post)
            (0, error_1.default)({ message: "Post not found", statusCode: 404 });
        res.status(200).json({
            data: {
                ...post,
                _html: {
                    title: (0, decode_1.decodeHtmlEntities)(post?._html.title || ""),
                    body: (0, decode_1.decodeHtmlEntities)(post?._html.body || ""),
                },
            },
            message: "Post updated successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.editPost = editPost;
// Delete posts controller
const deletePost = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const post = await post_model_1.default.findByIdAndDelete(id);
        if (!post)
            (0, error_1.default)({ message: "Post not found", statusCode: 404 });
        res.status(200).json({
            data: post,
            message: "Post deleted successfully",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePost = deletePost;
