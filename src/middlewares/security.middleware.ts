import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import hpp from "hpp";
import { Application, Request, Response, NextFunction } from "express";

export const securityMiddleware = (app: Application) => {
  // Secure HTTP headers
  app.use(helmet());

  // Enable CORS for trusted domains
  if (process.env.SAME_ORIGIN === "false") {
    app.use(
      cors({
        origin: [], // Allow requests from this origin
        methods: [], // Allow specific HTTP methods
        credentials: true, // Allow
      })
    );
  }

  // Sanitize inputs to prevent XSS (cross-site scripting) attack
  app.use(xssClean());

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Apply rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `windowMs`
    message: "Too many requests from this IP, please try again later.",
  });

  app.use(limiter);
};

export const enforceHTTPS = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
};
