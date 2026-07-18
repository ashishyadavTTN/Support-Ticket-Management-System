const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ]),
  authController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

router.patch(
  '/profile',
  authenticate,
  validate([body('name').trim().notEmpty().withMessage('Name is required')]),
  authController.updateProfile
);

router.patch(
  '/email',
  authenticate,
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('currentPassword').notEmpty().withMessage('Current password is required'),
  ]),
  authController.updateEmail
);

router.patch(
  '/password',
  authenticate,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ]),
  authController.updatePassword
);

module.exports = router;
