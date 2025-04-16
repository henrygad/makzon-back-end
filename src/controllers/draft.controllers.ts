import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import createError from "../utils/error";
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
    const { userName } = req.session.user!;

    const drafts = await Drafts.find({ author: userName });
    if (!drafts) return createError({ message: "Draft not found", statusCode: 404 });
    const getDrafts = drafts.map(draft => draft.toObject());    

    res.status(200).json({
      data: getDrafts
        .map((draft) => ({
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

    const draft = await Drafts.findById(id);
    if (!draft) return createError({ message: "Draft not found", statusCode: 404 });
    const getDraft = draft.toObject();

    res.status(200).json({
      data: {
        ...getDraft,
        _html: {
          title: decodeHtmlEntities(getDraft._html.title),
          body: decodeHtmlEntities(getDraft._html.body),
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

    const { userName } = req.session.user!;

    // Parse request body    
    for (const key in req.body) {
      let value: string = req.body[key];
      try {
        value = JSON.parse(value);
      } catch {
        createError({ message: "Invalid JSON data. Please provide only json data", statusCode: 422 });
      }
      req.body[key] = value;
    }

    const image_from_multer = req.file?.filename;
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

    const draft = await Drafts.create({
      publishedId,
      title,
      image: image_from_multer || image,
      body,
      _html,
      slug,
      catigories,
      mentions,
      author: userName,
      status: "drafted",
    });    
    if (!draft) return createError({ message: "Draft not added", statusCode: 400 });
    const getDraft = draft.toObject();    

    res.status(201).json({
      data: {
        ...getDraft,
        _html: {
          title: decodeHtmlEntities(getDraft._html.title),
          body: decodeHtmlEntities(getDraft._html.body),
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

    // Parse request body
    for (const key in req.body) {
      let value: string = req.body[key];
      try {
        value = JSON.parse(value);
      } catch {
        createError({ message: "Invalid JSON data. Please provide only json data", statusCode: 422 });
      }
      req.body[key] = value;
    }
    const image_from_multer = req.file?.filename;
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

    const draft = await Drafts.findByIdAndUpdate(
      id,
      {
        publishedId,
        image: image_from_multer || image,
        title,
        body,
        _html,
        catigories,
        mentions,
        slug,
        status: "draft",
      },
      { new: true }
    );
    if (!draft) return createError({ message: "Draft not found", statusCode: 404 });
    const getDraft = draft.toObject();  

    res.status(200).json({
      data: {
        ...getDraft,
        _html: {
          title: decodeHtmlEntities(getDraft._html.title),
          body: decodeHtmlEntities(getDraft._html.body),
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
