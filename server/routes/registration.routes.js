const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
  getWaitlistPosition,
  getTicketPdf,
  exportRegistrationsCsv,
} = require('../controllers/registration.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(verifyToken);

router.post('/', createRegistration);
router.get('/mine', getMyRegistrations);
router.get('/event/:eventId', requireRole(['organizer', 'admin']), getEventRegistrations);
router.get('/event/:eventId/export', requireRole(['organizer', 'admin']), exportRegistrationsCsv);
router.patch('/:id/cancel', cancelRegistration);
router.get('/:id/waitlist-position', getWaitlistPosition);
router.get('/:id/pdf', getTicketPdf);

module.exports = router;
