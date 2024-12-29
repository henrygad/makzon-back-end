import mongoose from "mongoose";

type userProps = {
  _id: mongoose.ObjectId;
  userName: string;
  email: string;
  password: string;
  googleId?: string;
  isValidPassword(password: string): Promise<boolean>;
  userVerified: boolean;
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
  profession: [string];
  country: string;
  sex: string;
  bio: string;
  followings: string[];
  interest: string[]
};


export default userProps;
