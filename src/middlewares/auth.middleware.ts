import { Request, Response, NextFunction } from "express";
import createError from "../utils/error.utils";
import { IUser } from "../models/user.model";

// Authenticate user middleware
export const isAuthenticated = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    if (
      req.isAuthenticated() && // Auth from server
      (req.user as IUser).sessions.some(
        (
          value // Auth from db
        ) => value.token === req.session.id && value.toExpire > Date.now()
      )
    ) {
      next();
    } else {
      createError({ statusCode: 401, message: "Unauthorized" });
    }
  } catch (error) {
    next(error);
  }
};
