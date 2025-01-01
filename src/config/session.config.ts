import session from "express-session";
//import MongoStore from "connect-mongo";
import "dotenv/config";

export default module.exports = session({
  secret: process.env.GENERAL_SECRET!,
  resave: false, // Prevents session from being saved to the store on every request
  saveUninitialized: false, // Prevents empty sessions from being stored untill it's modified
  /* store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI!,
    collectionName: "sessions",
  }), */
  cookie: {
    httpOnly: true, // Prevents client side JS from reading the cookie
    maxAge: 1000 * 60 * 60 * 24, // last for 1 day
    secure: process.env.NODE_ENV === "production", // Set to true in production
    sameSite: process.env.SAME_ORIGIN === "true" ? "strict" : "none", // Set to "strict" when same origin is true
    priority: "high",
  },
});
