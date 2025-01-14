"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Global error middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode).json({
        ...err,
        message: err.message || "Server Error",
        stack: err.stack, // process.env.NODE_ENV === "production" ? null : err.stack,
        date: Date(),
        targetUrl: req.originalUrl
    });
    next();
};
exports.default = errorHandler;
