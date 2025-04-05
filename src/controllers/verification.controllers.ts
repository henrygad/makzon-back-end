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
        const user = req.session.user!;

        if (!user)
            return createError({ statusCode: 404, message: "User not found" });
        if (user.userVerified) createError({ statusCode: 400, message: "User is already verified" });

        // Generate and send OTP token
        const otp = OTP(4);
        const expireOn: number = Date.now() + 15 * 60 * 1000; // expires in 15 minutes
        const url =
            process.env.DOMAIN_NAME_FRONTEND +
            `/verify/user?email=${user?.email}&otp=${otp}`;

        // Send OTP token to user mail box
        const result = await sendEmail({
            emailTo: user.email,
            subject: "Email Verification",
            template: `<span style="display: block;">Hi ${user?.userName}</span> <br/> <span style="display: block;">Your verification code is: <span style="font-weight: bold;" >${otp}</span></span>, or click <a href="${url}">Verify account</a>`,
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
            req.session.user = user;
        }

        res.status(200).json({
            message: "An OTP token has been sent to your email",
            email: hideEmail(user.email || ""),
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
        if (!errors.isEmpty())
            createError({ message: errors.array()[0].msg, statusCode: 422 });

        const { email, otp } = req.query as { email: string; otp: string };

        // Verify OTP token sent by user
        const user = await Users.findOne({
            email,
            verificationToken: otp,
            verificationTokenExpiringdate: { $gt: Date.now() },
        });

        if (!user)
            return createError({
                statusCode: 404,
                message:
                    "Invalid or expired verification token. Please request for another token or check whether you're alread verirfied",
            });

        // Update user verification data
        user.userVerified = true;
        user.verificationToken = "";
        user.verificationTokenExpiringdate = 0;
        req.session.user = await user.save();

        res.status(200).json({
            message: "Your account has been verified successfully",
            user: {
                userName: user.userName,
                email: hideEmail(user.email || ""),
            },
        });
        
    } catch (error) {
        next(error);
    }
};

