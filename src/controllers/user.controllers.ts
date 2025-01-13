import { NextFunction, Request, Response } from "express";
import Users, { IUser } from "../models/user.model";
import createError from "../utils/error";
import userProps from "../types/user.type";
import { SessionData } from "express-session";
import { validationResult } from "express-validator";

// Get all users controller
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { skip = 0, limit = 0 } = req.query;

    const users = await Users.find()
      .skip(Number(skip))
      .limit(Number(limit))
      .select(
        "-password -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v"
      );

    if (!users.length) createError({ statusCode: 404, message: "Users not found" });

    res.status(200).json({
      success: true,
      data: users,
      message: "Users found successfully",
    });
  } catch (error) {
    next(error);
  }
};
// Get single user controller
export const getSingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });
    
    const { userName } = req.params;
    const user = await Users.findById({ userName }).select(
      "-password -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v"
    );

    if (!user) createError({ statusCode: 404, message: "User not found" });
    res.status(200).json({
      success: true,
      data: user,
      message: "User found successfully",
    });
  } catch (error) {
    next(error);
  }
};
// Get authenticated user controller
export const getAuthUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await Users.findById((req.user as IUser)._id).select(
      "-password  -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v"
    );
    if (!user) createError({ statusCode: 404, message: "User not found" });

    res.status(200).json({
      success: true,
      data: user,
      message: "Auth User found successfully",
    });
  } catch (error) {
    next(error);
  }
};
// Edit and update authenticated user controller
export const editAuthUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
   
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

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
    }: userProps = req.body;
    const user = req.user as IUser;
    const image = (req.file?.filename + "/" + req.file?.filename).trim();

    const updatedUser = await Users.findByIdAndUpdate(
      user._id,
      {
        avatar: image ? image : user.avatar,
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
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated Successfully",
    });
  } catch (error) {
    next(error);
  }
};
// Edit authenticated user saves controller
export const editAuthUserSaves = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { save }: { save: string } = req.body;
    const user = req.user as IUser;

    user.saves.push(save);
    req.user = await user.save();

    res.status(200).json({
      success: true,
      data: { save },
      message: "User saves updated Successfully",
    });
  } catch (error: unknown) {
    next(error);
  }
};
// Stream user followers
export const streamUserFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { userName } = req.params;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });
    res.flushHeaders(); // Flush the headers to establish SSE with client

    const pipeline = [
      { $match: { "fullDocument.userName": userName } },
      { $match: { "operationType": { $in: ["insert", "update", "delete"] } } },
      { $match: { "updateDescription.updatedFields.followers": { $exists: true } } },
    ];
    const watchUser = Users.watch(pipeline); // Watch user followers

    watchUser.on("change", (change) => { // Stream user followers
      const eventType = change.operationType;
      const followers = change.updateDescription.updatedFields.followers;

      res.write(`data: ${JSON.stringify({ eventType, followers })}\n\n`);
    });

    watchUser.on("error", (error) => {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    });

    req.on("close", () => {
      watchUser.close();
      res.end();
    });

  } catch (error) {
    next(error);
  }
};
// Edit authenticated user followings controller
export const editAuthUserFollowings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { userName }: { userName: string } = req.body;
    const user = req.user as IUser;

    // Check if already followed user
    const isFollowing = user.followings.includes(userName);

    if (isFollowing) {

      // Remove follower
      const followedUser = await Users.findOneAndUpdate(
        { userName },
        { $pull: { followers: user.userName } },
        { runValidators: true }
      );
      if (!followedUser)
        createError({
          statusCode: 404,
          message: "User not found or User not unfollowed",
        });
      
      // Unfollow user
      user.followings.filter((name) => name !== userName);
      user.markModified("followings");
      req.user = await user.save();
      
    } else {

      // Add follower
      const followedUser = await Users.findOneAndUpdate(
        { userName },
        { $push: { followers: user.userName } },
        { runValidators: true }
      );
      if (!followedUser)
        createError({
          statusCode: 404,
          message: "User not found or User not followed",
        });
      
      // Follow user
      user.followings.push(userName);
      user.markModified("followings");
      req.user = await user.save();

    }

    res.status(200).json({
      success: true,
      data: { userName },
      message: isFollowing
        ? "User unfollowed Successfully"
        : "User followed Successfully",
    });
  } catch (error) {
    next(error);
  }
};
// Delete authenticated user controller
export const deleteAuthUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { password }: { password: string } = req.body;
    const user = req.user as IUser;

    // Comfirm user password
    const isMatch = user.isValidPassword(password);
    if (!isMatch) createError({ statusCode: 401, message: "Invalid password" });

    // Delete user
    const deletedUser = await Users.findByIdAndDelete(user._id);
    if (!deletedUser)
      createError({ statusCode: 404, message: "User not found" });

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
          message: "User deleted successfully",
        });
      });
    });
  } catch (error) {
    next(error);
  }
};
