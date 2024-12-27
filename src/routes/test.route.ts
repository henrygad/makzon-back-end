import { Router,  Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import Users from "../models/user.model";
import createError from "../utils/error.utils";
import OTP from "../utils/OTP";
import sendEmail from "../utils/sendEmail";

const router = Router();


router.get(
  "/users",
  isAuthenticated,
  async (_: Request, res: Response, next: NextFunction) => {
    try {
      const users = await Users.find();
      if (!users.length)
        createError({ statusCode: 404, message: "No users found" });

      res.status(200).json({ message: "Welcome to users route", users });
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.get("/email", async (_: Request, res: Response, next: NextFunction) => {
  try {
    // Generate OTP token and send a welcome email to user along the otp to verify account
    const otp = OTP(4);
    const email = "henrygad.orji@gmail.com";
    const url = process.env.DOMAIN_NAME + `/api/auth/verify?otp=${otp}`;
    const result = await sendEmail({
      emailTo: email,
      subject: "Email Verification",
      template: `Welcome Henry Loveday. Your verification code is: ${otp}. or click this url ${url}`,
    });

    if (!result.sent)
      createError({ statusCode: 500, message: "Failed to send email" });

    res.status(200).json({
      message: "OTP token has been sent to your mail box",
    });
  } catch (error) {
    next(error);
  }
});

export default router;