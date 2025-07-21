import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import hpp from "hpp";
import { Application, Request, Response, NextFunction } from "express";
import sanitize from "./sanitize.middleware";

// Security middleware
export const security = (app: Application) => {
  // Secure HTTP headers
  app.use(helmet());

  // Enable CORS for the frontend
  const allowedOrigins = [
    process.env.DOMAIN_NAME_FRONTEND, // (for makzon front end production domain)
    "http://localhost:5173", // (for local dev)
    "https://makzontexteditor.netlify.app/", // (makzonrichtexteditor front end production domain)
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }));

  // Set Content-Security-Policy header
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; media-src 'self' blob:;"
    );
    next();
  });

  // Prevent XSS attacks
  app.use(xssClean());
  app.use(sanitize); // ( Deep sanitize )

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  }));

};
// Enforce HTTPS
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
