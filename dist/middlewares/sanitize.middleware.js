"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sanitize_html_1 = __importDefault(require("sanitize-html"));
// Middleware to sanitize inputs
const sanitize = (req, _res, next) => {
    // Sanitize object recursively
    const sanitizeObject = (obj) => {
        if (typeof obj === "string") {
            return (0, sanitize_html_1.default)(obj, { allowedTags: [], allowedAttributes: {} });
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
exports.default = sanitize;
