const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'registration-confirmation',
        'new-registration-organizer',
        'reminder-1day',
        'reminder-1hour',
        'event-updated',
        'event-cancelled',
        'event-approved',
        'event-rejected',
        'attendance-confirmed',
        'badge-earned'
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null, // Nullable, as some notifications might not strictly map to a single event
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
