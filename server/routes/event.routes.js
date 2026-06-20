const express = require("express");

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/event.controller");

const upload = require("../middleware/upload.middleware");

const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/",
  verifyToken,
  upload.single("banner"),
  createEvent
);

router.get("/", getAllEvents);

router.get("/:id", getEventById);

router.put("/:id", verifyToken, updateEvent);

router.delete("/:id", verifyToken, deleteEvent);

module.exports = router;
