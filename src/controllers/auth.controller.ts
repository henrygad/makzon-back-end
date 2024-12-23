import { Request, Response, NextFunction } from "express";
import Users from "../models/user.model";
import createError from "../utils/error.utils";
import userProps from "../types/user.types";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { userName, email, password }: userProps = req.body;

    // Check and throw error if user alread exist either by username or email
    let userExist: userProps | null = null;

    userExist = await Users.findOne({ email }); // Email
    if (userExist) createError({
      statusCode: 401,
      message: "There is an account with this email. Try log in instead with this email",
    });

    userExist = await Users.findOne({ userName }); // Username
    if (userExist)createError({
      statusCode: 401,
      message: "This username is not available",
    });

    // Resgister new user
    const user = await Users.create({ userName, email, password });
    
    // Send a welcome email with verification code

    res.status(201).json({
      message: `Welcome $${user.userName}, you've successfully created your account`,
    });
    
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response) => {
  // Login user
  console.log(req.user);

  res.status(200).json({
    message: `Welcome back ${(req.user as userProps).userName
      }, you've successfully login into your account`,
  });
};
