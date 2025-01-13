import "express-session";
import { IUser } from "../models/user.model";

declare module "express-session" {
    interface Session extends Partial<SessionData> {
        visited?: boolean; // Add the 'visited' property here
        searchHistory?: {_id: string, search: string}[] // Add searchHistory array to user session
    }
}

declare global {
    namespace Express {
        interface Request {
            isAuthenticated: () => boolean,
        }
        interface User extends IUser {
            customProperty?: string; // Extend 'User' globally
        }       
    }
}
