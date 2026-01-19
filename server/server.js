import "dotenv/config";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import { ConnectDB } from "./configs/db.js"; // ✅ using your db.js
import http from "http";
import { Server } from "socket.io";
import gameRoutes from "./routes/game.routes.js";
import adminRouter from "./routes/adminRoute.js";
import userRoutes from "./routes/userRoute.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

const allowedOrigins = [
  "https://skillduels.vercel.app",
  "https://skill-duel-admin.vercel.app",
  "http://localhost:4000",
  "http://127.0.0.1:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images
app.use("/images", express.static(process.env.IMAGE_PATH));

// Routes
app.use("/api/game", gameRoutes);
app.use("/api/manage", adminRouter);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is Running!");
});

// ==================== Socket.IO & Chat Logic ====================
const rooms = {};
const onlineUsers = {};
const chatRooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register-user", ({ userId, username }) => {
    onlineUsers[userId] = socket.id;
    socket.userId = userId;
    socket.username = username;
    console.log("Registered:", userId, username);
  });

  socket.on("send-invite", ({ from, to, category }) => {
    console.log("onsi"+category)
    const receiverSocket = onlineUsers[to];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-invite", { from, category });
    }
  });

  socket.on("reject-invite", ({ from }) => {
    const senderSocket = onlineUsers[from];
    if (senderSocket) {
      io.to(senderSocket).emit("invite-rejected");
    }
  });

  socket.on("accept-invite", async ({ from, to,category }) => {
    try {
       const roomId = [from, to].sort().join("-");

      /*const client = new MongoClient(url);
      await client.connect();

      const db = client.db("skillduels");
      const collec = db.collection("duel");

      const selected = await collec.findOne({}, { sort: { _id: -1 } });
      if (!selected) return;

      const roomId = selected._id.toString();*/

      if (onlineUsers[from]) {
        io.to(onlineUsers[from]).emit("start-match", roomId,category);
      }
      if (onlineUsers[to]) {
        io.to(onlineUsers[to]).emit("start-match", roomId,category);
      }

      await client.close();
    } catch (err) {
      console.error("accept-invite error:", err);
    }
  });


  socket.on("start-quiz", ({ roomId, questions, username }) => {
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
      const userAnswer = answers[index];
      const correctOptionText = q.options[q.correctAnswer];
      if (userAnswer === correctOptionText) score++;
    });

    room.submissions[socket.id] = score;

    if (Object.keys(room.submissions).length === 2) {
      room.leaderboard = Object.entries(room.submissions).map(([socketId, score]) => {
        const player = room.players.find((p) => p.socketId === socketId);
        return { username: player?.username, score };
      });

      room.leaderboard.sort((a, b) => b.score - a.score);
      io.to(roomId).emit("quiz-end", { leaderboard: room.leaderboard });
    }
  });

  socket.on("join-room", ({ roomId, username }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        questions: [],
        submissions: {},
        leaderboard: null,
        players: [],
      };
    }

    const alreadyJoined = rooms[roomId].players.find((p) => p.socketId === socket.id);
    if (!alreadyJoined) {
      rooms[roomId].players.push({ socketId: socket.id, username });
    }

    socket.join(roomId);
  });

  // --- Chat Logic ---
  socket.on("send-chat-request", ({ from, to }) => {
    const receiverSocket = onlineUsers[to];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-chat-request", { from });
    }
  });

  socket.on("accept-chat", ({ from, to }) => {
    const roomId = [from, to].sort().join("-");
    chatRooms[roomId] = { users: [from, to] };
    io.to(onlineUsers[from]).emit("chat-started", { roomId });
    io.to(onlineUsers[to]).emit("chat-started", { roomId });
  });

  socket.on("reject-chat", ({ from, to }) => {
    const senderSocket = onlineUsers[from];
    if (senderSocket) {
      io.to(senderSocket).emit("chat-rejected", { by: to });
    }
  });

  socket.on("join-chat-room", ({ roomId }) => {
    socket.join(roomId);
  });

  socket.on("send-message", async ({ roomId, message, sender }) => {
    try {
      const client = new MongoClient(process.env.MONGODB_URL);
      await client.connect();
      const db = client.db("session");
      await db.collection("chatMessages").insertOne({
        roomId,
        sender,
        message,
        timestamp: new Date(),
      });
      await client.close();

      io.to(roomId).emit("receive-message", { sender, message, timestamp: new Date() });
    } catch (err) {
      console.error("Chat error:", err);
    }
  });

  socket.on("get-chat-history", async ({ roomId }) => {
    try {
      const client = new MongoClient(process.env.MONGODB_URL);
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

// ==================== Express Auth Routes ====================
app.post("/register", async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  await client.connect();
  const db = client.db("skillduels");
  const collec = db.collection("users");

  const { fullName, email, password } = req.body;
  const userExists = await collec.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const username = email.split("@")[0];

  const newUser = {
    id: Date.now().toString(),
    fullName,
    email,
    password: hashedPassword,
    profile: { username, rank: "Bronze", avatarIcon: "User" },
    stats: { totalXP: 0, level: 1, currentStreak: 0 },
    badges: [],
  };

  await collec.insertOne(newUser);
  const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({
    message: "Account created successfully",
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      profile: newUser.profile,
      stats: newUser.stats,
      badges: newUser.badges,
    },
  });
});

app.post("/login", async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  await client.connect();
  const db = client.db("skillduels");
  const collec = db.collection("users");

  const { email, password } = req.body;
  const user = await collec.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profile: user.profile,
      stats: user.stats,
      badges: user.badges,
    },
  });
});

app.get("/api/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = new MongoClient(process.env.MONGODB_URL);
    await client.connect();
    const db = client.db("skillduels");
    const collec = db.collection("users");
    const user = await collec.findOne({ id: decoded.userId });
    await client.close();

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: { id: user.id, name: user.fullName, email: user.email } });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Additional routes from original index.js
app.get("/protected", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "Access granted", userId: decoded.userId });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URL);
    await client.connect();
    const db = client.db("skillduels");
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
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    await client.connect();
    const db = client.db("skillduels");
    const collec = db.collection("users");
    const people = await collec.find({}).toArray();
    const result = people.map((user) => ({
      friend_id: user.id,
      fullName: user.fullName,
      email: user.email,
    }));
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});

app.post("/category", async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  await client.connect();
  const db = client.db("skillduels");
  const collec = db.collection("duel");
  const { category } = req.body;
  await collec.insertOne({ category, createdAt: new Date() });
  await client.close();
  res.json({ success: true });
});

app.get("/category1", async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  await client.connect();
  const db = client.db("skillduels");
  const collec = db.collection("duel");
  const selected = await collec.findOne({}, { sort: { _id: -1 } });
  await client.close();
  res.json(selected);
});

app.get("/categories/by-name/:categoryName", async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    await client.connect();
    const db = client.db("skillduels");
    const categoryDoc = await db.collection("categories").findOne({ name: req.params.categoryName });
    if (!categoryDoc) return res.status(404).json({ message: "Category not found" });
    res.json({ categoryId: categoryDoc._id, timePerQuestion: categoryDoc.timePerQuestion });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});

app.get("/quiz/by-category/:categoryId", async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    await client.connect();
    const db = client.db("skillduels");
    const questions = await db
      .collection("questions")
      .find({ category: new ObjectId(req.params.categoryId) })
      .limit(10)
      .toArray();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});

// ==================== Start Server ====================
ConnectDB(); // Connect to MongoDB via db.js

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server + Socket.IO running at http://localhost:${PORT}`);
});