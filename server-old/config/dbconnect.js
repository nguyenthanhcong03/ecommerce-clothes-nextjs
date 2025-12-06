import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("process.env.MONGODB_URL", process.env.MONGODB_URL);
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    if (conn.connection.readyState === 1) {
      console.log("Database connected");
    } else {
      console.log("Database not connected");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Database connection failed");
  }
};

export default connectDB;
