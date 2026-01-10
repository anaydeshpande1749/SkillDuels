
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ showLogin, setShowLogin }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate()

  return (
  
    <div className="bg-gradient-to-b from-[#040506] to-[#05060a] text-white font-inter">

   
      {/* TOP NAVBAR */}
      <header className="max-w-7xl mx-auto px-6 md:px-8 py-6 flex items-center justify-between">

        {/* Branding */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-tr from-[#081028] to-[#05243a] border border-white/5 p-1">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#1f5cff] to-[#00bcd4] flex items-center justify-center text-black font-bold">
              SD
            </div>
          </div>
          <div onClick={()=>navigate("/")} className="cursor-pointer">
            <h1 className="text-sm font-bold tracking-wide">SkillDuels</h1>
            <p className="text-[11px] text-white/40">Competitive Learning</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <NavLink to="/" className={({isActive}) => `nav-link transition ${isActive? 'active':''}`}>Home</NavLink>
          <NavLink to="/about" className={({isActive}) => `nav-link transition ${isActive? 'active':''}`}>About</NavLink>
          <NavLink to="/features" className={({isActive}) => `nav-link transition ${isActive? 'active':''}`}>Features</NavLink>
          <NavLink to="/leaderboard" className={({isActive}) => `nav-link transition ${isActive? 'active':''}`}>Leaderboard</NavLink>
          <NavLink to="/pricing" className={({isActive}) => `nav-link transition ${isActive? 'active':''}`}>Pricing</NavLink>
          <NavLink to="/contact" className={({isActive}) => `nav-link transition ${isActive? 'active':''}`}>Contact Us</NavLink>
          <NavLink to="/chatfriends" className={({isActive}) => `nav-link transition ${isActive? 'active':''}`}>Chat</NavLink>
          


          {/* LOGIN BUTTON */}
          <button
            onClick={() => setShowLogin(true)}
            className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1f5cff] to-[#00bcd4] text-black font-semibold shadow-md"
          >
            Sign In / Sign Up
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden px-3 py-2 rounded-lg bg-white/5"
        >
          Menu
        </button>
      </header>

      {/* MOBILE NAV SIDEBAR */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="fixed top-0 right-0 w-64 h-full bg-[#0a0f1b] p-6 shadow-xl z-50"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold">Menu</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-6 text-white/70 text-sm">
              <NavLink to="/about" onClick={() => setMobileOpen(false)} className={({isActive}) => `nav-link ${isActive? 'active':''}`}>About</NavLink>
              <NavLink to="/features" onClick={() => setMobileOpen(false)} className={({isActive}) => `nav-link ${isActive? 'active':''}`}>Features</NavLink>
              <NavLink to="/leaderboard" onClick={() => setMobileOpen(false)} className={({isActive}) => `nav-link ${isActive? 'active':''}`}>Leaderboard</NavLink>
              <NavLink to="/pricing" onClick={() => setMobileOpen(false)} className={({isActive}) => `nav-link ${isActive? 'active':''}`}>Pricing</NavLink>
              <NavLink to="/docs" onClick={() => setMobileOpen(false)} className={({isActive}) => `nav-link ${isActive? 'active':''}`}>Docs</NavLink>

              {/* LOGIN BUTTON */}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setShowLogin(true);
                }}
                className="mt-4 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#1f5cff] to-[#00bcd4] text-black font-semibold shadow-md"
              >
                Sign In / Sign Up
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    
    </div>
  );
};

export default Navbar;
