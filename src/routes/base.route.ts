import { Router, Response } from "express";
import { CustomRequest } from "../types/global";

const router = Router();

// Base api route
router.get("/", (req: CustomRequest, res: Response) => {
  if (!req.session.visited) {
    // Modify session
    req.session.visited = true;    
  }
  res.status(200).json({
    message: "Welcome user",
    sessionId: req.session.id,  
    session: req.session.cookie,     
    success: true,
  });
    
});

export default router;
