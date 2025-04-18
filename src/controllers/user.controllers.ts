import { NextFunction, Request, Response } from "express";
import Users from "../models/user.model";
import createError from "../utils/error";
import userProps from "../types/user.type";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

// Get all users controller
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { skip = 0, limit = 0 } = req.query;

    const users = await Users.find()
      .skip(Number(skip))
      .limit(Number(limit))
      .select(
        "-password -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v"
      );

    if (!users)
      createError({ statusCode: 404, message: "Users not found" });

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
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { userName } = req.params;
    const user = await Users.findOne({ userName }).select(
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
    if (!req.session.user)
      return createError({ statusCode: 401, message: "Unauthorized user" });
    // Remove the following properties from the user object before sending it to the client
    // "-password -_id -googleId -isValidPassword -sessions -verificationToken -verificationTokenExpiringdate -forgetPassWordToken -forgetPassWordTokenExpiringdate -changeEmailVerificationToke -changeEmailVerificationTokenExpiringdate -requestChangeEmail -__v"
    const user = req.session.user.toObject(); // Convert Mongoose document to plain object
    // Remove sensitive fields from the user object
    delete user.password;
    delete user._id;
    delete user.googleId;
    delete user.isValidPassword;
    delete user.sessions;
    delete user.verificationToken;
    delete user.verificationTokenExpiringdate;
    delete user.forgetPassWordToken;
    delete user.forgetPassWordTokenExpiringdate;
    delete user.changeEmailVerificationToke;
    delete user.changeEmailVerificationTokenExpiringdate;
    delete user.requestChangeEmail;
    delete user.__v;

    res.status(200).json({
      success: true,
      data: { ...user },
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
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const {
      name,
      avatar,
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
    const user = req.session.user!; // Get the authenticated user from the session
    const image_from_multer = req.file?.filename;

    const updatedUser = await Users.findByIdAndUpdate(
      user._id,
      {
        avatar: image_from_multer || avatar,
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

    if (!updatedUser) return createError({ statusCode: 404, message: "User not found" });
    req.session.user = updatedUser; // Update the session with the new user data

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
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { save }: { save: mongoose.Schema.Types.ObjectId, } = req.body;

    if (req.session.user) {
      const user = await Users.findById(req.session.user._id);
      if (!user) return createError({ statusCode: 404, message: "User not found" });

      if (user.saves.includes(save)) {
        // remove save id 
        user.saves = user.saves.filter(saveId => saveId !== save);
        req.session.user = await user.save();
      } else {
        // add save id
        user.saves.push(save);
        req.session.user = await user.save();
      }

      res.status(200).json({
        success: true,
        data: { save },
        message: "Successfully updated use saves",
      });
    }
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
      Connection: "keep-alive",
    });
    res.flushHeaders(); // Flush the headers to establish SSE with client

    const pipeline = [
      { $match: { "fullDocument.userName": userName } },
      { $match: { operationType: { $in: ["insert", "update", "delete"] } } },
      {
        $match: {
          "updateDescription.updatedFields.followers": { $exists: true },
        },
      },
    ];
    const watchUser = Users.watch(pipeline); // Watch user followers

    watchUser.on("change", (change) => {
      // Stream user followers
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

    const { friendUserName }: { friendUserName: string } = req.body;
    const user = req.session.user!;

    const isFollowing = user.followings.includes(friendUserName); // Check is following username

    if (isFollowing) { // If alread following this username
      // Unfollow user     
      const unFollowedUser = await Users.findOneAndUpdate(
        { userName: friendUserName },
        { $pull: { followers: user.userName } },
        { runValidators: true }
      );
      if (!unFollowedUser) return createError({ statusCode: 404, message: "User not found or User not unfollowed", });

      // Remove friend username from user following
      const authUser = await Users.findById(user._id);
      if (!authUser) return createError({ statusCode: 404, message: "Auth user not found", });
      authUser.followings.filter((name) => name !== unFollowedUser.userName);
      authUser.markModified("followings");
      req.session.user = await authUser.save();
    } else { // Follow user      

      const followedUser = await Users.findOneAndUpdate(
        { userName: friendUserName },
        { $push: { followers: user.userName } },
        { runValidators: true }
      );
      if (!followedUser) return createError({ statusCode: 404, message: "User not found or User not followed", });

      // Add friend username from user following
      const authUser = await Users.findById(user._id);
      if (!authUser) return createError({ statusCode: 404, message: "Auth user not found", });
      authUser.followings.push(friendUserName);
      authUser.markModified("followings");
      req.session.user = await authUser.save();
    }

    res.status(200).json({
      success: true,
      data: { friendUserName },
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
    const { password } = req.query as { password: string };
    const user = req.session.user!;

    if (user.password) { // Check if have a password
      // Comfirm user password
      const isMatch = user.isValidPassword(password);
      if (!isMatch) return createError({ statusCode: 401, message: "Invalid password" });
    }

    // Delete user
    const deletedUser = await Users.findByIdAndDelete(user._id);
    if (!deletedUser) createError({ statusCode: 404, message: "User not found" });
    req.session.user = undefined; // Clear session user property

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
