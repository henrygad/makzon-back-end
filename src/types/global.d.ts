import "express-session";
import { IUser } from "../models/user.model";

declare module "express-session" {
    interface Session extends Partial<SessionData> {
        visited?: boolean; // Add the 'visited' property here
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
