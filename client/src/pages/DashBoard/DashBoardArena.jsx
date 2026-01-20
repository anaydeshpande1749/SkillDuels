import React, { useState,useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios"
import {useNavigate} from "react-router-dom"

export default function DashboardArena() {
  
   const [allQuizzes,setallQuizzes]=useState([])
   const navigate=useNavigate("")

   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
  

  useEffect(()=>{

  //  axios.get("http://localhost:4080/api/users/categories")
    axios.get(`${API_BASE_URL}/categories`)
   .then((res)=>{setallQuizzes(res.data);console.log(res.data)})
   .catch((err)=>{console.log(err)})
  

  },[])

  const [search, setSearch] = useState("");

  const filteredQuizzes = allQuizzes.filter((quiz) =>
  quiz.name.toLowerCase().includes(search.toLowerCase())
);



  return (
    <section className="w-full bg-[#0c0c0f] text-white  relative overflow-hidden">
      {/* Glow Blur Background */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-40">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-900 blur-[150px] rounded-full" />
      </div>

      {/* Section Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16 relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">
           Quiz Arena
        </h2>
        <p className="text-gray-400 mt-3 text-lg max-w-2xl mx-auto">
          Compete in high-intensity, futuristic quiz battles. Earn XP, unlock rewards, and climb the SkillDuels leaderboard.
        </p>
      </motion.div>

      {/* Search Bar */}
      <div className="relative z-10 max-w-xl mx-auto mb-10">
        <input
          type="text"
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-5 py-3 rounded-xl bg-[#111118] border border-blue-700/40 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-lg shadow-black/20"
        />
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
        {filteredQuizzes.map((quiz, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="group p-6 rounded-2xl bg-[#111118] border border-[#1a1a22] shadow-xl hover:shadow-blue-600/30 hover:border-blue-600 transition duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-600/20 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />

            <h3 className="text-xl font-bold mb-2">{quiz.name}</h3>

            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-600/30">
                {quiz.difficulty}
              </span>
              <span>{quiz.players} Players</span>
            </div>

            <div className="text-blue-400 font-semibold text-lg">{quiz.xp}</div>

            <button className="mt-6 w-full py-2 rounded-xl bg-blue-600 group-hover:bg-blue-500 transition text-white font-semibold shadow-lg shadow-blue-600/20"
             onClick={()=>{console.log(quiz.name);navigate(`/singleplayer/${quiz.name}`)}}>
              Play Now
            </button>
          </motion.div>
        ))}
      </div>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-20 bg-gradient-to-r from-blue-600 to-blue-900 py-10 px-8 rounded-3xl shadow-2xl text-center"
      >
        <h3 className="text-3xl font-extrabold mb-4">Ready to Prove Your Skills?</h3>
        <p className="text-white/80 max-w-2xl mx-auto mb-6">
          Join thousands of competitive learners leveling up every day on SkillDuels. Jump into a live quiz battle now.
        </p>
        <button className="px-8 py-3 bg-black/30 backdrop-blur-md rounded-xl text-white font-semibold hover:bg-black/40 transition shadow-xl">
          Start Competing
        </button>
      </motion.div>
    </section>
  );
}
