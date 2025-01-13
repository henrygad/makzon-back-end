import commentProps from "../types/comment.type";
import { NextFunction, Request, Response } from "express";
import Comment from "../models/comment.model";
import userProps from "../types/user.type";
import createError from "../utils/error";
import { decodeHtmlEntities } from "../utils/decode";
import mongoose from "mongoose";
import { validationResult } from "express-validator";

// Get all comments
export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { author, postId, replyId, skip, limit, updatedAt } =
      req.query as unknown as {
        author: string;
        postId: mongoose.Schema.Types.ObjectId;
        replyId: mongoose.Schema.Types.ObjectId;
        skip: number;
        limit: number;
        updatedAt: string;
      };
    const filterBytime = updatedAt === "1" ? 1 : -1;
    const fillterCommentBy = ({
      author,
      postId,
      replyId,
    }: {
      author: string;
      postId: mongoose.Schema.Types.ObjectId;
      replyId: mongoose.Schema.Types.ObjectId;
    }) => {
      if (author && postId && replyId) {
        return { author, postId, replyId };
      } else if (author && postId) {
        return { author, postId };
      } else if (author && replyId) {
        return { author, replyId };
      } else if (postId && replyId) {
        return { postId, replyId };
      } else if (author || postId || replyId) {
        return { author, postId, replyId };
      } else {
        return {};
      }
    };
    const comments = await Comment.find(
      fillterCommentBy({ author, postId, replyId })
    )
      .skip(skip ? Number(skip) : 0)
      .limit(limit ? Number(limit) : 0)
      .sort({ updatedAt: filterBytime });
    if (!comments)
      createError({ message: "Comments not found", statusCode: 404 });

    res.status(200).json({
      message: "Comments found",
      data: comments.map((comment) => ({
        ...comment,
        body: {
          _html: decodeHtmlEntities(comment.body._html),
          text: comment.body.text,
        },
      })),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Get single comment
export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { id } = req.params;

    const comment: commentProps | null = await Comment.findById(id);
    if (!comment)
      createError({ message: "Comment not found", statusCode: 404 });

    res.status(200).json({
      message: "Comment found",
      data: {
        ...comment,
        body: {
          _html: decodeHtmlEntities(comment?.body._html || ""),
          text: comment?.body.text,
        },
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Add new comment
export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const user = req.user as userProps;
    const {
      postId,
      replyId = null,
      body,
      url_leading_to_comment_parent,
      replingTo,
    } = req.body as commentProps;

    let comment = new Comment({
      postId,
      replyId: replyId || null,
      author: user.userName,
      body,
      url_leading_to_comment_parent,
      replingTo,
    });
    comment = await comment.save();
    if (!comment)
      createError({ message: "Comment not saved", statusCode: 500 });

    res.status(201).json({
      message: "Comment added",
      data: {
        ...comment,
        body: {
          _html: decodeHtmlEntities(comment.body._html),
          text: comment.body.text,
        },
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Edit comment
export const editComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { id } = req.params;
    const { body, likes }: commentProps = req.body as commentProps;
    const comment: commentProps | null = await Comment.findByIdAndUpdate(
      id,
      {
        body,
        likes,
      },
      { new: true }
    );
    if (!comment)
      createError({ message: "Comment not found", statusCode: 404 });

    res.status(200).json({
      message: "Comment edited",
      data: {
        ...comment,
        body: {
          _html: decodeHtmlEntities(comment?.body._html || ""),
          text: comment?.body.text,
        },
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Delete comment
export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });
    
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment)
      createError({ message: "Comment not found", statusCode: 404 });

    res.status(200).json({
      message: "Comment deleted",
      data: comment,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
