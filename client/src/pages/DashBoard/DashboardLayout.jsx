import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaUser, FaComments, FaGamepad, FaPuzzlePiece } from "react-icons/fa";
import { GiThreeFriends } from "react-icons/gi";
import { SiApplearcade } from "react-icons/si";

export default function DashboardLayout({ user, setUser }) {
  const navigate = useNavigate();

  const menu = [
    { label: "Single Player", path: "", icon: <FaPuzzlePiece /> },
    { label: "Play Duel", path: "duel", icon: <FaGamepad /> },
    { label: "Chat", path: "chatfriends", icon: <FaComments /> },
    { label: "Friends", path: "friends", icon: <GiThreeFriends /> },
    { label: "Arcade Games", path: "games", icon: <SiApplearcade /> },
    { label: "User Profile", path: "profile", icon: <FaUser /> },
  ];

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);            // ✅ clear app state
    navigate("/");            // ✅ redirect home
  };

  return (
    <div className="h-screen flex flex-col bg-[#05060a] text-white">

      {/* ---------------- TOP NAVBAR ---------------- */}
      <div className="w-full h-16 flex items-center justify-between px-8 border-b border-white/10 bg-gradient-to-r from-[#040506] to-[#07090f] shadow-lg">
        <h1
          className="text-2xl font-bold tracking-wide cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <span className="text-[#1f5cff]">Skill</span>Duel
        </h1>

        <div className="flex items-center gap-6">
          <p className="text-white/80 text-lg">
            Hi,{" "}
            <span className="font-semibold">
              {user?.fullName || "User"}
            </span>
          </p>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 transition-all px-8 py-3 rounded-xl border border-red-500/40 shadow-[0_0_15px_rgba(255,0,0,0.4)] text-red-300 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ---------------- BODY ---------------- */}
      <div className="flex flex-1 overflow-hidden">

        {/* ---------------- SIDEBAR ---------------- */}
        <div className="w-64 bg-gradient-to-b from-[#040506] to-[#05060a] border-r border-white/10 p-6 flex flex-col overflow-y-auto">
          <h2 className="text-xl font-bold mb-6 tracking-wide">
            Dashboard
          </h2>

          <div className="flex flex-col gap-3">
            {menu.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#1f5cff] to-[#00bcd4] text-black font-semibold shadow-lg"
                      : "hover:bg-white/10 hover:shadow-md"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* ---------------- PAGE CONTENT ---------------- */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#05060a] to-[#020305]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
