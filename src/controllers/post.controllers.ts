import { NextFunction, Request, Response } from "express";
import Posts from "../models/post.model";
import createError from "../utils/error";
import postProps from "../types/post.type";
import userProps from "../types/user.type";
import { validationResult } from "express-validator";

// Get posts controller
export const getPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422});

        const { author = "", status = "published", updatedAt = "-1", skip = 0, limit = 0 } = req.query;
        const searchPostBytime = updatedAt === "1" ? 1 : -1;
        const searchPostBy = ({ status, author }: { status: string, author: string }) => {
            if (status && author) return { status, author };
            else if (status) return { status };
            else if (author) return { author };
            else return {};
        };

        const result = await Posts.find(searchPostBy({
            status: status.toString(),
            author: author.toString()
        }))
            .sort({ updatedAt: searchPostBytime })
            .skip(Number(skip))
            .limit(Number(limit));
        if (!result.length) createError({ message: "Posts not found", statusCode: 404 });

        res.status(200).json({
            data: result,
            message: "Posts fetched successfully",
            success: true,
        });

    } catch (error) {
        next(error);
    }
};
// Get treading posts controller 
export const getTrendingPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

        const { skip = 0, limit = 0 } = req.query;

        const result = await Posts
            .find({ status: "published" })
            .sort({ views: -1 })
            .skip(Number(skip))
            .limit(Number(limit));
        if (!result.length) createError({ message: "Posts not found", statusCode: 404 });

        res.status(200).json({
            data: result,
            message: "Trending posts fetched successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
// Get timeline posts controller
export const getTimelinePosts = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

        const { skip = 0, limit = 0 } = req.query;
        const { timeline, userName } = req.user as userProps;

        const result = await Posts.find({ author: { $in: [...timeline, userName] }, status: "published" })
            .sort({ updatedAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit));
        if (!result.length) createError({ message: "Posts not found", statusCode: 404 });

        res.status(200).json({
            data: result,
            message: "Timeline posts fetched successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
// Stream timeline posts controller
export const streamTimelinePosts = async (req: Request, res: Response, next: NextFunction) => {
    try {  
        
        const { timeline } = req.user as userProps;

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        });
        res.flushHeaders(); // flush the headers to establish SSE with client

        const watchPost = Posts.watch([
            { $match: { "operationType": { $in: ["insert", "update", "delete"] } } },
        ]); // watch for changes in posts collection

        watchPost.on("change", async (change) => { // Listen for changes and send updated posts to client
            const eventType = change.operationType;
            const post = change.fullDocument as postProps;

            if (eventType === "delete") {  // send post id to client when post is deleted
                const _id = change.documentKey._id;
                res.write(`data: ${JSON.stringify({ eventType, post: {_id} })}\n\n`);
            } else { // send post to client when post is inserted or updated
                if (timeline.includes(post.author) &&
                    post.status === "published") {
                    res.write(`data: ${JSON.stringify({ eventType, post })}\n\n`);
                }
             };
        });

        watchPost.on("error", (error) => { // listen for errors in posts collection
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        });

        req.on("close", () => {  // End the stream when client closes connection
            watchPost.close();
            res.end();
        });

    } catch (error) {
        next(error);
    }
};
// Get save posts controller
export const getSavePosts = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

        const { skip = 0, limit = 0 } = req.query;
        const { saves } = req.user as userProps;

        const result = await Posts.find({ _id: { $in: saves }, status: "published" })
            .sort({ updatedAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit));
        if (!result.length) createError({ message: "Posts not found", statusCode: 404 });

        res.status(200).json({
            data: result,
            message: "Save posts fetched successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
// Get single post controller 
export const getSinglePost = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

        const { id } = req.params;

        const result = await Posts.findById(id, { status: "published" });
        if (!result) createError({ message: "Post not found", statusCode: 404 });

        res.status(200).json({
            data: result,
            message: "Post fetched successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
// Add Publish posts controller
export const addPublishPost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

        const user = req.user as userProps;
        const image_from_multer = (req.file?.filename + "/" + req.file?.filename).trim();
        const { 
            image, 
            title, 
            body, 
            _html, 
            slug, 
            catigories, 
            mentions,             
        }: postProps = req.body;

        const post = new Posts({
            title,
            body,
            _html,
            slug,
            catigories,
            mentions,     
            author: user.userName,
            image: image_from_multer ? image_from_multer : image,
            url: user.userName + "/" + slug,
            status: "published",
        });
        const result = await post.save();
        if (!result) createError({ message: "Post not added", statusCode: 400 });

        res.status(201).json({
            data: result,
            message: "Post added successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
// Add Draft posts controller
export const addDraftPost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

        const user = req.user as userProps;
        const image_from_multer = (req.file?.filename + "/" + req.file?.filename).trim();
        const {
            image,
            title,
            body,
            _html,
            slug,
            catigories,
            mentions,
        }: postProps = req.body;

        const post = new Posts({
            title,
            body,
            _html,
            slug,
            catigories,
            mentions,
            author: user.userName,
            image: image_from_multer ? image_from_multer : image,
            url: user.userName  + "/" + slug,
            status: "draft",
        });
        const result = await post.save();
        if (!result) createError({ message: "Draft not added", statusCode: 400 });

        res.status(201).json({
            data: result,
            message: "Draft added successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
// Edit posts controller
export const editPost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

        const { id } = req.params;
        const image_from_multer = (req.file?.filename + "/" + req.file?.filename).trim();
        const {
            image,
            title,
            body,
            _html,
            catigories,
            mentions,
            likes,
            views,
            shares,
            status,
        }: postProps = req.body;

        const result = await Posts.findByIdAndUpdate(
            id,
            {
                image: image_from_multer ? image_from_multer : image,
                title,
                body,
                _html,
                catigories,
                mentions,
                likes,
                views,
                shares,
                status,
            },
            { new: true }
        );
        if (!result) createError({ message: "Post not found", statusCode: 404 });

        res.status(200).json({
            data: result,
            message: "Post updated successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
// Delete posts controller
export const deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });
        
        const { id } = req.params;
        const result = await Posts.findByIdAndDelete(id);
        if (!result) createError({ message: "Post not found", statusCode: 404 });

        res.status(200).json({
            data: result,
            message: "Post deleted successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
