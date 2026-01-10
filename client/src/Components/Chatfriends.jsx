//this is chatfriends.jsx

import { useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./All.css";


function Chatfriends() {
  const [friends, setFriends] = useState([]);
  const { socket } = useSocket();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const userId = localStorage.getItem("userId");


  const leavefriends = () => {
  //socket.emit("leave-chat-room", { roomId });
  navigate("/dashboard");
};

  /* ---------------- FETCH USERS (PORT 4000) ---------------- */
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/users") // ✅ correct server
      .then((res) => {
        // remove self from list
        const filtered = res.data.filter(
          (u) => u._id !== userId
        );
        setFriends(filtered);
      })
      .catch((err) => {
        console.error("Friends fetch error:", err);
      });
  }, [userId]);

  /* ---------------- SOCKET LISTENERS ---------------- */
  useEffect(() => {
    if (!socket) return;

    socket.on("receive-chat-request", ({ from, fromName }) => {
      const accept = window.confirm(
        `${fromName} wants to chat. Accept?`
      );


      if (accept) {
        socket.emit("accept-chat", {
          from,
          to: userId
        });
      } else {
        socket.emit("reject-chat", {
          from,
          to: userId
        });
      }
    });

    socket.on("chat-started", ({ roomId }) => {
      navigate(`/chat/${roomId}`);
    });

    socket.on("chat-rejected", ({ by }) => {
      alert(`Chat rejected by ${by}`);
    });

    return () => {
      socket.off("receive-chat-request");
      socket.off("chat-started");
      socket.off("chat-rejected");
    };
  }, [socket, userId, navigate]);

  /* ---------------- SEND CHAT REQUEST ---------------- */
const sendChatRequest = (friendId) => {
  if (!socket || !userId || !storedUser) return;

  const fromName =
    storedUser.profile?.username || storedUser.fullName;

  socket.emit("send-chat-request", {
    from: userId,
    fromName,
    to: friendId
  });
};


  return (
    <div className="chatfriends-container">
      <h2>Friends</h2>
       <button className="back-btn" onClick={leavefriends}>
           ← Back
      </button>

      {friends.map((f) => (
        <div className="friend-card" key={f.friend_id}>
          <span className="friend-name">
            {f.profile?.username || f.fullName}
          </span>

          <button
            className="chat-btn"
            onClick={() => sendChatRequest(f.friend_id)}
          >
            Chat
          </button>
        </div>
      ))}
    </div>
  );
}

export default Chatfriends;



