//this is userccontroller.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

/* REGISTER */
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // auto-generate username
    const username = email.split("@")[0];

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profile: {
        username,
        rank: "Bronze",
        avatarIcon: "User"
      },
      stats: {
        totalXP: 0,
        level: 1,
        currentStreak: 0
      },
      badges: []
    });

    res.status(201).json({
      message: "Account created successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profile: user.profile,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};


/* LOGIN */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profile: user.profile,
        stats: user.stats,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};


/* GET CURRENT USER */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.username) {
      user.profile.username = req.body.username;
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        filePath: user.filePath
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.filePath = `/images/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Avatar uploaded",
      filePath: user.filePath
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};


// export const getFriends = async (req, res) => {
//   try {
//     const users = await User.find({}, "fullName email _id");
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch friends" });
//   }
// };
