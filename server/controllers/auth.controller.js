const User = require('../models/User');
const Badge = require('../models/Badge');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const sendEmail = require('../utils/sendEmail');
const { passwordResetTemplate } = require('../utils/emailTemplates');

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return sendError(res, 400, 'User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    const token = generateToken(user._id);

    return sendSuccess(res, 201, 'User registered successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      token,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 200, 'Login successful', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      token,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, 'User data fetched successfully', user);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const logoutUser = async (req, res) => {
  try {
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    // Always return success even if user not found to prevent email enumeration
    if (!user) {
      return sendSuccess(res, 200, 'If an account with that email exists, we have sent a password reset link.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html: passwordResetTemplate(user, resetUrl),
    });

    return sendSuccess(res, 200, 'Password reset token generated', {
    resetToken,
    resetUrl
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return sendError(res, 400, 'Invalid or expired password reset token');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Optionally send a "password changed successfully" email here

    return sendSuccess(res, 200, 'Password has been successfully reset');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatarUrl } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, 'User not found');

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', user);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, 'User not found');

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body,
    };

    await user.save();

    return sendSuccess(res, 200, 'Notification preferences updated', user.notificationPreferences);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const getBadges = async (req, res) => {
  try {
    const allBadges = await Badge.find();
    const user = await User.findById(req.user._id);

    return sendSuccess(res, 200, 'Badges fetched successfully', {
      allBadges,
      earnedBadges: user.earnedBadges
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  updateNotificationPreferences,
  getBadges,
};
