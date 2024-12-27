import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller";
import passport from "../config/passport.config";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
  sendVerificationOTP,
  verifyUser,
} from "../controllers/verification.controller";
import createError from "../utils/error.utils";
import { IUser } from "../models/user.model";
import { authValidate_changeEmail, authValidate_changePassword, authValidate_login, authValidate_register, authValidate_resetPassword, authValidate_varification_body, authValidate_varification_query } from "../validators/auth.validator";
import { changeEmail, sendChangeEmailOTP } from "../controllers/email.controllers";

const router = Router();

// Local authentication
router.post("/register", authValidate_register, register);
router.post("/login", authValidate_login, passport.authenticate("local"), login);

// Google authentication
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res, next) => {
    try {
      // Add current user session id to user.session array
      if (req.user && req.session.id) {
        (req.user as IUser).sessions.push({
          token: req.session.id,
          toExpire: req.session.cookie.maxAge || 0,
        });
        await (req.user as IUser).save();
      } else {
        createError({
          statusCode: 401,
          message: "Authentication failed: Session not found",
        });
      }

      res.status(200).json({
        message: `Welcome back ${(req.user as IUser)?.userName}, you've successfully login into your account`,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Verify user
router.post("/verify", authValidate_varification_body, sendVerificationOTP);
router.get("/verify", authValidate_varification_query, verifyUser);

// Reset or change password
router.post("/password", authValidate_varification_body, verifyUser);
router.get("/password", authValidate_varification_query, verifyUser);
router.post("/password/reset", authValidate_resetPassword, verifyUser);
router.post("/password/change", authValidate_changePassword, isAuthenticated, verifyUser);

// Chnage account email 
router.post("/email", authValidate_varification_body, isAuthenticated, sendChangeEmailOTP);
router.post("/email/change", authValidate_changeEmail, isAuthenticated, changeEmail);

// Log out current login user
router.get("/logout", isAuthenticated, logout);

export default router;
