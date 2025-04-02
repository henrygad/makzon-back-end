import  { Response, NextFunction } from "express";
import createError from "../utils/error";
import { CustomRequest } from "../types/global";
import Users from "../models/user.model";

// Authenticate user middleware
export const isAuthenticated =  async(
  req: CustomRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    
    if (req.session && req.session.id) {    
      if (req.session.user) {     
        const user = await Users.findById(req.session.user._id);
        if (user && user.sessions.find(session => session.token === req.session.id)) {
          req.session.user = user; // Update session with the latest user data
          next();
        } else { 
          createError({ statusCode: 401, message: "Unauthorized: user has been logout" });
        }
        
      } else {
        createError({ statusCode: 401, message: "Unauthorized user" });
      }
    } else {
      createError({ statusCode: 401, message: "Login session has expired. Please Re-login" });
    }
  } catch (error) {
    next(error);
  }
};

