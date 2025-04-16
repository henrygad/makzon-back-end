import multer from "multer";
import path from "path";
import acceptedFiles from "../utils/fileFromat";
import createError from "../utils/error";
import { keepInMemoryStorage } from "../config/mediastorage.config";
import { NextFunction, Request, Response } from "express";
import mediaProps from "../types/media.type";
import Media, { IMedia } from "../models/media.model";


// Filter file and create new instanceof multer
const uploadMedia = multer({
  storage: keepInMemoryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter(_req, file, callback) {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const accepted_ext = acceptedFiles[fileExt as keyof typeof acceptedFiles];
    const accepted_mimeType = accepted_ext === file.mimetype;

    if (!accepted_mimeType) {
      return callback(
        createError({ statusCode: 415, message: "Unsupported file type" }),
        false
      );
    }
    file.filename = Date.now() + "-" + file.originalname.replace(/ /g, "-");
    callback(null, true);
  },
});

// Store uploaded file in memory to db
export const storeMediaToDB = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const user = req.session.user!;
    let getRawFile: mediaProps[] = [];

    if (req.file) {
      // A single file was uploaded
      const file: Express.Multer.File = req.file;
      getRawFile = [{
        uploader: user.userName,
        filename: file.filename,
        originalname: file.originalname,
        fieldname: file.fieldname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer,
        encoding: file.encoding,
        destination: "",
        path: "",
      }];

    } else if (req.files && Array.isArray(req.files) && req.files.length) {
      // Multiple files was uploaded
      getRawFile = req.files
        .map((file: Express.Multer.File) => ({
          uploader: user.userName,
          filename: file.filename,
          originalname: file.originalname,
          fieldname: file.fieldname,
          mimetype: file.mimetype,
          size: file.size,
          data: file.buffer,
          encoding: file.encoding,
          destination: "",
          path: "",
        }));

    } else {
      // No file was uploaded
      req.media = undefined;
      return next(); // Continue to the next middleware
    }

    // Save file to db
    const multipleMedia = await Media.create(...getRawFile);
    if (!multipleMedia) return createError({ statusCode: 500, message: "File not saved" });

    if (Array.isArray(multipleMedia)) {
      req.media = multipleMedia.map((media) => (
        {
          _id: media._id,
          filename: media.filename,
          fieldname: media.fieldname,
          mimetype: media.mimetype,
          size: media.size,
          uploader: media.uploader
        }
      ));
    } else {
      const media = multipleMedia as IMedia;
      req.media = {
        _id: media._id,
        filename: media.filename,
        fieldname: media.fieldname,
        mimetype: media.mimetype,
        size: media.size,
        uploader: media.uploader
      };
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default uploadMedia;
