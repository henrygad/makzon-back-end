import { NextFunction, Request, Response } from "express";
import Users, { IUser } from "../models/user.model";
import createError from "../utils/error";
import OTP from "../utils/OTP";
import sendEmail from "../config/email.config";
import "dotenv/config";
import hideEmail from "../utils/hideEmail";
import { validationResult } from "express-validator";

// Send otp for changing email request
export const sendChangeEmailOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(
                createError({ statusCode: 400, message: errors.array()[0].msg })
            );
        }

        const { email } : {email: string} = req.body;
        const newEmail = email; // Reasign incoming email as new email
        const user = req.user as IUser;

        // Validate cannot use this email
        let cannotUseEmail: boolean | null = user.email === newEmail;
        if (cannotUseEmail) createError({ statusCode: 400, message: "New email cannot be the same as current email" });
        cannotUseEmail = await Users.findOne({ email: newEmail });
        if (cannotUseEmail) createError({ statusCode: 400, message: "Email is already in use" });

        // Send OTP token to the old email box
        await sendEmail({
            emailTo: user.email,
            subject: "Change account email request",
            template: `Hi ${user.userName}. 
            You recently requested to change your account email ${user.email} to ${newEmail}.
           If you didn't make this requst please contact us or login to you account and change your password`,
        });

        // Generate and send OTP token to new email
        const otp = OTP(4);
        const expireOn: number = Date.now() + 15 * 60 * 1000; // expires in 15 minutes

        // Send OTP token to the new email box
        const result = await sendEmail({
            emailTo: newEmail,
            subject: "Change account email OTP request",
            template: `Hi ${user.userName}. 
            You requested to change your account email ${user.email} to ${newEmail}.
            Here is your OTP to change your email: ${otp}`,
        });
        if (!result.sent)
            createError({
                statusCode: 500,
                message: "Failed to send verification email",
            });

        // Store OTP to user data
        if (user) {
            user.changeEmailVerificationToken = otp;
            user.changeEmailVerificationTokenExpiringdate = expireOn;
            user.requestChangeEmail = newEmail;
            await user.save();
            req.user = user;
        }

        res.status(200).json({
            message:
                "An OTP token has been sent to your mail box to change your email",
            email: hideEmail(newEmail || ""),
        });
    } catch (error) {
        next(error);
    }
};
// Chnage email
export const changeEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(
                createError({ statusCode: 400, message: errors.array()[0].msg })
            );
        }

        const { newEmail, otp }:
            { newEmail: string, otp: string } = req.body;
        const user = (req.user as IUser);

        // Verify OTP token sent by user
        if (user.requestChangeEmail !== newEmail ||
            user.changeEmailVerificationToken !== otp ||
            user.changeEmailVerificationTokenExpiringdate < Date.now()
        ) createError({
            statusCode: 401,
            message: "Invalid or expired OTP token"
        });

        // Change user email
        if (user) {
            user.changeEmailVerificationToken = "";
            user.changeEmailVerificationTokenExpiringdate = 0;
            user.requestChangeEmail = "";
            user.email = newEmail;
            await user.save();
            req.user = user;
        };

        res.status(200).json({
            message: "Email changed successfully"
        });
    } catch (error) {
        next(error);
    }
};

