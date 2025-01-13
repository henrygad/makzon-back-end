import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import createError from "../utils/error";
import userProps from "../types/user.type";
import postProps from "../types/post.type";
import Drafts from "../models/draft.model";
import { decodeHtmlEntities } from "../utils/decode";

// Get user drafts controller
export const getDrafts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userName } = req.user as userProps;

    const drafts: postProps[] = await Drafts.find({ author: userName });
    if (!drafts.length)
      createError({ message: "Draft not found", statusCode: 404 });

    res.status(200).json({
      data: drafts.map((draft) => ({
        ...draft,
        _html: {
          title: decodeHtmlEntities(draft._html.title),
          body: decodeHtmlEntities(draft._html.body),
        },
      })),
      message: "Draft fetched successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Get single draft controller
export const getDraft = async (
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

    const draft: postProps | null = await Drafts.findById(id);
    if (!draft) createError({ message: "Draft not found", statusCode: 404 });

    res.status(200).json({
      data: {
        ...draft,
        _html: {
          title: decodeHtmlEntities(draft?._html.title || ""),
          body: decodeHtmlEntities(draft?._html.body || ""),
        },
      },
      message: "Draft fetched successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Add drafts controller
export const addDraft = async (
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
    const image_from_multer = (
      req.file?.filename +
      "/" +
      req.file?.filename
    ).trim();
    const {
      publishedId,
      image,
      title,
      body,
      _html,
      slug,
      catigories,
      mentions,
    }: postProps = req.body;
    const filteredSlug = slug.toLocaleLowerCase().replace(/\//g, "");

    let draft = new Drafts({
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
    if (!draft) createError({ message: "Draft not added", statusCode: 400 });

    res.status(201).json({
      data: {
        ...draft,
        _html: {
          title: decodeHtmlEntities(draft._html.title),
          body: decodeHtmlEntities(draft._html.body),
        },
      },
      message: "Draft added successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Edit posts controller
export const editDraft = async (
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
    const image_from_multer = (
      req.file?.filename +
      "/" +
      req.file?.filename
    ).trim();
    const {
      publishedId,
      image,
      title,
      body,
      _html,
      catigories,
      mentions,
    }: postProps = req.body;

    const draft: postProps | null = await Drafts.findByIdAndUpdate(
      id,
      {
        publishedId,
        image: image_from_multer || image,
        title,
        body,
        _html,
        catigories,
        mentions,
        status: "draft",
      },
      { new: true }
    );
    if (!draft) createError({ message: "Draft not found", statusCode: 404 });

    res.status(200).json({
      data: {
        ...draft,
        _html: {
          title: decodeHtmlEntities(draft?._html.title || ""),
          body: decodeHtmlEntities(draft?._html.body || ""),
        },
      },
      message: "draft updated successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
// Delete drafts controller
export const deleteDraft = async (
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
    const draft = await Drafts.findByIdAndDelete(id);
    if (!draft) createError({ message: "Draft not found", statusCode: 404 });

    res.status(200).json({
      data: draft,
      message: "Draft deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
