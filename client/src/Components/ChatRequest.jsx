//this is chat request.jsx

import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "./SocketContext";
import { useEffect } from "react";
import "./All.css";

function ChatRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const userId = localStorage.getItem("userId");
  const from = location.state?.from;

  useEffect(() => {
  if (!from) navigate("/chatfriends");

  socket.once("chat-started", ({ roomId }) => {
    navigate(`/chat/${roomId}`);
  });

  return () => {
    socket.off("chat-started");
  };
}, []);


  const acceptChat = () => {
    socket.emit("accept-chat", {
      from,
      to: userId
    });
  };

  const rejectChat = () => {
    socket.emit("reject-chat", {
      from,
      to: userId
    });
    navigate("/chatfriends");
  };



  return (
    <div className="chat-request-container">
      <div className="chat-request-box">
        <h3>Chat request from {from}</h3>

        <div className="chat-request-actions">
          <button className="accept-btn" onClick={acceptChat}>
            Accept
          </button>

          <button className="reject-btn" onClick={rejectChat}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatRequest;


