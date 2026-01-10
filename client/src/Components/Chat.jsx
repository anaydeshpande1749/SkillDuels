import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import "./All.css"

function Chat() {
  const { roomId } = useParams();
  console.log(roomId)
  const { socket } = useSocket();
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const user=localStorage.getItem("username")
  console.log(user)

  useEffect(() => {
    console.log(roomId)
    socket.emit("join-chat-room", {roomId});
    

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    console.log(messages)


    return () => socket.off("receive-message");
  }, []);

  const sendMessage = () => {
    socket.emit("send-message", {
      roomId,
      message: msg,
      sender:localStorage.getItem("username")
      
      
    });
   
    setMsg("");
  };
  console.log(messages)

  return (
  <div className="chat-container">
    <div className="chat-header">Chat</div>

    <div className="chat-messages">
      {messages.map((m, i) => (
  <div
    key={i}
    className={`chat-message ${
      m.sender === localStorage.getItem("username")
        ? "sent"
        : "received"
    }`}
  >
    <b>{m.sender}</b>
    {m.message}
  </div>
))}
    </div>

    <div className="chat-input">
      <input
        type="text"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  </div>
);
}

export default Chat;
