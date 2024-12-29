import mongoose from "mongoose";
import "dotenv/config";


// Create db connection
const connectDB = async (cb: () => void) => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`MongoDB Connected: ${db.connection.host}`);
    cb();

  } catch (error) {      
    console.log(error);
    process.exit(1);
  }
};


export default connectDB;
