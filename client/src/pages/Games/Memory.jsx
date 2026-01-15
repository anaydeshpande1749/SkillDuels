//this is Memory.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";



// Core gameplay component with improved visuals
function MemoryGameCore({ mode, onEnd, score, setScore }) {
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState([]);
  const [displayPattern, setDisplayPattern] = useState(true);
  const [selected, setSelected] = useState([]);
  const [lives, setLives] = useState(3);
  const [roundsPerfect, setRoundsPerfect] = useState(0);
  const [round, setRound] = useState(1);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [duoTurn, setDuoTurn] = useState(0); // 0 = Player A, 1 = Player B
  const [duoRound, setDuoRound] = useState(1);
  const timerRef = useRef(null);

  const cellColors = [
    "bg-gradient-to-r from-[#ff3366] to-[#ff6699]", // Red
    "bg-gradient-to-r from-[#3366ff] to-[#6699ff]", // Blue
    "bg-gradient-to-r from-[#33ff66] to-[#66ff99]", // Green
    "bg-gradient-to-r from-[#ffff33] to-[#ffff66]", // Yellow
    "bg-gradient-to-r from-[#cc33ff] to-[#cc66ff]", // Purple
    "bg-gradient-to-r from-[#ff9933] to-[#ffcc66]", // Orange
  ];

  // const startRound = () => {
  //   const positions = Array.from({ length: gridSize * gridSize }, (_, i) => i);
  //   const randomPattern = [];
  //   const patternLength = gridSize + 2; // Pattern gets longer with grid size
    
  //   while (randomPattern.length < patternLength) {
  //     const pick = positions[Math.floor(Math.random() * positions.length)];
  //     if (!randomPattern.includes(pick)) randomPattern.push(pick);
  //   }
    
  //   setPattern(randomPattern);
  //   setDisplayPattern(true);
  //   setSelected([]);
    
  //   // Show pattern for varying time based on difficulty
  //   const showTime = 3000 - (gridSize * 200); // Less time as grid gets bigger
  //   setTimeout(() => {
  //     setDisplayPattern(false);
  //     if (mode === "duo") {
  //       setTimeLeft(15); // Shorter time for duo mode
  //     }
  //   }, Math.max(1500, showTime));
  // };

const startRound = () => {
  const positions = Array.from({ length: gridSize * gridSize }, (_, i) => i);
  const randomPattern = [];
  const patternLength = gridSize + 2;

  while (randomPattern.length < patternLength) {
    const pick = positions[Math.floor(Math.random() * positions.length)];
    if (!randomPattern.includes(pick)) randomPattern.push(pick);
  }

  setPattern(randomPattern);
  setDisplayPattern(true);
  setSelected([]);

  setTimeLeft(15); // ✅ FIXED: 15 seconds EVERY round

  clearInterval(timerRef.current);
  timerRef.current = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timerRef.current);
        onEnd(); // ✅ end game cleanly
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  setTimeout(() => {
    setDisplayPattern(false);
  }, 3000); // pattern visible time
};


  // useEffect(() => {
  //   if (mode === "solo") {
  //     setTimeLeft(30);
  //     timerRef.current = setInterval(() => {
  //       setTimeLeft(prev => {
  //         if (prev <= 1) {
  //           clearInterval(timerRef.current);
  //           onEnd();
  //           return 0;
  //         }
  //         return prev - 1;
  //       });
  //     }, 1000);
  //   }
    
  //   startRound();
    
  //   return () => clearInterval(timerRef.current);
  // }, [mode]);

  // useEffect(() => {
  //   if (mode === "duo" && !displayPattern && timeLeft > 0) {
  //     const timer = setInterval(() => {
  //       setTimeLeft(prev => {
  //         if (prev <= 1) {
  //           clearInterval(timer);
  //           // End turn if time runs out
  //           endTurn(false);
  //           return 0;
  //         }
  //         return prev - 1;
  //       });
  //     }, 1000);
      
  //     return () => clearInterval(timer);
  //   }
  // }, [mode, displayPattern, timeLeft]);



  // const handleSelect = (idx) => {
  //   if (displayPattern || selected.includes(idx)) return;

  //   const newSel = [...selected, idx];
  //   setSelected(newSel);
    
  //   // Check if this was the correct next cell
  //   if (newSel.length <= pattern.length) {
  //     // const correct = pattern[newSel.length - 1] === idx;
      
  //     // if (!correct) {
  //     //   // Wrong selection
  //     //   if (mode === "solo") {
  //     //     setLives(prev => {
  //     //       if (prev <= 1) {
  //     //         onEnd();
  //     //         return 0;
  //     //       }
  //     //       return prev - 1;
  //     //     });
  //     //     setCombo(0);
  //     //   } else {
  //     //     endTurn(false);
  //     //   }
  //     //   setSelected([]); // ADD THIS LINE to clear selection on wrong choice
  //     //   return;
  //     // }
      
  //     // Correct selection
  //     if (newSel.length === pattern.length) {
  //       // Completed the pattern
  //       const baseScore = 10;
  //       const comboBonus = combo * 5;
  //       const difficultyBonus = gridSize * 2;
  //       const perfectBonus = pattern.length === newSel.length ? 15 : 0;
  //       const roundScore = baseScore + comboBonus + difficultyBonus + perfectBonus;
        
  //       if (mode === "solo") {
  //         setScore({ ...score, playerA: score.playerA + roundScore });
  //         setCombo(prev => prev + 1);
  //         setRoundsPerfect(prev => prev + 1);
          
  //         if (roundsPerfect + 1 >= 4 && lives < 3) {
  //           setLives(prev => prev + 1);
  //           setRoundsPerfect(0);
  //         }
          
  //         if (gridSize < 5 && round % 2 === 0) {
  //           setGridSize(prev => prev + 1);
  //         }
  //       } else {
  //         // Duo mode
  //         if (duoTurn === 0) {
  //           setScore({ ...score, playerA: score.playerA + roundScore });
  //         } else {
  //           setScore({ ...score, playerB: score.playerB + roundScore });
  //         }
  //         endTurn(true);
  //       }
        
  //       setRound(prev => prev + 1);
  //       startRound();
  //     }
  //   }
  // };

  useEffect(() => {
  startRound();
  return () => clearInterval(timerRef.current);
}, []);



