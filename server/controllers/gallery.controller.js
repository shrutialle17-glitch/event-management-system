const Gallery = require('../models/Gallery');
const Event = require('../models/Event');
const { cloudinary } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Upload media to gallery
// @route   POST /api/gallery
// @access  Protected
const uploadMedia = async (req, res) => {
  const { eventId, mediaType, caption } = req.body;
  
  if (!req.file) {
    return sendError(res, 400, 'Please upload a file');
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) return sendError(res, 404, 'Event not found');

    // Determine resource type based on mediaType
    const resourceType = mediaType === 'video' ? 'video' : 'image';

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'event_gallery', resource_type: resourceType },
      async (error, result) => {
        if (error) {
          return sendError(res, 500, 'Media upload failed');
        }

        const galleryItem = await Gallery.create({
          event: eventId,
          uploadedBy: req.user._id,
          mediaUrl: result.secure_url,
          mediaType,
          caption,
        });

        return sendSuccess(res, 201, 'Media uploaded successfully', galleryItem);
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get gallery for an event
// @route   GET /api/gallery/event/:eventId
// @access  Public
const getEventGallery = async (req, res) => {
  try {
    const galleryItems = await Gallery.find({ event: req.params.eventId })
      .populate('uploadedBy', 'name avatarUrl')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Gallery fetched successfully', galleryItems);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Toggle like on gallery media
// @route   PATCH /api/gallery/:id/like
// @access  Protected
const likeMedia = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) return sendError(res, 404, 'Media not found');

    const index = galleryItem.likes.indexOf(req.user._id);
    if (index === -1) {
      galleryItem.likes.push(req.user._id);
    } else {
      galleryItem.likes.splice(index, 1);
    }

    await galleryItem.save();
    return sendSuccess(res, 200, 'Like toggled', { likes: galleryItem.likes });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Add comment to gallery media
// @route   POST /api/gallery/:id/comment
// @access  Protected
const commentMedia = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return sendError(res, 400, 'Comment text is required');

    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) return sendError(res, 404, 'Media not found');

    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    galleryItem.comments.push(comment);
    await galleryItem.save();
    
    await galleryItem.populate('comments.user', 'name avatarUrl');

    return sendSuccess(res, 201, 'Comment added', { comments: galleryItem.comments });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  uploadMedia,
  getEventGallery,
  likeMedia,
  commentMedia,
};
