const express = require('express');
const { getCertificatePdf } = require('../controllers/attendance.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/:registrationId/certificate', verifyToken, getCertificatePdf);

module.exports = router;
