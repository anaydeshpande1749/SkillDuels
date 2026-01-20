<<<<<<< HEAD
=======
//this is login popup

>>>>>>> origin/main
import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IdContext } from "./Appcontext";
import { useSocket } from "./SocketContext";

<<<<<<< HEAD
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Now: http://localhost:4000
=======
const API = import.meta.env.VITE_API_BASE_URL;
>>>>>>> origin/main

const LoginPopup = ({ setShowLogin, setUser }) => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState("");
<<<<<<< HEAD
  const { id, setId } = useContext(IdContext);
  const { socket } = useSocket();
=======
>>>>>>> origin/main

  const { setId } = useContext(IdContext);
  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      /* ---------------- SIGN UP ---------------- */
      if (mode === "signup") {
<<<<<<< HEAD
        const res = await axios.post(`${API_BASE_URL}/register`, {
=======
        await axios.post(`${API}/api/users/register`, {
>>>>>>> origin/main
          fullName,
          email,
          password,
        });

<<<<<<< HEAD
        const { token, user } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("username", user.profile.username);
        localStorage.setItem("profile", JSON.stringify(user.profile));
        localStorage.setItem("stats", JSON.stringify(user.stats));
        localStorage.setItem("badges", JSON.stringify(user.badges));

        setUser(user);
        setShowLogin(false);
        navigate("/dashboard");
        return;
      }

      // LOGIN
      const res = await axios.post(`${API_BASE_URL}/login`, {
=======
        setMsg("Account created. Please sign in.");
        setMode("signin");
        return;
      }

      /* ---------------- SIGN IN ---------------- */
      const res = await axios.post(`${API}/api/users/login`, {
>>>>>>> origin/main
        email,
        password,
      });

      const { token, user } = res.data;
<<<<<<< HEAD

      // Store auth
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("username", user.profile.username);
      localStorage.setItem("profile", JSON.stringify(user.profile));
      localStorage.setItem("stats", JSON.stringify(user.stats));
      localStorage.setItem("badges", JSON.stringify(user.badges));

      // Context + socket
      setId(user.id);
      socket.emit("register-user", { userId: user.id, username: user.profile.username });

      setUser(user);
=======

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
>>>>>>> origin/main
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

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-[#06121f] to-[#02080f] border border-white/10 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-white text-center">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </h2>
          <p className="text-white/50 text-sm text-center mt-1">
            {mode === "signin"
              ? "Login to continue your SkillDuels journey"
              : "Create your player account to start battling"}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-white/70 text-sm">Full Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#1f5cff]"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-white/70 text-sm">Email</label>
              <input
                type="email"
                placeholder="player@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#1f5cff]"
                required
              />
            </div>

            <div>
              <label className="text-white/70 text-sm">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#1f5cff]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#1f5cff] to-[#00bcd4] text-black font-semibold cursor-pointer"
            >
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

<<<<<<< HEAD
          {msg && <p className="text-red-400 text-sm mt-3 text-center">{msg}</p>}
=======
          {msg && (
            <p className="text-red-400 text-sm mt-2">{msg}</p>
          )}
>>>>>>> origin/main

          <div className="text-center text-white/60 text-sm mt-3">
            {mode === "signin" ? (
<<<<<<< HEAD
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-[#60a5fa] underline cursor-pointer"
                  onClick={() => setMode("signup")}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-[#60a5fa] underline cursor-pointer"
                  onClick={() => setMode("signin")}
                >
                  Sign In
                </button>
              </>
=======
              <button onClick={() => setMode("signup")}>
                Sign Up
              </button>
            ) : (
              <button onClick={() => setMode("signin")}>
                Sign In
              </button>
>>>>>>> origin/main
            )}
          </div>

          <button
            onClick={() => setShowLogin(false)}
            className="w-full mt-4 text-sm text-white/40 hover:text-white/70 transition cursor-pointer"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginPopup;