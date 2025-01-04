import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import session from "./config/session.config";
import { authRoutes, fileRoutes, testRoutes, userRoutes, SSE, postRoutes } from "./routes/index";
import {
  securityMiddleware,
  enforceHTTPS,
} from "./middlewares/security.middleware";
import errorHandler from "./middlewares/error.middleware";
import { Session } from "express-session";
import "dotenv/config";
import createError from "./utils/error";
import path from "path";
import fs from "fs";

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
app.get("/", (req: CustomRequest, res: Response, next: NextFunction) => {
  if (!req.session.visited) { // Modify session
    req.session.visited = true;
    req.session.save();
  } 

  const filePath = path.join(__dirname, "public", "home.html");
  if (!fs.existsSync(filePath)) createError({ statusCode: 404, message: "Page not found" });

  fs.readFile(filePath, "utf-8", (err, file) => { 
    if (err) next(createError({ statusCode: 500, message: "Failed to read index.html file" }));
    const dynamicFile = file
      .replace("{{name}}", "Henry gad")
      .replace("{{role}}", "Developer");
    
    res.header("Content-Type", "text/html");
    res.status(200).send(dynamicFile);
  });
}); // Base end point
app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/user", userRoutes); // User routes
app.use("/api/post", postRoutes); // Post routes
app.use("/api/file", fileRoutes); // File routes

app.use("/api/sse", SSE); // SSE routes
app.use("/api/test", testRoutes); // Testing routes
app.all("*", (req: Request, _: Response, next: NextFunction) => {
  next(createError({ statusCode: 404, message: `Route not found ${req.originalUrl}`, }));
}); // Not found route

app.use(errorHandler); // Error middleware

export default app;
