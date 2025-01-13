import express from "express";
import passport from "passport";
import session from "./config/session.config";
import {
  authRoutes,
  fileRoutes,
  testRoutes,
  userRoutes,
  postRoutes,
  commentRoutes,
  searchRoutes,
  draftRoutes,
  baseRoute,
} from "./routes/index";
import { security, enforceHTTPS } from "./middlewares/security.middleware";
import errorHandler from "./middlewares/error.middleware";
import "dotenv/config";
import { notFound } from "./controllers/404.controller";

const app = express();

if (process.env.NODE_ENV === "production") {
  if (process.env.ON_PROXY === "true") {
    app.set("trust proxy", 1); // Trust first proxy when behind a reverse proxy (e.g. Third part domain)
  }

  app.use(enforceHTTPS); // Enforce HTTPS
}

app.use(express.json({ limit: "100mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "l00mb" })); // Parse URL-encoded

security(app); // Apply security middleware

app.use(session); // Enable session support
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Enable session support for Passport

app.use("/api", baseRoute); // Base api
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/user", userRoutes); // User routes
app.use("/api/post", postRoutes); // Post routes
app.use("/api/comment", commentRoutes); // Comment routes
app.use("/api/draft", draftRoutes); // Draft routes
app.use("/api/notification", commentRoutes); // Notification routes
app.use("/api/file", fileRoutes); // File routes
app.use("/api/search", searchRoutes); // Search routes
app.use("/api/test", testRoutes); // Testing routes
app.all("/api/*", notFound); // Not found route

app.use(errorHandler); // Error middleware

export default app;
