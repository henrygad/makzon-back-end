import express, { Request, Response } from "express";
import passport from "passport";
import session from "./config/session.config";
import connectDB from "./config/db.config";
import authRoutes from "./routes/auth.route";
import securityMiddleware from "./middlewares/security.middleware";
import { enforceHTTPS } from "./middlewares/security.middleware";
import errorHandler from "./middlewares/error.middleware";
import createError from "./utils/error.utils";
import { Session } from "express-session";
import "dotenv/config";

connectDB(); // Connect to the database

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // Trust first proxy
  app.use(enforceHTTPS); // Enforce HTTPS
}

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

securityMiddleware(app); // Apply security middleware

app.use(session); // Enable session support
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Enable session support for Passport

interface CustomSession extends Session {
  visited?: boolean;
};

interface CustomRequest extends Request {
  session: CustomSession;
};

app.use("/api/auth", authRoutes);
app.get("/api", (req: CustomRequest, res: Response) => {
  if (req.session?.visited) {
    // Check if the session was modified
    res.status(200).json({
      message: "Welcome client. You've visited this url before",
      ip: req.ip,
      protocol: req.protocol,
    });
  } else {
    req.session.visited = true; // Modify session
    res.status(200).json({
      message: "Welcome our dear client",
      ip: req.ip,
      protocol: req.protocol,
    });
  }
});
app.all("*", (req, _, next) => {
  try {
    createError({
      statusCode: 404,
      message: `Can't find ${req.originalUrl}`,
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

export default app;
