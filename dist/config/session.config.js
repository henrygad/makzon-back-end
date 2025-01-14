"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
require("dotenv/config");
exports.default = module.exports = (0, express_session_1.default)({
    secret: process.env.GENERAL_SECRET,
    resave: false, // Prevents session from being saved to the store on every request
    saveUninitialized: false, // Prevents empty sessions from being stored untill it's modified
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions",
    }),
    /* store: MongoStore.create({
      client: mongoose.connection.getClient() // Save session to db
    }), */
    cookie: {
        httpOnly: true, // Prevents client side JS from reading the cookie
        maxAge: (1000 * 60 * 60) * 24, // last for 1 day
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: process.env.SAME_ORIGIN === "true" ? "strict" : "none", // Set to "strict" when same origin is true
        priority: "high",
    },
});
