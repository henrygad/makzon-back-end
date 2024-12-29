import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import session from "./config/session.config";
import { authRoutes, testRoutes, userRoutes } from "./routes/index";
import {
  securityMiddleware,
  enforceHTTPS,
} from "./middlewares/security.middleware";
import errorHandler from "./middlewares/error.middleware";
import { Session } from "express-session";
import "dotenv/config";
import createError from "./utils/error";
import path from "path";

interface CustomSession extends Session {
  visited?: boolean;
}

interface CustomRequest extends Request {
  session: CustomSession;
}

const app = express();

if (process.env.NODE_ENV === "production") {
  if (process.env.ON_PROXY === "true") {
    app.set("trust proxy", 1); // Trust first proxy when behind a reverse proxy (e.g. Third part domain)
  }

  app.use(enforceHTTPS); // Enforce HTTPS
}

app.use(express.json({ limit: "100mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "l00mb" })); // Parse URL-encoded 

securityMiddleware(app); // Apply security middleware

app.use(session); // Enable session support
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Enable session support for Passport

app.use(express.static(path.join(__dirname, "public"))); // Public route
app.get("/", (req: CustomRequest, res: Response) => {
  res.status(200).json({
    message: "Hi Welcome to Makzon api",
    session: req.session,
    ip: [req.ip, req.ips],
    protocal: req.protocol
  });
}); // Base end point 
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/user", userRoutes); // User routes
app.use("/api/file", userRoutes); // File routes

app.use("/api/test", testRoutes); // Testing routes
app.all("*", (req: Request, _: Response, next: NextFunction) => {
  next(createError({ statusCode: 404, message: `Route not found ${req.originalUrl}`, }));
}); // Not found route

app.use(errorHandler); // Error middleware

export default app;
