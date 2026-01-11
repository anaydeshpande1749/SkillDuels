//This is index.js of backend folder running on port 9000

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* ======================
   CONFIG
====================== */
const MONGO_URL =
  "mongodb+srv://piyushshelar10_db_user:vbXofPmn1uGJAUYB@cluster0.84hcptk.mongodb.net/?appName=Cluster0";

const mongoClient = new MongoClient(MONGO_URL);
let db;

/* ======================
   IN-MEMORY STORES
====================== */
const rooms = {};        // duel rooms
const onlineUsers = {}; // userId -> socketId
//const chatRooms = {};   // chat rooms

/* ======================
   INIT DB
====================== */
async function initDB() {
  await mongoClient.connect();
  db = mongoClient.db("session");
  console.log("MongoDB connected (socket server)");
}
initDB();

/* ======================
   SOCKET LOGIC
====================== */
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  /* -------- USER REGISTER -------- */
  socket.on("register-user", ({ userId, username }) => {
    onlineUsers[userId] = socket.id;
    socket.userId = userId;
    socket.username = username;
  });

  // 🔥 SEND ONLINE USERS
socket.on("get-online-users", () => {
  socket.emit("online-users", Object.keys(onlineUsers));
});
  

  /* -------- INVITE -------- */
  // socket.on("send-invite", ({ from, to }) => {
  //   const receiver = onlineUsers[to];
  //   if (receiver) {
  //     io.to(receiver).emit("receive-invite", { from });
  //   }
  // });

/* -------- INVITE -------- */
socket.on("send-invite", ({ from, to }) => {
  console.log("📨 Invite sent:", { from, to });
  console.log("Online users:", onlineUsers);
  
  const receiver = onlineUsers[to];
  if (receiver) {
    console.log("✅ Receiver found, sending invite to socket:", receiver);
    io.to(receiver).emit("receive-invite", { from });
  } else {
    console.log("❌ Receiver not online:", to);
  }
});


  socket.on("reject-invite", ({ from }) => {
    const sender = onlineUsers[from];
    if (sender) io.to(sender).emit("invite-rejected");
  });

  // socket.on("accept-invite", async ({ from, to }) => {
  //   const duel = await db
  //     .collection("duel")
  //     .findOne({}, { sort: { _id: -1 } });

  //   if (!duel) return;

  //   const roomId = duel._id.toString();

  //   [from, to].forEach((id) => {
  //     if (onlineUsers[id]) {
  //       io.to(onlineUsers[id]).emit("start-match", roomId);
  //     }
  //   });
  // });

  socket.on("accept-invite", ({ from, to }) => {
  // ✅ generate room instantly (NO DB)
  const roomId = [from, to].sort().join("-");

  // 🔥 notify both players
  [from, to].forEach((id) => {
    const socketId = onlineUsers[id];
    if (socketId) {
      io.to(socketId).emit("start-match", roomId);
      console.log("Invite accepted:", from, to);

    }
  });
});


  /* -------- DUEL ROOM -------- */
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
      room.players.push({
        socketId: socket.id,
        username
      });
    }

    socket.join(roomId);
  });

  socket.on("start-quiz", ({ roomId, questions }) => {
    if (rooms[roomId]) {
      rooms[roomId].questions = questions;
      rooms[roomId].submissions = {}; // reset
    }
  });

  socket.on("submit-quiz", ({ roomId, answers }) => {
    const room = rooms[roomId];
    if (!room || !room.questions.length) return;

    let score = 0;

    room.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    room.submissions[socket.id] = score;

    if (Object.keys(room.submissions).length === 2) {
      const leaderboard = Object.entries(room.submissions).map(
        ([sid, score]) => {
          const player = room.players.find(p => p.socketId === sid);
          return { username: player?.username, score };
        }
      ).sort((a, b) => b.score - a.score);

      io.to(roomId).emit("quiz-end", { leaderboard });
    }
  });

  /* -------- CHAT -------- */
socket.on("send-chat-request", ({ from, fromName, to }) => {
  const receiver = onlineUsers[to];
  if (receiver) {
    io.to(receiver).emit("receive-chat-request", {
      from,
      fromName
    });
  }
});


socket.on("accept-chat", ({ from, to }) => {
  const roomId = [from, to].sort().join("-");

  const fromSocket = onlineUsers[from];
  const toSocket = onlineUsers[to];

  if (!fromSocket || !toSocket) return;

  io.to(fromSocket).emit("chat-started", { roomId });
  io.to(toSocket).emit("chat-started", { roomId });
});

// -------- CHAT ROOM JOIN --------
socket.on("join-chat-room", ({ roomId }) => {
  socket.join(roomId);
});


  socket.on("send-message", async ({ roomId, message, sender }) => {
     if (!sender) return; // ❌ reject bad payloads
    const payload = {
      roomId,
      sender,
      message,
      timestamp: new Date()
    };

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

  /* -------- DISCONNECT -------- */
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    
    for (const id in onlineUsers) {
      if (onlineUsers[id] === socket.id) {
        delete onlineUsers[id];
        break;
      }
    }
  });

  socket.on("leave-chat-room", ({ roomId }) => {
  socket.leave(roomId);
});


});

/* ======================
   SERVER
====================== */
server.listen(9000, () => {
  console.log("Socket server running on http://localhost:9000");
});

