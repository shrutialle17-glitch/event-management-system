const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['conference', 'workshop', 'concert', 'sports', 'networking', 'webinar', 'other'],
    },
    bannerUrl: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    capacity: {
      type: Number,
      required: true,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending-approval', 'published', 'rejected', 'cancelled', 'completed'],
      default: 'draft',
    },
    rejectionReason: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
      },
    ],
    reminder1DaySent: {
      type: Boolean,
      default: false,
    },
    reminder1HourSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
