
function registerCallHandlers(io, socket) {

  // Forward WebRTC offer to the other participant
  socket.on("call:offer", (data) => {
    const roomId = socket.data.roomId;

    if (!roomId || !data?.offer) return;

    socket.to(roomId).emit("call:offer", {
      offer: data.offer,
    });
  });

  // Forward WebRTC answer
  socket.on("call:answer", (data) => {
    const roomId = socket.data.roomId;

    if (!roomId || !data?.answer) return;

    socket.to(roomId).emit("call:answer", {
      answer: data.answer,
    });
  });

  // Forward ICE candidates
  socket.on("call:ice-candidate", (data) => {
    const roomId = socket.data.roomId;

    if (!roomId || !data?.candidate) return;

    socket.to(roomId).emit("call:ice-candidate", {
      candidate: data.candidate,
    });
  });

}

module.exports = registerCallHandlers;
