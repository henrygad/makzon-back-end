//import "express-session"; // Import express-session module
import { IUser } from "../models/user.model";
import { Request } from "express";
import { Session } from "express-session"; // Import Session interface from express-session

 interface CustomSession extends Session {
    visited?: boolean; // Add any custom properties you need
    user?: IUser; // Add user property to session
}

export interface CustomRequest extends Request { 
    session: CustomSession; // Use the custom session interface 
    user?: IUser; // Add user property to request
}

declare global {
    namespace Express {
        interface Request {
            session: CustomSession; // Use the custom session interface
            user?: IUser; // Add user property to request
        }
    }
 }

