const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const Registration = require("../models/Registration");
const Attendance = require("../models/Attendance");
const Event = require("../models/Event");
//const notify = require('../utils/notify');
//const { checkAndAwardBadges } = require('../utils/checkAndAwardBadges');
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Get QR Image URL for a registration
// @route   GET /api/qr/:registrationId
// @access  Protected
const getQR = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.registrationId);

    if (!registration) {
      return sendError(res, 404, "Registration not found");
    }

    A//ccess control: only the user who registered, or an organizer/admin can view it
    if (
      registration.user.toString() !== req.user._id.toString() &&
      req.user.role === 'user'
    ) {
      return sendError(res, 403, 'Not authorized to view this QR code');
    }

    return sendSuccess(res, 200, "QR fetched successfully", {
      qrImageUrl: registration.qrImageUrl,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Validate a scanned QR code
// @route   POST /api/qr/validate
// @access  Protected (Organizer, Admin)

const validateQR = async (req, res) => {
  const { qrToken } = req.body;

  if (!qrToken) {
    return sendError(res, 400, 'QR Token is required');
  }

  try {
    let registration;
    // 1. Verify Token is a valid ObjectId (New Format) or JWT (Old Format), or fallback to ticketId
    if (mongoose.Types.ObjectId.isValid(qrToken)) {
      registration = await Registration.findById(qrToken)
        .populate('user', 'name email avatarUrl')
        .populate('event', 'title date venue organizer');
    } else {
      try {
        const decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
        registration = await Registration.findById(decoded.registrationId)
          .populate('user', 'name email avatarUrl')
          .populate('event', 'title date venue organizer');
      } catch (err) {
        // Fallback: Check if it's a manual ticketId entry
        registration = await Registration.findOne({ ticketId: qrToken.toUpperCase() })
          .populate('user', 'name email avatarUrl')
          .populate('event', 'title date venue organizer');
      }
    }

    if (!registration) {
      return sendError(res, 404, 'Registration not found for this QR code or Ticket ID');
    }

    // 3. Confirm it belongs to an event this organizer manages
    if (
      registration.event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 403, 'Not authorized to scan tickets for this event');
    }

    // 4. Check if already checked in
    const existingAttendance = await Attendance.findOne({ registration: registration._id });
    
    if (existingAttendance) {
      return sendError(res, 409, 'Ticket has already been checked in', {
        checkedInAt: existingAttendance.checkedInAt,
        registration,
      });
    }

    if (registration.status === 'cancelled') {
      return sendError(res, 400, 'This registration was cancelled');
    }

    // Return valid registration info, waiting for explicit checkin confirm
    return sendSuccess(res, 200, 'QR Token is valid and ready for check-in', {
      registration,
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Explicitly check-in a user after validation
// @route   POST /api/qr/checkin
// @access  Protected (Organizer, Admin)
const checkInQR = async (req, res) => {
  const { qrToken } = req.body;

  if (!qrToken) {
    return sendError(res, 400, 'QR Token is required');
  }

  try {
    let registration;
    if (mongoose.Types.ObjectId.isValid(qrToken)) {
      registration = await Registration.findById(qrToken).populate('user').populate('event');
    } else {
      try {
        const decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
        registration = await Registration.findById(decoded.registrationId).populate('user').populate('event');
      } catch (err) {
        registration = await Registration.findOne({ ticketId: qrToken.toUpperCase() }).populate('user').populate('event');
      }
    }
    
    if (!registration) {
      return sendError(res, 404, 'Registration not found');
    }

    // Prevent duplicate check-in at DB level due to unique constraint, but check first to be clean
    const existingAttendance = await Attendance.findOne({ registration: registration._id });
    if (existingAttendance) {
      return sendError(res, 409, 'Ticket has already been checked in');
    }

    // Create Attendance Record
    const attendance = await Attendance.create({
      registration: registration._id,
      event: registration.event._id,
      user: registration.user._id,
      checkedInBy: req.user._id,
    });

    // Update Registration Status
    registration.status = 'checked-in';
    await registration.save();

    /*Send Check-in Confirmation notification
    await notify({
      recipientIds: [registration.user._id],
      type: 'attendance-confirmed',
      title: `Check-in Confirmed: ${registration.event.title}`,
      message: `You have successfully checked in to ${registration.event.title}.`,
      eventId: registration.event._id,
      event: registration.event,
    });

    // Badge checks
    const attendanceCount = await Attendance.countDocuments({ user: registration.user._id });
    if (attendanceCount === 1) await checkAndAwardBadges(registration.user._id, 'first-event');
    if (attendanceCount === 5) await checkAndAwardBadges(registration.user._id, 'five-events');*/

    return sendSuccess(res, 200, 'Check-in successful', attendance);

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Manual check-in (without QR)
// @route   POST /api/qr/manual-checkin
// @access  Protected (Organizer, Admin)
const manualCheckIn = async (req, res) => {
  try {
    const { registrationId } = req.body;
    const registration = await Registration.findById(registrationId).populate('user').populate('event');
    
    if (!registration) return sendError(res, 404, 'Registration not found');

    if (registration.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized');
    }

    if (registration.status === 'checked-in') {
      return sendError(res, 400, 'Already checked in');
    }
    if (registration.status === 'cancelled') {
      return sendError(res, 400, 'Registration cancelled');
    }

    const existingAttendance = await Attendance.findOne({ registration: registration._id });
    if (existingAttendance) return sendError(res, 409, 'Already checked in');

    const attendance = await Attendance.create({
      registration: registration._id,
      event: registration.event._id,
      user: registration.user._id,
      checkedInBy: req.user._id,
    });

    registration.status = 'checked-in';
    await registration.save();
    
    await notify({
      recipientIds: [registration.user._id],
      type: 'attendance-confirmed',
      title: `Check-in Confirmed: ${registration.event.title}`,
      message: `You have successfully checked in.`,
      eventId: registration.event._id,
      event: registration.event,
    });

    /*Badge checks
    const attendanceCount = await Attendance.countDocuments({ user: registration.user._id });
    if (attendanceCount === 1) await checkAndAwardBadges(registration.user._id, 'first-event');
    if (attendanceCount === 5) await checkAndAwardBadges(registration.user._id, 'five-events');*/

    return sendSuccess(res, 200, 'Manual check-in successful', attendance);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
    
};

module.exports = {
  getQR,
  validateQR,
  checkInQR,
  manualCheckIn,
};
