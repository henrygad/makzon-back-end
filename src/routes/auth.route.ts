import { Router } from "express";
import { localRegistretion, logout, localLogin, logoutRest, googleAuthRequest, googleLogin} from "../controllers/auth.controllers";
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
import { changePassword, findUser, resetPassword, verifyOTP } from "../controllers/password.controllers";

const router = Router();

// Local authentication
router.post("/register", authValidator_register, localRegistretion);
router.post("/login", authValidator_login, localLogin);

// Google authentication
router.get("/google", googleAuthRequest);
router.get("/google/callback", googleLogin);

// Verify user account
router.get("/opt/", isAuthenticated, sendVerificationOTP);
router.get("/verify", authValidator_varification_query, isAuthenticated, verifyUser);

// Reset or change password
router.get("/password/forget", authValidator_varification_query, verifyOTP);
router.post("/password/forget", authValidator_varification_body, findUser);
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
router.get("/logout", isAuthenticated, logout); // current user
router.get("/logout/rest", logoutRest); // rest of the users in this account


export default router;
