const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  registerUser, 
  loginUser, 
  getMe, 
  logoutUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  //updateNotificationPreferences,
  //getBadges
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// Validations
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Please enter a password with 6 or more characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required'),
];

// Routes
router.post('/register', validate(registerValidation), registerUser);
router.post('/login', validate(loginValidation), loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/logout', verifyToken, logoutUser);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
//router.patch('/notification-preferences', verifyToken, updateNotificationPreferences);
//router.get('/badges', verifyToken, getBadges);

module.exports = router;
