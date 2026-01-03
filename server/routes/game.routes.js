import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/* ---------------- POST GAME ATTEMPT ---------------- */
router.post("/attempt", async (req, res) => {
  try {
    // const { userId, game, score } = req.body;

    const { userId, userName, game, score } = req.body;


    if (!userId || !game || score === undefined) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const db = mongoose.connection.db;

    const result = await db.collection("game_attempts").insertOne({
      userId,
      userName,           // ✅ store name directly
      game,
      score,
      createdAt: new Date()
    });

    console.log("Inserted ID:", result.insertedId);

    res.status(201).json({ message: "Game attempt saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- DEBUG ROUTE ---------------- */
router.get("/debug", async (req, res) => {
  const db = mongoose.connection.db;
  const docs = await db.collection("game_attempts").find().toArray();
  res.json(docs);
});

/* ---------------- LEADERBOARD ROUTE ---------------- */

router.get("/leaderboard", async (req, res) => {
  try {
    const { game } = req.query;   // ✅ get game from query

    if (!game) {
      return res.status(400).json({ message: "Game type required" });
    }

    const db = mongoose.connection.db;

    const leaderboard = await db.collection("game_attempts").aggregate([
      { $match: { game } },       // ✅ dynamic now
      {
        $group: {
          _id: "$userId",
          name: { $first: "$userName" }|| {$first: "$name"} ,
          bestScore: { $max: "$score" }
        }
      },
      { $sort: { bestScore: -1 } }
    ]).toArray();

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Leaderboard error" });
  }
});

/* ---------------- GET CATEGORIES ---------------- */
router.get("/categories", async (req, res) => {
  try {
    const db = mongoose.connection.db;

    const categories = await db
      .collection("categories")
      .find({})
      .toArray();

    res.json(categories);
  } catch (err) {
    console.error("Categories fetch error:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

router.get("/quiz/:category", async (req, res) => {
  const { category } = req.params;
  const db = mongoose.connection.db;

  const questions = await db
    .collection("questions")
    // .find({ category })
    .find({category: { $regex: `^${category}$`, $options: "i" }})
    .limit(10)
    .toArray();

  res.json(questions);
});




// router.get("/leaderboard", async (req, res) => {
//   try {
//     const { game } = req.query;
//     const db = mongoose.connection.db;

//     const leaderboard = await db.collection("game_attempts").aggregate([
//       { $match: { game } },

//       {
//         $group: {
//           _id: "$userId",
//           bestScore: { $max: "$score" }
          
//         }
//       },

//       {
//         $lookup: {
//           from: "users",              // 👈 skillduels.users
//           localField: "_id",           // userId
//           foreignField: "_id",         // users._id
//           as: "user"
          
//         }
//       },

//       { $unwind: "$user" },

//       {
//         $project: {
//           _id: 0,
//           userId: "$_id",
//           bestScore: 1,
//           userName: "$user.fullName" || "$user.userName"  // ✅ REAL NAME
//         }
//       },

//       { $sort: { bestScore: -1 } },
//       { $limit: 10 }
//     ]).toArray();

//     res.json(leaderboard);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Leaderboard error" });
//   }
// });




// router.get("/leaderboard", async (req, res) => {
//   const db = mongoose.connection.db;

//   const leaderboard = await db.collection("game_attempts").aggregate([
//     { $match: { game: "memory" } },

//     {
//       $group: {
//         _id: "$userId",
//         name: { $first: "$userName" },
//         bestScore: { $max: "$score" }
//       }
//     },

//     { $sort: { bestScore: -1 } }
//   ]).toArray();

//   res.json(leaderboard);
// });

//======================================================================
// router.get("/leaderboard", async (req, res) => {
//   try {
//     const db = mongoose.connection.db;

//     const leaderboard = await db.collection("game_attempts").aggregate([
//       { $match: { game: "memory" } },

//       {
//         $group: {
//           _id: "$userId",
//           bestScore: { $max: "$score" }
//         }
//       },

//       {
//         $lookup: {
//           from: "details",        // Users collection
//           localField: "_id",      // userId
//           foreignField: "id",     // users.id
//           as: "user"
//         }
//       },

//       { $unwind: "$user" },

//       {
//         $project: {
//           _id: 0,
//           userId: "$_id",
//           name: "$user.fullName",
//           bestScore: 1
//         }
//       },

//       { $sort: { bestScore: -1 } }
//     ]).toArray();

//     res.json(leaderboard);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Leaderboard error" });
//   }
// });

export default router;



// import express from "express";
// import mongoose from "mongoose";

// const router = express.Router();

// /**
//  * POST /api/game/attempt
//  * Saves ONE game attempt
//  */
// router.post("/attempt", async (req, res) => {
//   try {
//     const { userId, game, score } = req.body;

//     // basic validation
//     if (!userId || !game || score === undefined) {
//       return res.status(400).json({ message: "Missing fields" });
//     }

// router.get("/debug", async (req, res) => {
//   const db = mongoose.connection.db;
//   const docs = await db.collection("game_attempts").find().toArray();
//   res.json(docs);
// });

// // router.get("/leaderboard", async (req, res) => {
// //   try {
// //     const db = mongoose.connection.db;

// //     const leaderboard = await db.collection("game_attempts").aggregate([
// //       { $match: { game: "memory" } },

// //       {
// //         $group: {
// //           _id: "$userId",
// //           bestScore: { $max: "$score" }
// //         }
// //       },

// //       { $sort: { bestScore: -1 } }
// //     ]).toArray();

// //     res.json(leaderboard);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: "Failed to load leaderboard" });
// //   }
// // });

// router.get("/leaderboard", async (req, res) => {
//   try {
//     const db = mongoose.connection.db;

//     const leaderboard = await db.collection("game_attempts").aggregate([
//       { $match: { game: "memory" } },

//       // get best score per user
//       {
//         $group: {
//           _id: "$userId",
//           bestScore: { $max: "$score" }
//         }
//       },

//       // join with users collection
//       {
//         $lookup: {
//           from: "details",        // 👈 Users collection name
//           localField: "_id",      // userId
//           foreignField: "id",     // user.id
//           as: "user"
//         }
//       },

//       // flatten user array
//       { $unwind: "$user" },

//       // shape response
//       {
//         $project: {
//           _id: 0,
//           userId: "$_id",
//           name: "$user.fullName",   // 👈 REAL NAME
//           bestScore: 1
//         }
//       },

//       { $sort: { bestScore: -1 } }
//     ]).toArray();

//     res.json(leaderboard);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Leaderboard error" });
//   }
// });



//     // access MongoDB directly via mongoose
//     const db = mongoose.connection.db;

//     // await db.collection("game_attempts").insertOne({
//     //   userId,
//     //   game,
//     //   score,
//     //   createdAt: new Date()
//     // });
//     const result = await db.collection("game_attempts").insertOne({
//         userId,
//         game,
//         score,
//         createdAt: new Date()
//     });

// console.log("Inserted ID:", result.insertedId);

    


//     res.status(201).json({ message: "Game attempt saved" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;
