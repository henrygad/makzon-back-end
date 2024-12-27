import "express";
import { IUser } from "../models/user.model";

declare global {
    namespace Express{
        interface User extends IUser {            
            // Add at least one additional property to differentiate from IUser
            customProperty?: string;
        }
    }
}