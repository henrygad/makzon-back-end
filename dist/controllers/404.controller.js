"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const error_1 = __importDefault(require("../utils/error"));
// 404 api route not found controller
const notFound = (req, _res, next) => {
    next((0, error_1.default)({
        statusCode: 404,
        message: `Route not found ${req.originalUrl}`,
    }));
};
exports.notFound = notFound;
