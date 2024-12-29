import { Request, Response, NextFunction } from "express";
import createError from "../utils/error";
import OTP from "../utils/OTP";
import sendEmail from "../utils/sendEmail";
import "dotenv/config";
import Users, { IUser } from "../models/user.model";
import { SessionData } from "express-session";
import { validationResult } from "express-validator";

export const register = async (
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

    const {
      userName,
      email,
      password,
    }: { userName: string; email: string; password: string } = req.body;

    // If user exist by either username or email then throw an error
    let user = await Users.findOne({ email });
    if (user)
      // By email
      createError({
        statusCode: 401,
        message:
          "There is an account with this email. Try log in instead with this email",
      });
    user = await Users.findOne({ userName });
    if (user)
      // By username
      createError({
        statusCode: 401,
        message: "This username is not available",
      });

    // Resgister new user
    user = new Users({ userName, email, password });
    await user.save();
    if (!user)
      createError({ statusCode: 500, message: "Failed to create user" });

    // Generate OTP token and send a welcome email to user along the otp to verify account
    const otp = OTP(4);
    const url = process.env.DOMAIN_NAME + `/api/auth/verify?otp=${otp}`;
    const result = await sendEmail({
      emailTo: email,
      subject: "Email Verification",
      template: `Welcome ${user?.userName}. Your verification code is: ${otp}. or click this url ${url}`,
    });
    if (!result.sent)
      createError({
        statusCode: 500,
        message: "Failed to send welcome email to new",
      });

    const hideEmail = (email: string) => {
      // Function to hide user email
      const [username, domain] = email.split("@");
      return `${username.slice(0, 3)}***@${domain}`;
    };

    res.status(201).json({
      message: `Welcome $${user.userName}, you've successfully created your account. Next step is to verify your email`,
      email: hideEmail(user.email),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const user = (req.user as IUser);

    if (err) {
      createError({ statusCode: 401, message: err.message });
    }

    // Add current user session id to user.session array
    if (user && req.session.id) {
      user.sessions.push({
        token: req.session.id,
        toExpire: req.session.cookie.maxAge || 0,
      });
      await user.save();
      req.user = user;
    } else {
      createError({
        statusCode: 401,
        message: "Authentication failed: Session not found",
      });
    }

    res.status(200).json({
      message: `Welcome back ${
        user.userName
      }, you've successfully login into your account`,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const user = (req.user as IUser);

    req.logOut(async () => {
      // Logout current user from db and server
      if (req.user) {
        user.sessions =  user.sessions.filter(
          (session) => session.token !== req.session.id
        );
        await user.save();
        req.user = undefined;
      }

      interface T extends SessionData {
        passport: {
          user?: string;
        };
      }

      (req.session as unknown as T).passport = { user: undefined };
      req.session.save(() => {
        res.status(200).json({
          message: "You've successfully logout",
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const logoutRest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUser;

    if (user) {
      // Logout the rest users from db but keep current user
      user.sessions = user.sessions.filter(
        (session) => session.token === req.session.id
      );
      await user.save();
      req.user = user;
    }

    res.status(200).json({
      message: "You've successfully logged out the rest users",
    });
  } catch (error) {
    next(error);
  }
};
