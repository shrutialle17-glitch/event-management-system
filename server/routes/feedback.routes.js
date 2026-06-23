const express = require('express');
const router = express.Router();
const { createFeedback,getFeedbackStats, getEventFeedback } = require('../controllers/feedback.controller');
//const { verifyToken } = require('../middleware/auth.middleware');

router.get('/event/:eventId', getEventFeedback);
router.get(
  "/event/:eventId/stats",
  getFeedbackStats
);
//router.post('/', verifyToken, createFeedback);
router.post('/', createFeedback);
module.exports = router;
