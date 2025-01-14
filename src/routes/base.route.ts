import { Router, Request, Response } from "express";
import { Session } from "express-session";

const router = Router();

interface CustomSession extends Session {
  visited?: boolean;
}
interface CustomRequest extends Request {
  session: CustomSession;
}

// Base api route
router.get("/", (req: CustomRequest, res: Response) => {
  if (!req.session.visited) {
    // Modify session
    req.session.visited = true;
    req.session.save();
  }
  res.status(200).json({
    message: "Welcome user",
    data: {
      session: req.session,
      sessionId: req.session.id,
    },
    success: true,
  });
});

export default router;
