import { Request, Response, NextFunction} from "express";
import createError from "../utils/error";

// 404 api route not found controller
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
    next(
        createError({
            statusCode: 404,
            message: `Route not found ${req.originalUrl}`,
        })
    );
};