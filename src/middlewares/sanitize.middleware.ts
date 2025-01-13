import { NextFunction, Response, Request } from "express";
import sanitizeHtml from "sanitize-html";

// Middleware to sanitize inputs
const sanitize = (req: Request, _res: Response, next: NextFunction) => {

    // Sanitize object recursively
    const sanitizeObject = <T>(obj: T): T => {
        if (typeof obj === "string") {
            return sanitizeHtml(obj, {allowedTags: [], allowedAttributes: {}}) as T;
        }

        if (typeof obj === "object" && obj !== null) {
            for (const key in obj) {
                obj[key] = sanitizeObject(obj[key]);
            }
        }

        return obj;
    };

    // Sanitize request body, query, and params
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);

    next();
};

export default sanitize;
