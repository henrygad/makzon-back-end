import { NextFunction, Request, Response } from "express";
import Users, { IUser } from "../models/user.model";
import createError from "../utils/error";
import userProps from "../@types/user.types";
import { SessionData } from "express-session";
import { validationResult } from "express-validator";

// Fetch user data from db
export const sendUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await Users.findById((req.user as IUser)._id).select([
      "-password",
      "_id",
      "-googleId",
      "-isValidPassword",
      "-sessions",
      "-verificationToken",
      "-verificationTokenExpiringdate",
      "-forgetPassWordToken",
      "-forgetPassWordTokenExpiringdate",
      "-changeEmailVerificationToke",
      "changeEmailVerificationTokenExpiringdate",
      "requestChangeEmail",
    ]);

    if (!user) createError({ statusCode: 404, message: "User not found" });
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user avatar


// Edit and update user data to db
export const updateUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // Validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError({ statusCode: 400, message: errors.array()[0].msg }));
  }

  try {
    const {
      name,
      dateOfBirth,
      displayDateOfBirth,
      displayEmail,
      displayPhoneNumber,
      website,
      profession,
      country,
      sex,
      bio,
      interest,
    }: userProps = req.body;

    const updatedUser = await Users.findByIdAndUpdate(
      (req.user as IUser)._id,
      {
        name,
        dateOfBirth,
        displayDateOfBirth,
        displayEmail,
        displayPhoneNumber,
        website,
        profession,
        country,
        sex,
        bio,
        interest,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user data from db
export const deleteUserData = async (
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

    const { password }: { password: string } = req.body;
    const user = (req.user as IUser);

    // Comfirm user password
    const isMatch = user.isValidPassword(password);
    if (!isMatch) createError({ statusCode: 401, message: "Invalid password" });

    // Delete user
    const deletedUser = await Users.findByIdAndDelete(user._id);
    if (!deletedUser) createError({ statusCode: 404, message: "User not found" });

    // Logout user
    req.logOut(() => {
      req.user = undefined;

      interface T extends SessionData {
        passport: {
          user?: string;
        };
      }

      (req.session as unknown as T).passport = { user: undefined };
      req.session.save(() => {
        res.status(200).json({
          success: true,
          message: "User deleted successfully"
        });
      });

    });

  } catch (error) {
    next(error);
  }
};
