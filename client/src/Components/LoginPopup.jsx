//this is login popup

import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IdContext } from "./Appcontext";
import { useSocket } from "./SocketContext";

const API = import.meta.env.VITE_API_BASE_URL;

const LoginPopup = ({ setShowLogin, setUser }) => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState("");

  const { setId } = useContext(IdContext);
  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      /* ---------------- SIGN UP ---------------- */
      if (mode === "signup") {
        await axios.post(`${API}/api/users/register`, {
          fullName,
          email,
          password,
        });

        setMsg("Account created. Please sign in.");
        setMode("signin");
        return;
      }

      /* ---------------- SIGN IN ---------------- */
      const res = await axios.post(`${API}/api/users/login`, {
        email,
        password,
      });

      const { token, user } = res.data;

      /* 🔥 RESOLVE USERNAME SAFELY */
      const resolvedUsername =
        user.profile?.username || user.fullName;

      /* ---------------- STORE FIRST ---------------- */
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("username", resolvedUsername);
      localStorage.setItem("user", JSON.stringify(user));

      /* ---------------- UPDATE APP STATE FIRST ---------------- */
      setId(user.id);
      setUser(user);

      /* ---------------- REGISTER SOCKET ---------------- */
      if (socket) {
        socket.emit("register-user", {
          userId: user.id,
          username: resolvedUsername,
        });
      }

      /* ---------------- CLOSE MODAL ---------------- */
      setShowLogin(false);

      /* 🔥 IMPORTANT: navigate AFTER state is set */
      setTimeout(() => {
        navigate("/dashboard");
      }, 0);

    } catch (err) {
      setMsg(
        err.response?.data?.message ||
          "Invalid email or password"
      );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          className="absolute inset-0 bg-black/70"
          onClick={() => setShowLogin(false)}
        />

        <motion.div className="relative w-full max-w-md p-6 rounded-2xl bg-[#06121f]">
          <h2 className="text-xl text-white text-center">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white/10 text-white"
              />
            )}

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/10 text-white"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/10 text-white"
            />

            <button className="w-full py-2 bg-blue-500 rounded">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {msg && (
            <p className="text-red-400 text-sm mt-2">{msg}</p>
          )}

          <div className="text-center text-white/60 mt-3">
            {mode === "signin" ? (
              <button onClick={() => setMode("signup")}>
                Sign Up
              </button>
            ) : (
              <button onClick={() => setMode("signin")}>
                Sign In
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginPopup;


