const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../config/cloudinary');

const generateQR = async (registrationId, eventId) => {
  // 1. Simplify QR token to just the registration ID to make it less dense and easier to scan
  const qrToken = registrationId.toString();

  // 2. Generate QR code PNG as a buffer
  const qrBuffer = await QRCode.toBuffer(qrToken, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 4,
  });

  // Upload buffer to Cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'event_qr_codes',
        format: 'png',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        resolve({
          qrToken,
          qrImageUrl: result.secure_url,
          qrBuffer, // useful if we want to attach directly to email without downloading
        });
      }
    );

    // Write buffer to stream
    uploadStream.end(qrBuffer);
  });
};

module.exports = { generateQR };
