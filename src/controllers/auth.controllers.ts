import { Request, Response, NextFunction } from "express";
import createError from "../utils/error";
import OTP from "../utils/OTP";
import sendEmail from "../config/email.config";
import Users from "../models/user.model";
import { validationResult } from "express-validator";
import registrationProps, { loginProps } from "../types/auth.types";
import axios from "axios";

// request google authentication
export const googleAuthRequest = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Redirect user to google authentication page
    const redirectUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_REDIRCT_URI!,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });
    res.redirect(`${redirectUrl}?${params.toString()}`);
  } catch (error) {
    next(error);
  }
};
// google authentication return callback
export const googleLogin = async (
 
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.query;
    if (!code) {      
      return res.redirect(process.env.DOMAIN_NAME_FRONTEND + "/login");
    };

    // Exchange code for Google Access Token
    const { data } = await axios.post("https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRCT_URI,
          grant_type: "authorization_code",
        },
      }
    );

    // Get user info
    const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${data.access_token}` }, });
    const { email, sub } = googleRes.data as { given_name: string; email: string; sub: string };

    // check if goolge user already signup
    let user = await Users.findOne({ email });
    if (!user) {
      // create new user from user google data
      user = new Users({
        userName: email.split("@")[0],
        email: email,
        googleId: sub,
        userVerified: true,
      });
      await user.save();
    }

    // Add current user session id to user.session array
    user.sessions.push({
      token: req.session.id,
      toExpire: new Date(req.session.cookie.expires!).getTime(),
    });

    // Save user session to db and attach user to request body
    req.session.user = await user.save();
    const loginUser = req.session.user;

    res.redirect(
      process.env.DOMAIN_NAME_FRONTEND + "/profile/" + loginUser.userName
    );
  } catch (error) {
    next(error);
  }
};
// Local Register new user
export const localRegistretion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { userName, email, password }: registrationProps = req.body;

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
      process.env.DOMAIN_NAME_FRONTEND +
      `/verify/user?email=${user?.email}&otp=${otp}`;
    const result = await sendEmail({
      emailTo: user?.email,
      subject: "Email Verification",
      template: `<span style="display: block;">Welcome ${user?.userName}</span> <br/> <span style="display: block;">Your verification code is: <span style="font-weight: bold;" >${otp}</span></span>, or click <a href="${url}">Verify account</a>`,
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
      message: `Welcome ${user.userName}, you've successfully created your account`,
      email: hideEmail(user.email),
      login: "/api/auth/login",
    });
  } catch (error) {
    next(error);
  }
};
// Local Loign user
export const localLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { identity, password }: loginProps = req.body;

    // Check if user exist by username or email
    const user = await Users.findOne({
      $or: [{ userName: identity }, { email: identity }],
    });
    if (!user)
      return createError({
        statusCode: 401,
        message: "Username: Invalid credentials",
      });

    // Comapre incoming passwords with hashed password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch)
      return createError({
        statusCode: 401,
        message: "Password: Invalid credentials",
      });

    // Add current user session id to user.session array
    user.sessions.push({
      token: req.session.id,
      toExpire: new Date(req.session.cookie.expires!).getTime(),
    });

    // Save user session to db and attach user to request body
    req.session.user = await user.save();
    const loginUser = req.session.user;

    res.status(200).json({
      message: `Welcome back ${loginUser.userName}, you've successfully login into your account`,
      userName: loginUser.userName,
      email: loginUser.email,
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

    if (req.session.user) {
      const user = await Users.findById(req.session.user._id);
      if (user) {
        // Delete session from user session array
        user.sessions = user.sessions.filter(
          (session) => session.token !== req.session.id
        );
        req.session.user = await user.save();
        // destroy user object from request body but keep session
        req.session.user = undefined;

        res.status(200).json({
          message: "You've successfully logout",
        });

      } else {
        createError({ statusCode: 401, message: "Unauthorized" });
      }

    } else {
      createError({ statusCode: 401, message: "Unauthorized" });
    }

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

    if (req.session.user) {
      const user = await Users.findById(req.session.user._id);
      if (user) {
        // Delete other login user session from user session array
        user.sessions = user.sessions.filter(
          (session) => session.token == req.session.id
        );
        req.session.user = await user.save();

        res.status(200).json({
          message: "You've successfully logged out the rest users",
        });

      } else {
        createError({ statusCode: 401, message: "Unauthorized" });
      }

    } else {
      createError({ statusCode: 401, message: "Unauthorized" });
    }

  } catch (error) {
    next(error);
  }
};

// Destroy session
export const destroySession = async (
  req: Request,
  res: Response,
) => {
  req.session.destroy(() => {
    res.clearCookie("makzonBckendSession");
    res.status(200).json({
      message: "You've successfully destroy client session",
    });
  });
};
