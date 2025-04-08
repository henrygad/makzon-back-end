import { IUser } from "../models/user.model";
import { Request } from "express";
import { Session } from "express-session"; // Import Session interface from express-session
import "express-session";
import { frontEndMediaProps } from "./media.type";

declare module "express-session" {
  interface SessionData {
    user?: IUser,
    searchHistory?: { _id: string, search: string }[],
    visited?: boolean,
  }
}

interface CustomSession extends Session {
  user?: IUser,
  searchHistory?: { _id: string, search: string }[],
  visited?: boolean,
}

declare global {
  namespace Express {
    interface Request {
      media?: frontEndMediaProps | frontEndMediaProps[]; // Add media property to request
      session: CustomSession; // Use the custom session interface      
    }
  }
}


export interface CustomRequest extends Request {
  media?: frontEndMediaProps | frontEndMediaProps[]; 
  session: CustomSession; // Use the custom session interface
}
