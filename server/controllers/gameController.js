//this is gamecontroller.js

/* ======================================================
   XP BASE CONFIG
====================================================== */
const XP_BASE = {
  duel: {
    win: 400,
    loss: 100
  },
  single: {
    win: 250,
    loss: 75
  },
  arcade: {
    win: 120,
    loss: 30
  }
};

const STREAK_BONUS = {
  duel: 30,
  single: 20,
  arcade: 10
};

const LEVEL_XP = 1000;


/* ======================================================
   SCORE MULTIPLIER (0–100)
====================================================== */
const getScoreMultiplier = (score = 0) => {
  if (score >= 90) return 1.4;
  if (score >= 75) return 1.2;
  if (score >= 50) return 1.0;
  if (score >= 30) return 0.8;
  return 0.6;
};

export const processGameResult = async (req, res) => {
  try {
    const {
      gameType,   // "duel" | "single" | "arcade"
      gameId,
      gameName,
      result,     // "win" | "loss"
      score       // 0 - 100
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* =======================
       STREAK & WINS
    ======================= */
    if (result === "win") {
      user.stats.currentStreak += 1;
      if (gameType !== "arcade") {
        user.stats.totalWins += 1;
      }
    } else {
      user.stats.currentStreak = 0;
    }

    /* =======================
       XP CALCULATION
    ======================= */
    let earnedXP = XP_BASE[gameType][result];
    earnedXP *= getScoreMultiplier(score);
    earnedXP +=
      user.stats.currentStreak * STREAK_BONUS[gameType];
    earnedXP = Math.floor(earnedXP);

    user.stats.totalXP += earnedXP;
    user.stats.quizzesPlayed += 1;

    /* =======================
       ARCADE GAME UPDATE
    ======================= */
    if (gameType === "arcade") {
      let game = user.arcadeGames.find(
        (g) => g.gameId === gameId
      );

      // First time play → activate game
      if (!game) {
        user.arcadeGames.push({
          gameId,
          gameName,
          totalPlays: 1,
          bestScore: score,
          totalXPearned: earnedXP,
          currentStreak:
            result === "win" ? 1 : 0
        });
      } else {
        game.totalPlays += 1;
        game.bestScore = Math.max(game.bestScore, score);
        game.totalXPearned += earnedXP;
        game.currentStreak =
          result === "win" ? game.currentStreak + 1 : 0;
        game.lastPlayedAt = new Date();
      }
    }

    /* =======================
       LEVEL & RANK
    ======================= */
    user.stats.level =
      Math.max(1, Math.floor(user.stats.totalXP / LEVEL_XP) + 1);
    user.profile.rank = calculateRank(user.stats.level);

    /* =======================
       BADGES
    ======================= */
    const unlocked = unlockBadges(user);
    unlocked.forEach((badge) => {
      if (!user.badges.some((b) => b.id === badge.id)) {
        user.badges.push(badge);
      }
    });

    await user.save();

    res.json({
      message: "Game processed successfully",
      earnedXP,
      stats: user.stats,
      rank: user.profile.rank,
      arcadeGames: user.arcadeGames
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Game processing failed" });
  }
};
