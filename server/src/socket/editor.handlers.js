function registerEditorHandlers(io, socket) {
  // Collaborative Code Synchronization
  socket.on("code:update", (data) => {
    const roomId = socket.data.roomId;

    // User must be in a room and code must be a string
    if (!roomId || typeof data?.code !== "string") {
      return;
    }

    // Send updated code to other room members
    socket.to(roomId).emit("code:updated", {
      code: data.code,
    });
  });
}

module.exports = registerEditorHandlers;
