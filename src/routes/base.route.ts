import { Router, Request, Response } from "express";

const router = Router();

// Base api route
router.get("/", (req: Request, res: Response) => {
  if (!req.session.visited) {
    // Modify session
    req.session.visited = true;
    req.session.save();
  }
  res.status(200).json({
    message: "Welcome user",
    sessionId: req.session.id,  
    session: req.session.cookie, 
    success: true,
  });
    
});

export default router;
