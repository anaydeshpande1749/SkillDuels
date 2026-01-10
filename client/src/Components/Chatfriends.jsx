import { useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import axios from "axios"
import "./All.css"

function Chatfriends() {
  const [friends, setFriends] = useState([]);
  const { socket } = useSocket();
  const userid = localStorage.getItem("userId");
  console.log(userid)

  useEffect(() => {
    // Example static list (replace with API)
    axios.get("http://localhost:9000/friends")
        .then((res)=>{
            setFriends(res.data)
            console.log(res.data)
        })
        .catch((err)=>{
            console.log(err)
        })
  }, []);

  const sendChatRequest = (friendId) => {
    console.log(friendId)
    const userI = localStorage.getItem("userId");
    console.log(userI)
    socket.emit("send-chat-request", {
      to: friendId,
      from: localStorage.getItem("userId")

    });
  };

  return (
  <div className="chatfriends-container">
    <h2>Friends</h2>

    {friends.map((f) => (
      <div className="friend-card" key={f.friend_id}>
        <span className="friend-name">{f.fullName}</span>
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
