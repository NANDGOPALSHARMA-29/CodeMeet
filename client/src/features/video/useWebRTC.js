
import { useEffect, useRef, useState } from "react";
import socket from "../../services/socket";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function useWebRTC({ roomId, localStream, participants, isInitiator }) {
  const peerRef = useRef(null);
  const pendingCandidates = useRef([]);

  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("new");
  const [peerReady, setPeerReady] = useState(false);

  useEffect(() => {
    if (!roomId || !localStream) return;

    const peer = new RTCPeerConnection(ICE_SERVERS);
    peerRef.current = peer;
    pendingCandidates.current = [];

    // Add local camera and microphone tracks
    localStream.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
    });

    // Receive remote video/audio
    peer.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Send ICE candidates to partner
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call:ice-candidate", {
          candidate: event.candidate,
        });
      }
    };

    peer.onconnectionstatechange = () => {
      setConnectionState(peer.connectionState);
    };

    async function addPendingCandidates() {
      for (const candidate of pendingCandidates.current) {
        await peer.addIceCandidate(candidate);
      }

      pendingCandidates.current = [];
    }

    // Receive offer from room creator
    async function handleOffer(data) {
      try {
        await peer.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        await addPendingCandidates();

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("call:answer", {
          answer: peer.localDescription,
        });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    }

    // Receive answer from partner
    async function handleAnswer(data) {
      try {
        await peer.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        await addPendingCandidates();
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }

    // Receive ICE candidates
    async function handleIceCandidate(data) {
      try {
        const candidate = new RTCIceCandidate(data.candidate);

        if (peer.remoteDescription) {
          await peer.addIceCandidate(candidate);
        } else {
          pendingCandidates.current.push(candidate);
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }

    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIceCandidate);

    setPeerReady(true);

    return () => {
      setPeerReady(false);

      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIceCandidate);

      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.close();

      if (peerRef.current === peer) {
        peerRef.current = null;
      }

      setRemoteStream(null);
      setConnectionState("new");
    };
  }, [roomId, localStream]);

  // Only room creator initiates the offer
  useEffect(() => {
    async function createOffer() {
      const peer = peerRef.current;

      if (
        !peer ||
        !peerReady ||
        !isInitiator ||
        participants !== 2 ||
        peer.signalingState !== "stable"
      ) {
        return;
      }

      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("call:offer", {
          offer: peer.localDescription,
        });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    }

    createOffer();
  }, [participants, isInitiator, peerReady]);

  return {
    remoteStream,
    connectionState,
  };
}

export default useWebRTC;
