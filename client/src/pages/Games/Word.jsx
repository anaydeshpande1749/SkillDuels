

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Generate matrix with hidden word - MOVED OUTSIDE COMPONENT
const generateMatrix = (word, size) => {
  const letters = word.split("");
  const totalCells = size * size;
  const matrix = Array(totalCells).fill(null);
  
  // Place word randomly in a straight line (horizontal, vertical, or diagonal)
  const direction = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
  let startPos;
  
  if (direction === 0) { // Horizontal
    const row = Math.floor(Math.random() * size);
    const startCol = Math.floor(Math.random() * (size - letters.length + 1));
    startPos = row * size + startCol;
    for (let i = 0; i < letters.length; i++) {
      matrix[startPos + i] = letters[i];
    }
  } else if (direction === 1) { // Vertical
    const col = Math.floor(Math.random() * size);
    const startRow = Math.floor(Math.random() * (size - letters.length + 1));
    startPos = startRow * size + col;
    for (let i = 0; i < letters.length; i++) {
      matrix[startPos + i * size] = letters[i];
    }
  } else { // Diagonal
    const startRow = Math.floor(Math.random() * (size - letters.length + 1));
    const startCol = Math.floor(Math.random() * (size - letters.length + 1));
    startPos = startRow * size + startCol;
    for (let i = 0; i < letters.length; i++) {
      matrix[startPos + i * (size + 1)] = letters[i];
    }
  }
  
  // Fill remaining cells with random letters
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < totalCells; i++) {
    if (!matrix[i]) {
      matrix[i] = alphabet[Math.floor(Math.random() * 26)];
    }
  }
  
  return matrix;
};



