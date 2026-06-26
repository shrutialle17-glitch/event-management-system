const Event = require("../models/Event");
const User = require('../models/User');
const Registration = require('../models/Registration');
const notify = require('../utils/notify');
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const { sendSuccess, sendError } = require("../utils/apiResponse");
// Create Event
// @desc    Create new event
// @route   POST /api/events
// @access  Protected (Organizer, Admin)
const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, organizer: req.user._id };
    
    // Prevent organizers from publishing directly without admin approval
    if (req.user.role !== 'admin' && eventData.status === 'published') {
      eventData.status = 'pending-approval';
    }

    const event = await Event.create(eventData);
    return sendSuccess(res, 201, 'Event created successfully', event);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Get All Events
const getEvents = async (req, res) => {
  try {
    const { category, date, search, time, page = 1, limit = 10 } = req.query;

    // Show both published (upcoming) and completed (past) events to the public
    let query = { status: { $in: ['published', 'completed'] } };

    if (category) query.category = category;

    // Time filter (upcoming vs past)
    if (time === 'upcoming') {
      query.date = { ...query.date, $gte: new Date() };
      // Upcoming: only show properly published events
      query.status = { $in: ['published'] };
    } else if (time === 'past') {
      query.date = { ...query.date, $lt: new Date() };
      // Past: also include pending-approval events (they already happened)
      query.status = { $in: ['published', 'completed', 'pending-approval'] };
    }

    if (date) {
      // Very basic date filtering (matches exactly the day if it's a YYYY-MM-DD string)
      // For more complex ranges, we could expand this.
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.date = { ...query.date, $gte: startOfDay, $lte: endOfDay };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .populate('organizer', 'name email avatarUrl')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: 1 });

    const total = await Event.countDocuments(query);

    return sendSuccess(res, 200, 'Events fetched successfully', {
      events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Get Event By Id
// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email avatarUrl');

    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    return sendSuccess(res, 200, 'Event fetched successfully', event);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Update Event
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    // Ownership check
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to update this event');
    }

    // Prevent organizers from publishing directly without admin approval
    if (req.user.role !== 'admin' && req.body.status === 'published') {
      req.body.status = 'pending-approval';
    }

    // If status changes to pending-approval, clear any previous rejection reasons
    if (req.body.status === 'pending-approval') {
      req.body.rejectionReason = '';
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Notify registered users of the update
    const registrations = await Registration.find({ event: event._id, status: 'registered' });
    const recipientIds = registrations.map(reg => reg.user);

    if (recipientIds.length > 0) {
      await notify({
        recipientIds,
        type: 'event-updated',
        title: `Event Updated: ${event.title}`,
        message: `The details for ${event.title} have been updated.`,
        eventId: event._id,
        event: event,
      });
    }

    return sendSuccess(res, 200, 'Event updated successfully', event);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return sendError(res, 404, 'Event not found');
    }

    // Ownership check
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to delete this event');
    }

    await event.deleteOne();
    return sendSuccess(res, 200, 'Event deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
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
const getPublicStats = async (req, res) => {
  try {
    const [totalEvents, totalUsers, eventsHosted, totalRegistrations] = await Promise.all([
      Event.countDocuments({ status: { $in: ['published', 'completed'] } }),
      User.countDocuments(),
      Event.countDocuments({ status: 'completed' }),
      Registration.countDocuments()
    ]);

    return sendSuccess(res, 200, 'Stats fetched successfully', {
      totalEvents,
      totalUsers,
      eventsHosted,
      totalRegistrations
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const duplicateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return sendError(res, 404, 'Event not found');

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized');
    }

    const newEvent = new Event({
      title: `${event.title} (Copy)`,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: event.venue,
      capacity: event.capacity,
      price: event.price,
      category: event.category,
      tags: event.tags,
      organizer: event.organizer,
      status: 'draft',
      bannerUrl: event.bannerUrl,
      isOnline: event.isOnline
    });

    await newEvent.save();
    return sendSuccess(res, 201, 'Event duplicated successfully', newEvent);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  cancelEvent,
  getMyEvents,
  uploadEventBanner,
  getPublicStats,
  duplicateEvent,
};