import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "./SocketContext";
import "./All.css";

function ChatRequest() {
  const { state } = useLocation();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const acceptChat = () => {
    socket.emit("accept-chat", {
      from: state.from,
      to: localStorage.getItem("userId")
    });
  };

  const rejectChat = () => {
    socket.emit("reject-chat", {
      from: state.from,
      to: localStorage.getItem("userId")
    });

    navigate(-1); // go back or to friends page
  };

  return (
    <div className="chat-request-container">
      <div className="chat-request-box">
        <h3>Chat request from {state.from}</h3>

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
