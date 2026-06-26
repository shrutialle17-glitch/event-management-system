const Feedback = require("../models/Feedback");
const Event = require("../models/Event");
const Registration = require('../models/Registration');
//const { checkAndAwardBadges } = require('../utils/checkAndAwardBadges');
const { sendSuccess, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Protected (User)
const createFeedback = async (req, res) => {
  const { eventId, rating, comment } = req.body;
  const userId = req.user._id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return sendError(res, 404, "Event not found");

     // Only users who were checked-in at the event can leave feedback
    const registration = await Registration.findOne({
      user: userId,
      event: eventId,
      status: 'checked-in',
    });

    if (!registration) {
      return sendError(res, 403, 'Only attendees who checked in to this event can submit feedback');
    }
    // Create feedback (unique compound index will throw error if user already reviewed)
    let feedback;
    try {
      feedback = await Feedback.create({
        user: userId,
        event: eventId,
        rating,
        comment,
      });
    } catch (err) {
      if (err.code === 11000) {
        return sendError(
          res,
          409,
          "You have already submitted feedback for this event",
        );
      }
      throw err;
    }

    //await checkAndAwardBadges(userId, 'feedback-giver');

    return sendSuccess(res, 201, "Feedback submitted successfully", feedback);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get feedback for an event
// @route   GET /api/feedback/event/:eventId
// @access  Public
const getEventFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId })
      .populate("user", "name avatarUrl")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Feedback fetched successfully", feedbacks);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(req.params.eventId),
        },
      },
      {
        $group: {
          _id: "$event",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    return sendSuccess(
      res,
      200,
      "Feedback stats fetched",
      stats[0] || {
        averageRating: 0,
        totalReviews: 0,
      }
    );
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  createFeedback,
  getEventFeedback,
  getFeedbackStats,
};
