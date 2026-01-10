const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const http = require("http");
const { Server } = require("socket.io");

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

const JWT_SECRET = "supersecretkey";

const url =
  "mongodb+srv://piyushshelar10_db_user:vbXofPmn1uGJAUYB@cluster0.84hcptk.mongodb.net/?appName=Cluster0";

// Fake DB
let users = [];

const rooms = {};
const onlineUsers = {};

/* ======================
   CHAT DATA (ADDED)
====================== */
const chatRooms = {}; // roomId -> users

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register-user", ({ userId, username }) => {
    onlineUsers[userId] = socket.id;
    socket.userId = userId;
  socket.username = username;   // ✅ IMPORTANT
  console.log("Registered:", userId, username);
  });

  socket.on("send-invite", ({ from, to }) => {
    const receiverSocket = onlineUsers[to];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-invite", { from });
    }
  });

  socket.on("reject-invite", ({ from }) => {
    const senderSocket = onlineUsers[from];
    if (senderSocket) {
      io.to(senderSocket).emit("invite-rejected");
    }
  });

  socket.on("accept-invite", async ({ from, to }) => {
    try {
      const client = new MongoClient(url);
      await client.connect();

      const db = client.db("session");
      const collec = db.collection("duel");

      const selected = await collec.findOne({}, { sort: { _id: -1 } });
      if (!selected) return;

      const roomId = selected._id.toString();

      if (onlineUsers[from]) {
        io.to(onlineUsers[from]).emit("start-match", roomId);
      }
      if (onlineUsers[to]) {
        io.to(onlineUsers[to]).emit("start-match", roomId);
      }

      await client.close();
    } catch (err) {
      console.error("accept-invite error:", err);
    }
  });

  socket.on("start-quiz", ({ roomId, questions }) => {
    if (!rooms[roomId]) return;
    rooms[roomId].questions = questions;
  });

  socket.on("get-leaderboard", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("leaderboard-error", { message: "Room not found" });
      return;
    }
    if (room.leaderboard) {
      socket.emit("leaderboard-data", { leaderboard: room.leaderboard });
    }
  });

  socket.on("submit-quiz", ({ roomId, answers }) => {
    const room = rooms[roomId];
    if (!room) return;

    let score = 0;
    room.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) score++;
    });

    room.submissions[socket.id] = score;

    if (Object.keys(room.submissions).length === 2) {
      room.leaderboard = Object.entries(room.submissions).map(
        ([socketId, score]) => {
          const player = room.players.find(
            (p) => p.socketId === socketId
          );
          return { username: player?.username, score };
        }
      );

      room.leaderboard.sort((a, b) => b.score - a.score);

      io.to(roomId).emit("quiz-end", {
        leaderboard: room.leaderboard
      });
    }
  });

  socket.on("join-room", ({ roomId, username }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        questions: [],
        submissions: {},
        leaderboard: null,
        players: []
      };
    }

    const alreadyJoined = rooms[roomId].players.find(
      (p) => p.socketId === socket.id
    );

    if (!alreadyJoined) {
      rooms[roomId].players.push({
        socketId: socket.id,
        username
      });
    }

    socket.join(roomId);
  });

  /* ======================
     CHAT LOGIC (ADDED)
  ====================== */

  socket.on("send-chat-request", ({ from, to }) => {
    const receiverSocket = onlineUsers[to];
    console.log(from)
    console.log(to)
    console.log(onlineUsers)
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-chat-request", { from });
    }
  });

  socket.on("accept-chat", ({ from, to }) => {
    const roomId = [from, to].sort().join("-");
    chatRooms[roomId] = { users: [from, to] };
    console.log("a "+from)
    console.log("a "+to)


    io.to(onlineUsers[from]).emit("chat-started", { roomId });
    io.to(onlineUsers[to]).emit("chat-started", { roomId });
  });

  socket.on("reject-chat", ({ from, to }) => {
  const senderSocket = onlineUsers[from];

  if (senderSocket) {
    io.to(senderSocket).emit("chat-rejected", {
      by: to
    });
  }

  console.log(`Chat rejected by ${to}`);
});


  socket.on("join-chat-room", ({ roomId }) => {
    socket.join(roomId);
    console.log(roomId)
  });

  socket.on("send-message", async ({ roomId, message,sender}) => {
    try {
       
     
      const client = new MongoClient(url);
      await client.connect();
      const db = client.db("session");

      await db.collection("chatMessages").insertOne({
        roomId,
        sender,
        message,
        timestamp: new Date()
      });

      await client.close();

      io.to(roomId).emit("receive-message", {
        sender,
        message,
        timestamp: new Date()
      });
    } catch (err) {
      console.error("Chat error:", err);
    }
  });

  socket.on("get-chat-history", async ({ roomId }) => {
    try {
      const client = new MongoClient(url);
      await client.connect();
      const db = client.db("session");

      const messages = await db
        .collection("chatMessages")
        .find({ roomId })
        .sort({ timestamp: 1 })
        .toArray();

      await client.close();
      socket.emit("chat-history", messages);
    } catch (err) {
      console.error("History error:", err);
    }
  });

  socket.on("disconnect", () => {
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
  });
});

