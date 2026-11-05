
// import { useEffect, useRef, useState } from "react";
// import "./VideoCall.css";

// function VideoCall() {
//   const localVideoRef = useRef(null);
//   const [stream, setStream] = useState(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const startCamera = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const mediaStream =
//         await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });

//       setStream(mediaStream);
//     } catch (err) {
//       console.error("Camera access error:", err);
//       setError("Camera/Microphone access denied or unavailable.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (localVideoRef.current && stream) {
//       localVideoRef.current.srcObject = stream;
//     }
//   }, [stream]);

//   useEffect(() => {
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [stream]);

//   return (
//     <div className="video-call">
//       <h3>Your Camera</h3>

//       <video
//         ref={localVideoRef}
//         autoPlay
//         playsInline
//         muted
//         className="local-video"
//       />

//       {!stream && (
//         <button onClick={startCamera} disabled={loading}>
//           {loading ? "Starting..." : "Start Camera"}
//         </button>
//       )}

//       {error && <p className="error">{error}</p>}
//     </div>
//   );
// }

// export default VideoCall;



import { useEffect, useRef, useState } from "react";
import useWebRTC from "./useWebRTC";
import "./VideoCall.css";

function VideoCall({ roomId, participants, isInitiator }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { remoteStream, connectionState } = useWebRTC({
    roomId,
    localStream: stream,
    participants,
    isInitiator,
  });

  const startCamera = async () => {
    try {
      setLoading(true);
      setError("");

      const mediaStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      setStream(mediaStream);
    } catch (err) {
      console.error(err);
      setError("Camera/Microphone access denied or unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="video-call">
      <div className="video-card">
        <h3>Your Camera</h3>

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="local-video"
        />
      </div>

      <div className="video-card">
        <h3>Partner Camera</h3>

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="remote-video"
        />

        {!remoteStream && (
          <p className="video-status">
            Waiting for partner...
          </p>
        )}
      </div>

      {!stream && (
        <button onClick={startCamera} disabled={loading}>
          {loading ? "Starting..." : "Start Camera"}
        </button>
      )}

      <p className="connection-status">
        WebRTC: {connectionState}
      </p>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default VideoCall;
