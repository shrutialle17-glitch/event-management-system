const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Feedback = require('../models/Feedback');
const Gallery = require('../models/Gallery');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Protected (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Users fetched successfully', users);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Protected (Admin)
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');

    if (!['user', 'organizer', 'admin'].includes(role)) {
      return sendError(res, 400, 'Invalid role');
    }

    user.role = role;
    await user.save();

    // Do not send password back
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    return sendSuccess(res, 200, 'User role updated successfully', updatedUser);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Protected (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');

    await user.deleteOne();
    return sendSuccess(res, 200, 'User deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get all events (admin view, bypasses public filters)
// @route   GET /api/admin/events
// @access  Protected (Admin)
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Events fetched successfully', events);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
// @desc    Get pending events
// @route   GET /api/admin/events/pending
// @access  Protected (Admin)
const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending-approval' })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Pending events fetched successfully', events);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Approve an event
// @route   PATCH /api/admin/events/:id/approve
// @access  Protected (Admin)
const approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return sendError(res, 404, 'Event not found');

    event.status = 'published';
    event.rejectionReason = undefined;
    await event.save();

    // Notify organizer
    const notify = require('../utils/notify');
    await notify({
      recipientIds: [event.organizer],
      type: 'event-approved',
      title: 'Event Approved',
      message: `Your event "${event.title}" has been approved and is now live!`,
      eventId: event._id,
    });

    return sendSuccess(res, 200, 'Event approved successfully', event);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Reject an event
// @route   PATCH /api/admin/events/:id/reject
// @access  Protected (Admin)
const rejectEvent = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return sendError(res, 404, 'Event not found');

    if (!rejectionReason) return sendError(res, 400, 'Rejection reason is required');

    event.status = 'rejected';
    event.rejectionReason = rejectionReason;
    await event.save();

    // Notify organizer
    const notify = require('../utils/notify');
    await notify({
      recipientIds: [event.organizer],
      type: 'event-rejected',
      title: 'Event Rejected',
      message: `Your event "${event.title}" was rejected. Reason: ${rejectionReason}`,
      eventId: event._id,
    });

    return sendSuccess(res, 200, 'Event rejected successfully', event);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
// @desc    Delete an event
// @route   DELETE /api/admin/events/:id
// @access  Protected (Admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return sendError(res, 404, 'Event not found');

    await event.deleteOne();
    return sendSuccess(res, 200, 'Event deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Protected (Admin)
const getAnalytics = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const eventsCount = await Event.countDocuments();
    const registrationsCount = await Registration.countDocuments();

    // Calculate total revenue from paid registrations
    const paidRegistrations = await Registration.find({ paymentStatus: 'paid' }).populate('event', 'price');
    const revenue = paidRegistrations.reduce((acc, reg) => {
      return acc + (reg.event?.price || 0);
    }, 0);

    // Registrations per month for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const registrationsPerMonth = await Registration.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return sendSuccess(res, 200, 'Analytics fetched successfully', {
      totals: {
        users: usersCount,
        events: eventsCount,
        registrations: registrationsCount,
        revenue,
      },
      registrationsPerMonth,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get reports (flagged content - mocked for now to return all feedback <= 2 stars)
// @route   GET /api/admin/reports
// @access  Protected (Admin)
const getReports = async (req, res) => {
  try {
    const flaggedFeedback = await Feedback.find({ rating: { $lte: 2 } })
      .populate('user', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Reports fetched successfully', { flaggedFeedback });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Feature an event
// @route   PATCH /api/admin/events/:id/feature
// @access  Protected (Admin)
const featureEvent = async (req, res) => {
  try {
    const { isFeatured } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return sendError(res, 404, 'Event not found');

    event.isFeatured = isFeatured;
    await event.save();
    return sendSuccess(res, 200, 'Event feature status updated', event);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  getEvents,
  deleteEvent,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getAnalytics,
  getReports,
  featureEvent,
};
