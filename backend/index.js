//This is index.js of backend folder running on port 9000

const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
const { MongoClient,ObjectId } = require("mongodb");
=======
>>>>>>> origin/main
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

<<<<<<< HEAD
  socket.on("send-invite", ({ from, to,category }) => {
    const receiverSocket = onlineUsers[to];
    console.log("s"+from)
    console.log("r"+to)
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive-invite", { from,category });
    }
  });
=======
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

>>>>>>> origin/main

  socket.on("reject-invite", ({ from }) => {
    const sender = onlineUsers[from];
    if (sender) io.to(sender).emit("invite-rejected");
  });

<<<<<<< HEAD
  socket.on("accept-invite", async ({ from, to,category }) => {
    try {
       const roomId = [from, to].sort().join("-");

      /*const client = new MongoClient(url);
      await client.connect();

      const db = client.db("skillduels");
      const collec = db.collection("duel");
=======
  // socket.on("accept-invite", async ({ from, to }) => {
  //   const duel = await db
  //     .collection("duel")
  //     .findOne({}, { sort: { _id: -1 } });

  //   if (!duel) return;
>>>>>>> origin/main

  //   const roomId = duel._id.toString();

<<<<<<< HEAD
      const roomId = selected._id.toString();*/

      if (onlineUsers[from]) {
        io.to(onlineUsers[from]).emit("start-match", roomId,category);
      }
      if (onlineUsers[to]) {
        io.to(onlineUsers[to]).emit("start-match", roomId,category);
      }
=======
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
>>>>>>> origin/main

    }
  });
});

<<<<<<< HEAD
  socket.on("start-quiz", ({ roomId, questions,username }) => {
    if (!rooms[roomId]) return;
    rooms[roomId].questions = questions;
    console.log("q", rooms[roomId].questions )
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
    console.log(answers)
    if (!room) return;

    let score = 0;
    room.questions.forEach((q, index) => {
    const userAnswer = answers[index];
    const correctOptionText = q.options[q.correctAnswer];
    
    
    
    if (userAnswer === correctOptionText) {
      score++;
    }
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
=======
>>>>>>> origin/main

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

app.post("/register", async (req, res) => {
  const client = new MongoClient(url);
  await client.connect();

  const db = client.db("skillduels");
  const collec = db.collection("users");

  const { fullName, email, password } = req.body;

  const userExists = await collec.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  // auto-generate username
  const username = email.split("@")[0];

  const newUser = {
    id: Date.now().toString(),
    fullName,
    email,
    password: hashedPassword,

    profile: {
      username,
      rank: "Bronze",
      avatarIcon: "User"
    },

    stats: {
      totalXP: 0,
      level: 1,
      currentStreak: 0
    },

    badges: []
  };

  await collec.insertOne(newUser);

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
    expiresIn: "1h"
  });

  res.json({
    message: "Account created successfully",
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      profile: newUser.profile,
      stats: newUser.stats,
      badges: newUser.badges
    }
  });
});

app.post("/login", async (req, res) => {
  const client = new MongoClient(url);
  await client.connect();

  const db = client.db("skillduels");
  const collec = db.collection("users");

  const { email, password } = req.body;
  const user = await collec.findOne({ email });
  console.log(user);

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "1h"
  });

  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profile: user.profile,
      stats: user.stats,
      badges: user.badges
    }
  });
});


/* ======================
   SERVER
====================== */
<<<<<<< HEAD

/*app.post("/register", async (req, res) => {
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
  console.log(user)

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
*/
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

    const db = client.db("skillduels");
    const collec = db.collection("users");

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
  const client = new MongoClient(url);


  try {
    await client.connect();
    const db = client.db("skillduels");
    const collec = db.collection("users");

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

/*app.get("/quiz/:category", async (req, res) => {
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
});*/


app.post("/category", async (req, res) => {
  const client = new MongoClient(url);
  await client.connect();

  const db = client.db("skillduels");
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

  const db = client.db("skillduels");
  const collec = db.collection("duel");

  const selected = await collec.findOne({}, { sort: { _id: -1 } });

  await client.close();
  res.json(selected);
});

app.get("/categories/by-name/:categoryName", async (req, res) => {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db("skillduels");

    const categoryDoc = await db.collection("categories").findOne({
      name: req.params.categoryName
    });
    console.log("Category document:", categoryDoc);

    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      categoryId: categoryDoc._id,
      timePerQuestion: categoryDoc.timePerQuestion
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});

app.get("/quiz/by-category/:categoryId", async (req, res) => {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db("skillduels");

    const questions = await db
      .collection("questions")
      .find({ category: new ObjectId(req.params.categoryId) })
      .limit(10)
      .toArray();
      console.log("Questions fetched:", questions);
console.log("Questions count:", questions.length);

    res.json(questions);
   

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});





server.listen(9000, () => {
  console.log("Server + Socket.IO running on http://localhost:9000");
=======
server.listen(4000, () => {
  console.log("Socket server running on http://localhost:4000");
>>>>>>> origin/main
});
