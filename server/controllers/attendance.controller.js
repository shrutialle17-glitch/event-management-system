const Attendance = require('../models/Attendance');
const { generateCertificate } = require('../utils/generateCertificate');
const { sendError } = require('../utils/apiResponse');

// @desc    Download Certificate of Attendance
// @route   GET /api/attendance/:registrationId/certificate
// @access  Protected (User - own registration)
const getCertificatePdf = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ registration: req.params.registrationId })
      .populate('user', 'name')
      .populate('event', 'title date')
      .populate('registration', 'ticketId');

    if (!attendance) {
      return sendError(res, 403, 'Certificate not available. You must check in to the event to earn a certificate.');
    }

    if (attendance.user._id.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to download this certificate');
    }

    // Mark as issued on the first download
    if (!attendance.certificateIssued) {
      attendance.certificateIssued = true;
      attendance.certificateIssuedAt = new Date();
      await attendance.save();
    }

    await generateCertificate(attendance, res);

  } catch (error) {
    console.error("Certificate generation error:", error);
    if (!res.headersSent) {
      return sendError(res, 500, error.message);
    }
  }
};

module.exports = {
  getCertificatePdf,
};
