//this is userroute.js

import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  uploadAvatar
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGODB_URL;
const router = express.Router();

/* AUTH ROUTES */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.post(
  "/upload-avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);

/* -------------------------
   ✅ GET ALL USERS (NEW)
-------------------------- */
router.get("/", async (req, res) => {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db("skillduels");
    const users = await db.collection("users").find({}).toArray();

    const result = users.map(user => ({
      friend_id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      username: user.profile?.username || ""
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});

/* -------------------------
   FRIENDS (OPTIONAL)
-------------------------- */
router.get("/friends", async (req, res) => {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db("skillduels");
    const users = await db.collection("users").find({}).toArray();

    const result = users.map(user => ({
      friend_id: user._id.toString(),
      fullName: user.fullName,
      email: user.email
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});

export default router;



