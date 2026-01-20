//this is chat.jsx

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useNavigate } from "react-router-dom";

import "./All.css";

function Chat() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { socket } = useSocket();

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  //const username = localStorage.getItem("username");
  const storedUser = JSON.parse(localStorage.getItem("user"));
const username = storedUser?.profile?.username || storedUser?.fullName || "unknown";

const leaveChat = () => {
  socket.emit("leave-chat-room", { roomId });
  navigate("/dashboard/chatfriends");
};

useEffect(() => {
  return () => {
    socket.emit("leave-chat-room", { roomId });
  };
}, []);


useEffect(() => {
  if (!socket || !roomId) return;

  socket.emit("join-chat-room", { roomId });
  socket.emit("get-chat-history", { roomId });

  const handleHistory = (history) => setMessages(history);
  const handleMessage = (data) =>
    setMessages((prev) => [...prev, data]);

  socket.on("chat-history", handleHistory);
  socket.on("receive-message", handleMessage);

  return () => {
    socket.off("chat-history", handleHistory);
    socket.off("receive-message", handleMessage);
  };
}, [socket, roomId]);


  const sendMessage = () => {
    if (!msg.trim()) return;

    socket.emit("send-message", {
      roomId,
      message: msg,
      sender: username
    });

    setMsg("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Chat</div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-message ${
              m.sender === username ? "sent" : "received"
            }`}
          >
            <b>{m.sender}</b>
            <span>{m.message}</span>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
        <button className="back-btn" onClick={leaveChat}>
           ← Back
      </button>

      </div>
    </div>
  );
}

export default Chat;





