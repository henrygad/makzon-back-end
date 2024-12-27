import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Users from "../models/user.model";
import userProps from "../@types/user.types";
import generatedUserName from "../utils/generateUserName";

passport.use(
  // Validate and local login user
  new LocalStrategy(
    { usernameField: "userName", passwordField: "password" }, // Define username and password fields
    async (userName, password, done) => {

      // Check if user exist by username or email
      const user = await Users.findOne({ $or: [{ userName }, { email: userName }] });
      if (!user) return done({ message: "Username: Invalid credentials" }, false);

      // Comapre incoming passwords with hashed password
      const isMatch = await user.isValidPassword(password);
      if (!isMatch) return done({ message: "Password: Invalid credentials" }, false);

      return done(null, user);
    }
  )
);

passport.use(
  // Validate and Goodle login user
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (_, accessToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const emailValue = emails?.[0].value;

      // Check if user exist by goolge id or email
      let user = await Users.findOne({
        $or: [{ googleId: id }, { email: emailValue }],
      });

      // If no user was found, register new user
      if (!user) {
        user = new Users({
          googleId: profile.id,
          email: emailValue,
          userName: generatedUserName(displayName), // Generate a unique username
          userVerified: true,
        });

        await user.save();
      };

      console.log(accessToken ? " " : " ");
      return done(null, user); // Send user data
    }
  )
);

passport.serializeUser(
  // Serialize user data to session storage
  (user, done: (err: unknown, id?: unknown) => void) => {
    done(null, (user as userProps)._id);
  }
);

passport.deserializeUser(async (_id, done) => {
  // Deserialize user data from session storage
  const user = await Users.findById(_id);
  done(null, user);
});

export default passport;