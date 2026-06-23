const express = require("express");

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  uploadEventBanner,
} = require("../controllers/event.controller");

const upload = require("../middleware/upload.middleware");

const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/",
  //verifyToken,
  upload.single("banner"),
  createEvent
);

router.get("/", getAllEvents);

router.get(
  "/organizer/mine",
  //verifyToken,
  getMyEvents
);

router.get("/:id", getEventById);

router.put("/:id", 
  //verifyToken, 
  updateEvent);

router.post(
  "/:id/banner",
  //verifyToken,
  upload.single("banner"),
  uploadEventBanner
);

router.delete("/:id", verifyToken, 
  deleteEvent);

module.exports = router;
