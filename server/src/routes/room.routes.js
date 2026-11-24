const express = require("express");
const router = express.Router();

const { createRoom } = require("../controllers/room.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Create room - Interviewer only
router.post(
  "/create",
  protect,
  authorizeRoles("interviewer"),
  createRoom
);

module.exports = router;
