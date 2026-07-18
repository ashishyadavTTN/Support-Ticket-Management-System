const express = require('express');
const { body, param, query } = require('express-validator');
const ticketController = require('../controllers/ticketController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const checkPermission = require('../middleware/checkPermission');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../constants/roles');
const { PERMISSION_KEYS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.CUSTOMER, ROLES.ADMIN),
  checkPermission(PERMISSION_KEYS.CAN_CREATE_TICKETS),
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isInt(),
    body('createdBy').optional().isInt(),
  ]),
  ticketController.createTicket
);

router.get(
  '/',
  validate([
    query('search').optional().isString(),
    query('status').optional().isString(),
    query('priority').optional().isString(),
    query('assignedTo').optional().isString(),
    query('sortBy').optional().isString(),
    query('sortOrder').optional().isIn(['asc', 'desc', 'ASC', 'DESC']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  ticketController.getTickets
);

router.get('/assignees', ticketController.listAssignees);

router.get(
  '/:id',
  validate([param('id').isInt()]),
  ticketController.getTicketById
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.REPRESENTATIVE),
  validate([
    param('id').isInt(),
    body('title').optional().trim().notEmpty(),
    body('description').optional().isString(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isInt(),
  ]),
  ticketController.updateTicket
);

router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.REPRESENTATIVE),
  checkPermission(PERMISSION_KEYS.CAN_CHANGE_STATUS),
  validate([
    param('id').isInt(),
    body('status').notEmpty().withMessage('status is required'),
  ]),
  ticketController.updateTicketStatus
);

router.post(
  '/:id/comments',
  checkPermission(PERMISSION_KEYS.CAN_COMMENT),
  validate([
    param('id').isInt(),
    body('message').trim().notEmpty().withMessage('message is required'),
  ]),
  ticketController.createComment
);

router.get(
  '/:id/comments',
  validate([param('id').isInt()]),
  ticketController.getComments
);

module.exports = router;
