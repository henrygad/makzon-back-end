"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceHTTPS = exports.security = void 0;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
const sanitize_middleware_1 = __importDefault(require("./sanitize.middleware"));
// Security middleware
const security = (app) => {
    // Secure HTTP headers
    app.use((0, helmet_1.default)());
    // Enable CORS for the frontend
    if (process.env.SAME_ORIGIN === "false") {
        app.use((0, cors_1.default)({
            origin: [], // Allow requests from this origin
            methods: [], // Allow specific HTTP methods
            credentials: true, // Allow
        }));
    }
    // Set Content-Security-Policy header
    app.use((_req, res, next) => {
        res.setHeader("Content-Security-Policy", "default-src 'self'; media-src 'self' blob:;");
        next();
    });
    // Prevent XSS attacks
    app.use((0, xss_clean_1.default)());
    app.use(sanitize_middleware_1.default); // ( Deep sanitize )
    // Prevent HTTP Parameter Pollution
    app.use((0, hpp_1.default)());
    // Rate limiting
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per `windowMs`
        message: "Too many requests from this IP, please try again later.",
    }));
};
exports.security = security;
// Enforce HTTPS
const enforceHTTPS = (req, res, next) => {
    if (!req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
};
exports.enforceHTTPS = enforceHTTPS;
