import "express";
import "express-session";
import { IUser } from "./src/models/user.model";
import mongoose from "mongoose";

declare module "express-session" {
    interface SessionData {
        passport: {
            user?: string;
        };
    }
}

declare global {
    namespace Express {
        interface User extends IUser {
            _id: mongoose.ObjectId
        };
    }
}