import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import userProps from "../types/user.type";


export interface IUser extends userProps, Document<Schema.Types.ObjectId> {
};

const UserSchema = new Schema(
  {
    userName: {
      type: String,
      require: [true, "Please provide a username"],
      unique: [true, "This username is not avalible"],
    },
    email: {
      type: String,
      require: [true, "Please provide an email"],
      unique: [true, "There is an  account with this email"],
    },
    password: {
      type: String,
      require: [true, "Please provide a password"],
    },
    googleId: String,
    userVerified: {
      type: Boolean,
      default: false,
    },
    sessions: [
      {
        token: String,
        toExpire: Number
      }
    ],
    verificationToken: String,
    verificationTokenExpiringdate: Number,
    changeEmailVerificationToken: String,
    changeEmailVerificationTokenExpiringdate: Number,
    requestChangeEmail: String,
    forgetPassWordToken: String,
    forgetPassWordTokenExpiringdate: Number,
    avatar: String,
    name: { familyName: String, givenName: String },
    dateOfBirth: String,
    displayDateOfBirth: {
      type: Boolean,
      default: false
    },
    displayEmail: String,
    displayPhoneNumber: String,
    website: String,
    profession: String,
    country: String,
    sex: String,
    bio: {
      type: String,
      max: [50, "Words have exceded 50 words"],
    },
    followings: [String],
    followers: [String],
    timeline: [String],
    saves: [String],
  },
  { timestamps: true }
);

// On save doc
UserSchema.pre<IUser>("save", async function (next) { 
  // Hash password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  // Set followings to timeline
  if (this.isModified("followings")) {
    this.timeline = this.followings;
  }
  next();
});

// Compare password
UserSchema.methods.isValidPassword = async function (password: string) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

const Users: Model<IUser> = mongoose.models.users || mongoose.model<IUser>("users", UserSchema);

export default Users;
