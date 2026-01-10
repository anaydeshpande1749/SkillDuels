import React,{useState,useEffect,useContext} from "react"
import { IdContext } from "./Appcontext"
import "./All.css"
import axios from "axios"
import { useSocket } from "./SocketContext";
import {useParams} from "react-router-dom"






function Invitefriends()
{
    const [friends,setFriends]=useState([])
    const {id}=useContext(IdContext)
     const { socket } = useSocket();
     const {category}=useParams()

    useEffect(()=>{
    
        axios.get("http://localhost:9000/users/friends")
        .then((res)=>{
            setFriends(res.data)
            console.log(res.data)
        })
        .catch((err)=>{
            console.log(err)
        })


    },[])

    function handleInvite(friendId)
    {
        const userid=id;
        const friend_id=friendId;
        socket.emit("send-invite", {
         from: userid,
         to: friend_id
         
    });

    }


    return (

          <div className="friends-container">
      <h1 className="friends-title">Friends List</h1>

      <div className="friends-list">
        {friends.map((friend, index) => (
          <div className="friend-card" key={index}>
            <p className="friend-name">{friend.fullName}</p>
            <p className="friend-email">{friend.email}</p>
            <button
              className="invite-btn"
              onClick={() => handleInvite(friend.friend_id)}
            >Invite</button>
          </div>
        ))}
      </div>
    </div>
    )



}

export default Invitefriends;