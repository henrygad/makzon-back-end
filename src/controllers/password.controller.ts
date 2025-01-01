import { NextFunction, Request, Response } from "express";
import Users, { IUser } from "../models/user.model";
import createError from "../utils/error";
import OTP from "../utils/OTP";
import sendEmail from "../config/email.config";
import "dotenv/config";
import hideEmail from "../utils/hideEmail";
import { validationResult } from "express-validator";

// Send reset password otp
export const sendResetOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

     // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ statusCode: 400, message: errors.array()[0].msg });

    const { email }: {email: string} = req.body;

    // Find user
    const user = await Users.findOne({ email });
    if (!user) createError({ statusCode: 404, message: "User not found" });

    // Generate and send OTP token
    const otp = OTP(4);
    const expireOn: number = Date.now() + 15 * 60 * 1000; // expires in 15 minutes
    const url =
      process.env.DOMAIN_NAME +
      `/api/auth/password?email=${user?.email}otp=${otp}`;

    // Send OTP token to user mail box
    const result = await sendEmail({
      emailTo: email,
      subject: "Reset password OTP request",
      template: `Hi ${user?.userName}. Your Reset password OTP is: ${otp}. or click this url ${url}`,
    });
    if (!result.sent)
      createError({
        statusCode: 500,
        message: "Failed to send verification email",
      });

    // Store OTP to user data
    if (user) {
      user.forgetPassWordToken = otp;
      user.forgetPassWordTokenExpiringdate = expireOn;
      await user.save();
    }

    res.status(200).json({
      message:
        "An OTP token has been sent to your email to reset your password",
      email: hideEmail(user?.email || ""),
    });
  } catch (error) {
    next(error);
  }
};
// verify otp
export const verifyResetOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { email, otp } = req.query as { email: string, otp: string };

    // Verify OTP token sent by user
    const user = await Users.findOne({
      email,
      forgetPassWordToken: otp,
      forgetPassWordTokenExpiringdate: { $gt: Date.now() },
    });
    if (!user)
      createError({
        statusCode: 404,
        message: "Invalid or expired verification token",
      });

    // Update user verification data
    if (user) {
      user.forgetPassWordToken = "";
      await user.save();
    }

    res.status(200).json({
      message: "Email verification successful for reseting your password",
      resetPasswordUrl: "/api/auth/password/reset",
    });
  } catch (error) {
    next(error);
  }
};
// reset password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

     // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ statusCode: 400, message: errors.array()[0].msg });

    const { email, newPassword }:
      { email: string, newPassword: string } = req.body;

    // Find user
    const user = await Users.findOne({
      email,
      forgetPassWordTokenExpiringdate: { $gt: Date.now() },
    });
    if (!user)
      createError({
        statusCode: 404,
        message:
          "User not found or time out to reset password. Please send new request",
      });

    if (user) {
      const sameAsOld = await user.isValidPassword(newPassword);
      if (sameAsOld)
        createError({
          statusCode: 400,
          message: "New password cannot be the same as old password",
        });
      
      user.forgetPassWordTokenExpiringdate = 0;
      user.password = newPassword;
      await user.save();
    }

    res.status(200).json({
      message:
        "Password has been successfully reset. You can now login with your new password.",
      loginUrl: "/api/auth/login",
    });
  } catch (error) {
    next(error);
  }
};
// chnage passwprd
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

     // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ statusCode: 400, message: errors.array()[0].msg });
    
    const { oldPassword, newPassword }:
      { oldPassword: string, newPassword: string } = req.body;
    const user = (req.user as IUser);

    if (user) {
      const sameAsOld = await user.isValidPassword(newPassword);
      if (sameAsOld)
        createError({
          statusCode: 400,
          message: "New password cannot be the same as old password",
        });

      const isMatch = await user.isValidPassword(oldPassword);
      if (isMatch)
        createError({ statusCode: 401, message: "Invalid password" });

      if (isMatch) {
        // Change user password
        user.password = newPassword;
        await user.save();
        req.user = user;
      }
    }

    res.status(200).json({
      message:
        "Password has been successfully changed. Would you like to logout from all devise, but keep you login on this devise?",
      logOutAllDeviseUrl: "/api/auth/logout/all",
    });
  } catch (error) {
    next(error);
  }
};
