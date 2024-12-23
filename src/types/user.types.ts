import mongoose from "mongoose";

type userProps = {
  _id: mongoose.ObjectId
  userName: string;
  email: string;
  password: string;
  googleId?: string;
  isValidPassword(password: string): Promise<boolean>;
  isVerified: boolean;
  loginDBToken: string;
  verificationToken: string;
  verificationTokenExpiringdate: number;
  forgetPassWordToken: string;
  forgetPassWordTokenExpiringdate: number;
  avatar: string;
  dateOfBirth: string;
  displayDateOfBirth: boolean;
  displayEmails: [string];
  displayPhoneNumbers: [string];
  website: string;
  profession: [string];
  country: string;
  sex: string;
  bio: string;
  followers: [string];
  followings: [string];
};

export default userProps;