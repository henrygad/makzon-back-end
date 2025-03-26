import session from "express-session";
import MongoStore from "connect-mongo";
import "dotenv/config";

export default module.exports = session({
  secret: process.env.GENERAL_SECRET!,
  resave: false, // Prevents session from being saved to the store on every request
  saveUninitialized: false, // Prevents empty sessions from being stored untill it's modified
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI!,
    collectionName: "sessions",
  }),
  /* store: MongoStore.create({
    client: mongoose.connection.getClient() // Save session to db
  }), */
  cookie: {
    httpOnly: true, // Prevents client side JS from reading the cookie
    maxAge: (1000 * 60 * 60) * 24, // last for 1 day
    secure: process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "local_production" ||
      process.env.NODE_ENV === "deploy", // Set to true on production
    sameSite: process.env.SAME_ORIGIN === "true" ? "strict" : "none", // Set to "strict" when same origin is true
    priority: "high",
  },
});
