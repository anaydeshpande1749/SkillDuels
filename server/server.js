//this is server.js running on port 4000

import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConnectDB } from "./configs/db.js";
import gameRoutes from "./routes/game.routes.js";
import adminRouter from "./routes/adminRoute.js";
import userRoutes from "./routes/userRoute.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB
ConnectDB();

// Routes
app.use("/api/game", gameRoutes);
app.use("/api/manage", adminRouter);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Static images
app.use(
  "/images",
  express.static("E:/Dr.Doom Vault/SkillsDuel/Skill2Duels/SkillDuel/images")
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server live at http://localhost:${PORT}`);
});



// import "dotenv/config"
// import express from "express";
// import cors from "cors"
// import { ConnectDB } from "./configs/db.js";
// import gameRoutes from "./routes/game.routes.js"
// import adminRouter from "./routes/adminRoute.js";
// import userRoutes from "./routes/userRoute.js";


// const app = express()


// app.use(express.json())
// app.use(express.urlencoded({ extended: true }));
// app.use(cors())
// app.use("/api/game",gameRoutes)



// ConnectDB()

// app.use("/api/manage",adminRouter)
// app.use("/api/users", userRoutes);

// app.get("/",(req,res)=>{
//     res.send("Server is Running ! ")
// })

// app.use(
//   "/images",
//   express.static(
//     "E:/Dr.Doom Vault/SkillsDuel/Skill2Duels/SkillDuel/images"
//   )
// );

// const PORT = process.env.PORT || 4000


// app.listen(PORT,()=>{console.log(`Server is live at port ${PORT}`)})

