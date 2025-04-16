import { NextFunction, Request, Response } from "express";
import Media from "../models/media.model";
import createError from "../utils/error";
import { validationResult } from "express-validator";
import { frontEndMediaProps } from "../types/media.type";

// get user media filenames from db
export const getUserMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.session.user!;
    const media = await Media.find({ uploader: user.userName });
    if (!media)
      return createError({ statusCode: 404, message: "No files found" });

    const sendMediaNeccData: frontEndMediaProps[] = media.map((file) => ({
      _id: file._id,
      filename: file.filename,
      fieldname: file.fieldname,
      mimetype: file.mimetype,
      size: file.size,
      uploader: file.uploader,
    }));

    res.status(200).json({
      message: "Successfully fetched files",
      success: true,
      data: sendMediaNeccData,
    });
  } catch (error) {
    next(error);
  }
};
// Stream single media
export const getSingleMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { filename } = req.params as { filename: string };

    const media = await Media.findOne({ filename });
    if (!media)
      return createError({ statusCode: 404, message: "File not found" });

    res.setHeader(
      "Access-Control-Allow-Origin",
      process.env.DOMAIN_NAME_FRONTEND!
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // crucial for loading cor images
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${media.originalname}"`
    );
    res.setHeader("Content-Length", media.size.toString());
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.setHeader("Pragma", "no-cache");

    res.contentType(media.mimetype); // e.g. image/png, image/jpeg
    res.send(media.data); // send the Buffer
  } catch (error) {
    next(error);
  }
};
// Send media data after upload to db
export const sendMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.media)
      return createError({ statusCode: 400, message: "No file uploaded" });

    res.status(201).json({
      message: "Successfully uploaded file",
      success: true,
      data: req.media, // Return only the necessary fields,
    });
  } catch (error) {
    next(error);
  }
};
// Delete media
export const deleteMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { filename } = req.params as { filename: string };

    // Delete file from db
    const file = await Media.deleteOne({ filename });
    if (!file)
      return createError({ statusCode: 404, message: "File not found" });

    res.status(200).json({
      message: "File deleted successfully",
      success: true,
      data: { filename },
    });
  } catch (error) {
    next(error);
  }
};
