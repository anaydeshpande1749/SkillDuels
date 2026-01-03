
////====================================================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Core gameplay component for Laser Dash
function LaserGameCore({ mode, onEnd, score, setScore }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("playing");
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activePowerUps, setActivePowerUps] = useState({});
  const [duoTurn, setDuoTurn] = useState(0);
  const [duoRound, setDuoRound] = useState(1);
  const [currentScore, setCurrentScore] = useState(0); // ✅ ADDED: Track current round score
  
  // Game refs for mutable data that doesn't trigger re-renders
  const gameRef = useRef({
    playerY: 0,
    playerVel: 0,
    isJumping: false,
    obstacles: [],
    powerUps: [],
    speedMult: 1.0,
    lastTime: 0,
    obstacleTimer: 0,
    powerUpTimer: 0,
    powerUpShieldUsed: false,
    animationId: null,
    score: 0 // ✅ ADDED: Track score in gameRef
  });

  // Game constants (from HTML)
  const WIDTH = 800;
  const HEIGHT = 400;
  const GROUND_LEVEL = 80;
  const PLAYER_SIZE = 48;
  const PLAYER_X = 80;
  const JUMP_FORCE = 15;
  const GRAVITY = 0.4;
  const BASE_SPEED = 6;

  const POWER_TYPES = {
    shield: { icon: '🛡️', color: '#fbbf24', dur: 10000, description: 'Blocks one hit' },
    slow: { icon: '⏱️', color: '#3b82f6', dur: 5000, description: 'Slows game speed by 40%' },
    invinc: { icon: '💫', color: '#a855f7', dur: 7000, description: 'No damage from obstacles' }
  };

  // Initialize game
  const startRound = useCallback(() => {
    gameRef.current = {
      playerY: 0,
      playerVel: 0,
      isJumping: false,
      obstacles: [],
      powerUps: [],
      speedMult: 1.0,
      lastTime: 0,
      obstacleTimer: 0,
      powerUpTimer: 0,
      powerUpShieldUsed: false,
      animationId: null,
      score: 0
    };
    setActivePowerUps({});
    setCombo(0);
    setLives(3);
    setTimeLeft(30);
    setCurrentScore(0); // ✅ Reset current score
    setGameState("playing");
  }, []);

  // Jump function
  const jump = () => {
    if (gameState !== "playing" || gameRef.current.playerY > 0) return;
    gameRef.current.playerVel = JUMP_FORCE;
    gameRef.current.isJumping = true;
  };

  // Spawn obstacle
  const spawnObstacle = () => {
    if (gameRef.current.obstacles.length >= 3) return;
    
    const height = 40 + Math.random() * 80;
    gameRef.current.obstacles.push({
      x: WIDTH,
      h: height,
      passed: false,
      id: Date.now() + Math.random()
    });
  };

  // Spawn power-up
  const spawnPowerUp = () => {
    if (gameRef.current.powerUps.length >= 3) return;
    
    const types = Object.keys(POWER_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const yPos = 30 + Math.random() * 200;
    
    gameRef.current.powerUps.push({
      x: WIDTH,
      y: yPos,
      type: type,
      id: Date.now() + Math.random()
    });
  };

  // Check collision
  const checkCollision = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.w &&
           rect1.x + rect1.w > rect2.x &&
           rect1.y < rect2.y + rect2.h &&
           rect1.y + rect1.h > rect2.y;
  };

  // Activate power-up
  const activatePowerUp = (type) => {
    const now = Date.now();
    setActivePowerUps(prev => ({
      ...prev,
      [type]: now + POWER_TYPES[type].dur
    }));
    
    if (type === 'shield') {
      gameRef.current.powerUpShieldUsed = false;
    }
    
    // Add score for collecting power-up
    const powerUpScore = 50;
    gameRef.current.score += powerUpScore;
    
    if (mode === "solo") {
      setScore(prev => ({ ...prev, playerA: prev.playerA + powerUpScore }));
    } else {
      setScore(prev => ({
        ...prev,
        [duoTurn === 0 ? "playerA" : "playerB"]: 
          prev[duoTurn === 0 ? "playerA" : "playerB"] + powerUpScore
      }));
    }
  };

  // Game loop
  const gameLoop = useCallback((timestamp) => {
    if (gameState !== "playing") return;

    const game = gameRef.current;
    
    if (!game.lastTime) game.lastTime = timestamp;
    const delta = timestamp - game.lastTime;
    game.lastTime = timestamp;

    // Calculate speed
    let speed = BASE_SPEED * game.speedMult;
    if (activePowerUps.slow) speed *= 0.6;

    // Player physics
    game.playerVel -= GRAVITY;
    game.playerY = Math.max(0, game.playerY + game.playerVel);
    if (game.playerY === 0) game.isJumping = false;

    // Move obstacles
    game.obstacles = game.obstacles.filter(obs => obs.x > -50);
    game.obstacles.forEach(obs => obs.x -= speed * (delta / 16));

    // Move power-ups
    game.powerUps = game.powerUps.filter(pup => pup.x > -50);
    game.powerUps.forEach(pup => pup.x -= speed * (delta / 16));

    // Spawn obstacles
    game.obstacleTimer += delta;
    if (game.obstacleTimer > 1500 / game.speedMult && game.obstacles.length < 3) {
      game.obstacleTimer = 0;
      spawnObstacle();
    }

    // Spawn power-ups
    game.powerUpTimer += delta;
    if (game.powerUpTimer > 8000) {
      game.powerUpTimer = 0;
      spawnPowerUp();
    }

    // Collision detection
    const playerRect = {
      x: PLAYER_X,
      y: HEIGHT - GROUND_LEVEL - game.playerY - PLAYER_SIZE,
      w: PLAYER_SIZE,
      h: PLAYER_SIZE
    };

    // Check obstacle collisions
    game.obstacles.forEach(obs => {
      const obsRect = {
        x: obs.x,
        y: HEIGHT - GROUND_LEVEL - obs.h,
        w: 40,
        h: obs.h
      };

      if (checkCollision(playerRect, obsRect)) {
        // Handle invincibility
        if (activePowerUps.invinc) return;
        
        // Handle shield
        if (activePowerUps.shield && !game.powerUpShieldUsed) {
          game.powerUpShieldUsed = true;
          setCombo(0);
          // Remove shield from active power-ups after use
          setActivePowerUps(prev => {
            const newPowerUps = { ...prev };
            delete newPowerUps.shield;
            return newPowerUps;
          });
          return;
        }

        // Normal collision
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            if (mode === "solo") {
              setGameState("gameover");
              onEnd();
            } else {
              endTurn();
            }
          }
          return newLives;
        });
        setCombo(0);
        
        // Remove the obstacle
        game.obstacles = game.obstacles.filter(o => o !== obs);
      }

      // Score points when passing obstacles
      if (!obs.passed && obs.x + 40 < PLAYER_X) {
        obs.passed = true;
        const basePoints = 10;
        const comboMultiplier = Math.floor(combo / 3) + 1;
        const points = basePoints * comboMultiplier;
        
        // Update gameRef score
        game.score += points;
        
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
      }
    });

    // Check power-up collisions
    game.powerUps.forEach((pup, i) => {
      const pupRect = {
        x: pup.x,
        y: HEIGHT - GROUND_LEVEL - pup.y - 24,
        w: 24,
        h: 24
      };

      if (checkCollision(playerRect, pupRect)) {
        // Collect power-up
        game.powerUps.splice(i, 1);
        activatePowerUp(pup.type);
      }
    });

    // Expire power-ups
    const now = Date.now();
    const newActivePowerUps = { ...activePowerUps };
    let powerUpExpired = false;
    
    Object.keys(newActivePowerUps).forEach(key => {
      if (newActivePowerUps[key] < now) {
        delete newActivePowerUps[key];
        powerUpExpired = true;
      }
    });
    
    if (powerUpExpired) {
      setActivePowerUps(newActivePowerUps);
    }

    // Passive score gain - time-based score
    const passivePoints = Math.floor(delta / 100); // Reduced from 50 to 100 for slower passive gain
    if (passivePoints > 0) {
      game.score += passivePoints;
      
      if (mode === "solo") {
        setScore(prev => ({ ...prev, playerA: prev.playerA + passivePoints }));
      } else {
        setScore(prev => ({
          ...prev,
          [duoTurn === 0 ? "playerA" : "playerB"]: 
            prev[duoTurn === 0 ? "playerA" : "playerB"] + passivePoints
        }));
      }
    }

    // Increase speed gradually
    const currentPlayerScore = mode === "solo" ? score.playerA : (duoTurn === 0 ? score.playerA : score.playerB);
    if (currentPlayerScore % 200 < 10 && currentPlayerScore > 0) {
      game.speedMult = Math.min(2.5, game.speedMult + 0.05);
    }

    // Update current score display
    setCurrentScore(game.score);

    // Draw everything
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw ground
    ctx.fillStyle = 'rgba(6,95,70,0.8)';
    ctx.fillRect(0, HEIGHT - GROUND_LEVEL, WIDTH, GROUND_LEVEL);

    // Draw player
    let playerColor = '#34d399';
    let playerEmoji = '🏃';
    
    if (activePowerUps.invinc) {
      playerColor = '#a855f7';
      // Add pulsing effect for invincibility
      const pulse = Math.sin(now / 100) * 0.2 + 0.8;
      ctx.globalAlpha = pulse;
    } else if (activePowerUps.shield && !game.powerUpShieldUsed) {
      playerColor = '#fbbf24';
      // Draw shield effect
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        PLAYER_X + PLAYER_SIZE/2,
        HEIGHT - GROUND_LEVEL - game.playerY - PLAYER_SIZE/2,
        PLAYER_SIZE/2 + 10,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw player rectangle
    ctx.fillStyle = playerColor;
    ctx.globalAlpha = 1;
    ctx.fillRect(
      PLAYER_X,
      HEIGHT - GROUND_LEVEL - game.playerY - PLAYER_SIZE,
      PLAYER_SIZE,
      PLAYER_SIZE
    );
    
    // Draw player emoji (mirrored to face right)
    ctx.save();
    ctx.font = '40px Arial';
    ctx.translate(
      PLAYER_X + PLAYER_SIZE,
      HEIGHT - GROUND_LEVEL - game.playerY - PLAYER_SIZE
    );
    ctx.scale(-1, 1);
    ctx.fillText(playerEmoji, -4, PLAYER_SIZE - 8);
    ctx.restore();

    // Draw obstacles
    game.obstacles.forEach(obs => {
      ctx.fillStyle = obs.passed ? 'rgba(239,68,68,0.6)' : '#ef4444';
      ctx.fillRect(obs.x, HEIGHT - GROUND_LEVEL - obs.h, 40, obs.h);
      
      // Add texture to obstacles
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      for(let i = 0; i < obs.h; i += 10) {
        ctx.fillRect(obs.x + 5, HEIGHT - GROUND_LEVEL - obs.h + i, 30, 4);
      }
    });

    // Draw power-ups with animation
    game.powerUps.forEach(pup => {
      // Floating animation
      const floatOffset = Math.sin(now / 500 + pup.id) * 5;
      
      // Draw glow effect
      ctx.save();
      ctx.shadowColor = POWER_TYPES[pup.type].color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = POWER_TYPES[pup.type].color;
      ctx.beginPath();
      ctx.arc(
        pup.x + 12, 
        HEIGHT - GROUND_LEVEL - pup.y - 12 + floatOffset, 
        16, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
      
      // Draw icon
      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(
        POWER_TYPES[pup.type].icon, 
        pup.x + 4, 
        HEIGHT - GROUND_LEVEL - pup.y - 4 + floatOffset
      );
      
      // Draw collection radius (visual only)
      ctx.strokeStyle = POWER_TYPES[pup.type].color + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(
        pup.x + 12, 
        HEIGHT - GROUND_LEVEL - pup.y - 12 + floatOffset, 
        30, 
        0, 
        Math.PI * 2
      );
      ctx.stroke();
    });

    // Continue game loop
    if (gameState === "playing") {
      game.animationId = requestAnimationFrame(gameLoop);
    }
  }, [gameState, activePowerUps, combo, mode, duoTurn, onEnd, score]);

  // End turn for duo mode
  const endTurn = useCallback(() => {
    if (mode === "duo") {
      if (duoRound >= 5) {
        setGameState("gameover");
        onEnd();
      } else {
        setDuoTurn(prev => (prev + 1) % 2);
        setDuoRound(prev => prev + 1);
        startRound();
      }
    }
  }, [mode, duoRound, onEnd, startRound]);

  // Game timer for time-based rounds
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (mode === "solo") {
            setGameState("gameover");
            onEnd();
          } else {
            endTurn();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, mode, onEnd, endTurn]);

  // Start game loop
  useEffect(() => {
    if (gameState === "playing") {
      gameRef.current.animationId = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameRef.current.animationId) {
        cancelAnimationFrame(gameRef.current.animationId);
      }
    };
  }, [gameState, gameLoop]);

  // Handle keyboard input for jump
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Handle click for jump
  const handleCanvasClick = () => {
    jump();
  };

  // Start the round on mount
  useEffect(() => {
    startRound();
  }, [startRound]);

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
          <div className="text-sm text-white/60 mb-1">Round Score</div>
          <div className="text-2xl font-bold">{currentScore}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-sm text-white/60 mb-1">Lives</div>
          <div className="text-2xl font-bold flex justify-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < lives ? 'text-red-500' : 'text-gray-500'}>
                {i < lives ? '❤️' : '♡'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Game Arena */}
      <div className="mb-8">
        <div className="text-xl font-bold mb-4 text-center">
          {gameState === "playing" ? "Press SPACE or CLICK to jump! Avoid obstacles!" : "Game Over"}
        </div>
        
        <div className="relative rounded-3xl border-2 border-white/10 bg-gradient-to-br from-[#064e3b]/60 to-[#134e4a]/60 backdrop-blur-sm overflow-hidden shadow-2xl mx-auto"
             style={{ width: WIDTH, height: HEIGHT }}>
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onClick={handleCanvasClick}
            className="cursor-pointer"
          />
          
          {/* Timer Bar */}
          {gameState === "playing" && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/10">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Active Power-ups - MOVED BELOW GAME ARENA */}
      {Object.keys(activePowerUps).length > 0 && (
        <div className="bg-white/5 rounded-xl p-4 mb-4 max-w-md mx-auto">
          <div className="text-sm text-white/60 mb-2">Active Power-ups</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(activePowerUps).map(([type, endTime]) => {
              const remaining = Math.max(0, endTime - Date.now());
              const powerUp = POWER_TYPES[type];
              return (
                <div key={type} 
                     className="flex items-center gap-2 px-3 py-2 rounded-lg"
                     style={{ background: `${powerUp.color}30` }}
                     title={powerUp.description}>
                  <span className="text-lg">{powerUp.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-bold capitalize">{type}</div>
                    <div className="text-xs">{(remaining/1000).toFixed(1)}s</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Combo Display */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="text-white/60">Combo Multiplier</div>
          <div className="text-white/60">
            Current: x{Math.floor(combo / 3) + 1}
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${Math.min(100, (combo % 3) * 33.3)}%` }}
          ></div>
        </div>
        <div className="text-sm text-white/60 mt-1">
          {combo > 0 ? `${combo} obstacles passed in a row!` : "Pass obstacles consecutively for bonus!"}
        </div>
      </div>

      {mode === "duo" && (
        <div className="bg-white/5 rounded-2xl p-4 mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className={`flex items-center gap-2 ${duoTurn === 0 ? 'text-emerald-400' : 'text-white/60'}`}>
              <span className="text-xl">😀</span>
              <span>Player A: {score.playerA}</span>
              {duoTurn === 0 && <span className="text-sm animate-pulse">← Current turn</span>}
            </div>
            <div className={`flex items-center gap-2 ${duoTurn === 1 ? 'text-emerald-400' : 'text-white/60'}`}>
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

      {/* Game Instructions */}
      <div className="bg-white/5 rounded-2xl p-6 max-w-md mx-auto mb-8">
        <h3 className="text-lg font-bold mb-3">How to Play</h3>
        <ul className="text-left text-sm text-white/70 space-y-2">
          <li>• Press <span className="font-bold text-emerald-400">SPACE</span> or <span className="font-bold text-emerald-400">CLICK</span> to jump over obstacles</li>
          <li>• Collect power-ups for special abilities:</li>
          <li className="ml-4">🛡️ Shield: Blocks one hit</li>
          <li className="ml-4">⏱️ Slow: Slows game speed by 40%</li>
          <li className="ml-4">💫 Invincible: No damage from obstacles</li>
          <li>• Build combos by passing obstacles consecutively</li>
          <li>• Game gets faster as your score increases!</li>
        </ul>
      </div>
    </div>
  );
}

// MAIN PAGE COMPONENT - Keep everything exactly as it was
export default function LaserGamePage() {
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

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser?.id || currentUser.id || currentUser._id;

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
          userName: currentUser?.fullName || currentUser.fullName || "Guest" || "Anonymous",
          game: "lazer",
          score: finalScore,
        }),
      });
      console.log("Score sent to backend:", finalScore);
    } catch (error) {
      console.error("Failed to send score", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(
        "http://localhost:4000/api/game/leaderboard?game=lazer"
      );
      const data = await res.json();

      const formatted = data.map((item, index) => ({
        rank: index + 1,
        name: item.userName || item.userId || item.fullName || item.name || "Unknown",
        score: item.bestScore || 0,
        isYou: item.userId === (currentUser?.id || "guest")
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 text-white p-4 md:p-4">
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
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center text-3xl md:text-4xl text-emerald-700 font-bold">
              🏃‍♂️
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Laser Dash</h1>
            
            <div className="flex gap-2 justify-center mb-3">
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                REFLEX
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                ENDLESS
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                POWER-UPS
              </span>
            </div>
            
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
              Dash through obstacles, collect power-ups, and test your reflexes in this fast-paced endless runner!
            </p>
          </div>

          {/* Game Mode Selection */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex bg-white/10 rounded-xl p-1 mb-4">
              <button
                className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${
                  gameMode === "solo"
                    ? "bg-white text-emerald-700"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setGameMode("solo")}
              >
                🎮 Solo
              </button>
              <button
                className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${
                  gameMode === "duo"
                    ? "bg-white text-emerald-700"
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
              className="w-full py-3 bg-white text-emerald-700 font-bold rounded-xl hover:scale-105 transition-transform shadow-xl text-base"
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
                  Laser Dash is an intense endless runner where you control a character jumping over obstacles.
                  Collect power-ups, build combos, and survive as long as possible while the game speeds up!
                </p>
                
                <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-4">
                  <h4 className="font-bold text-sm mb-2">Real-world application:</h4>
                  <p className="text-white/70 text-sm">
                    Improves reaction time, hand-eye coordination, and decision-making under pressure.
                    Similar to avoiding obstacles in sports, driving, or fast-paced activities.
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
                      Endless obstacle course with increasing speed
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      Collect power-ups for special abilities
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">⚡</div>
                      3 lives - survive as long as possible!
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">🔥</div>
                      5-round duel with alternating turns
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
                  <div className="text-emerald-400 font-bold text-sm">+50 XP</div>
                </div>

                {/* Week Calendar */}
                <div className="flex justify-between mb-4">
                  {streakData.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-sm ${
                        day.completed 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-black' 
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
              <div className="bg-gradient-to-r from-emerald-900/20 to-teal-800/20 rounded-2xl p-4 border border-white/10">
                <h4 className="font-bold text-sm mb-2">💡 Pro Tip</h4>
                <p className="text-white/70 text-xs">
                  {gameMode === "solo"
                    ? "Build combos by avoiding obstacles consecutively. Each combo increases your score multiplier and makes the game faster!"
                    : "In duo mode, focus on collecting power-ups. They can give you a significant advantage over your opponent."}
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
                        ? "bg-gradient-to-r from-emerald-900/30 to-teal-800/30"
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
          
          <div className="bg-gradient-to-r from-emerald-900/30 to-teal-800/30 rounded-3xl p-8 mb-8">
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
                       ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30' 
                       : 'bg-white/5 border-white/10'
                   }`}>
                <div className="text-5xl mb-3">{player.emoji}</div>
                <div className="text-xl font-bold mb-3">{player.name}</div>
                <div className="text-white/60 mb-4">{player.ready ? 'Ready!' : 'Waiting...'}</div>
                <button
                  onClick={() => readyToPlay(index)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    player.ready 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                      : 'bg-gradient-to-r from-teal-700 to-emerald-700'
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
            Get ready to dash!
          </div>
          <div className="mt-8 flex gap-4">
            <span className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="w-4 h-4 rounded-full bg-teal-500 animate-pulse" style={{animationDelay: '0.2s'}}></span>
            <span className="w-4 h-4 rounded-full bg-green-500 animate-pulse" style={{animationDelay: '0.4s'}}></span>
          </div>
        </div>
      )}

      {/* Show Gameplay Screen */}
      {screen === "gameplay" && (
        <LaserGameCore 
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
              <div className="text-6xl font-bold text-emerald-400 mb-4">
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
                  <span className="text-xl font-bold text-emerald-400">+50 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Time Bonus</span>
                  <span className="text-xl font-bold text-teal-400">+20 XP</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-lg">Total</span>
                  <span className="text-2xl font-bold text-emerald-400">+70 XP</span>
                </div>
              </div>
            </div>
          </div>

          {gameMode === "duo" && (
            <div className="bg-gradient-to-r from-emerald-900/20 to-teal-800/20 rounded-3xl p-8 mb-8">
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
                        ? 'text-emerald-400' 
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
              className="px-8 py-4 bg-gradient-to-r from-teal-700 to-emerald-700 rounded-2xl font-bold hover:scale-105 transition-transform"
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

