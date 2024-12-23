import mongoose from "mongoose";
import createError from "../utils/error.utils";
import "dotenv/config";

let isConnected: number | boolean = false;
const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  };
  
  if (mongoose.connections.length > 0) {
    isConnected = mongoose.connections[0].readyState;

    if (isConnected) {
      console.log("Reusing existing database connection");
      return;
    };
  };

  try {
    const db = await mongoose.connect(process.env.MONGO_URI!);
    isConnected = db.connection.readyState;
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      createError({ statusCode: 500, message: error.message });
    } else {
      createError({ statusCode: 500, message: `Unexpected error: ${error}` });
    }

    process.exit(1);
  }
};

export default connectDB;
