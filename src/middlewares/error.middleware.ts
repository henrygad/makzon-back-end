import { NextFunction, Request, Response } from "express";

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}
// Global error middleware
const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  res.status(err.statusCode).json({
    ...err,
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
    date: Date(),
    targetUrl: req.originalUrl
  });

  next();
};

export default errorHandler;
