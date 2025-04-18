import commentProps from "../types/comment.type";
import { NextFunction, Request, Response } from "express";
import Comment from "../models/comment.model";
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
        replyId: mongoose.Schema.Types.ObjectId | string;
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
      replyId: mongoose.Schema.Types.ObjectId | string;
    }) => {
      if (postId && replyId === "null") {
        return { postId, replyId: null };
      } else if (author) {
        return { author };
      } else if (postId) {
        return { postId };
      } else if (replyId) {
        return { replyId };
      } else {
        return {};
      };
    };

    const comments = await Comment
      .find(fillterCommentBy({ author, postId, replyId }))
      .skip(skip ? Number(skip) : 0)
      .limit(limit ? Number(limit) : 0)
      .sort({ updatedAt: filterBytime });
    if (!comments) return createError({ message: "Comments not found", statusCode: 404 });

    const getComments = comments.map(comment => comment.toObject());

    res.status(200).json({
      message: "Comments found",
      data: getComments.map((comment) => ({
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

    const comment = await Comment.findById(id);
    if (!comment) return createError({ message: "Comment not found", statusCode: 404 });
    const getComment = comment.toObject();


    res.status(200).json({
      message: "Comment found",
      data: {
        ...getComment,
        body: {
          _html: decodeHtmlEntities(getComment?.body._html || ""),
          text: getComment?.body.text,
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

    const user = req.session.user!;
    const {
      postId,
      replyId = null,
      body,
      url_leading_to_comment_parent,
      replyingTo,
    } = req.body as commentProps;

    let comment = new Comment({
      postId,
      replyId: replyId || null,
      author: user.userName,
      body,
      url_leading_to_comment_parent,
      replyingTo,
    });
    comment = await comment.save();
    if (!comment) return createError({ message: "Comment not saved", statusCode: 500 });

    const getComment = comment.toObject();

    res.status(201).json({
      message: "Comment added",
      data: {
        ...getComment,
        body: {
          _html: decodeHtmlEntities(getComment.body._html),
          text: getComment.body.text,
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
    const comment = await Comment.findByIdAndUpdate(
      id,
      {
        body,
        likes,
      },
      { new: true }
    );
    if (!comment) return createError({ message: "Comment not found", statusCode: 404 });

    const getComment = comment.toObject();

    res.status(200).json({
      message: "Comment edited",
      data: {
        ...getComment,
        body: {
          _html: decodeHtmlEntities(getComment?.body._html || ""),
          text: getComment?.body.text,
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
