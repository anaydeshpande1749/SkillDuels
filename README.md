# 🧠 SkillDuels – Client Application

---

## 🎮 About SkillDuels (Client)

**SkillDuels** is a **competitive, real-time learning platform** where users engage in **1v1 quiz battles**, earn XP, unlock achievements, and climb leaderboards.

This repository contains the **user-facing client application**, built with **React + Vite**, focused on:

* Real-time gameplay experience
* Smooth UI/UX interactions
* Live updates using Socket.IO
* Gamified learning mechanics

---

## 🔗 Related Repository (Admin & Backend)

> SkillDuels follows a **multi-repo architecture** for scalability and clean separation of concerns.

* 🛠 **Admin Panel & Backend**
  👉 [https://github.com/SarthakDudhe/SkillDuel.git](https://github.com/SarthakDudhe/SkillDuel.git)
  *(Admin dashboard, quiz & category management, APIs, Socket.IO backend)*

* 🎮 **Client Application (This Repo)**
  👉 [https://github.com/anaydeshpande1749/SkillDuels.git](https://github.com/anaydeshpande1749/SkillDuels.git)
  *(User-facing gameplay experience)*

---

## 🎯 What This Client Does

The client transforms traditional quizzes into an **engaging competitive experience**.

Users can:

* Play live **1v1 quiz duels**
* Select categories and enter arenas
* Track XP, rank, and leaderboard position
* See real-time score updates
* Enjoy audio-enhanced gameplay

---

## 🚀 Core Features

* ⚔️ **Real-Time 1v1 Quiz Battles**

  * Live opponent matchmaking
  * Countdown timers per question
  * Instant score synchronization

* 🧑‍💻 **User Dashboard**

  * XP & rank overview
  * Category selection
  * Match entry points

* 🏆 **Leaderboard System**

  * Displays top-performing players
  * Rank-based progression system

* 🔊 **Enhanced Game Experience**

  * Background music & sound effects
  * Visual overlays & UI feedback

* 🧠 **Quiz Flow Management**

  * Question rendering with timers
  * Result screen with performance summary

* 🔐 **Protected Routes**

  * Auth-based access control
  * Popup-based login flow

* 💬 **Social Interaction UI**

  * Friends list
  * Invite modal
  * In-app chat interface (UI-side)

---

## 🛠️ Tech Stack (Client)

| Category            | Technologies                 |
| ------------------- | ---------------------------- |
| **Frontend**        | React 18, Vite               |
| **Routing**         | React Router                 |
| **State**           | Context API                  |
| **Real-Time**       | Socket.IO Client             |
| **Styling**         | CSS (component-level)        |
| **UX Enhancements** | Custom audio hooks, overlays |

---

## 📁 Client Folder Structure

```
client/
├── src/
│   ├── Components/
│   │   ├── Duel.jsx
│   │   ├── Duelresult.jsx
│   │   ├── Question.jsx
│   │   ├── Leadersection.jsx
│   │   ├── LoginPopup.jsx
│   │   ├── InviteModal.jsx
│   │   ├── Chat.jsx
│   │   ├── Friends.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SocketContext.jsx
│   │   └── Appcontext.jsx
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LeaderBoard.jsx
│   │   └── DashBoard/
│   │       ├── DashboardLayout.jsx
│   │       ├── DashBoardArena.jsx
│   │       └── PlayDuel.jsx
│   │
│   ├── assets/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## ⚡ Getting Started (Client)

### Prerequisites

* Node.js (v16+ recommended)
* Backend & Socket server running

### Installation

```bash
git clone https://github.com/anaydeshpande1749/SkillDuels.git
cd SkillDuels/client
npm install
```

### Environment Setup

Create a `.env` file inside the `client` folder:

```env
VITE_API_URL=http://localhost:4000
```

### Run the Client

```bash
npm run dev
```

👉 App runs at **[http://localhost:5173](http://localhost:5173)**

---

## 🎮 Gameplay Flow

1. User logs in via popup authentication
2. Selects quiz category from dashboard
3. Gets matched with another player
4. Answers timed quiz questions
5. Scores update live via Socket.IO
6. Results shown with XP & winner status

---

## 📽️ Demo Video

🎥 **Demo:** *(To be added)*
Will showcase:

* Live 1v1 gameplay
* Real-time score updates
* Leaderboard transitions

---

## 🖼️ Screenshots (Recommended)

Suggested screenshots to add:

* Landing Page
* Duel Arena
* Live Question Screen
* Result Screen
* Leaderboard

> Add images in an `/images` folder and reference them here.

---

## 📈 Learning Outcomes

* Real-time app development with Socket.IO
* Multiplayer state synchronization
* Component-driven UI architecture
* MERN stack integration
* Gamification logic & UX design

---

## 🤝 Contributors

* **Anay Deshpande** – Client architecture, UI & gameplay flow
* **Sarthak Dudhe** – Backend, admin panel & APIs
* **Piyush** – Game logic & feature support
* **Madhur** – Testing & integration support

---

## 🛣️ Future Enhancements

* Skill-based matchmaking
* AI-generated quiz questions
* Friends & private battles
* Mobile responsiveness
* In-app notifications

---

## 📄 License

Developed as part of an academic submission
**Project Code:** `EDU-WEB-2025-115`

License can be added if required.

---

⭐ **If you like this project, feel free to star the repo and connect!**
