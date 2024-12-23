import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Users from "../models/user.model";
import userProps from "../types/user.types";

passport.use( // Validate and local login user
  new LocalStrategy(
    { usernameField: "identity" },
    async (identity, password, done) => {

      // Check if user exist either by username or email
      const user = await Users.findOne({
        $or: [{userName: identity}, {email: identity}]
      });

      if (!user) { // Check if user was not found      
        return done(null, false, {
          message: "No account found by this identity",
        });
      }

      // Comapre incoming passwords with hashed password
      if (!(await user.isValidPassword(password))) { // Invalid credentials
        return done(null, false, {
          message: "Invalid credentials",
        });
      }

      return done(null, user); 
    }
  )
);

passport.use( // Validate and Goodle login user

    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: "/auth/google/callback",
        },

        async (accessToken, refreshToken, profile, done) => {
            // Check if user exist
            let user = await Users.findOne({ googleId: profile.id });

            if (!user) {
                // Register user if not found with by google id
                if (!profile.emails) return;

                user = await Users.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                });
            }

            console.log(profile);
            console.log(accessToken);
            console.log(refreshToken);
            return done(null, user); // Send user data
        }
    )
);

passport.serializeUser(
  (user: Express.User, done: (err: unknown, id?: unknown) => void) => {
    done(null, (user as userProps)._id); 
  });

passport.deserializeUser(async (_id, done) => {
  const user = await Users.findById(_id);
  done(null, user);
});
