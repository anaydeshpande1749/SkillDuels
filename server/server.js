// //this is server.js running on port 4000

// import "dotenv/config";
// import express from "express";
// import cors from "cors";

// import { ConnectDB } from "./configs/db.js";
// import gameRoutes from "./routes/game.routes.js";
// import adminRouter from "./routes/adminRoute.js";
// import userRoutes from "./routes/userRoute.js";

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // DB
// ConnectDB();

// // Routes
// app.use("/api/game", gameRoutes);
// app.use("/api/manage", adminRouter);
// app.use("/api/users", userRoutes);

// app.get("/", (req, res) => {
//   res.send("Server is running 🚀");
// });

// // Static images
// app.use(
//   "/images",
//   express.static("E:/Dr.Doom Vault/SkillsDuel/Skill2Duels/SkillDuel/images")
// );

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server live at http://localhost:${PORT}`);
// });


import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";

import { ConnectDB } from "./configs/db.js";
import gameRoutes from "./routes/game.routes.js";
import adminRouter from "./routes/adminRoute.js";
import userRoutes from "./routes/userRoute.js";

/* ======================
   APP + SERVER
====================== */
const app = express();
const server = http.createServer(app);

/* ======================
   MIDDLEWARE
====================== */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   DATABASES
====================== */
// Main App DB (mongoose)
ConnectDB();

// Socket Chat DB (native mongodb)
const mongoClient = new MongoClient(process.env.MONGO_URL);
let db;

async function initSocketDB() {
  await mongoClient.connect();
  db = mongoClient.db("session");
  console.log("✅ MongoDB connected (Socket)");
}
initSocketDB();

/* ======================
   ROUTES
====================== */
app.use("/api/game", gameRoutes);
app.use("/api/manage", adminRouter);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("SkillDuels Server running 🚀");
});

// app.use(
//   "/images",
//   express.static(process.env.IMAGE_PATH)
// );

if (process.env.IMAGE_PATH) {
  app.use("/images", express.static(process.env.IMAGE_PATH));
}


/* ======================
   SOCKET.IO
====================== */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  }
});

/* ======================
   IN-MEMORY STORES
====================== */
const rooms = {};
const onlineUsers = {};

/* ======================
   SOCKET LOGIC
====================== */
io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  socket.on("register-user", ({ userId, username }) => {
    onlineUsers[userId] = socket.id;
    socket.userId = userId;
    socket.username = username;
  });

  socket.on("get-online-users", () => {
    socket.emit("online-users", Object.keys(onlineUsers));
  });

  socket.on("send-invite", ({ from, to }) => {
    const receiver = onlineUsers[to];
    if (receiver) {
      io.to(receiver).emit("receive-invite", { from });
    }
  });

  socket.on("reject-invite", ({ from }) => {
    const sender = onlineUsers[from];
    if (sender) io.to(sender).emit("invite-rejected");
  });

  socket.on("accept-invite", ({ from, to }) => {
    const roomId = [from, to].sort().join("-");
    [from, to].forEach((id) => {
      const sid = onlineUsers[id];
      if (sid) io.to(sid).emit("start-match", roomId);
    });
  });

  socket.on("join-room", ({ roomId, username }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        questions: [],
        submissions: {},
        players: []
      };
    }

    const room = rooms[roomId];
    if (!room.players.find(p => p.socketId === socket.id)) {
      room.players.push({ socketId: socket.id, username });
    }

    socket.join(roomId);
  });

  socket.on("start-quiz", ({ roomId, questions }) => {
    if (rooms[roomId]) {
      rooms[roomId].questions = questions;
      rooms[roomId].submissions = {};
    }
  });

  socket.on("submit-quiz", ({ roomId, answers }) => {
    const room = rooms[roomId];
    if (!room) return;

    let score = 0;
    room.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    room.submissions[socket.id] = score;

    if (Object.keys(room.submissions).length === 2) {
      const leaderboard = Object.entries(room.submissions)
        .map(([sid, score]) => {
          const player = room.players.find(p => p.socketId === sid);
          return { username: player?.username, score };
        })
        .sort((a, b) => b.score - a.score);

      io.to(roomId).emit("quiz-end", { leaderboard });
    }
  });

  /* CHAT */
  socket.on("join-chat-room", ({ roomId }) => socket.join(roomId));

  socket.on("send-message", async ({ roomId, message, sender }) => {
    if (!sender) return;
    const payload = { roomId, sender, message, timestamp: new Date() };
    await db.collection("chatMessages").insertOne(payload);
    io.to(roomId).emit("receive-message", payload);
  });

  socket.on("get-chat-history", async ({ roomId }) => {
    const messages = await db
      .collection("chatMessages")
      .find({ roomId })
      .sort({ timestamp: 1 })
      .toArray();
    socket.emit("chat-history", messages);
  });

  socket.on("disconnect", () => {
    for (const id in onlineUsers) {
      if (onlineUsers[id] === socket.id) {
        delete onlineUsers[id];
        break;
      }
    }
  });
});








