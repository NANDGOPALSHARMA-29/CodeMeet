import { useEffect, useState } from "react";
import socket from "./services/socket";
import "./App.css";
import CodeEditor from "./features/editor/CodeEditor";

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    function handleConnect() {
      setConnected(true);
      console.log("Connected:", socket.id);
    }

    function handleDisconnect() {
      setConnected(false);
      console.log("Disconnected");
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, []);
  return (
  <div className="app-container">
    <header className="app-header">
      <h1>CodeMeet</h1>

      <span className={connected ? "status online" : "status offline"}>
        {connected ? "● Connected" : "● Disconnected"}
      </span>
    </header>

    <main>
      <CodeEditor />
    </main>
  </div>
);
  // return (
  //   <div style={{ padding: "40px", color: "white" }}>
  //     <h1>CodeMeet</h1>
  //     <h2>Collaborative Editor</h2>

  //     <p>
  //       Socket Status:{" "}
  //       <strong style={{ color: connected ? "lightgreen" : "tomato" }}>
  //         {connected ? "Connected" : "Disconnected"}
  //       </strong>
  //     </p>
  //   </div>
  // );
}

export default App;