import { Request, Response, NextFunction } from "express";
import createError from "../utils/error";
import OTP from "../utils/OTP";
import sendEmail from "../config/email.config";
import "dotenv/config";
import Users, { IUser } from "../models/user.model";
import { SessionData } from "express-session";
import { validationResult } from "express-validator";

// Register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

    const {
      userName,
      email,
      password,
    }: { userName: string; email: string; password: string } = req.body;

    // If user exist by either username or email then throw an error
    let user = await Users.findOne({ email });
    if (user)
      createError({
        // By email
        statusCode: 401,
        message:
          "There is an account with this email. Try log in instead with this email",
      });
    user = await Users.findOne({ userName });
    if (user)
      createError({
        // By username
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
    const expireOn: number = Date.now() + 15 * 60 * 1000; // expires in 15 minutes
    const url =
      process.env.DOMAIN_NAME +
      `/api/auth/verify?email=${user?.email}&otp=${otp}`;
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

    // Store OTP to user data
    user.verificationToken = otp;
    user.verificationTokenExpiringdate = expireOn;
    await user.save();

    const hideEmail = (email: string) => {
      // Function to hide user email
      const [username, domain] = email.split("@");
      return `${username.slice(0, 3)}***@${domain}`;
    };

    res.status(201).json({
      message: `Welcome ${user.userName}, you've successfully created your account. Next step is to verify your account`,
      email: hideEmail(user.email),
      verifyUrl: "/api/auth/verify",
    });
  } catch (error) {
    next(error);
  }
};
// Loign user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUser;

    // Check if user was Authenticated
    if (!user || !req.session.id)
      createError({
        statusCode: 401,
        message: "Authentication failed: Session not found",
      });

    // Create new session
    const userSession = {
      token: req.session.id,
      toExpire: new Date(req.session.cookie.expires!).getTime(),
    };

    // Add current user session id to user.session array
    user.sessionId = req.session.id;
    user.sessions.push(userSession);
    req.user = await user.save();

    res.status(200).json({
      message: `Welcome back ${user.userName}, you've successfully login into your account`,
    });
  } catch (error) {
    next(error);
  }
};
// Logout current user
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Logout user from db
    const user = req.user as IUser;
    user.sessions = user.sessions.filter(
      (session) => session.token !== req.session.id
    );
    req.user = await user.save();

    req.logOut(async (err) => {
      // Logout user from server
      if (err) next(createError({ statusCode: 500, message: "Logout error" }));
      interface T extends SessionData {
        passport: {
          user?: string;
        };
      }

      req.user = undefined;
      (req.session as unknown as T).passport = { user: undefined };
      req.session.save((err) => {
        if (err)
          next(
            createError({ statusCode: 500, message: "Failed to save session" })
          );

        res.status(200).json({
          message: "You've successfully logout",
        });
      });
    });
  } catch (error) {
    next(error);
  }
};   
// Logout rest user expect current user
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
      req.user = await user.save();
    }

    res.status(200).json({
      message: "You've successfully logged out the rest users",
    });
  } catch (error) {
    next(error);
  }
};
