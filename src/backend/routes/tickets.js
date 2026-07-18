const express = require('express');
const { body, param, query } = require('express-validator');
const ticketController = require('../controllers/ticketController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const checkPermission = require('../middleware/checkPermission');
const { validate } = require('../middleware/validate');
const { optionalMultipart } = require('../middleware/upload');
const HttpError = require('../utils/httpError');
const { ROLES } = require('../constants/roles');
const { PERMISSION_KEYS } = require('../constants/permissions');

const router = express.Router();

function validateMultipartTicketCreate(req, res, next) {
  const title = (req.body.title || '').trim();
  if (!title) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{ type: 'field', msg: 'Title is required', path: 'title', location: 'body' }],
    });
  }

  const priority = req.body.priority;
  if (priority && !['low', 'medium', 'high', 'critical'].includes(priority)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{ type: 'field', msg: 'Invalid priority', path: 'priority', location: 'body' }],
    });
  }

  return next();
}

function validateMultipartComment(req, res, next) {
  const message = (req.body.message || '').trim();
  const hasFiles = req.files && req.files.length > 0;

  if (!message && !hasFiles) {
    return next(new HttpError(400, 'Message or at least one image is required.'));
  }

  return next();
}

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.CUSTOMER, ROLES.ADMIN, ROLES.REPRESENTATIVE),
  checkPermission(PERMISSION_KEYS.CAN_CREATE_TICKETS),
  optionalMultipart('attachments'),
  (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      return validateMultipartTicketCreate(req, res, next);
    }
    return validate([
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('description').optional().isString(),
      body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
      body('assignedTo').optional().isInt(),
      body('createdBy').optional().isInt(),
    ])(req, res, next);
  },
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

router.get('/customers', ticketController.listCustomers);
router.get('/assignees', ticketController.listAssignees);

router.get(
  '/:id',
  validate([param('id').isUUID()]),
  ticketController.getTicketById
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.REPRESENTATIVE),
  validate([
    param('id').isUUID(),
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
    param('id').isUUID(),
    body('status').notEmpty().withMessage('status is required'),
  ]),
  ticketController.updateTicketStatus
);

router.post(
  '/:id/comments',
  checkPermission(PERMISSION_KEYS.CAN_COMMENT),
  optionalMultipart('attachments'),
  validate([param('id').isUUID()]),
  (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      return validateMultipartComment(req, res, next);
    }
    return validate([
      body('message').trim().notEmpty().withMessage('message is required'),
    ])(req, res, next);
  },
  ticketController.createComment
);

router.get(
  '/:id/comments',
  validate([param('id').isUUID()]),
  ticketController.getComments
);

router.get(
  '/:id/attachments/:attachmentId',
  validate([param('id').isUUID(), param('attachmentId').isInt()]),
  ticketController.getAttachment
);

module.exports = router;
