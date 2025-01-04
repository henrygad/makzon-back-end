import { Router } from "express";
import { register, logout, login, logoutRest} from "../controllers/auth.controllers";
import passport from "../config/passport.config";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
  sendVerificationOTP,
  verifyUser,
} from "../controllers/verification.controllers";
import {
  authValidator_changeEmail,
  authValidator_changeEmail_request,
  authValidator_changePassword,
  authValidator_login,
  authValidator_register,
  authValidator_resetPassword,
  authValidator_varification_body,
  authValidator_varification_query,
} from "../validators/auth.validator";
import {
  changeEmail,
  sendChangeEmailOTP,
} from "../controllers/email.controllers";
import { changePassword, resetPassword, sendForgetPasswordOTP, verifyForgetPasswordOTP } from "../controllers/password.controllers";

const router = Router();

// Local authentication
router.post("/register", authValidator_register, register);
router.post(
  "/login",
  authValidator_login,
  passport.authenticate("local"),
  login
);

// Google authentication
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  login
);

// Verify user
router.post("/verify", authValidator_varification_body, sendVerificationOTP);
router.get("/verify", authValidator_varification_query, verifyUser);

// Reset or change password
router.post("/password/forget", authValidator_varification_body, sendForgetPasswordOTP);
router.get("/password/forget", authValidator_varification_query, verifyForgetPasswordOTP);
router.post("/password/reset", authValidator_resetPassword, resetPassword);
router.post(
  "/password/change",
  authValidator_changePassword,
  isAuthenticated,
  changePassword
);

// Chnage account email
router.post(
  "/email",
  authValidator_changeEmail_request,
  isAuthenticated,
  sendChangeEmailOTP
);
router.post(
  "/email/change",
  authValidator_changeEmail,
  isAuthenticated,
  changeEmail
);

// Logout
router.get("/logout", logout); // current user
router.get("/logout/rest", logoutRest); // rest of the users in this account


export default router;
