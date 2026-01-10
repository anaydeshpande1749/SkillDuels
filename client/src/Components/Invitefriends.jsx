//this is invitefriends.jsx

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./All.css";
import { IdContext } from "./Appcontext";
import { useSocket } from "./SocketContext";
import { useNavigate } from "react-router-dom";

function Invitefriends() {
  const [friends, setFriends] = useState([]);
  const { userId } = useContext(IdContext);
  const { socket } = useSocket();
  const navigate = useNavigate();

   const backfrominvite = () => {
  //socket.emit("leave-chat-room", { roomId });
  navigate("/dashboard/duel");
};

useEffect(() => {
  if (!socket) return;

  socket.emit("get-online-users");

  socket.on("online-users", (onlineIds) => {
    // filter only online friends
    setFriends((prev) =>
      prev.filter((f) => onlineIds.includes(f.friend_id))
    );
  });

  return () => socket.off("online-users");
}, [socket]);



  /* ---------------- FETCH USERS (PORT 4000) ---------------- */
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/users")
      
      // .then((res) => {
      //   // remove self from list
      //   const filtered = res.data.filter(
      //     (u) => u._id !== userId
      //   );
      //   setFriends(filtered);
      // })

      .then((res) => {
        // 🔥 backend returns friend_id not _id
        const filtered = res.data.filter(
          (u) => u.friend_id !== userId
        );
        setFriends(filtered);
      })

      .catch((err) => {
        console.error("Friends fetch error:", err);
      });
  }, [userId]);

  /* ---------------- SEND INVITE ---------------- */
  const handleInvite = (friendId) => {
    if (!socket || !userId) return;

    socket.emit("send-invite", {
      from: userId,
      to: friendId
    });
  };

  return (
    <div className="friends-container">
      <h1 className="friends-title">Invite a Friend</h1>
      <button className="back-btn" onClick={backfrominvite}>
           ← Back
      </button>

      <div className="friends-list">
        {friends.map((friend) => (
          // <div className="friend-card" key={friend._id}>
          //   <p className="friend-name">
          //     {friend.profile?.username || friend.fullName}
          //   </p>
          //   <p className="friend-email">{friend.email}</p>

          //   <button
          //     className="invite-btn"
          //     onClick={() => handleInvite(friend._id)}
          //   >
          //     Invite
          //   </button>
          // </div>

        <div className="friend-card" key={friend.friend_id}>
          <p className="friend-name">
            {friend.username || friend.fullName}
          </p>

          <p className="friend-email">{friend.email}</p>

          <button
            className="invite-btn"
            onClick={() => handleInvite(friend.friend_id)}
          >
            Invite
          </button>
        </div>

        ))}
      </div>
    </div>
  );
}

export default Invitefriends;





