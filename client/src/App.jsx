import { useEffect, useState } from "react";
import socket from "./services/socket";
import "./App.css";
import CodeEditor from "./features/editor/CodeEditor";
import VideoCall from "./features/video/VideoCall";
import LandingPage from "./landing/LandingPage";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ProtectedRoute from "./auth/ProtectedRoute";

function CollaborationApp() {
  const [connected, setConnected] = useState(false);

  const [roomId, setRoomId] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [participants, setParticipants] = useState(0);
  const [message, setMessage] = useState("");
  const [isInitiator, setIsInitiator] = useState(false);

  useEffect(() => {
    function handleConnect() {
      setConnected(true);
      console.log("Connected:", socket.id);
    }

    function handleDisconnect() {
      setConnected(false);
      setRoomId("");
      setParticipants(0);
      setMessage("Disconnected from server. Please reconnect.");
    }
    // Room created successfully
    // function handleRoomCreated(data) {
    //   setRoomId(data.roomId);
    //   setParticipants(data.participants);
    //   setMessage("Room created successfully!");
    // }
    function handleRoomCreated(data) {
  setRoomId(data.roomId);
  setParticipants(data.participants);
  setIsInitiator(true);
  setMessage("Room created successfully!");
}
     // Room joined successfully
    // function handleRoomJoined(data) {
    //   setRoomId(data.roomId);
    //   setParticipants(data.participants);
    //   setMessage("Joined room successfully!");
    // }
    function handleRoomJoined(data) {
  setRoomId(data.roomId);
  setParticipants(data.participants);
  setIsInitiator(false);
  setMessage("Joined room successfully!");
}
     // Room error
    function handleRoomError(data) {
      setMessage(data.message);
    }
    // Another user joined
    function handleUserJoined(data) {
      setParticipants(data.participants);
      setMessage("Your partner joined the room!");
    }

    // Another user left
    function handleUserLeft(data) {
      setParticipants(data.participants);
      setMessage("Your partner left the room.");
    }
     // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.on("room:created", handleRoomCreated);
    socket.on("room:joined", handleRoomJoined);
    socket.on("room:error", handleRoomError);
    socket.on("room:user-joined", handleUserJoined);
    socket.on("room:user-left", handleUserLeft);

    socket.connect();

     // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);

      socket.off("room:created", handleRoomCreated);
      socket.off("room:joined", handleRoomJoined);
      socket.off("room:error", handleRoomError);
      socket.off("room:user-joined", handleUserJoined);
      socket.off("room:user-left", handleUserLeft);

      socket.disconnect();
    };
  }, []);

  // Create a new room
  function createRoom() {
    setMessage("");
    socket.emit("room:create");
  }

  // Join an existing room
  function joinRoom(e) {
    if (e) e.preventDefault();

    const trimmedRoomId = roomInput.trim();
    if (!trimmedRoomId) {
      setMessage("Please enter a Room ID.");
      return;
    }

    setMessage("");

    socket.emit("room:join", {
      roomId: trimmedRoomId,
    });
  }

  // Leave current room
  function leaveRoom() {
    socket.emit("room:leave");
    setIsInitiator(false);
    setRoomId("");
    setParticipants(0);
    setMessage("You left the room.");
  }

  // Copy Room ID
  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      setMessage("Room ID copied!");
    } catch {
      setMessage("Could not copy Room ID. Please copy it manually.");
    }
  }

  return (
    <div className="app-container">

      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <h1>CodeMeet<span>.</span></h1>
          <p>Collaborative Interview Platform</p>
        </div>

        <div className={connected ? "connection online" : "connection offline"}>
          <span className="connection-dot"></span>
          {connected ? "Connected" : "Disconnected"}
        </div>
      </header>

      <main className="app-main">

        {/* No active room */}
        {!roomId && (
          <section className="room-card">
            <div className="room-heading">
              <h2>Start your coding session</h2>
              <p>Create a room or join your partner's room.</p>
            </div>

            <button
              className="primary-btn"
              onClick={createRoom}
              disabled={!connected}
            >
              + Create New Room
            </button>

            <div className="room-divider">
              <span>OR</span>
            </div>

            <form className="join-section" onSubmit={joinRoom}>
              <label htmlFor="roomId">Join with Room ID</label>

              <input
                id="roomId"
                type="text"
                placeholder="Enter Room ID (e.g. CM-A1B2C3)"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                autoComplete="off"
              />

              <button
                type="submit"
                className="secondary-btn"
                disabled={!connected || !roomInput.trim()}
              >
                Join Room
              </button>
            </form>

            {message && (
              <p className="message">{message}</p>
            )}
          </section>
        )}

        {/* Active room */}
        {roomId && (
          <section className="workspace">

            <div className="room-info">
              <div>
                <span className="room-label">YOUR ROOM</span>
                <h2>{roomId}</h2>
              </div>

              <button className="copy-btn" onClick={copyRoomId}>
                Copy ID
              </button>

              <div className="participant-info">
                <span className="participant-dot"></span>
                {participants}/2 Participants
              </div>

              <button className="leave-btn" onClick={leaveRoom}>
                Leave Room
              </button>
            </div>

            {message && (
              <p className="message">{message}</p>
            )}
            <div className="workspace-content">

  {/* Left: Video Section */}
  <aside className="video-column">
  <VideoCall
    roomId={roomId}
    participants={participants}
    isInitiator={isInitiator}
  />
</aside>

  {/* Right: Code Editor */}
  <div className="editor-column">
    <CodeEditor />
  </div>

</div>

          </section>
        )}

      </main>
    </div>
  );
}

// function App() {
//   const [showWorkspace, setShowWorkspace] = useState(false);

//   if (!showWorkspace) {
//     return <LandingPage onGetStarted={() => setShowWorkspace(true)} />;
//   }

//   return <CollaborationApp />;
// }

function App() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onGetStarted={() => navigate("/login")}
          />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/workspace" element={<CollaborationApp />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
