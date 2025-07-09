import { NextFunction, Request, Response } from "express";

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  response: {
    data: string
  }
}
// Global error middleware
const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;

  res.
    status(err.statusCode)
    .json({
      ...(err.response?.data && { details: err.response.data }),
      message: err.message || "Server Error",
      stack: err.stack, // process.env.NODE_ENV === "production" ? null : err.stack,
      date: Date(),
      targetUrl: req.originalUrl,
      name: err.name,
    });

  next();
};

export default errorHandler;
