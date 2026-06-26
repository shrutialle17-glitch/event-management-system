const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");
const { generateQR } = require("../utils/generateQR");
const generateTicket = require("../utils/generateTicket");
const notify = require("../utils/notify");
const sendEmail = require("../utils/sendEmail");
const { checkAndAwardBadges } = require("../utils/checkAndAwardBadges");
const { waitlistTemplate } = require("../utils/emailTemplates");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { nanoid } = require("nanoid");
const Feedback = require("../models/Feedback");

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Protected (User)
const createRegistration = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user._id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return sendError(res, 404, "Event not found");

    if (event.status !== "published") {
      return sendError(res, 400, "Event is not open for registration");
    }

    let isWaitlisted = false;
    let waitlistPosition = null;

    if (event.registeredCount >= event.capacity) {
      isWaitlisted = true;
      const waitlistCount = await Registration.countDocuments({
        event: eventId,
        status: "waitlisted",
      });
      waitlistPosition = waitlistCount + 1;
    }

    let ticketId;

    let registration = await Registration.findOne({
      user: userId,
      event: eventId,
    });

    if (registration) {
      if (registration.status !== "cancelled") {
        return sendError(
          res,
          409,
          "You have already registered for this event",
        );
      }

      registration.status = isWaitlisted ? "waitlisted" : "registered";
      registration.waitlistPosition = isWaitlisted
        ? waitlistPosition
        : undefined;
      registration.paymentStatus = event.price > 0 ? "paid" : "free";
      await registration.save();
      ticketId = registration.ticketId;
    } else {
      ticketId = `TKT-${nanoid(8).toUpperCase()}`;
      try {
        registration = await Registration.create({
          user: userId,
          event: eventId,
          ticketId,
          status: isWaitlisted ? "waitlisted" : "registered",
          waitlistPosition: isWaitlisted ? waitlistPosition : undefined,
          paymentStatus: event.price > 0 ? "paid" : "free",
        });
      } catch (err) {
        if (err.code === 11000) {
          return sendError(
            res,
            409,
            "You have already registered for this event",
          );
        }
        throw err;
      }
    }

    if (isWaitlisted) {
      await sendEmail({
        email: req.user.email,
        subject: `You're on the waitlist for ${event.title}`,
        html: waitlistTemplate(req.user, event, waitlistPosition),
      });
      return sendSuccess(res, 201, "Added to waitlist", registration);
    }

    // Generate QR code and upload to Cloudinary
    const { qrToken, qrImageUrl, qrBuffer } = await generateQR(
      registration._id,
      eventId,
    );

    // Update registration with QR details
    registration.qrToken = qrToken;
    registration.qrImageUrl = qrImageUrl;
    await registration.save();

    // Increment event registered count
    event.registeredCount += 1;
    await event.save();

    // Send confirmation email + in-app notification
    await notify({
      recipientIds: [req.user._id],
      type: "registration-confirmation",
      title: `Registration Confirmed: ${event.title}`,
      message: `You have successfully registered for ${event.title}.`,
      eventId: event._id,
      event: event,
      ticketId: ticketId,
      attachments: [
        {
          filename: "ticket-qr.png",
          content: qrBuffer,
        },
      ],
    });

    // Notify organizer
    await notify({
      recipientIds: [event.organizer],
      type: "new-registration-organizer",
      title: "New registration",
      message: `${req.user.name} just registered for ${event.title}`,
      eventId: event._id,
      emailTemplateData: { event, registrant: req.user },
    });

    // Check early-bird badge
    const daysUntilEvent =
      (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysUntilEvent > 7) {
      await checkAndAwardBadges(req.user._id, "early-bird");
    }

    return sendSuccess(res, 201, "Registration successful", registration);
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
      .populate("event", "title date time venue bannerUrl status")
      .sort({ createdAt: -1 });

    // Check feedback for every registration
    const registrationsWithFeedback = await Promise.all(
      registrations.map(async (reg) => {
        const feedback = await Feedback.findOne({
          user: req.user._id,
          event: reg.event._id,
        });

        return {
          ...reg.toObject(),
          hasFeedback: !!feedback,
        };
      })
    );

    return sendSuccess(
      res,
      200,
      "Registrations fetched successfully",
      registrationsWithFeedback
    );
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};



