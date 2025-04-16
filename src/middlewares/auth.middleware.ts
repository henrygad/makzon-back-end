import  { Response, Request, NextFunction } from "express";
import createError from "../utils/error";
import Users from "../models/user.model";

// Authenticate user middleware
export const isAuthenticated =  async(
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    
    if (req.session && req.session.id) {    
      if (req.session.user) {     
        const user = await Users.findById(req.session.user._id);
        if (user && user.sessions.find(session => session.token === req.session.id)) {
          req.session.user = user;
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

