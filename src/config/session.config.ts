import MongoStore from "connect-mongo";
import session from "express-session";
import "dotenv/config";
//import { Mongoose } from "mongoose";

export default module.exports = session({
  name: "makzonBckendSession", // Name of the session cookie
  secret: process.env.GENERAL_SECRET!,
  resave: false, // Prevents session from being saved to the store on every request
  saveUninitialized: false, // Prevents empty sessions from being stored untill it's modified
  cookie: {
    httpOnly: true, // Prevents client side JS from reading the cookie
    maxAge: (1000 * 60 * 60) * 24, // last for 1 day
    secure: process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "deploy" ||
      process.env.NODE_ENV === "local_https", // Set to true on production
    sameSite: process.env.SAME_ORIGIN === "true" ? "strict" : "none", // Set to "strict" when same origin is true
    priority: "high",
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI!,
    collectionName: "sessions",
  }),
  /*   store: MongoStore.create({
    client: Mongoose.connection.getClient() // save session to DB store
  }), */
});

