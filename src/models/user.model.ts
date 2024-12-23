import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import userProps from "../types/user.types";


interface IUser extends userProps, Document<Schema.Types.ObjectId> {
};

const UserSchema: Schema = new Schema(
  {
    userName: {
      type: String,
      require: [true, "Please provide a username"],
      unique: [true, "This username is not avalible"],
    },
    email: {
      type: String,
      require: [true, "Please provide an email"],
      unique: [true, "There is an  account with his email"],
    },
    password: {
      type: String,
      require: [true, "Please provide a password"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    loginDBToken: String,
    verificationToken: String,
    verificationTokenExpiringdate: Number,
    forgetPassWordToken: String,
    forgetPassWordTokenExpiringdate: Number,
    avatar: String,
    dateOfBirth: String,
    displayDateOfBirth: Boolean,
    displayEmails: [String],
    displayPhoneNumbers: [String],
    website: String,
    profession: [String],
    country: String,
    sex: String,
    bio: {
      type: String,
      max: [50, "Words have exceded 50 words"],
    },
    followers: [String],
    followings: [String],
  },
  { timestamps: true }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  next();
});

UserSchema.methods.isValidPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const Users: Model<IUser> = mongoose.models.users || mongoose.model<IUser>("users", UserSchema);

export default Users;
