import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import hpp from "hpp";
import { Application, Request, Response, NextFunction } from "express";

const securityMiddleware = (app: Application) => {
  // Use Helmet to secure HTTP headers
  app.use(helmet());

  // Enable CORS for trusted domains
  app.use(cors());

  // Sanitize request data and prevent XSS
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
  if (process.env.NODE_ENV === "production" && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  };
  next();
};


export default securityMiddleware;
