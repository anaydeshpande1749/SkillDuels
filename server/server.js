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

app.use(
  "/images",
  express.static(process.env.IMAGE_PATH)
);

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
   START SERVER
====================== */
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server live at http://localhost:${PORT}`);
});


