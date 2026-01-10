import { UserIcon } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Core gameplay component for Reflex Racer
function ReflexGameCore({ mode, onEnd, score, setScore }) {
  const arenaRef = useRef(null);
  const [targets, setTargets] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [speed, setSpeed] = useState(1200);
  const [combo, setCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [duoTurn, setDuoTurn] = useState(0);
  const [duoRound, setDuoRound] = useState(1);
  const [gameActive, setGameActive] = useState(true);
  const animationFrameRef = useRef();

  // Start game
  const startRound = () => {
    setGameActive(true);
    setTargets([]);
    setCombo(0);
    setMisses(0);
    setTimeLeft(30);
    setSpeed(1200);
  };

  // Spawn targets
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;

    const spawnTarget = () => {
      const arena = arenaRef.current;
      if (!arena) return;

      const size = 48 - Math.min(24, combo * 2);
      const x = Math.random() * (arena.clientWidth - size);
      const y = Math.random() * (arena.clientHeight - size);
      const id = Date.now() + Math.random();

      const velocity = {
        x: (Math.random() - 0.5) * (3 + combo * 0.5),
        y: (Math.random() - 0.5) * (3 + combo * 0.5)
      };

      setTargets(prev => [...prev.slice(-4), { x, y, id, size, velocity }]);
    };

    spawnTarget();
    const interval = setInterval(spawnTarget, speed);
    return () => clearInterval(interval);
  }, [speed, timeLeft, gameActive, combo]);

  // Game timer
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (mode === "solo") {
            setGameActive(false);
            onEnd();
          } else {
            endTurn(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, timeLeft, mode, onEnd]);

  // Animate moving targets
  useEffect(() => {
    if (!gameActive) return;

    const animateTargets = () => {
      setTargets(prev => {
        const arena = arenaRef.current;
        if (!arena) return prev;

        return prev.map(target => {
          let { x, y, velocity, size, ...rest } = target;
          
          x += velocity.x;
          y += velocity.y;
          
          if (x <= 0 || x >= arena.clientWidth - size) {
            velocity.x *= -0.9;
            x = x <= 0 ? 0 : arena.clientWidth - size;
          }
          if (y <= 0 || y >= arena.clientHeight - size) {
            velocity.y *= -0.9;
            y = y <= 0 ? 0 : arena.clientHeight - size;
          }

          return { ...rest, x, y, velocity, size };
        });
      });

      animationFrameRef.current = requestAnimationFrame(animateTargets);
    };

    animationFrameRef.current = requestAnimationFrame(animateTargets);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameActive]);

  // Remove old targets (misses)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameActive) return;
      
      setTargets(prev => {
        if (prev.length === 0) return prev;
        
        const cutoff = Date.now() - speed * 2;
        const newTargets = prev.filter(t => t.id > cutoff);
        
        if (newTargets.length < prev.length) {
          setMisses(m => m + 1);
          setCombo(0);
        }
        
        return newTargets;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [gameActive, speed]);

  const hitTarget = useCallback((id) => {
    if (!gameActive) return;

    // Calculate points with combo multiplier
    const points = 10 * (1 + Math.floor(combo / 3));
    
    if (mode === "solo") {
      setScore(prev => ({ ...prev, playerA: prev.playerA + points }));
    } else {
      setScore(prev => ({
        ...prev,
        [duoTurn === 0 ? "playerA" : "playerB"]: 
          prev[duoTurn === 0 ? "playerA" : "playerB"] + points
      }));
    }
    
    setCombo(c => c + 1);
    setSpeed(s => Math.max(300, s - 80 * (1 - combo * 0.1)));
    setTargets(prev => prev.filter(t => t.id !== id));
  }, [gameActive, combo, mode, duoTurn, setScore]);

  // Handle arena clicks (misses)
  const handleArenaClick = (e) => {
    if (!gameActive || e.target !== arenaRef.current) return;
    
    setMisses(m => m + 1);
    setCombo(0);
  };

  const endTurn = (success) => {
    if (mode === "duo") {
      if (duoRound >= 5) {
        setGameActive(false);
        onEnd();
      } else {
        setDuoTurn(prev => (prev + 1) % 2);
        setDuoRound(prev => prev + 1);
        startRound();
      }
    }
  };

  const accuracy = score.playerA === 0 ? 0 : 
    Math.round((score.playerA / 10) / ((score.playerA / 10) + misses) * 100);

  return (
    <div className="max-w-4xl mx-auto text-center pt-16">
      <h2 className="text-3xl font-bold mb-6">
        {mode === "solo" ? "Solo Mode" : "Duo Mode"}
      </h2>
      
      {/* Game stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-sm text-white/60 mb-1">Time</div>
          <div className="text-2xl font-bold" style={{ color: timeLeft < 10 ? '#ffa726' : 'white' }}>
            {timeLeft}s
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-sm text-white/60 mb-1">Round</div>
          <div className="text-2xl font-bold">{mode === "solo" ? 1 : duoRound}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-sm text-white/60 mb-1">Score</div>
          <div className="text-2xl font-bold">
            {mode === "solo" ? score.playerA : (duoTurn === 0 ? score.playerA : score.playerB)}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-sm text-white/60 mb-1">Combo</div>
          <div className="text-2xl font-bold" style={{ color: combo >= 3 ? '#ffa726' : 'white' }}>
            x{combo}
          </div>
        </div>
      </div>

      {/* Game Arena */}
      <div className="mb-8">
        <div className="text-xl font-bold mb-4 text-center">
          {gameActive ? "Click the glowing orbs!" : "Game Over"}
        </div>
        
        <div
          ref={arenaRef}
          onClick={handleArenaClick}
          className="relative h-[480px] rounded-3xl border-2 border-white/10 bg-gradient-to-br from-[#2a1a0a]/60 to-[#1a0f05]/60 backdrop-blur-sm overflow-hidden shadow-2xl cursor-crosshair mx-auto"
        >
          {/* Grid background */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.1) 100%),
                             linear-gradient(transparent 95%, rgba(255,255,255,0.1) 100%)`,
            backgroundSize: '40px 40px'
          }} />
          
          {/* Targets */}
          {targets.map((target) => (
            <button
              key={target.id}
              onClick={() => hitTarget(target.id)}
              className="absolute rounded-full shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95"
              style={{
                left: target.x,
                top: target.y,
                width: target.size,
                height: target.size,
                background: `radial-gradient(circle at 30% 30%, #ffa726, #ef6c00)`,
                boxShadow: `0 0 30px ${combo >= 5 ? '#ffa726' : '#ef6c00'}80`,
                animation: `pulse ${0.5 + combo * 0.1}s infinite alternate`
              }}
            />
          ))}

          {/* Timer Bar */}
          {gameActive && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/10">
              <div 
                className="h-full bg-gradient-to-r from-[#ffa726] to-[#ef6c00] transition-all duration-1000"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Game Stats */}
      <div className="mt-8 mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="text-white/60">Accuracy</div>
          <div className="text-white/60">
            {accuracy}% • Misses: {misses}
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#ffa726] to-[#ef6c00] transition-all duration-300"
            style={{ width: `${accuracy}%` }}
          ></div>
        </div>
      </div>

      {/* Additional info */}
      {mode === "solo" && (
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="text-sm text-white/60">
              Speed: {Math.round(1000 / speed * 10) / 10} targets/sec
            </div>
          </div>
          <div className="text-sm text-white/60">
            Active Targets: {targets.length}
          </div>
        </div>
      )}

      {mode === "duo" && (
        <div className="bg-white/5 rounded-2xl p-4 mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className={`flex items-center gap-2 ${duoTurn === 0 ? 'text-[#ffa726]' : 'text-white/60'}`}>
              <span className="text-xl">😀</span>
              <span>Player A: {score.playerA}</span>
              {duoTurn === 0 && <span className="text-sm animate-pulse">← Current turn</span>}
            </div>
            <div className={`flex items-center gap-2 ${duoTurn === 1 ? 'text-[#ffa726]' : 'text-white/60'}`}>
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

      <style jsx>{`
        @keyframes pulse {
          from {
            box-shadow: 0 0 20px #ef6c0080;
            transform: scale(1);
          }
          to {
            box-shadow: 0 0 40px #ffa726ff;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}

export default function ReflexGamePage() {
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
  const [score, setScore] = useState({ playerA: 0, playerB: 0 });

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

  const currentUser = JSON.parse(localStorage.getItem("user")) || {} ;
  const userId = currentUser?.id  || currentUser.id || currentUser._id;

  const sendScoreToBackend = async (finalScore) => {
    try {
      if (!userId) {
      console.warn("No userId found, score not sent");
      return;
    }


      await fetch("http://localhost:4000/api/game/attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          //userId: currentUser.id ,
          userName: currentUser.fullName|| "Anonymous",
          game: "reflex",
          score: finalScore,
        }),
      });
      console.log("Score sent to backend");
    } catch (error) {
      console.error("Failed to send score", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // const res = await fetch("http://localhost:4080/api/game/leaderboard");
      const res = await fetch(
          "http://localhost:4000/api/game/leaderboard?game=reflex"
      );

      const data = await res.json();

      const formatted = data.map((item, index) => ({
        rank: index + 1,
        name: item.userName || item.userId || item.fullName || item.name,
        score: item.bestScore,
        isYou: item.userId === "test-user-frontend"
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

  // MAIN RETURN STATEMENT - SAME STRUCTURE AS MEMORY.JSX
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#8B4513] to-[#A0522D] text-white p-4 md:p-4">
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
          {/* Pattern Grid Background */}
          <div className="grid grid-cols-6 md:grid-cols-8 gap-2 md:gap-3 justify-center mb-8 opacity-25 pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-white/30"
              />
            ))}
          </div>

          {/* Game Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center text-3xl md:text-4xl text-[#8B4513] font-bold">
              ⚡
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Reflex Racer</h1>
            
            <div className="flex gap-2 justify-center mb-3">
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                REFLEX
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                SPEED
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                ACCURACY
              </span>
            </div>
            
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
              Test your reaction time by clicking glowing orbs before they disappear!
            </p>
          </div>

          {/* Game Mode Selection */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex bg-white/10 rounded-xl p-1 mb-4">
              <button
                className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${
                  gameMode === "solo"
                    ? "bg-white text-[#8B4513]"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setGameMode("solo")}
              >
                🎮 Solo
              </button>
              <button
                className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${
                  gameMode === "duo"
                    ? "bg-white text-[#8B4513]"
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
              className="w-full py-3 bg-white text-[#8B4513] font-bold rounded-xl hover:scale-105 transition-transform shadow-xl text-base"
            >
              Start {gameMode === "solo" ? "Practice" : "Duel"}
            </button>
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Left Column - Game Info */}
            <div className="space-y-4">
              <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-3">About the game</h3>
                <p className="text-white/80 mb-4 text-sm">
                  Challenge your reaction time and hand-eye coordination by clicking 
                  glowing orbs that appear randomly. The game gets faster as you progress!
                </p>
                
                <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-sm mb-2">Real-world application:</h4>
                  <p className="text-white/70 text-sm">
                    Similar to reacting quickly in sports, driving, or any activity 
                    requiring fast visual-motor responses.
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
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      30-second reflex challenge
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      Targets move and get smaller with combos
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      Compete for high scores on leaderboard
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">🔥</div>
                      Take turns in 5-round duel
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">🔥</div>
                      Each player gets 30 seconds per turn
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">🔥</div>
                      Highest total score wins the match
                    </li>
                  </ul>
                )}
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-4">
              {/* Stats Grid */}
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

              {/* Streak Section */}
              <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">🔥 1 day streak</h3>
                  <div className="text-[#ffa726] font-bold text-sm">+50 XP</div>
                </div>

                {/* Week Calendar */}
                <div className="flex justify-between mb-4">
                  {streakData.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-sm ${
                        day.completed 
                          ? 'bg-gradient-to-br from-[#ffa726] to-[#ef6c00] text-black' 
                          : 'bg-white/10'
                      }`}>
                        {day.completed ? '✓' : day.day}
                      </div>
                      <div className="text-xs text-white/60">{day.day}</div>
                    </div>
                  ))}
                </div>

                {/* Streak Stats */}
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

              {/* Game Tips */}
              <div className="bg-gradient-to-r from-[#8B4513]/20 to-[#A0522D]/20 rounded-2xl p-4 border border-white/10">
                <h4 className="font-bold text-sm mb-2">💡 Pro Tip</h4>
                <p className="text-white/70 text-xs">
                  {gameMode === "solo"
                    ? "Build combos by clicking targets consecutively without missing. Each combo increases your score multiplier!"
                    : "In duo mode, focus on accuracy over speed. Missing resets your combo, giving your opponent an advantage."}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section - Leaderboard Preview */}
          <div className="max-w-5xl mx-auto mt-8">
            <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">🏆 Leaderboard</h3>
              <div className="space-y-3">
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      player.isYou
                        ? "bg-gradient-to-r from-[#8B4513]/30 to-[#A0522D]/30"
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
                          {gameMode === "solo" ? "Best Score" : "Duo Wins"}
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
          
          <div className="bg-gradient-to-r from-[#8B4513]/30 to-[#A0522D]/30 rounded-3xl p-8 mb-8">
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
                      : 'bg-gradient-to-r from-[#A0522D] to-[#8B4513]'
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
            Get ready to race!
          </div>
          <div className="mt-8 flex gap-4">
            <span className="w-4 h-4 rounded-full bg-[#ffa726] animate-pulse"></span>
            <span className="w-4 h-4 rounded-full bg-[#ef6c00] animate-pulse" style={{animationDelay: '0.2s'}}></span>
            <span className="w-4 h-4 rounded-full bg-[#8B4513] animate-pulse" style={{animationDelay: '0.4s'}}></span>
          </div>
        </div>
      )}

      {/* Show Gameplay Screen */}
      {screen === "gameplay" && (
        <ReflexGameCore 
          mode={gameMode} 
          onEnd={async () => {
            const finalScore = gameMode === "solo"
              ? score.playerA
              : Math.max(score.playerA, score.playerB);

            await sendScoreToBackend(finalScore);
            fetchLeaderboard();
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
              <div className="text-6xl font-bold text-[#ffa726] mb-4">
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
                  <span className="text-2xl font-bold text-[#ffa726]">+70 XP</span>
                </div>
              </div>
            </div>
          </div>

          {gameMode === "duo" && (
            <div className="bg-gradient-to-r from-[#8B4513]/20 to-[#A0522D]/20 rounded-3xl p-8 mb-8">
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
              className="px-8 py-4 bg-gradient-to-r from-[#A0522D] to-[#8B4513] rounded-2xl font-bold hover:scale-105 transition-transform"
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


