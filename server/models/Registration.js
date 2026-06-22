const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ticketId: {
      type: String,
      unique: true,
    },
    qrToken: {
      type: String,
      unique: true,
    },
    qrImageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['registered', 'waitlisted', 'checked-in', 'cancelled'],
      default: 'registered',
    },
    waitlistPosition: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: ['free', 'paid', 'refunded'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registration
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
