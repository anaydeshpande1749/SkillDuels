//this is db.js in configs folder

import mongoose from "mongoose";

export const ConnectDB = async () => {
  try {
    // await mongoose.connect(process.env.MONGODB_URL, {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "skillduels",   // 🔐 FORCE DB NAME
    });

    console.log("Connected to skillduels database 👍");
    console.log("Active DB:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed ❌", error);
    process.exit(1);
  }
};
