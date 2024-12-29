import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import session from "./config/session.config";
import {authRoutes, testRoutes, userRoutes} from "./routes/index";
import {
  securityMiddleware,
  enforceHTTPS,
} from "./middlewares/security.middleware";
import errorHandler from "./middlewares/error.middleware";
import createError from "./utils/error";
import { Session } from "express-session";
import "dotenv/config";

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

app.use(express.json({limit: "100mb"})); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit:"l00mb"})); // Parse URL-encoded 

securityMiddleware(app); // Apply security middleware

app.use(session); // Enable session support
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Enable session support for Passport

app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/auth", userRoutes); // User routes
app.use("/api/test", testRoutes); // Testing routes

app.get("/", (req: CustomRequest, res: Response) => {
  const send = {
    ip: req.ip,
    protocol: req.protocol,
    session: req.session,
    user: req.user,
  };

  if (req.session?.visited) {
    // Check if the session was modified
    res.status(200).json({
      message: "Welcome to our website dear client for the first time",
      ...send,
    });
  } else {
    req.session.visited = true; // Modify session
    res.status(200).json({
      message: "Welcome back dear client",
      ...send,
    });
  }
});

app.all("*", (req: Request, _: Response, next: NextFunction) => {
  try {
    createError({
      statusCode: 404,
      message: `Can't find ${req.method} ${req.originalUrl}`,
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

export default app;
