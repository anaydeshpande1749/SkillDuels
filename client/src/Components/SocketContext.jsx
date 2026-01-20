//this is socketcontext.jsx

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const SocketContext = createContext();

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000");

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [invite, setInvite] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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


    const register = () => {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

    socket.on("chat-rejected", ({ by }) => {
      alert("Chat request rejected");
    });

    // 🔹 chat accepted
    socket.on("chat-started", ({ roomId }) => {
      console.log("s " + roomId);
      navigate(`/chat/${roomId}`);
    });

    return () => {
      socket.off("connect", register);
      socket.off("receive-invite");
      socket.off("start-match");
      socket.off("receive-chat-request");
      socket.off("chat-started");
      socket.off("chat-rejected");
    };
  };
}, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, invite, setInvite }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
