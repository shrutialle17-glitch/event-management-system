const Registration = require('../models/Registration');
const Event = require('../models/Event');
//const { generateQR } = require('../utils/generateQR');
//const notify = require('../utils/notify');
//const sendEmail = require('../utils/sendEmail');
//const { checkAndAwardBadges } = require('../utils/checkAndAwardBadges');
//const { waitlistTemplate } = require('../utils/emailTemplates');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { nanoid } = require('nanoid');
//const PDFDocument = require('pdfkit');
//const axios = require('axios');

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Protected (User)
const createRegistration = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user._id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return sendError(res, 404, 'Event not found');

    if (event.status !== 'published') {
      return sendError(res, 400, 'Event is not open for registration');
    }

    let isWaitlisted = false;
    let waitlistPosition = null;

    if (event.registeredCount >= event.capacity) {
      isWaitlisted = true;
      const waitlistCount = await Registration.countDocuments({ event: eventId, status: 'waitlisted' });
      waitlistPosition = waitlistCount + 1;
    }

    let ticketId;

    let registration = await Registration.findOne({ user: userId, event: eventId });

    if (registration) {
      if (registration.status !== 'cancelled') {
        return sendError(res, 409, 'You have already registered for this event');
      }
      
      registration.status = isWaitlisted ? 'waitlisted' : 'registered';
      registration.waitlistPosition = isWaitlisted ? waitlistPosition : undefined;
      registration.paymentStatus = event.price > 0 ? 'paid' : 'free';
      await registration.save();
      ticketId = registration.ticketId;
    } else {
      ticketId = `TKT-${nanoid(8).toUpperCase()}`;
      try {
        registration = await Registration.create({
          user: userId,
          event: eventId,
          ticketId,
          status: isWaitlisted ? 'waitlisted' : 'registered',
          waitlistPosition: isWaitlisted ? waitlistPosition : undefined,
          paymentStatus: event.price > 0 ? 'paid' : 'free',
        });
      } catch (err) {
        if (err.code === 11000) {
          return sendError(res, 409, 'You have already registered for this event');
        }
        throw err;
      }
    }

      

    // Generate QR code and upload to Cloudinary

    // Update registration with QR details

    // Increment event registered count
    event.registeredCount += 1;
    await event.save();

    // Send confirmation email + in-app notification
  

    // Notify organizer
 

    // Check early-bird badge


    return sendSuccess(res, 201, 'Registration successful', registration);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get user's registrations
// @route   GET /api/registrations/mine
// @access  Protected (User)
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('event', 'title date time venue bannerUrl status')
      .sort({ createdAt: -1 });
    
    return sendSuccess(res, 200, 'Registrations fetched successfully', registrations);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get registrations for an event
// @route   GET /api/registrations/event/:eventId
// @access  Protected (Organizer - own event, Admin)
/*const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return sendError(res, 404, 'Event not found');

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to view these registrations');
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email phone avatarUrl')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Registrations fetched successfully', registrations);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};*/

// @desc    Cancel a registration
// @route   PATCH /api/registrations/:id/cancel
// @access  Protected (User - own registration)
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return sendError(res, 404, 'Registration not found');

    if (registration.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to cancel this registration');
    }

    if (registration.status === 'checked-in') {
      return sendError(res, 400, 'Cannot cancel a registration that has already been checked in');
    }

    if (registration.status === 'cancelled') {
      return sendError(res, 400, 'Registration is already cancelled');
    }

    const previousStatus = registration.status;
    const previousWaitlistPosition = registration.waitlistPosition;

    registration.status = 'cancelled';
    registration.waitlistPosition = undefined;
    await registration.save();

    const event = await Event.findById(registration.event);

    if (previousStatus === 'registered') {
      if (event && event.registeredCount > 0) {
        event.registeredCount -= 1;
        await event.save();
      }

      // Auto-promote next on waitlist
      const nextInLine = await Registration.findOne({ event: event._id, status: 'waitlisted' }).sort({ waitlistPosition: 1 }).populate('user');
      
      if (nextInLine) {
        nextInLine.status = 'registered';
        nextInLine.waitlistPosition = undefined;
        
        // Generate QR token and image

        
        //Notify promoted user

        
        // Shift remaining waitlisted positions
        await Registration.updateMany(
          { event: event._id, status: 'waitlisted' },
          { $inc: { waitlistPosition: -1 } }
        );
      }
    } else if (previousStatus === 'waitlisted') {
      // Shift remaining waitlisted positions down
      await Registration.updateMany(
        { event: event._id, status: 'waitlisted', waitlistPosition: { $gt: previousWaitlistPosition } },
        { $inc: { waitlistPosition: -1 } }
      );
    }

    return sendSuccess(res, 200, 'Registration cancelled successfully', registration);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
module.exports = {
  createRegistration,
  getMyRegistrations,
  //getEventRegistrations,
  cancelRegistration,
};
