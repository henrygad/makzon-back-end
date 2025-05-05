import { NextFunction, Request, Response } from "express";
import Users from "../models/user.model";
import createError from "../utils/error";
import OTP from "../utils/OTP";
import sendEmail from "../config/email.config";
import "dotenv/config";
import { validationResult } from "express-validator";


// Find user if exist
export const findUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { identity }: { identity: string } = req.body;

    // Find user
    const user = await Users.findOne({
      $or: [{ userName: identity }, { email: identity }],
    });
    if (!user) return createError({ statusCode: 404, message: "User not found" });
    
    // Generate and send OTP token
    const otp = OTP(4);
    const expireOn: number = Date.now() + 5 * 60 * 1000; // expires in 5 minutes

    // Send OTP token to user mail box
    const result = await sendEmail({
      emailTo: user.email,
      subject: "Reset password OTP request",
      template: `Hi ${user?.userName}. Your Reset password OTP is: ${otp}. This OTP is valid for 5 minutes. If you did not request this, please ignore this email.`,  
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
      message: "successfully found user",
      data: user.toObject(),      
    });

  } catch (error) {
    next(error);
  }
};
// Verify otp
export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

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
      message: "User verification was successful. You  can now reseting password",
      resetPasswordUrl: "/api/auth/password/reset",
    });
  } catch (error) {
    next(error);
  }
};
// Reset password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { email, newPassword }:
      { email: string, newPassword: string } = req.body;

    // Find user
    const user = await Users.findOne({
      email,
      forgetPassWordToken: "",
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
      user.markModified("password");
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
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });
    const { oldPassword, newPassword }: { oldPassword: string, newPassword: string } = req.body;
    const user = req.session.user!;

    // Check if old password is valid
    const isMatch = await user.isValidPassword(oldPassword);
    if (!isMatch)
      createError({ statusCode: 401, message: "Invalid password" });

    // Check if new password is the same as old password
    const sameAsOld = await user.isValidPassword(newPassword);
    if (sameAsOld)
      createError({
        statusCode: 400,
        message: "New password cannot be the same as old password",
      });

    // Change user password
    user.password = newPassword;
    user.markModified("password");
    req.session.user = user;

    res.status(200).json({
      message:
        "Password has been successfully changed. Would you like to logout from all devise, but keep you login on this devise?",
      logOutAllDeviseUrl: "/api/auth/logout/rest",
    });
  } catch (error) {
    next(error);
  }
};
