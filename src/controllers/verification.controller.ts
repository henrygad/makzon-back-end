import { NextFunction, Request, Response } from "express";
import Users from "../models/user.model";
import createError from "../utils/error";
import OTP from "../utils/OTP";
import sendEmail from "../config/email.config";
import "dotenv/config";
import hideEmail from "../utils/hideEmail";
import { validationResult } from "express-validator";

// Send verification otp 
export const sendVerificationOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createError({ statusCode: 400, message: errors.array()[0].msg }));
        }

        const { email }: {email: string}= req.body;

        // Find user
        const user = await Users.findOne({ email });
        if (!user) createError({ statusCode: 404, message: "User not found" });

        // Generate and send OTP token
        const otp = OTP(4);
        const expireOn: number = Date.now() + 15 * 60 * 1000; // expires in 15 minutes
        const url =
            process.env.DOMAIN_NAME +
            `/api/auth/verify?email=${user?.email}otp=${otp}`;

        // Send OTP token to user mail box
        const result = await sendEmail({
            emailTo: email,
            subject: "Email Verification",
            template: `Hi ${user?.userName}. Your verification code is: ${otp}. or click this url ${url}`,
        });
        if (!result.sent)
            createError({
                statusCode: 500,
                message: "Failed to send verification email",
            });

        // Store OTP to user data
        if (user) {
            user.verificationToken = otp;
            user.verificationTokenExpiringdate = expireOn;
            await user.save();
        }

        res.status(200).json({
            message: "An OTP token has been sent to your email",
            email: hideEmail(user?.email || ""),
        });
    } catch (error) {
        next(error);
    }
};
// Verify user
export const verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createError({ statusCode: 400, message: errors.array()[0].msg }));
        }

        const { email, otp } = req.query as { email: string, otp: string };

        // Verify OTP token sent by user
        const user = await Users.findOne({
            email,
            verificationToken: otp,
            verificationTokenExpiringdate: { $gt: Date.now() },
        });
        if (!user)
            createError({
                statusCode: 404,
                message: "Invalid or expired verification token",
            });

        // Update user verification data
        if (user) {
            user.verificationToken = "";
            user.verificationTokenExpiringdate = 0;
            await user.save();
        }

        res.status(200).json({
            message: "Email verification successful",
        });
    } catch (error) {

        next(error);
    }
};
