import { Request, Response} from "express";

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
};

const errorHandler = (err: ErrorWithStatus, _: Request, res: Response) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    status: err.statusCode || "error",
    message: err.message || "Server Error",
    isOperational: err.isOperational || false,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
    date: Date.toString(),
  });
};

export default errorHandler;
