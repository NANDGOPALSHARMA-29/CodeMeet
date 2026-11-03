const crypto = require("crypto");

function registerRoomHandlers(io, socket, rooms) {
  // Generate a unique Room ID
  function generateRoomId() {
    let roomId;
    do {
      roomId = `CM-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    } while (rooms.has(roomId));
    
    return roomId;
  }

  // Leave current room
  async function leaveRoom(disconnecting = false) {
    const roomId = socket.data.roomId;

    if (!roomId) return;

    const members = rooms.get(roomId);

    // Leave Socket.IO room during manual leave
    if (!disconnecting) {
      await socket.leave(roomId);
    }

    if (members) {
      members.delete(socket.id);

      if (members.size === 0) {
        rooms.delete(roomId);
      }
    }

    socket.data.roomId = null;

    // Notify remaining participants
    io.to(roomId).emit("room:user-left", {
      socketId: socket.id,
      participants: members ? members.size : 0,
    });

    console.log(`${socket.id} left room ${roomId}`);
  }

  // Create Room
  socket.on("room:create", async () => {
    if (socket.data.roomId) {
      return socket.emit("room:error", {
        message: "Leave your current room first",
      });
    }

    const roomId = generateRoomId();

    rooms.set(roomId, new Set([socket.id]));

    await socket.join(roomId);

    socket.data.roomId = roomId;

    socket.emit("room:created", {
      roomId,
      participants: 1,
    });

    console.log(`${socket.id} created room ${roomId}`);
  });

  // Join Room
  socket.on("room:join", async (data) => {
    if (socket.data.roomId) {
      return socket.emit("room:error", {
        message: "Leave your current room first",
      });
    }

    const roomId = data?.roomId?.trim().toUpperCase();

    if (!roomId || !rooms.has(roomId)) {
      return socket.emit("room:error", {
        message: "Room does not exist",
      });
    }

    const members = rooms.get(roomId);

    if (members.size >= 2) {
      return socket.emit("room:error", {
        message: "Room is full",
      });
    }

    await socket.join(roomId);

    members.add(socket.id);
    socket.data.roomId = roomId;

    socket.emit("room:joined", {
      roomId,
      participants: members.size,
    });

    socket.to(roomId).emit("room:user-joined", {
      socketId: socket.id,
      participants: members.size,
    });

    console.log(`${socket.id} joined room ${roomId}`);
  });

  // Manual Leave Room
  socket.on("room:leave", () => {
    leaveRoom();
  });

  // Handle unexpected disconnection
  socket.on("disconnect", () => {
    leaveRoom(true);
  });
}

module.exports = registerRoomHandlers;
