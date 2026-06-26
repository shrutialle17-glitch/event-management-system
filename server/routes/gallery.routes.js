const express = require('express');
const router = express.Router();
const { uploadMedia, getEventGallery, likeMedia, commentMedia } = require('../controllers/gallery.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/event/:eventId', getEventGallery);
router.post('/', verifyToken, upload.single('media'), uploadMedia);
router.patch('/:id/like', verifyToken, likeMedia);
router.post('/:id/comment', verifyToken, commentMedia);

module.exports = router;
