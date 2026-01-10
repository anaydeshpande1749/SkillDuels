import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import {useNavigate} from "react-router-dom"



const SocketContext = createContext();

const socket = io("http://localhost:9000");

export const SocketProvider = ({ children }) => {
  const [invite, setInvite] = useState(null);
  const navigate=useNavigate("")
  
 

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      socket.emit("register-user", userId);
      console.log("Socket registered for:", userId);
    }

    socket.on("receive-invite", ({ from }) => {
      setInvite(from);
    });

     socket.on("start-match", ({ roomId }) => {
      // ✅ NO category here
      navigate(`/duel`)
     
      //navigate(`/duel/${roomId}`);
    });

    return () => {
      socket.off("receive-invite");
      socket.off("start-match");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, invite, setInvite }}>
      
      {children}
      
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);