import React, { useState,useContext,useEffect                                                                                            } from "react";
import { motion } from "framer-motion";
import { FaBolt, FaBrain, FaClock, FaTrophy } from "react-icons/fa";
import axios from "axios"
import { CatContext,IdContext } from "../../Components/Appcontext";
import {useNavigate} from "react-router-dom"

export default function PlayDuel() {
 const [quizdomains,setQuizdomains]=useState([])

  const [selectedQuiz, setSelectedQuiz] = useState("");

  const navigate=useNavigate("")
  const {userId}=useContext(IdContext)

  

  useEffect(()=>{

  //  axios.get("http://localhost:4080/api/users/categories")
    axios.get("http://localhost:4000/api/game/categories")
   .then((res)=>{setQuizdomains(res.data);console.log(res.data)})
   .catch((err)=>{console.log(err)})
  

  },[])

  function handleCategory(category)
  {
    const data=category
    // axios.post("http://localhost:4080/api/game/category",{

    // axios.post(`http://localhost:4000/api/game/quiz/${category}`,{

    //   // category:data
    //   category
    // })
    // .then((res)=>{console.log(res)})
    // .catch((err)=>{console.log(err)})

    axios.get(
      `http://localhost:4000/api/game/quiz/${encodeURIComponent(category)}`
    )
    .then(res => {
      console.log("Questions:", res.data);
    })
    .catch(err => console.log(err));


  }



  const handleStartMatch = () => {
    if (!selectedQuiz) {
      alert("Please select a quiz domain first!");
      return;
    }
    alert(`Starting duel in ${selectedQuiz.title} domain!`);
    // Navigate to duel arena or load duel data here
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
          {quizdomains.map((domain, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`relative p-6 rounded-3xl cursor-pointer border border-white/20 shadow-xl overflow-hidden group`}
             onClick={(()=>{
              setSelectedQuiz(domain);   // ✅ THIS WAS MISSING

             handleCategory(domain.name)
              navigate("/invitefriends")
              // navigate(`/friends/${domain.name}`)
             })}
            >
              {/* Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${domain.color} opacity-25 blur-2xl group-hover:opacity-40 transition`} />
              
              {/* Card Content */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold text-white">{domain.name}</h2>
                <p className="text-white/70">{domain.xp}</p>
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

      {/* Duel Arena */}
      {selectedQuiz && (
        <motion.div
          className="w-full max-w-6xl bg-[#0b0e19] rounded-3xl border border-white/10 shadow-xl mt-10 p-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-[#1f5cff]">
            {selectedQuiz.title} Duel
          </h2>

          {/* Player Cards */}
          <div className="grid grid-cols-2 gap-6">
            {["Player 1", "Player 2"].map((player, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl bg-black/20 border border-white/10 shadow-md flex flex-col items-center"
              >
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=player${idx + 1}`}
                  className="w-28 h-28 rounded-full mb-3"
                />
                <h2 className="text-2xl font-semibold">{player}</h2>
                <p className="text-white/60">Rating: {1200 + idx * 70}</p>

                <div className="flex gap-3 mt-4">
                  <span className="flex items-center gap-2 bg-[#1f5cff]/20 px-3 py-1 rounded-lg text-[#1f5cff] text-sm">
                    <FaBolt /> Speed
                  </span>
                  <span className="flex items-center gap-2 bg-[#00bcd4]/20 px-3 py-1 rounded-lg text-[#00bcd4] text-sm">
                    <FaBrain /> Accuracy
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* VS Section */}
          <div className="w-full flex items-center justify-center my-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="text-6xl font-extrabold text-[#ff3366] drop-shadow-[0_0_20px_rgba(255,0,80,0.6)]"
            >
              VS
            </motion.div>
          </div>

          {/* Match Info */}
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-black/20 rounded-2xl border border-white/10">
              <FaClock className="text-3xl mx-auto mb-2 text-[#1f5cff]" />
              <h3 className="text-lg text-white/70">Time Per Question</h3>
              <p className="text-2xl font-bold">10 sec</p>
            </div>
            <div className="p-6 bg-black/20 rounded-2xl border border-white/10">
              <FaBrain className="text-3xl mx-auto mb-2 text-[#00bcd4]" />
              <h3 className="text-lg text-white/70">Questions</h3>
              <p className="text-2xl font-bold">15</p>
            </div>
            <div className="p-6 bg-black/20 rounded-2xl border border-white/10">
              <FaTrophy className="text-3xl mx-auto mb-2 text-yellow-400" />
              <h3 className="text-lg text-white/70">Reward</h3>
              <p className="text-2xl font-bold">+40 XP</p>
            </div>
          </div>

          {/* Start Match Button */}
          <div className="w-full flex justify-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#1f5cff] to-[#00bcd4] text-black text-xl font-bold shadow-[0_0_20px_rgba(0,191,255,0.4)]"
              onClick={handleStartMatch}
            >
              Start Match
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
