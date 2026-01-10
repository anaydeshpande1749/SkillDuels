//this is duelresult.jsx

import React, { useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useParams } from "react-router-dom";
import "./All.css";

function Duelresult() {
  const { roomId } = useParams();
  const { socket } = useSocket();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !roomId) return;

    // ask backend for leaderboard (safe fallback)
    socket.emit("get-leaderboard", { roomId });

    const handleQuizEnd = ({ leaderboard }) => {
      setLeaderboard(leaderboard);
      setLoading(false);
    };

    const handleLeaderboardData = ({ leaderboard }) => {
      setLeaderboard(leaderboard);
      setLoading(false);
    };

    socket.on("quiz-end", handleQuizEnd);
    socket.on("leaderboard-data", handleLeaderboardData);

    return () => {
      socket.off("quiz-end", handleQuizEnd);
      socket.off("leaderboard-data", handleLeaderboardData);
    };
  }, [socket, roomId]);

  if (loading) {
    return (
      <div className="leaderboard">
        <h2>🏆 Leaderboard</h2>
        <p>Waiting for results...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>

      {leaderboard.length === 0 && (
        <p>No results available</p>
      )}

      {leaderboard.map((player, index) => (
        <div className="leaderboard-row" key={index}>
          <span className="leaderboard-rank">
            #{index + 1}
          </span>
          <span className="leaderboard-name">
            {player.username}
          </span>
          <span className="leaderboard-score">
            {player.score}
          </span>
        </div>
      ))}
    </div>
  );
}

export default Duelresult;



// import React,{useEffect,useState} from "react"
// import { useSocket } from "./SocketContext";
// import "./All.css"
// import { useParams } from "react-router-dom";


// function Duelresult()
// {
//   const { roomId } = useParams();
//   console.log(roomId)
//   const { socket } = useSocket();
//   const [leaderboard, setLeaderboard] = useState([]);


//    useEffect(() => {
//     if (!socket || !roomId) return;

//     // 🔥 explicitly ask for THIS room's leaderboard
//     socket.emit("get-leaderboard", { roomId });

//     socket.on("quiz-end", ({ leaderboard }) => {
//       setLeaderboard(leaderboard);
//     });

//     socket.on("leaderboard-data", ({ leaderboard }) => {
//       setLeaderboard(leaderboard);
//     });

//     return () => {
//       socket.off("quiz-end");
//       socket.off("leaderboard-data");
//     };
//   }, [socket, roomId]);

  
// return(
//     <div>
//       {leaderboard.length > 0 && (
//         <div className="leaderboard">
//           <h2>🏆 Leaderboard</h2>

//           {leaderboard.map((p, i) => (
//             <div  className="leaderboard-row">
//              {p.username}: <span>{p.score}</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
    


//   )
// }
// export default Duelresult;