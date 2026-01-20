//this is socketcontext.jsx

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

<<<<<<< HEAD
const SocketContext = createContext();

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000");
=======
const SocketContext = createContext(null);
>>>>>>> origin/main

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [invite, setInvite] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
<<<<<<< HEAD
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    if (userId && username) {
      socket.emit("register-user", { userId, username });
    }

    /* =======================
       DUEL LOGIC
    ======================= */
    socket.on("receive-invite", ({ from, category }) => {
      setInvite({ from, category });
      console.log("sc"+category)
    });

    socket.on("start-match", (roomId, category) => {
      console.log("sm"+category)
      navigate("/duel", {
        state: {
          roomId: roomId,
          category: category
        }
      });
    });
=======
    //socketRef.current = io("http://localhost:4000", {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true
    });

    const socket = socketRef.current;
>>>>>>> origin/main


    const register = () => {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

<<<<<<< HEAD
    socket.on("chat-rejected", ({ by }) => {
      alert("Chat request rejected");
    });

    // 🔹 chat accepted
    socket.on("chat-started", ({ roomId }) => {
      console.log("s " + roomId);
      navigate(`/chat/${roomId}`);
    });
=======
  // 🔥 guard against first-login race
  if (!userId || !username) return;

  socket.emit("register-user", {
    userId,
    username
  });
};


    // const register = () => {
    //   if (userId && username) {
    //     socket.emit("register-user", { userId, username });
    //   }
    // };

    // 🔥 REGISTER ON FIRST CONNECT
    //register();

    // 🔥 REGISTER ON EVERY RECONNECT
    //socket.on("connect", register);
    // 🔥 REGISTER ONLY AFTER CONNECT
socket.on("connect", () => {
  register(); // ✅ run once per connection
});

socket.on("receive-invite", ({ from }) => {
  console.log("🎮 Duel invite received from:", from);
  setInvite(from);
});
  
// Add this too - to navigate when invite is accepted
socket.on("start-match", (roomId) => {
  console.log("Starting match with room:", roomId);
  navigate(`/duel`);
});


    /* INVITE */
    // socket.on("receive-invite", ({ from }) => {
    //   setInvite(from);
    // });

    /* CHAT REQUEST */
    // socket.on("receive-chat-request", ({ from }) => {
    //   navigate("/chat-request", { state: { from } });
    // });

    // socket.on("chat-rejected", () => {
    //   alert("Chat request rejected");
    // });
>>>>>>> origin/main

    return () => {
      socket.off("connect", register);
      socket.off("receive-invite");
      socket.off("start-match");
<<<<<<< HEAD
      socket.off("receive-chat-request");
      socket.off("chat-started");
      socket.off("chat-rejected");
=======
      //socket.off("receive-chat-request");
      //socket.off("chat-rejected");
      //socket.disconnect();
>>>>>>> origin/main
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, invite, setInvite }}>
      {children}
    </SocketContext.Provider>
  );
};

<<<<<<< HEAD
export const useSocket = () => useContext(SocketContext);
=======
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};



>>>>>>> origin/main