// Core gameplay component - FIXED GAME LOGIC WITH 15 SECONDS
function WordMatrixCore({ mode, onEnd, score, setScore }) {
  const [gridSize, setGridSize] = useState(4);
  const [matrix, setMatrix] = useState([]);
  const [targetWord, setTargetWord] = useState("");
  const [hint, setHint] = useState("");
  const [selected, setSelected] = useState([]);
  const [found, setFound] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per word
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [duoTurn, setDuoTurn] = useState(0);
  const [duoRound, setDuoRound] = useState(1);
  const [showError, setShowError] = useState(false);
  const timerRef = useRef(null);

  const wordsDatabase = [
    { word: "REACT", hint: "Popular JavaScript library" },
    { word: "BRAIN", hint: "The organ you're exercising" },
    { word: "LOGIC", hint: "Reasoning with principles" },
    { word: "MATRIX", hint: "Array of numbers or symbols" },
    { word: "MEMORY", hint: "Mind's storage for information" },
    { word: "PUZZLE", hint: "Game to test ingenuity" },
    { word: "FOCUS", hint: "Center of attention" },
    { word: "REASON", hint: "Power to think and understand" },
    { word: "PYTHON", hint: "Popular programming language" },
    { word: "JAVA", hint: "Object-oriented language" },
    { word: "SWIFT", hint: "Apple's programming language" },
    { word: "HTML", hint: "Markup for web pages" },
    { word: "CSS", hint: "Stylesheet language" },
    { word: "NODE", hint: "JavaScript runtime" },
    { word: "CODE", hint: "Instructions for computer" },
    { word: "DATA", hint: "Information in digital form" },
    { word: "LOOP", hint: "Repeating sequence" },
    { word: "ARRAY", hint: "Collection of items" },
    { word: "CLASS", hint: "Object blueprint" },
    { word: "FLOAT", hint: "Decimal number type" }
  ];

  const startRound = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Select a word based on difficulty
    const wordPool = wordsDatabase.filter(w => w.word.length <= gridSize + 1);
    const randomIndex = Math.floor(Math.random() * wordPool.length);
    const { word, hint } = wordPool[randomIndex];
    
    setTargetWord(word);
    setHint(hint);
    setMatrix(generateMatrix(word, gridSize));
    setSelected([]);
    setFound(false);
    setShowError(false);
    setTimeLeft(15); // Reset to 15 seconds for new round
    
    // Start timer for this round (same as Memory.jsx)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          
          // Time's up - handle based on mode
          if (mode === "solo") {
            setLives(prevLives => {
              if (prevLives <= 1) {
                setTimeout(() => onEnd(), 500);
                return 0;
              }
              return prevLives - 1;
            });
            setCombo(0);
            
            // Continue to next round after delay
            setTimeout(() => {
              if (lives > 1) { // If still have lives after decrement
                startRound();
              }
            }, 1000);
          } else {
            // Duo mode - end current player's turn
            endTurn(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Initialize on mount (same as Memory.jsx)
  useEffect(() => {
    startRound();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSelect = (idx, letter) => {
    if (found || selected.includes(idx) || showError) return;
    
    const newSelected = [...selected, idx];
    const selectedWord = newSelected.map(i => matrix[i]).join("");
    
    setSelected(newSelected);
    
    // Check if the selected letters match the beginning of the target word
    if (targetWord.startsWith(selectedWord)) {
      // Correct so far
      if (selectedWord === targetWord) {
        // Word found!
        setFound(true);
        
        // Clear timer for this round
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        const baseScore = 10;
        const timeBonus = Math.floor(timeLeft); // 1 point per second left
        const comboBonus = combo * 5;
        const lengthBonus = targetWord.length * 3;
        const roundScore = baseScore + timeBonus + comboBonus + lengthBonus;
        
        if (mode === "solo") {
          setScore(prev => ({
            ...prev,
            playerA: prev.playerA + roundScore
          }));
          setCombo(prev => prev + 1);
          
          // Increase grid size every 3 rounds
          if (round % 3 === 0 && gridSize < 6) {
            setGridSize(prev => prev + 1);
          }
          
          // Move to next round after delay
          setTimeout(() => {
            setRound(prev => prev + 1);
            startRound(); // Start new round with NEW matrix
          }, 1500);
        } else {
          // Duo mode
          setScore(prev => ({
            ...prev,
            [duoTurn === 0 ? "playerA" : "playerB"]: 
              prev[duoTurn === 0 ? "playerA" : "playerB"] + roundScore
          }));
          setTimeout(() => endTurn(true), 1500);
        }
      }
    } else {
      // Wrong letter selected
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        setSelected([]);
        
        if (mode === "solo") {
          setLives(prev => {
            if (prev <= 1) {
              // Clear timer before ending
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              onEnd();
              return 0;
            }
            return prev - 1;
          });
          setCombo(0);
        } else {
          endTurn(false);
        }
      }, 1000);
    }
  };

  const endTurn = (success) => {
    if (mode === "duo") {
      // Clear current timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (duoRound >= 5) {
        setTimeout(() => onEnd(), 1000);
      } else {
        setDuoTurn(prev => (prev + 1) % 2);
        setDuoRound(prev => prev + 1);
        setSelected([]);
        setCombo(0);
        setTimeout(() => startRound(), 1000); // Start new round for next player
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
          <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : ''}`}>
            {timeLeft}s
          </div>
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

      {/* Game info */}
      <div className="bg-gradient-to-r from-[#ff3366]/20 to-[#ff9933]/20 rounded-2xl p-6 mb-8">
        <div className="text-xl font-bold mb-2">
          {found ? "🎉 Word Found!" : "Find the hidden word!"}
        </div>
        <div className="text-white/80 mb-4">💡 Hint: {hint}</div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-bold mb-2">
            {targetWord.split('').map((letter, i) => (
              <span 
                key={i} 
                className={`mx-1 px-2 py-1 rounded ${i < selected.length ? 'bg-gradient-to-r from-[#ff3366] to-[#ff9933]' : 'bg-white/10'}`}
              >
                {i < selected.length ? selected.map(idx => matrix[idx]).join("")[i] : "_"}
              </span>
            ))}
          </div>
          <div className="text-sm text-white/60">
            Grid: {gridSize}×{gridSize} • {targetWord.length} letters
          </div>
        </div>
      </div>

      {/* Selected letters preview */}
      <div className="mb-8">
        <div className="text-lg font-bold mb-2">Selected Letters:</div>
        <div className="flex justify-center gap-2 mb-4">
          {selected.map((idx, i) => (
            <div
              key={i}
              className={`w-12 h-12 flex items-center justify-center rounded-lg text-2xl font-bold transition-all duration-300 ${
                showError 
                  ? 'bg-red-500 scale-110' 
                  : 'bg-gradient-to-r from-[#ff3366] to-[#ff9933] scale-105'
              }`}
            >
              {matrix[idx]}
            </div>
          ))}
          {Array(targetWord.length - selected.length)
            .fill()
            .map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-lg text-2xl font-bold text-white/30"
              >
                _
              </div>
            ))}
        </div>
        
        {showError && (
          <div className="text-red-400 text-xl font-bold animate-pulse mb-2">
            ❌ Wrong letter! Try again
          </div>
        )}
        
        {found && (
          <div className="text-green-400 text-xl font-bold animate-pulse">
            🎉 Correct! +{10 + Math.floor(timeLeft) + (combo * 5) + (targetWord.length * 3)} points
          </div>
        )}
      </div>

      {/* Game grid */}
      <div className="mb-8">
        <div className={`grid gap-3 mx-auto max-w-lg ${
          gridSize === 4 ? 'grid-cols-4' :
          gridSize === 5 ? 'grid-cols-5' :
          'grid-cols-6'
        }`}>
          {cells.map((idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx, matrix[idx])}
              disabled={found || showError}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-2xl font-bold
                transition-all duration-300 relative
                ${selected.includes(idx)
                  ? (showError 
                    ? 'bg-red-500 scale-110' 
                    : 'bg-gradient-to-r from-[#ff3366] to-[#ff9933] scale-110')
                  : 'bg-white/10 hover:bg-white/20 hover:scale-105'
                }
                ${(found || showError) ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              {matrix[idx]}
              {selected.includes(idx) && !showError && (
                <div className="absolute top-1 right-1 text-sm bg-white/20 rounded-full w-5 h-5 flex items-center justify-center">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-8 mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="text-white/60">Word Progress</div>
          <div className="text-white/60">
            {selected.length}/{targetWord.length} letters
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              showError ? 'bg-red-500' : 'bg-gradient-to-r from-[#ff3366] to-[#ff9933]'
            }`}
            style={{ width: `${(selected.length / targetWord.length) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-white/60 mt-2">
          {timeLeft <= 10 && timeLeft > 5 && "⏳ Time is running!"}
          {timeLeft <= 5 && "⏰ Hurry up!"}
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
            Combo: x{combo} • Difficulty: {gridSize === 4 ? "Easy" : gridSize === 5 ? "Medium" : "Hard"}
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



// Rest of the code remains the same...
export default function WordMatrixPage() {
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

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser?.id || currentUser._id || currentUser.id ;
  
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
          userName: currentUser?.fullName || "Anonymous",
          game: "wordmatrix",
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
      const res = await fetch(
        "http://localhost:4000/api/game/leaderboard?game=wordmatrix"
      );
      const data = await res.json();
      const formatted = data.map((item, index) => ({
        rank: index + 1,
        name: item.userName || item.userId || item.fullName || item.name,
        score: item.bestScore,
        isYou: item.userId === userId
      }));
      setLeaderboard(formatted);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#ff3366] to-[#ff9933] text-white p-4 md:p-4">
      {/* Back Button */}
      <button
        onClick={goBack}
        className="fixed top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
      >
        ←
      </button>

      {/* Menu Screen */}
      {screen === "menu" && (
        <div className="max-w-5xl mx-auto pt-1">
          {/* Background Pattern */}
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
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center text-3xl md:text-4xl text-[#ff3366] font-bold">
              🔤
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Word Matrix</h1>
            
            <div className="flex gap-2 justify-center mb-3">
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                VOCABULARY
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                PATTERN
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                15s PER WORD
              </span>
            </div>
            
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
              Find hidden words in a letter matrix! Test your vocabulary and pattern recognition.
            </p>
          </div>

          {/* Game Mode Selection */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex bg-white/10 rounded-xl p-1 mb-4">
              <button
                className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${
                  gameMode === "solo"
                    ? "bg-white text-[#ff3366]"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setGameMode("solo")}
              >
                🎮 Solo
              </button>
              <button
                className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${
                  gameMode === "duo"
                    ? "bg-white text-[#ff3366]"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setGameMode("duo")}
              >
                ⚔️ Duo
              </button>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-3 bg-white text-[#ff3366] font-bold rounded-xl hover:scale-105 transition-transform shadow-xl text-base"
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
                  Find hidden words in a letter matrix in <strong>15 seconds</strong>! 
                  Words can be horizontal, vertical, or diagonal. Select letters in order.
                </p>
                
                <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-sm mb-2">Rules:</h4>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• 15 seconds per word</li>
                    <li>• Select letters in correct order</li>
                    <li>• Wrong letter = lose a life</li>
                    <li>• Time's up = lose a life</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-3">
                  {gameMode === "solo" ? "Solo Mode" : "Duo Mode"}
                </h3>
                {gameMode === "solo" ? (
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                      15 seconds per word
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                      3 lives, progress through levels
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                      Time bonus points
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      15 seconds per turn
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      5 rounds total
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      Highest score wins
                    </li>
                  </ul>
                )}
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">0</div>
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
                  <h3 className="text-lg font-bold">🔥 0 day streak</h3>
                  <div className="text-[#ffcc00] font-bold text-sm">+0 XP</div>
                </div>

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

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-white/60 text-xs mb-1">Best streak</div>
                    <div className="text-xl font-bold">0 days</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-white/60 text-xs mb-1">Last streak</div>
                    <div className="text-xl font-bold">0 days</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#ff3366]/20 to-[#ff9933]/20 rounded-2xl p-4 border border-white/10">
                <h4 className="font-bold text-sm mb-2">💡 Pro Tip</h4>
                <p className="text-white/70 text-xs">
                  Look for the first letter first. The word is always in a straight line - 
                  check horizontal, then vertical, then diagonal.
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="max-w-5xl mx-auto mt-8">
            <div className="bg-[#0f0f14]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">🏆 Leaderboard</h3>
              <div className="space-y-3">
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      player.isYou
                        ? "bg-gradient-to-r from-[#ff3366]/30 to-[#ff9933]/30"
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

      {/* Duo Lobby Screen */}
      {screen === "duoLobby" && (
        <div className="max-w-4xl mx-auto text-center pt-16">
          <h2 className="text-3xl font-bold mb-6">Duo Challenge Room</h2>
          
          <div className="bg-gradient-to-r from-[#ff3366]/30 to-[#ff9933]/30 rounded-3xl p-8 mb-8">
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
                      : 'bg-gradient-to-r from-[#ff3366] to-[#ff9933]'
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

      {/* Countdown Screen */}
      {screen === "countdown" && (
        <div className="max-w-4xl mx-auto text-center h-[60vh] flex flex-col items-center justify-center">
          <div className="text-8xl md:text-9xl font-bold mb-8">
            {countdown > 0 ? countdown : "GO!"}
          </div>
          <div className="text-2xl text-white/70">
            Get ready to find words in 15 seconds!
          </div>
          <div className="mt-8 flex gap-4">
            <span className="w-4 h-4 rounded-full bg-[#ff3366] animate-pulse"></span>
            <span className="w-4 h-4 rounded-full bg-[#ff9933] animate-pulse" style={{animationDelay: '0.2s'}}></span>
            <span className="w-4 h-4 rounded-full bg-[#ffcc00] animate-pulse" style={{animationDelay: '0.4s'}}></span>
          </div>
        </div>
      )}

      {/* Gameplay Screen */}
      {screen === "gameplay" && (
        <WordMatrixCore 
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

      {/* Results Screen */}
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
                  <span>Vocabulary Bonus</span>
                  <span className="text-xl font-bold text-blue-400">+30 XP</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-lg">Total</span>
                  <span className="text-2xl font-bold text-[#ffcc00]">+80 XP</span>
                </div>
              </div>
            </div>
          </div>

          {gameMode === "duo" && (
            <div className="bg-gradient-to-r from-[#ff3366]/20 to-[#ff9933]/20 rounded-3xl p-8 mb-8">
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
              className="px-8 py-4 bg-gradient-to-r from-[#ff3366] to-[#ff9933] rounded-2xl font-bold hover:scale-105 transition-transform"
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