/* ======================
   EXPRESS ROUTES (UNCHANGED)
====================== */

app.post("/register", async (req, res) => {
  const client = new MongoClient(url);
  await client.connect();

  const db = client.db("Users");
  const collec = db.collection("details");

  const { fullName, email, password } = req.body;

  const userExists = await collec.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  await collec.insertOne({
    id: Date.now().toString(),
    fullName,
    email,
    password: hashedPassword
  });

  res.json({ message: "Account created successfully" });
});

app.post("/login", async (req, res) => {
  const client = new MongoClient(url);
  await client.connect();

  const db = client.db("Users");
  const collec = db.collection("details");

  const { email, password } = req.body;
  const user = await collec.findOne({ email });

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "1h"
  });

  res.json({
    token,
    user: { id: user.id, name: user.fullName, email: user.email }
  });
});

app.get("/api/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const client = new MongoClient(url);
    await client.connect();

    const db = client.db("Users");
    const collec = db.collection("details");

    const user = await collec.findOne({ id: decoded.userId });

    await client.close();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email
      }
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});



/* PROTECTED */
app.get("/protected", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ message: "Access granted", userId: decoded.userId });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const client = new MongoClient(url);
    await client.connect();

    const db = client.db("quizapp");
    const collection = db.collection("categories");

    const categories = await collection.find({}).toArray();

    res.status(200).json(categories);

    await client.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

app.get("/friends", async (req, res) => {
  const client = new MongoClient(url);


  try {
    await client.connect();
    const db = client.db("Users");
    const collec = db.collection("details");

    const people = await collec.find({}).toArray();

    const result = people.map(user => ({
      friend_id: user.id,
      fullName: user.fullName,
      email: user.email
    }));

    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});

app.get("/quiz/:category", async (req, res) => {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db("quizapp");
    const collection = db.collection("questions");
    const { category } = req.params;

    const questions = await collection
      .find({ category })
      .limit(10)
      .toArray();

    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/category", async (req, res) => {
  const client = new MongoClient(url);
  await client.connect();

  const db = client.db("session");
  const collec = db.collection("duel");

  const { category } = req.body;

  await collec.insertOne({
    category,
    createdAt: new Date()
  });

  await client.close();
  res.json({ success: true });
});


app.get("/category1", async (req, res) => {
  const client = new MongoClient(url);
  await client.connect();

  const db = client.db("session");
  const collec = db.collection("duel");

  const selected = await collec.findOne({}, { sort: { _id: -1 } });

  await client.close();
  res.json(selected);
});




server.listen(9000, () => {
  console.log("Server + Socket.IO running on http://localhost:9000");
});

