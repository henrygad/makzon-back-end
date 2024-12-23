import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import passport from "passport";
import userProps from "../types/user.types";

const router = Router();

router.post("/register", register);
router.post("/login", passport.authenticate("local"), login);

router.get("/google", passport.authenticate("google", { scope: ["email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    //res.redirect("/");
     
    res.status(200).json({
      message: `Welcome back ${
        (req.user as userProps).userName
      }, you've successfully login into your account`,
    });
    
  }
);

export default router;
