import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBolt, FaBrain, FaClock, FaTrophy } from "react-icons/fa";
import axios from "axios";
import { CatContext, IdContext } from "../../Components/Appcontext";
import { useNavigate } from "react-router-dom";

export default function PlayDuel() {
  const [quizdomains, setQuizdomains] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const navigate = useNavigate("");
  const { userId } = useContext(IdContext);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/categories`)
      .then((res) => {
        setQuizdomains(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  /*function handleCategory(categoryName) {
    axios.post(`${API_BASE_URL}/category`, {
      category: categoryName
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
  }*/

  /* ---------------- START MATCH (UI ONLY) ---------------- */
  const handleStartMatch = () => {
    if (!selectedQuiz) {
      alert("Please select a quiz domain first!");
      return;
    }
    alert(`Waiting for opponent in ${selectedQuiz.name}`);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center text-white px-4 md:px-0 bg-gradient-to-b from-[#040506] to-[#05060a] py-12">
      {/* Header */}
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-5xl font-extrabold tracking-wide mb-2 text-[#1f5cff]">
          Multiplayer Duel Arena
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Choose your battle domain and prove your skills!
        </p>
      </div>

      {/* Quiz Domain Selection */}
      {!selectedQuiz && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12 w-full max-w-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {quizDomains.map((domain) => (
            <motion.div
              key={domain._id}
              whileHover={{ scale: 1.05 }}
              className={`relative p-6 rounded-3xl cursor-pointer border border-white/20 shadow-xl overflow-hidden group`}
              onClick={() => {
                console.log("p"+domain.name)
                /*handleCategory(domain.name);*/
                navigate("/invitefriends", {
                  state: {
                    category: domain.name,
                  },
                });
              }}
            >
              {/* Glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${domain.color} opacity-25 blur-2xl group-hover:opacity-40 transition`}
              />

              {/* Card Content */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold text-white">{domain.name}</h2>
                <p className="text-white/70">{domain.difficulty}</p>
                <motion.div
                  className="w-20 h-20 bg-white/5 rounded-full border border-white/20 shadow-inner flex items-center justify-center text-[#1f5cff] font-bold text-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                >
                  🎯
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Duel Preview */}
      {selectedQuiz && (
        <motion.div
          className="w-full max-w-6xl bg-[#0b0e19] rounded-3xl border border-white/10 shadow-xl mt-10 p-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-[#1f5cff]">
            {selectedQuiz.name} Duel
          </h2>

          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-black/20 rounded-2xl border border-white/10">
              <FaClock className="text-3xl mx-auto mb-2 text-[#1f5cff]" />
              <h3 className="text-lg text-white/70">Time Per Question</h3>
              <p className="text-2xl font-bold">
                {selectedQuiz.timePerQuestion || 10}s
              </p>
            </div>

            <div className="p-6 bg-black/20 rounded-2xl border border-white/10">
              <FaBrain className="text-3xl mx-auto mb-2 text-[#00bcd4]" />
              <h3 className="text-lg text-white/70">Questions</h3>
              <p className="text-2xl font-bold">
                {selectedQuiz.questionCount || 10}
              </p>
            </div>

            <div className="p-6 bg-black/20 rounded-2xl border border-white/10">
              <FaTrophy className="text-3xl mx-auto mb-2 text-yellow-400" />
              <h3 className="text-lg text-white/70">Reward</h3>
              <p className="text-2xl font-bold">+XP</p>
            </div>
          </div>

          <div className="w-full flex justify-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#1f5cff] to-[#00bcd4] text-black text-xl font-bold"
              onClick={handleStartMatch}
            >
              Waiting for Opponent
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
