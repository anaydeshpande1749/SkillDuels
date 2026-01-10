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
    socketRef.current = io("http://localhost:9000", {
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
    register();

    // 🔥 REGISTER ON EVERY RECONNECT
    socket.on("connect", register);

    /* INVITE */
    socket.on("receive-invite", ({ from }) => {
      setInvite(from);
    });

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