const handleSelect = (idx) => {
  if (displayPattern || selected.includes(idx)) return;

  // ❌ Wrong tile (not part of pattern)
  if (!pattern.includes(idx)) {
    if (mode === "solo") {
      setLives(prev => {
        if (prev <= 1) {
          onEnd(); // ✅ game over
          return 0;
        }
        return prev - 1;
      });
      setSelected([]); // reset attempt
    } else {
      endTurn(false);
    }
    return;
  }

  // ✅ Correct tile (order does NOT matter)
  const newSelected = [...selected, idx];
  setSelected(newSelected);

  // 🎉 Pattern completed
  if (newSelected.length === pattern.length) {
    if (mode === "solo") {
      setScore(prev => ({
        ...prev,
        playerA: prev.playerA + 10 // ✅ +10 per correct round
      }));
    } else {
      setScore(prev => ({
        ...prev,
        [duoTurn === 0 ? "playerA" : "playerB"]:
          prev[duoTurn === 0 ? "playerA" : "playerB"] + 10
      }));
    }

    setSelected([]);
    setRound(prev => prev + 1);
    startRound(); // next round
  }
};




  const endTurn = (success) => {
    if (mode === "duo") {
      if (duoRound >= 5) {
        onEnd();
      } else {
        setDuoTurn(prev => (prev + 1) % 2);
        setDuoRound(prev => prev + 1);
        setSelected([]);
        setCombo(0);
        setTimeLeft(15);
        startRound();
      }
    }
  };

  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);

  return (
    <div className="max-w-4xl mx-auto text-center pt-16">
      <h2 className="text-3xl font-bold mb-6">
        {mode === "solo" ? "Solo Mode" : "Duo Mode"}
      </h2>
      
      {/* Game stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-sm text-white/60 mb-1">Time</div>
          <div className="text-2xl font-bold">{timeLeft}s</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-sm text-white/60 mb-1">Round</div>
          <div className="text-2xl font-bold">{mode === "solo" ? round : duoRound}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-sm text-white/60 mb-1">Score</div>
          <div className="text-2xl font-bold">
            {mode === "solo" ? score.playerA : (duoTurn === 0 ? score.playerA : score.playerB)}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-sm text-white/60 mb-1">Combo</div>
          <div className="text-2xl font-bold">x{combo}</div>
        </div>
      </div>

      {/* Game grid */}
        <div className="mb-8">
          <div className="text-xl font-bold mb-4 text-center">
            {displayPattern ? "Memorize this pattern!" : "Recreate the pattern!"}
          </div>
          
          {/* Grid - CHANGED TO MATCH MemoryMatch.jsx */}
          <div className={`grid gap-3 mx-auto max-w-md ${
            gridSize === 3 ? 'grid-cols-3' :
            gridSize === 4 ? 'grid-cols-4' :
            gridSize === 5 ? 'grid-cols-5' : 'grid-cols-6'
          }`}>

          {cells.map((idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                disabled={displayPattern}
                                className={`
                                  aspect-square rounded-xl flex items-center justify-center text-2xl font-bold
                                  transition-all duration-300 relative overflow-hidden
                                  ${displayPattern 
                                    ? (pattern.includes(idx) 
                                      ? cellColors[idx % cellColors.length] + ' scale-110' 
                                      : 'bg-white/10 border border-white/20')
                                    : (selected.includes(idx)
                                      ? (pattern.includes(idx) 
                                        ? cellColors[idx % cellColors.length] + ' scale-110' 
                                        : 'bg-red-500/50 scale-110')
                                      : 'bg-white/10 hover:bg-white/20 hover:scale-105')
                                  }
                                  ${displayPattern ? 'cursor-default' : 'cursor-pointer'}
                                `}
                              >
                                {displayPattern && pattern.includes(idx) && (
                                  <div className="animate-ping absolute inset-0 bg-white/30 rounded-xl"></div>
                                )}
                                {!displayPattern && selected.includes(idx) && (
                                  <div className="text-white text-xl">✓</div>
                                )}
                                {displayPattern && pattern.includes(idx) && (
                                  <div className="text-white text-2xl">★</div>
                                )}
                              </button>
                          ))}

           </div>
        
                {/* {displayPattern && (
                  <div className="text-lg text-[#ffcc00] font-bold mb-4 animate-pulse">
                    Memorize the pattern!
                  </div>
                )}
                
                {!displayPattern && (
                  <div className="text-lg text-green-400 font-bold mb-4">
                    Recreate the pattern!
                  </div>
                )} */}
        </div>

                      {/* Pattern Progress - ADDED TO MATCH MemoryMatch.jsx */}
              <div className="mt-8 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-white/60">Progress</div>
                  <div className="text-white/60">
                    {selected.length}/{pattern.length} cells
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#a64ac9] to-[#7b2cbf] transition-all duration-300"
                    style={{ width: `${(selected.length / pattern.length) * 100}%` }}
                  ></div>
                </div>
              </div>

      {/* Additional info */}
      {mode === "solo" && (
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-400' : 'bg-white/10'}`}
                />
              ))}
            </div>
            <span className="text-sm">Lives</span>
          </div>
          <div className="text-sm text-white/60">
            Grid: {gridSize}×{gridSize}
          </div>
        </div>
      )}

      {mode === "duo" && (
        <div className="bg-white/5 rounded-2xl p-4 mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className={`flex items-center gap-2 ${duoTurn === 0 ? 'text-green-400' : 'text-white/60'}`}>
              <span className="text-xl">😀</span>
              <span>Player A: {score.playerA}</span>
              {duoTurn === 0 && <span className="text-sm animate-pulse">← Current turn</span>}
            </div>
            <div className={`flex items-center gap-2 ${duoTurn === 1 ? 'text-green-400' : 'text-white/60'}`}>
              <span>Player B: {score.playerB}</span>
              <span className="text-xl">😎</span>
              {duoTurn === 1 && <span className="text-sm animate-pulse">Current turn →</span>}
            </div>
          </div>
          <div className="text-sm text-white/60">
            Round {duoRound} of 5 • {duoTurn === 0 ? "Player A's" : "Player B's"} turn
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemoryGamePage() {
  const [leaderboard, setLeaderboard] = useState([]);

  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState("solo");
  const [streakData, setStreakData] = useState([
    { day: "M", completed: true },
    { day: "T", completed: true },
    { day: "W", completed: false },
    { day: "T", completed: false },
    { day: "F", completed: false },
    { day: "S", completed: false },
    { day: "S", completed: false },
  ]);

  const [screen, setScreen] = useState("menu");
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([
    { name: "Player A", emoji: "😀", ready: false },
    { name: "Player B", emoji: "😎", ready: false }
  ]);
  const [countdown, setCountdown] = useState(5);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState({ playerA: 0, playerB: 0 });
  const timerRef = useRef(null);

  const handleStartGame = () => {
    if (gameMode === "solo") {
      startSolo();
    } else if (gameMode === "duo") {
      startDuo();
    }
  };

  const startSolo = () => {
    setGameMode("solo");
    setCountdown(3);
    setScreen("countdown");
    setTimer(0);
    setScore({ playerA: 0, playerB: 0 });
  };

  const startDuo = () => {
    setGameMode("duo");
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setScreen("duoLobby");
    setScore({ playerA: 0, playerB: 0 });
  };

  const readyToPlay = (playerIndex) => {
    const newPlayers = [...players];
    newPlayers[playerIndex].ready = !newPlayers[playerIndex].ready;
    setPlayers(newPlayers);
    
    // Start game when all players are ready
    if (newPlayers.every(p => p.ready) && newPlayers.length >= 2) {
      setCountdown(3);
      setScreen("countdown");
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert("Room code copied!");
  };

  const goBack = () => {
    if (screen === "menu") {
      navigate(-1);
    } else {
      setScreen("menu");
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("user"))  || {}  ;
  const userId = currentUser?.id || currentUser.id || currentUser._id || localStorage.getItem("userId")   ;
   const userName = localStorage.getItem("username") ||  JSON.parse(localStorage.getItem("username"));
  // const { token, user } = res.data;
   const API = import.meta.env.VITE_API_BASE_URL;



//  const userId = localStorage.getItem("userId");
// const userName = localStorage.getItem("username");
  const sendScoreToBackend = async (finalScore) => {
  try {

   ;

    if (!userId) {
      console.warn("No userId found, score not sent");
      return;
    }
      
   // await fetch("http://localhost:4000/api/game/attempt", {
    await fetch(`${API}/api/game/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // userId: "test-user-frontend", // TEMP (JWT later)
        //userId,
        
        // userId: currentUser.id,
        userId,
        // userName: currentUser.fullName, // ✅ REAL NAME
        userName: currentUser.fullName || "Anonymous" || userName || currentUser.name ,
        // userName:  "Anonymous" || userName  ,
        game: "memory",
        score: finalScore,
      }),
    });

    console.log("Score sent to backend");
    console.log(userId);
  } catch (error) {
    console.error("Failed to send score", error);
  }
};


const fetchLeaderboard = async () => {
  try {
    // const res = await fetch("http://localhost:4080/api/game/leaderboard");
    const res = await fetch(
       // "http://localhost:4000/api/game/leaderboard?game=memory"
      `${API}/api/game/leaderboard?game=memory`
    );

    const data = await res.json();
    // console.log(data)

    // transform backend data → UI-friendly format
    const formatted = data.map((item, index) => ({
      rank: index + 1,
      name: item.userName || item.userId || item.fullName || item.name, 
      // name: item._id,              // userId for now
      score: item.bestScore,
      // isYou: item._id === "test-user-frontend" // TEMP (JWT later)
      isYou: item.userId === "test-user-frontend" // TEMP (JWT later)
    }));

    setLeaderboard(formatted);
  } catch (err) {
    console.error("Failed to fetch leaderboard", err);
  }
};




useEffect(() => {
  fetchLeaderboard();
}, []);



  useEffect(() => {
    if (screen === "countdown") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setScreen("gameplay");
      }
    }
  }, [screen, countdown]);

  useEffect(() => {
    if (screen === "gameplay" && gameMode === "solo") {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, gameMode]);

  // MAIN RETURN STATEMENT FOR MemoryGamePage
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#a64ac9] to-[#7b2cbf] text-white p-4 md:p-4">
      {/* Back Button */}
      <button
        onClick={goBack}
        className="fixed top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
      >
        ←
      </button>

      {/* Show Menu Screen */}
      {screen === "menu" && (
        <div className="max-w-5xl mx-auto pt-1">
          {/* Pattern Grid Background - Smaller */}
          <div className="grid grid-cols-6 md:grid-cols-8 gap-2 md:gap-3 justify-center mb-8 opacity-25 pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-white/30"
              />
            ))}
          </div>

          {/* Game Header - Compact */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center text-3xl md:text-4xl text-[#7b2cbf] font-bold">
              🧠
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Memory</h1>
            
            <div className="flex gap-2 justify-center mb-3">
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                MEMORY
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                PATTERN
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                SPEED
              </span>
            </div>
            
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
              Test your memory by recreating patterns!
            </p>
          </div>

          {/* Game Mode Selection - Compact */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex bg-white/10 rounded-xl p-1 mb-4">
              <button
                className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${
                  gameMode === "solo"
                    ? "bg-white text-[#7b2cbf]"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setGameMode("solo")}
              >
                🎮 Solo
              </button>
              <button
                className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${
                  gameMode === "duo"
                    ? "bg-white text-[#7b2cbf]"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setGameMode("duo")}
              >
                ⚔️ Duo
              </button>
            </div>

            {/* Start Game Button */}
            <button
              onClick={handleStartGame}
              className="w-full py-3 bg-white text-[#7b2cbf] font-bold rounded-xl hover:scale-105 transition-transform shadow-xl text-base"
            >
              Start {gameMode === "solo" ? "Practice" : "Duel"}
            </button>
          </div>

          {/* Content Section - Compact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Left Column - Game Info */}
            <div className="space-y-4">
              <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-3">About the game</h3>
                <p className="text-white/80 mb-4 text-sm">
                  Exercise your working memory and visual pattern recognition by
                  observing and recreating increasingly complex patterns.
                </p>
                
                <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-sm mb-2">Example:</h4>
                  <p className="text-white/70 text-sm">
                    Remembering where you parked your car in a large parking lot
                    or recalling the sequence of steps in a new recipe.
                  </p>
                </div>
              </div>

              {/* Game Mode Description */}
              <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-3">
                  {gameMode === "solo" ? "Solo Mode" : "Duo Mode"}
                </h3>
                {gameMode === "solo" ? (
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                      Practice at your own pace
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                      Progress through 15 difficulty levels
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                      Compete for high scores
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      Real-time multiplayer duel
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      Race against the clock (10s per round)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      Win XP and climb leaderboards
                    </li>
                  </ul>
                )}
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-4">
              {/* Stats Grid - Compact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">1</div>
                    <div className="text-white/60 text-sm">Total plays</div>
                  </div>
                </div>
                
                <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">0</div>
                    <div className="text-white/60 text-sm">Highest score</div>
                  </div>
                </div>
              </div>

              {/* Streak Section - Compact */}
              <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">🔥 1 day streak</h3>
                  <div className="text-[#ffcc00] font-bold text-sm">+50 XP</div>
                </div>

                {/* Week Calendar - Compact */}
                <div className="flex justify-between mb-4">
                  {streakData.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-sm ${
                        day.completed 
                          ? 'bg-gradient-to-br from-[#ffcc00] to-[#ff9900] text-black' 
                          : 'bg-white/10'
                      }`}>
                        {day.completed ? '✓' : day.day}
                      </div>
                      <div className="text-xs text-white/60">{day.day}</div>
                    </div>
                  ))}
                </div>

                {/* Streak Stats - Compact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-white/60 text-xs mb-1">Best streak</div>
                    <div className="text-xl font-bold">1 day</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-white/60 text-xs mb-1">Last streak</div>
                    <div className="text-xl font-bold">0 days</div>
                  </div>
                </div>
              </div>

              {/* Game Tips - Compact */}
              <div className="bg-gradient-to-r from-[#7b2cbf]/20 to-[#a64ac9]/20 rounded-2xl p-4 border border-white/10">
                <h4 className="font-bold text-sm mb-2">💡 Pro Tip</h4>
                <p className="text-white/70 text-xs">
                  {gameMode === "solo"
                    ? "Start with simple patterns and gradually increase complexity. Try to visualize the pattern before recreating it."
                    : "In duo mode, speed is key! Practice solo first to memorize common patterns."}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section - Leaderboard Preview - Compact */}
          <div className="max-w-5xl mx-auto mt-8">
            <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">🏆 Leaderboard</h3>
              <div className="space-y-3">
                  {/* {[
                    { rank: 1, name: "You", score: 850, isYou: true },
                    { rank: 2, name: "Alex", score: 1200 },
                    { rank: 3, name: "Sam", score: 1150 },
                  ] */}
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      player.isYou
                        ? "bg-gradient-to-r from-[#7b2cbf]/30 to-[#a64ac9]/30"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm">
                        {player.rank}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{player.name}</div>
                        <div className="text-xs text-white/60">
                          {gameMode === "solo" ? "Solo High Score" : "Duo Wins"}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold">{player.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Duo Lobby Screen */}
      {screen === "duoLobby" && (
        <div className="max-w-4xl mx-auto text-center pt-16">
          <h2 className="text-3xl font-bold mb-6">Duo Challenge Room</h2>
          
          <div className="bg-gradient-to-r from-[#7b2cbf]/30 to-[#a64ac9]/30 rounded-3xl p-8 mb-8">
            <div className="text-lg mb-2">Room Code</div>
            <div className="text-4xl font-bold mb-4 tracking-widest">{roomCode}</div>
            <button
              onClick={copyRoomCode}
              className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              Copy Code
            </button>
          </div>

          <p className="text-white/60 mb-8">
            Share this code with your friend to join the game
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {players.map((player, index) => (
              <div key={index} 
                   className={`p-6 rounded-3xl border transition-all ${
                     player.ready 
                       ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30' 
                       : 'bg-white/5 border-white/10'
                   }`}>
                <div className="text-5xl mb-3">{player.emoji}</div>
                <div className="text-xl font-bold mb-3">{player.name}</div>
                <div className="text-white/60 mb-4">{player.ready ? 'Ready!' : 'Waiting...'}</div>
                <button
                  onClick={() => readyToPlay(index)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    player.ready 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-[#a64ac9] to-[#7b2cbf]'
                  }`}
                >
                  {player.ready ? '✓ Ready' : 'Ready Up'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-white/50">
            Waiting for both players to ready up...
          </div>
        </div>
      )}

      {/* Show Countdown Screen */}
      {screen === "countdown" && (
        <div className="max-w-4xl mx-auto text-center h-[60vh] flex flex-col items-center justify-center">
          <div className="text-8xl md:text-9xl font-bold mb-8">
            {countdown > 0 ? countdown : "GO!"}
          </div>
          <div className="text-2xl text-white/70">
            Get ready to memorize!
          </div>
          <div className="mt-8 flex gap-4">
            <span className="w-4 h-4 rounded-full bg-[#a64ac9] animate-pulse"></span>
            <span className="w-4 h-4 rounded-full bg-[#7b2cbf] animate-pulse" style={{animationDelay: '0.2s'}}></span>
            <span className="w-4 h-4 rounded-full bg-[#ff3366] animate-pulse" style={{animationDelay: '0.4s'}}></span>
          </div>
        </div>
      )}

      {/* Show Gameplay Screen */}
      {screen === "gameplay" && (
        <MemoryGameCore 
          mode={gameMode} 
          // onEnd={() => setScreen("results")}
          onEnd={async () => {
              const finalScore =
              gameMode === "solo"
                ? score.playerA
                : Math.max(score.playerA, score.playerB);

            // sendScoreToBackend(finalScore);
            // setScreen("results");
            


            await sendScoreToBackend(finalScore);
            fetchLeaderboard(); // ✅ refresh leaderboard
            setScreen("results");

          }}

          
          score={score}
          setScore={setScore}
        />
      )}

      {/* Show Results Screen */}
      {screen === "results" && (
        <div className="max-w-4xl mx-auto text-center pt-16">
          <h2 className="text-4xl font-bold mb-8">Game Over!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Your Score</h3>
              <div className="text-6xl font-bold text-[#ffcc00] mb-4">
                {gameMode === "solo" ? score.playerA : Math.max(score.playerA, score.playerB)}
              </div>
              <div className="text-white/60">
                {gameMode === "solo" ? "Solo High Score" : "Winner's Score"}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Rewards</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>XP Earned</span>
                  <span className="text-xl font-bold text-green-400">+50 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Time Bonus</span>
                  <span className="text-xl font-bold text-blue-400">+20 XP</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-lg">Total</span>
                  <span className="text-2xl font-bold text-[#ffcc00]">+70 XP</span>
                </div>
              </div>
            </div>
          </div>

          {gameMode === "duo" && (
            <div className="bg-gradient-to-r from-[#7b2cbf]/20 to-[#a64ac9]/20 rounded-3xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-6">Match Results</h3>
              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{player.emoji}</div>
                      <div>
                        <div className="font-bold">{player.name}</div>
                        <div className="text-sm text-white/60">
                          {index === 0 ? score.playerA : score.playerB} points
                        </div>
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${
                      (index === 0 && score.playerA > score.playerB) || 
                      (index === 1 && score.playerB > score.playerA)
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {(index === 0 && score.playerA > score.playerB) || 
                       (index === 1 && score.playerB > score.playerA)
                        ? 'Winner!' 
                        : 'Runner Up'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => gameMode === "solo" ? startSolo() : startDuo()}
              className="px-8 py-4 bg-gradient-to-r from-[#a64ac9] to-[#7b2cbf] rounded-2xl font-bold hover:scale-105 transition-transform"
            >
              Play Again
            </button>
            <button
              onClick={() => setScreen("menu")}
              className="px-8 py-4 border border-white/20 rounded-2xl font-bold hover:bg-white/10 transition-colors"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}