
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Star,
  Zap,
  Award,
  Shield,
  Trophy,
  Edit,
  LogOut
} from "lucide-react";
import EditProfilePopup from "./EditPopup";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/* ======================================================
   ICON MAP
====================================================== */
const iconMap = {
  User,
  Star,
  Zap,
  Award,
  Shield,
  Trophy
};

export default function UserProfile({ user, setUser }) {
  const [showEdit, setShowEdit] = useState(false);

  /* =======================
     AUTH GUARD
  ======================== */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Please login to view your profile
      </div>
    );
  }

  /* =======================
     NORMALIZED DATA
  ======================== */
  const fullName = user.fullName || "Player";
  const profile = user.profile || {};
  const stats = user.stats || {};

  const avatarSrc = user.filePath
    ? `${API_BASE}${user.filePath}`
    : null;

  const AvatarIcon = iconMap[profile.avatarIcon] || User;

  const level = stats.level ?? 1;
  const totalXP = stats.totalXP ?? 0;
  const currentStreak = stats.currentStreak ?? 0;
  const totalWins = stats.totalWins ?? 0;

  const xpRequired = level * 1000;
  const progress = Math.min(
    Math.round((totalXP / xpRequired) * 100),
    100
  );

  /* =======================
     ACTIONS
  ======================== */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleProfileUpdate = (data) => {
    const updatedUser = {
      ...user,
      filePath: data.filePath || user.filePath,
      profile: {
        ...profile,
        username: data.username
      }
    };

    setUser(updatedUser);
  };

  /* =======================
     UI
  ======================== */
  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white py-16 px-6 md:px-16 lg:px-28">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-16"
      >
        <div>
          <h1 className="text-5xl font-bold">Player Profile</h1>
          <p className="text-gray-400 mt-2">
            Your stats. Your achievements. Your dominance.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600/20 border border-blue-500/40"
          >
            <Edit size={18} /> Edit
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* LEFT PANEL */}
        <div className="bg-[#11121a] p-8 rounded-3xl border border-blue-500/20">
          <div className="flex flex-col items-center">

            {/* AVATAR */}
            <div className="w-32 h-32 rounded-full overflow-hidden border border-blue-500/30 bg-[#0d0f15]">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-800">
                  <AvatarIcon size={60} />
                </div>
              )}
            </div>

            <h2 className="text-3xl font-bold mt-6">{fullName}</h2>
            <p className="text-gray-400">@{profile.username}</p>

            <div className="mt-6 px-6 py-2 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300">
              {profile.rank || "Bronze"} Rank
            </div>
          </div>

          <div className="mt-10 space-y-5">
            <Stat label="Total XP" value={totalXP} />
            <Stat label="Battles Won" value={totalWins} />
            <Stat label="Current Streak" value={`${currentStreak} 🔥`} />
            <Stat label="Account Level" value={`Lv. ${level}`} />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 bg-[#11121a] p-10 rounded-3xl border border-blue-500/20">
          <h3 className="text-xl font-semibold mb-4">Achievements</h3>
          <p className="text-gray-400">No achievements unlocked yet</p>
        </div>
      </div>

      <EditProfilePopup
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        user={{
          username: profile.username,
          email: user.email,
          filePath: user.filePath
        }}
        onSave={handleProfileUpdate}
      />
    </div>
  );
}

/* =======================
   SMALL COMPONENT
======================== */
function Stat({ label, value }) {
  return (
    <div className="flex justify-between text-gray-300">
      <span>{label}</span>
      <span className="text-blue-400 font-bold">{value}</span>
    </div>
  );
}
