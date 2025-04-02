import { Response, NextFunction } from "express";
import createError from "../utils/error";
import { CustomRequest } from "../types/global";

// Authenticate user middleware
export const isAuthenticated = (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
) => {
  try {

    if (req.session && req.session.id) {
      if (req.session.user) {        
        next();
      } else {
        createError({ statusCode: 401, message: "Unauthorized user" });
      }
    } else {
      createError({ statusCode: 401, message: "Session expired. Please you have to Re-login" });
    }
  } catch (error) {
    next(error);
  }
};

