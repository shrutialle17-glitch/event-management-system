const Event = require("../models/Event");
const User = require('../models/User');
const Registration = require('../models/Registration');
const uploadToCloudinary = require("../utils/cloudinaryUpload");
// Create Event
const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      date: req.body.date,
      time: req.body.time,
      venue: req.body.venue,
      capacity: req.body.capacity,
      price: req.body.price,
      isOnline: req.body.isOnline,
      tags: req.body.tags,
      bannerUrl: req.file?.path || "",
      //organizer: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate(
      "organizer",
      "name email"
    );

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Event By Id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      event.organizer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      event.organizer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Organizer Events
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload Event Banner
const uploadEventBanner = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
  
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      event.organizer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload banner image",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    event.bannerUrl = result.secure_url;

    await event.save();

    res.status(200).json({
      success: true,
      message: "Banner uploaded successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    // Ownership check
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to cancel this event');
    }

    if (event.status === 'cancelled') {
      return sendError(res, 400, 'Event is already cancelled');
    }

    event.status = 'cancelled';
    await event.save();


    if (recipientIds.length > 0) {
      await notify({
        recipientIds,
        type: 'event-cancelled',
        title: `Event Cancelled: ${event.title}`,
        message: `The event ${event.title} has been cancelled.`,
        eventId: event._id,
        event: event,
      });
    }

    // Cancel all active registrations
    await Registration.updateMany(
      { event: event._id, status: 'registered' },
      { $set: { status: 'cancelled' } }
    );

    return sendSuccess(res, 200, 'Event cancelled successfully', event);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  cancelEvent,
  getMyEvents,
  uploadEventBanner,
};