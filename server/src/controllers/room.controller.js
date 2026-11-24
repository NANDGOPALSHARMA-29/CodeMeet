const crypto = require("crypto");
const Room = require("../models/Room");

const createRoom = async (req, res) => {
  try {
    const roomId = `CM-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const room = await Room.create({
      roomId,
      interviewer: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: {
        id: room._id,
        roomId: room.roomId,
        status: room.status,
      },
    });
  } catch (error) {
    console.error("Create room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create room",
    });
  }
};

module.exports = { createRoom };
