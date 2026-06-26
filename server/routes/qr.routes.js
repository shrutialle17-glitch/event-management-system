const express = require('express');
const router = express.Router();
const { getQR, validateQR, checkInQR, manualCheckIn } = require('../controllers/qr.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(verifyToken);

router.get('/:registrationId', getQR);
router.post('/validate', requireRole(['organizer', 'admin']), validateQR);
router.post('/checkin', requireRole(['organizer', 'admin']), checkInQR);
router.post('/manual-checkin', requireRole(['organizer', 'admin']), manualCheckIn);

module.exports = router;



