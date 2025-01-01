import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import hpp from "hpp";
import { Application, Request, Response, NextFunction } from "express";

// Security middleware
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

  // Content Security Policy (CSP)
  app.use((_, res: Response, next: NextFunction) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; media-src 'self' blob:;"
    );
    next();
  });
  
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

// Middleware to enforce redirect to https for production
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
