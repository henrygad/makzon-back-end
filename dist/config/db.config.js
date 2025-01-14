"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
// Create db connection
const connectDB = async (cb) => {
    try {
        const db = await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${db.connection.host}`);
        cb();
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};
exports.default = connectDB;
