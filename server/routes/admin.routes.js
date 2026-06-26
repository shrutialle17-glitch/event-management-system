const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(verifyToken);
router.use(requireRole(['admin']));

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/events', getEvents);
router.get('/events/pending', getPendingEvents);
router.patch('/events/:id/approve', approveEvent);
router.patch('/events/:id/reject', rejectEvent);
router.delete('/events/:id', deleteEvent);

router.get('/analytics', getAnalytics);
router.get('/reports', getReports);

module.exports = router;
