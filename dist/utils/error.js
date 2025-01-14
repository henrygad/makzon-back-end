"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//  Reuseable custom error handler
class customError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
;
const createError = ({ statusCode, message }) => {
    throw new customError(statusCode, message);
};
exports.default = createError;
