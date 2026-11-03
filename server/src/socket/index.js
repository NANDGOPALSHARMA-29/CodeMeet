const { Server } = require("socket.io");

function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;