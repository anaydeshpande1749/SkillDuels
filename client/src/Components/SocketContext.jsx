import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const SocketContext = createContext();

const socket = io("http://localhost:9000");

export const SocketProvider = ({ children }) => {
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
    socket.on("receive-invite", ({ from }) => {
      setInvite(from);
    });

    socket.on("start-match", (roomId) => {
      navigate("/duel");
    });

    /* =======================
       CHAT LOGIC ✅
    ======================= */

    // 🔹 chat request received
    socket.on("receive-chat-request", ({ from }) => {
      navigate("/chat-request", { state: { from } });
    });

    socket.on("chat-rejected", ({ by }) => {
  alert("Chat request rejected");
});


    // 🔹 chat accepted
    socket.on("chat-started", ({ roomId }) => {
      console.log("s "+roomId)
      navigate(`/chat/${roomId}`);
    });

    return () => {
      socket.off("receive-invite");
      socket.off("start-match");
      socket.off("receive-chat-request");
      socket.off("chat-started");
      socket.off("chat-rejected");

    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, invite, setInvite }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
