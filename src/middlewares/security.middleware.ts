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
  if (process.env.SAME_ORIGIN === "false" &&
      process.env.DOMAIN_NAME_FRONTEND
  ) {
    app.use(
      cors({
        origin: [process.env.DOMAIN_NAME_FRONTEND], // Allow requests from this origin
       // methods: [], // Allow specific HTTP methods 
        credentials: true, // Allow
      })
    );
  }

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
    max: 100, // Limit each IP to 100 requests per `windowMs`
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