/* ======================
   EXPRESS ROUTES (UNCHANGED)
====================== */

// app.post("/register", async (req, res) => {
//   const client = new MongoClient(url);
//   await client.connect();

//   const db = client.db("Users");
//   const collec = db.collection("details");

//   const { fullName, email, password } = req.body;

//   const userExists = await collec.findOne({ email });
//   if (userExists)
//     return res.status(400).json({ message: "User already exists" });

//   const hashedPassword = await bcrypt.hash(password, 10);

//   await collec.insertOne({
//     id: Date.now().toString(),
//     fullName,
//     email,
//     password: hashedPassword
//   });

//   res.json({ message: "Account created successfully" });
// });

// app.post("/login", async (req, res) => {
//   const client = new MongoClient(url);
//   await client.connect();

//   const db = client.db("Users");
//   const collec = db.collection("details");

//   const { email, password } = req.body;
//   const user = await collec.findOne({ email });

//   if (!user) return res.status(401).json({ message: "Invalid credentials" });

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch)
//     return res.status(401).json({ message: "Invalid credentials" });

//   const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
//     expiresIn: "1h"
//   });

//   res.json({
//     token,
//     user: { id: user.id, name: user.fullName, email: user.email }
//   });
// });

// app.get("/api/auth/me", async (req, res) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ message: "No token" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);

//     const client = new MongoClient(url);
//     await client.connect();

//     const db = client.db("Users");
//     const collec = db.collection("details");

//     const user = await collec.findOne({ id: decoded.userId });

//     await client.close();

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({
//       user: {
//         id: user.id,
//         name: user.fullName,
//         email: user.email
//       }
//     });
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// });



// /* PROTECTED */
// app.get("/protected", (req, res) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ message: "No token" });

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     res.json({ message: "Access granted", userId: decoded.userId });
//   } catch {
//     res.status(401).json({ message: "Invalid token" });
//   }
// });

// app.get("/categories", async (req, res) => {
//   try {
//     const client = new MongoClient(url);
//     await client.connect();

//     const db = client.db("quizapp");
//     const collection = db.collection("categories");

//     const categories = await collection.find({}).toArray();

//     res.status(200).json(categories);

//     await client.close();
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch categories" });
//   }
// });

// app.get("/friends", async (req, res) => {
//   const client = new MongoClient(url);


//   try {
//     await client.connect();
//     const db = client.db("skillduels");
//     const collec = db.collection("users");

//     const people = await collec.find({}).toArray();

//     const result = people.map(user => ({
//       friend_id: user.id,
//       fullName: user.fullName,
//       email: user.email
//     }));

//     res.status(200).json(result);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Server error" });
//   } finally {
//     await client.close();
//   }
// });

// app.get("/quiz/:category", async (req, res) => {
//   const client = new MongoClient(url);

//   try {
//     await client.connect();
//     const db = client.db("quizapp");
//     const collection = db.collection("questions");
//     const { category } = req.params;

//     const questions = await collection
//       .find({ category })
//       .limit(10)
//       .toArray();

//     res.status(200).json(questions);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// app.post("/category", async (req, res) => {
//   const client = new MongoClient(url);
//   await client.connect();

//   const db = client.db("session");
//   const collec = db.collection("duel");

//   const { category } = req.body;

//   await collec.insertOne({
//     category,
//     createdAt: new Date()
//   });

//   await client.close();
//   res.json({ success: true });
// });


// app.get("/category1", async (req, res) => {
//   const client = new MongoClient(url);
//   await client.connect();

//   const db = client.db("session");
//   const collec = db.collection("duel");

//   const selected = await collec.findOne({}, { sort: { _id: -1 } });

//   await client.close();
//   res.json(selected);
// });







/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server live at http://localhost:${PORT}`);
});


