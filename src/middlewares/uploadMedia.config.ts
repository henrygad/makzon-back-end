import multer from "multer";
import path from "path";
import acceptedFiles from "../utils/fileFromat";
import createError from "../utils/error";
import { keepInMemoryStorage } from "../config/mediastorage.config";
import { NextFunction, Request, Response } from "express";
import mediaProps from "../types/media.type";
import Media from "../models/media.model";


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
    file.filename = Date.now() + "-" + file.originalname;
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
    let getRawFile: mediaProps | mediaProps[];

    if (req.file) {
      const file: Express.Multer.File = req.file;
      getRawFile = {
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
      };

      // save file to db
      const singleMedia = await Media.create(getRawFile);
      if (!singleMedia) return createError({ statusCode: 500, message: "File not saved" });

      req.media = {
        _id: singleMedia._id,
        filename: singleMedia.filename,
        fieldname: singleMedia.fieldname,
        mimetype: singleMedia.mimetype,
        size: singleMedia.size,
      };

    } else {
      if (req.files && Array.isArray(req.files) && req.files.length) {

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

        // save file to db
        const multipleMedia = await Media.create(getRawFile);
        if (!multipleMedia) return createError({ statusCode: 500, message: "File not saved" });        

        req.media = multipleMedia.map((media) => (
          {
            _id: media._id,
            filename: media.filename,
            fieldname: media.fieldname,
            mimetype: media.mimetype,
            size: media.size,
          }
        ));
       

      } else {
        req.media = undefined;
       
      }
    }

    next();
   
  } catch (error) {
    next(error);
  }
};

export default uploadMedia;
