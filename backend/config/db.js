import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoDb_url = process.env.MONGO_URI;

    if (!mongoDb_url) {
      throw new Error("MongoDB URL not found in environment variables.");
    }

    const conn = await mongoose.connect(mongoDb_url, {
      dbName: "RasoiDb",
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDb connection failed");
    console.error(error.message);

    process.exit(1);
  }
};

export default connectDB;
