"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const session_config_1 = __importDefault(require("./config/session.config"));
const index_1 = require("./routes/index");
const security_middleware_1 = require("./middlewares/security.middleware");
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
require("dotenv/config");
const _404_controller_1 = require("./controllers/404.controller");
const app = (0, express_1.default)();
if (process.env.NODE_ENV === "production") {
    if (process.env.ON_PROXY === "true") {
        app.set("trust proxy", 1); // Trust first proxy when behind a reverse proxy (e.g. Third part domain)
    }
    app.use(security_middleware_1.enforceHTTPS); // Enforce HTTPS
}
app.use(express_1.default.json({ limit: "100mb" })); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true, limit: "l00mb" })); // Parse URL-encoded
(0, security_middleware_1.security)(app); // Apply security middleware
app.use(session_config_1.default); // Enable session support
app.use(passport_1.default.initialize()); // Initialize Passport
app.use(passport_1.default.session()); // Enable session support for Passport
app.use("/api", index_1.baseRoute); // Base api
app.use("/api/auth", index_1.authRoutes); // Auth routes
app.use("/api/user", index_1.userRoutes); // User routes
app.use("/api/post", index_1.postRoutes); // Post routes
app.use("/api/comment", index_1.commentRoutes); // Comment routes
app.use("/api/draft", index_1.draftRoutes); // Draft routes
app.use("/api/notification", index_1.commentRoutes); // Notification routes
app.use("/api/file", index_1.fileRoutes); // File routes
app.use("/api/search", index_1.searchRoutes); // Search routes
app.use("/api/test", index_1.testRoutes); // Testing routes
app.all("/api/*", _404_controller_1.notFound); // Not found route
app.use(error_middleware_1.default); // Error middleware
exports.default = app;
