"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = require("../controllers/auth.controllers");
const passport_config_1 = __importDefault(require("../config/passport.config"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const verification_controllers_1 = require("../controllers/verification.controllers");
const auth_validator_1 = require("../validators/auth.validator");
const email_controllers_1 = require("../controllers/email.controllers");
const password_controllers_1 = require("../controllers/password.controllers");
const router = (0, express_1.Router)();
// Local authentication
router.post("/register", auth_validator_1.authValidator_register, auth_controllers_1.register);
router.post("/login", auth_validator_1.authValidator_login, passport_config_1.default.authenticate("local"), auth_controllers_1.login);
// Google authentication
router.get("/google", passport_config_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_config_1.default.authenticate("google", { failureRedirect: "/login" }), auth_controllers_1.login);
// Verify user
router.post("/verify", auth_validator_1.authValidator_varification_body, verification_controllers_1.sendVerificationOTP);
router.get("/verify", auth_validator_1.authValidator_varification_query, verification_controllers_1.verifyUser);
// Reset or change password
router.post("/password/forget", auth_validator_1.authValidator_varification_body, password_controllers_1.sendForgetPasswordOTP);
router.get("/password/forget", auth_validator_1.authValidator_varification_query, password_controllers_1.verifyForgetPasswordOTP);
router.post("/password/reset", auth_validator_1.authValidator_resetPassword, password_controllers_1.resetPassword);
router.post("/password/change", auth_validator_1.authValidator_changePassword, auth_middleware_1.isAuthenticated, password_controllers_1.changePassword);
// Chnage account email
router.post("/email", auth_validator_1.authValidator_changeEmail_request, auth_middleware_1.isAuthenticated, email_controllers_1.sendChangeEmailOTP);
router.post("/email/change", auth_validator_1.authValidator_changeEmail, auth_middleware_1.isAuthenticated, email_controllers_1.changeEmail);
// Logout
router.get("/logout", auth_controllers_1.logout); // current user
router.get("/logout/rest", auth_controllers_1.logoutRest); // rest of the users in this account
exports.default = router;
