//this is invitemodal.jsx

import React, { useContext } from "react";
import { useSocket } from "./SocketContext";
import { IdContext } from "./Appcontext";
import "./All.css";

const InviteModal = () => {
  const { invite, setInvite, socket } = useSocket();
  const { userId } = useContext(IdContext);

  if (!invite) return null;

  const acceptInvite = () => {
<<<<<<< HEAD
    console.log("im"+invite.category)
    socket.emit("accept-invite", {
      from: invite.from,
      to: id,
      category:invite.category
=======
    if (!socket || !userId) return;

    socket.emit("accept-invite", {
      from: invite,
      to: userId
>>>>>>> origin/main
    });

    setInvite(null);
  };

  const rejectInvite = () => {
    if (!socket || !userId) return;

    socket.emit("reject-invite", {
<<<<<<< HEAD
      from: invite.from,
      to: id
=======
      from: invite,
      to: userId
>>>>>>> origin/main
    });

    setInvite(null);
  };

  return (
    <div className="invite-overlay">
      <div className="invite-modal">
        <h2>🎮 Duel Invitation</h2>
        <p>You have been challenged!</p>

        <div className="invite-actions">
          <button className="accept-btn" onClick={acceptInvite}>
            Accept
          </button>
          <button className="reject-btn" onClick={rejectInvite}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;

