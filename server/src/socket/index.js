const { Server } = require("socket.io");
const registerRoomHandlers = require("./room.handlers");


function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });
  const rooms = new Map();
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    registerRoomHandlers(io, socket, rooms);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;