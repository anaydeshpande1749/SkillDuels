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

  const API = import.meta.env.VITE_API_BASE_URL;
  //const [incomingInvite, setIncomingInvite] = useState(null);


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


// useEffect(() => {
//   if (!socket) return;

//   const onInvite = ({ from }) => {
//     console.log("📨 Duel invite from:", from);
//     setIncomingInvite(from); // 🔥 local state = stable
//   };

//   socket.on("receive-invite", onInvite);

//   return () => {
//     socket.off("receive-invite", onInvite);
//   };
// }, [socket]);


  /* ---------------- FETCH USERS (PORT 4000) ---------------- */
  useEffect(() => {
    axios
      //.get("http://localhost:4000/api/users")
      .get(`${API}/api/users`)
      
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

        <div className="friend-card" key={friend.friend_id || friend._id  }  >
          <p className="friend-name">
            {friend.username || friend.fullName || friend.profile?.username }
          </p>

          <p className="friend-email">{friend.email}</p>

          <button
            className="invite-btn bg-amber-300 "
            onClick={() => handleInvite( friend._id || friend.friend_id)}
          >
            Invite
          </button>
        </div>

        ))}
      </div>

        {/* {incomingInvite && (
  <div className="invite-overlay">
    <div className="invite-modal">
      <h2>🎮 Duel Invitation</h2>
      <p>User wants to duel!</p>

      <div className="invite-actions">
        <button
          className="accept-btn"
          onClick={() => {
            socket.emit("accept-invite", {
              from: incomingInvite,
              to: userId
            });
            setIncomingInvite(null);
          }}
        >
          Accept
        </button>

        <button
          className="reject-btn"
          onClick={() => {
            socket.emit("reject-invite", {
              from: incomingInvite
            });
            setIncomingInvite(null);
          }}
        >
          Reject
        </button>
      </div>
    </div>
  </div>
)} */}



    </div>
  );
}

export default Invitefriends;





