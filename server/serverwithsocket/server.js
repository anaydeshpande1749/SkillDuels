import "dotenv/config"
import express from "express";
import cors from "cors"
import { ConnectDB } from "./configs/db.js";
import gameRoutes from "./routes/game.routes.js"
import adminRouter from "./routes/adminRoute.js";
import userRoutes from "./routes/userRoute.js";


// import http from "http";
// import { Server } from "socket.io";
    

// const http = require("http");
// const { Server } = require("socket.io");


const app = express()


// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });



app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use("/api/game",gameRoutes)



ConnectDB()
//api endpoints
app.use("/api/manage",adminRouter)
app.use("/api/users", userRoutes);

app.get("/",(req,res)=>{
    res.send("Server is Running ! ")
})

app.use(
  "/images",
  express.static(
    "E:/Dr.Doom Vault/SkillsDuel/Skill2Duels/SkillDuel/images"
  )
);

const PORT = process.env.PORT || 4000



// const rooms = {}; 
// // Map userId -> socketId
// const onlineUsers = {};

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("register-user", (userId) => {
//     onlineUsers[userId] = socket.id;
//   });

//   socket.on("send-invite", ({ from, to }) => {
//     const receiverSocket = onlineUsers[to];
//     if (receiverSocket) {
//       io.to(receiverSocket).emit("receive-invite", { from });
//     }
//   });

//   socket.on("reject-invite", ({ from }) => {
//     const senderSocket = onlineUsers[from];
//     if (senderSocket) {
//       io.to(senderSocket).emit("invite-rejected");
//     }
//   });

//   socket.on("accept-invite", async ({ from, to }) => {
//     try {
//       const client = new MongoClient(url);
//       await client.connect();

//       const db = client.db("session");
//       const collec = db.collection("duel");

//       // ✅ get latest category selection
//       const selected = await collec.findOne({}, { sort: { _id: -1 } });

//       if (!selected) return;

//       const roomId = selected._id.toString();

//       // join both users
//       if (onlineUsers[from]) {
//         io.to(onlineUsers[from]).emit("start-match", roomId);
//       }
//       if (onlineUsers[to]) {
//         io.to(onlineUsers[to]).emit("start-match", roomId);
//       }

//       await client.close();
//     } catch (err) {
//       console.error("accept-invite error:", err);
//     }
//   });

//   socket.on("start-quiz", ({ roomId, questions }) => {
//   if (!rooms[roomId]) return;

//   rooms[roomId].questions = questions;
// });


//   socket.on("get-leaderboard", ({ roomId }) => {
//   const room = rooms[roomId];

//   if (!room) {
//     socket.emit("leaderboard-error", {
//       message: "Room not found"
//     });
//     return;
//   }

//   if (room.leaderboard) {
//     socket.emit("leaderboard-data", {
//       leaderboard: room.leaderboard
//     });
//   }
// });


//   socket.on("submit-quiz", ({ roomId, answers }) => {
//     const room = rooms[roomId];
//     console.log(room)
//     console.log(roomId)
//     console.log(answers)
//     if (!room) return;

//     let score = 0;

//     room.questions.forEach((q, index) => {
//       if (answers[index] === q.correctAnswer) {
//         score++;
//       }
//     });

//     room.submissions[socket.id] = score;
//     console.log(score)

//     // 🔥 when both players submit
//     if (Object.keys(room.submissions).length === 2) {
//        room.leaderboard = Object.entries(room.submissions).map(
//       ([socketId, score]) => {
//         const player = room.players.find(
//           p => p.socketId === socketId
//         );

//         return {
//           username: player?.username ,
//           score
//         };
//       }
//     );

//       room.leaderboard.sort((a, b) => b.score - a.score);
     

//      io.to(roomId).emit("quiz-end", {
//       leaderboard: room.leaderboard
//     });

//       // optional cleanup
//      ;
//     }
//   });

   

//   socket.on("join-room", ({ roomId, username }) => {
//   if (!rooms[roomId]) {
//     rooms[roomId] = {
//       questions: [],
//       submissions: {},
//       leaderboard: null,
//       players: []
//     };
//   }

//   // ❌ avoid duplicate entries
//   const alreadyJoined = rooms[roomId].players.find(
//     p => p.socketId === socket.id
//   );

//   if (!alreadyJoined) {
//     rooms[roomId].players.push({
//       socketId: socket.id,
//       username
//     });
//   }

//   socket.join(roomId);
// });

//   socket.on("disconnect", () => {
//     for (const userId in onlineUsers) {
//       if (onlineUsers[userId] === socket.id) {
//         delete onlineUsers[userId];
//         break;
//       }
//     }
//   });
// });





app.listen(PORT,()=>{console.log(`Server is live at port ${PORT}`)})
// app.listen(PORT,()=>{console.log(`Server is ready`)})


// server.listen(PORT, () => {
//   console.log(`Server + Socket.IO running at http://localhost:${PORT}`);
// });

