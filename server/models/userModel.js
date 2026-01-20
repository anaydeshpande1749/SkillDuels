//this is usermodel.js

import mongoose from "mongoose";

/* ============================
   Badge Sub-Schema
============================ */
const badgeSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    icon: { type: String, required: true },
    label: { type: String, required: true }
  },
  { _id: false }
);

/* ============================
   Profile Sub-Schema
============================ */
const profileSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    rank: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
      default: "Bronze"
    },
    avatarIcon: {
      type: String,
      default: "User"
    }
  },
  { _id: false }
);

/* ============================
   Stats Sub-Schema
============================ */
const statsSchema = new mongoose.Schema(
  {
    totalXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalWins: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    quizzesPlayed: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }
  },
  { _id: false }
);

/* ============================
   Arcade Game Sub-Schema
============================ */


/* ============================
   Main User Schema
============================ */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      immutable: true // 🔒 cannot be changed
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    // 🖼️ Avatar / profile image path
    filePath: {
      type: String,
      default: "" // Cloudinary URL / local path
    },

    badges: {
      type: [badgeSchema],
      default: []
    },

    profile: {
      type: profileSchema,
      required: true
    },

    stats: {
      type: statsSchema,
      default: () => ({})
    },


  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