// @desc    Get registrations for an event
// @route   GET /api/registrations/event/:eventId
// @access  Protected (Organizer - own event, Admin)
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return sendError(res, 404, "Event not found");

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return sendError(res, 403, "Not authorized to view these registrations");
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate("user", "name email phone avatarUrl")
      .sort({ createdAt: -1 });

    return sendSuccess(
      res,
      200,
      "Registrations fetched successfully",
      registrations,
    );
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Cancel a registration
// @route   PATCH /api/registrations/:id/cancel
// @access  Protected (User - own registration)
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return sendError(res, 404, "Registration not found");

    if (registration.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Not authorized to cancel this registration");
    }

    if (registration.status === "checked-in") {
      return sendError(
        res,
        400,
        "Cannot cancel a registration that has already been checked in",
      );
    }

    if (registration.status === "cancelled") {
      return sendError(res, 400, "Registration is already cancelled");
    }

    const previousStatus = registration.status;
    const previousWaitlistPosition = registration.waitlistPosition;

    registration.status = "cancelled";
    registration.waitlistPosition = undefined;
    await registration.save();

    const event = await Event.findById(registration.event);

    if (previousStatus === "registered") {
      if (event && event.registeredCount > 0) {
        event.registeredCount -= 1;
        await event.save();
      }

      // Auto-promote next on waitlist
      const nextInLine = await Registration.findOne({
        event: event._id,
        status: "waitlisted",
      })
        .sort({ waitlistPosition: 1 })
        .populate("user");

      if (nextInLine) {
        nextInLine.status = "registered";
        nextInLine.waitlistPosition = undefined;

        // Generate QR token and image
        const { qrToken, qrImageUrl, qrBuffer } = await generateQR(
          nextInLine._id,
          event._id,
        );
        nextInLine.qrToken = qrToken;
        nextInLine.qrImageUrl = qrImageUrl;
        await nextInLine.save();

        event.registeredCount += 1;
        await event.save();

        //Notify promoted user
        await notify({
          recipientIds: [nextInLine.user._id],
          type: 'registration-confirmation',
          title: `Registration Confirmed: ${event.title}`,
          message: `You have been promoted from the waitlist and successfully registered for ${event.title}.`,
          eventId: event._id,
          event: event,
          ticketId: nextInLine.ticketId,
          attachments: [
            {
              filename: 'ticket-qr.png',
              content: qrBuffer,
            },
          ],
        });
        // Shift remaining waitlisted positions
        await Registration.updateMany(
          { event: event._id, status: "waitlisted" },
          { $inc: { waitlistPosition: -1 } },
        );
      }
    } else if (previousStatus === "waitlisted") {
      // Shift remaining waitlisted positions down
      await Registration.updateMany(
        {
          event: event._id,
          status: "waitlisted",
          waitlistPosition: { $gt: previousWaitlistPosition },
        },
        { $inc: { waitlistPosition: -1 } },
      );
    }

    return sendSuccess(
      res,
      200,
      "Registration cancelled successfully",
      registration,
    );
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get waitlist position for a registration
// @route   GET /api/registrations/:id/waitlist-position
// @access  Protected (User - owner only)
const getWaitlistPosition = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return sendError(res, 404, "Registration not found");

    if (registration.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Not authorized");
    }

    if (registration.status !== "waitlisted") {
      return sendError(res, 400, "Registration is not waitlisted");
    }

    return sendSuccess(res, 200, "Waitlist position fetched", {
      waitlistPosition: registration.waitlistPosition,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// @desc    Download ticket PDF
// @route   GET /api/registrations/:id/pdf
// @access  Protected (User - own registration)
const getTicketPdf = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate(
      "event",
    );
    if (!registration) return sendError(res, 404, "Registration not found");

    if (
      registration.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return sendError(res, 403, "Not authorized");
    }

    if (!registration.qrImageUrl) {
      return sendError(res, 400, "QR Code not generated for this ticket yet");
    }

    await generateTicket({ registration, user: req.user, res });
  } catch (error) {
    console.error("Ticket PDF generation error:", error);
    if (!res.headersSent) {
      return sendError(res, 500, error.message);
    }
  }
};

const exportRegistrationsCsv = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return sendError(res, 404, "Event not found");

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return sendError(res, 403, "Not authorized");
    }

    const registrations = await Registration.find({
      event: req.params.eventId,
    }).populate("user", "name email phone");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=registrations-${event._id}.csv`,
    );

    let csv =
      "Ticket ID,Name,Email,Phone,Status,Payment Status,Waitlist Position\\n";

    registrations.forEach((reg) => {
      const name = reg.user?.name?.replace(/,/g, "") || "";
      const email = reg.user?.email || "";
      const phone = reg.user?.phone || "";
      const waitlistPos = reg.waitlistPosition || "";

      csv += `${reg.ticketId},${name},${email},${phone},${reg.status},${reg.paymentStatus},${waitlistPos}\\n`;
    });

    return res.status(200).send(csv);
  } catch (error) {
    if (!res.headersSent) {
      return sendError(res, 500, error.message);
    }
  }
};

module.exports = {
  createRegistration,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
  getTicketPdf,
  getWaitlistPosition,
  exportRegistrationsCsv,
};
