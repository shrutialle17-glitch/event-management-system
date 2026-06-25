const multer = require('multer');

// Configure multer with memory storage
// The buffer will be streamed directly to Cloudinary
const storage = multer.memoryStorage();

// Restrict file types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image or video! Please upload only images or videos.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB limit
  },
  fileFilter,
});

module.exports = upload;