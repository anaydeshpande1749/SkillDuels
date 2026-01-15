//this is socketcontext.jsx

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [invite, setInvite] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    //socketRef.current = io("http://localhost:4000", {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true
    });

    const socket = socketRef.current;


    const register = () => {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

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

    return () => {
      socket.off("connect", register);
      socket.off("receive-invite");
      socket.off("start-match");
      //socket.off("receive-chat-request");
      //socket.off("chat-rejected");
      //socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, invite, setInvite }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};



