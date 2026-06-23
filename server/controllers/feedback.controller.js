const Feedback = require("../models/Feedback");
const Event = require("../models/Event");
const Attendance = require("../models/Attendance");
//const { checkAndAwardBadges } = require('../utils/checkAndAwardBadges');
const { sendSuccess, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Protected (User)
const createFeedback = async (req, res) => {
  const { eventId, rating, comment } = req.body;
  //const userId = req.user._id;
  const userId = "6a393447274ca175f5410a1a";

  try {
    const event = await Event.findById(eventId);
    if (!event) return sendError(res, 404, "Event not found");

    const attendance = await Attendance.findOne({
      user: userId,
      event: eventId,
    });

    if (!attendance) {
      return sendError(
        res,
        403,
        "You must attend the event before submitting feedback",
      );
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
