import { Request, Response, NextFunction } from "express";
import createError from "../utils/error";
import { IUser } from "../models/user.model";

// Authenticate user middleware
export const isAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {

    if (
      req.isAuthenticated() &&// Auth from server
      (req.user as IUser).sessions.some(value => value.token === req.session.id && value.toExpire > Date.now()) // Auth from db
    ) {
      next();
    } else {
      createError({ statusCode: 401, message: "Unauthorized" });
    }
  } catch (error) {
    next(error);
  }
};
