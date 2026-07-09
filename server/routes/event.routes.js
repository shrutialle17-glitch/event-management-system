const express = require("express");
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  cancelEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getPublicStats,
  uploadEventBanner,
  duplicateEvent,
} = require("../controllers/event.controller");

const upload = require("../middleware/upload.middleware");
const { verifyToken } = require("../middleware/auth.middleware");
const { requireRole } = require('../middleware/role.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const eventValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
];



// Public routes
router.get('/stats', getPublicStats);
router.get('/', getEvents);


// Protected routes
router.use(verifyToken);

router.get('/organizer/mine', requireRole(['organizer', 'admin']), getMyEvents);

router.post('/', requireRole(['organizer', 'admin']), upload.single('banner'), validate(eventValidation), createEvent);

router.put('/:id', requireRole(['organizer', 'admin']), validate(eventValidation), updateEvent);
router.patch('/:id/cancel', requireRole(['organizer', 'admin']), cancelEvent);
router.delete('/:id', requireRole(['organizer', 'admin']), deleteEvent);
router.post('/:id/banner', requireRole(['organizer', 'admin']), upload.single('banner'), uploadEventBanner);

router.get('/:id', getEventById);

module.exports = router;
