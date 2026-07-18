const express = require('express');
const { body, param } = require('express-validator');
const adminController = require('../controllers/adminController');
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/representatives', adminController.listRepresentatives);
router.get('/customers', adminController.listCustomers);
router.get('/dashboard-stats', dashboardController.getAdminStats);
router.get('/default-permissions', adminController.getDefaultPermissions);

router.post(
  '/representatives',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('permissions').optional().isObject(),
  ]),
  adminController.createRepresentative
);

router.patch(
  '/representatives/:id/permissions',
  validate([
    param('id').isInt(),
    body('permissions').optional().isObject(),
    body('isActive').optional().isBoolean(),
  ]),
  adminController.updateRepresentativePermissions
);

module.exports = router;