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
    saves: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true }
);

// On save doc to db, hash the password and set the followings to timeline
// and set the timeline to the followings
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

// A method to save user data on the fly (e.g. when the req.session.user object is updated, then this method will be called to update the user data in the database. (i.e req.sessions.user.save() ))
UserSchema.methods.saveChange = async function () {
  const user = await Users.findByIdAndUpdate(this._id, this, {
    new: true,
    runValidators: true,
  });
  return user as IUser;
};

// Method that compare password when called
UserSchema.methods.isValidPassword = async function (password: string) {
  const isMatch = await bcrypt.compare(password, this.password || "");
  return isMatch;
};

const Users: Model<IUser> = mongoose.models.users || mongoose.model<IUser>("users", UserSchema);

export default Users;
