import mongoose from "mongoose";
import { IUser } from "../models/user.model";

type userProps = {
  _id: mongoose.Schema.Types.ObjectId;
  userName: string;
  email: string;
  password: string;
  googleId?: string;
  isValidPassword(password: string): Promise<boolean>;
  saveChange(): Promise<IUser>;
  userVerified: boolean;
  login: boolean,  
  sessions: {
    token: string,
    toExpire: number
  }[]
  verificationToken: string;
  verificationTokenExpiringdate: number;
  changeEmailVerificationToken: string;
  changeEmailVerificationTokenExpiringdate: number;
  requestChangeEmail: string,
  forgetPassWordToken: string;
  forgetPassWordTokenExpiringdate: number;
  avatar: string;
  name: { familyName: string; givenName: string };
  dateOfBirth: string;
  displayDateOfBirth: boolean;
  displayEmail: string;
  displayPhoneNumber: string;
  website: string;
  profession: string;
  country: string;
  sex: string;
  bio: string;
  followings: string[];
  followers: string[];
  timeline: string[];
  saves: mongoose.Schema.Types.ObjectId[];
  createdAt: Date,
  updatedAt: Date,
};


export default userProps;
