const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Ticket, User, Comment, Attachment } = require('../models');
const HttpError = require('../utils/httpError');
const {
  buildTicketListFilter,
  assertTicketAccess,
} = require('../utils/userHelpers');
const { PERMISSION_KEYS } = require('../constants/permissions');
const { isValidTransition } = require('../constants/statusTransitions');
const { parseCsvParam, buildOrderClause } = require('../utils/ticketQuery');
const { findRepresentativeWithLowestQueue } = require('../utils/ticketAssignment');
const { ROLES } = require('../constants/roles');
const { saveAttachments, getAttachmentFilePath } = require('../utils/attachmentStorage');

const userAttributes = ['id', 'name', 'email', 'role'];

const attachmentAttributes = ['id', 'originalName', 'mimeType', 'sizeBytes', 'createdAt'];

const ticketInclude = [
  { model: User, as: 'creator', attributes: userAttributes },
  { model: User, as: 'assignee', attributes: userAttributes },
  {
    model: Attachment,
    as: 'attachments',
    attributes: attachmentAttributes,
    where: { commentId: null },
    required: false,
  },
  {
    model: Comment,
    as: 'comments',
    include: [
      { model: User, as: 'author', attributes: ['id', 'name'] },
      {
        model: Attachment,
        as: 'attachments',
        attributes: attachmentAttributes,
      },
    ],
  },
];

function parseOptionalInt(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return parseInt(value, 10);
}

async function createTicket(req, res, next) {
  try {
    const perms = req.user.getEffectivePermissions();
    const payload = {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'medium',
      status: 'open',
    };

    if (req.user.role === ROLES.CUSTOMER) {
      payload.createdBy = req.user.id;
    } else {
      const createdBy = parseOptionalInt(req.body.createdBy);
      if (!createdBy) {
        throw new HttpError(400, 'createdBy (customer) is required.');
      }
      payload.createdBy = createdBy;
    }

    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.REPRESENTATIVE) {
      const assignedTo = parseOptionalInt(req.body.assignedTo);
      if (assignedTo !== undefined) {
        if (req.user.role === ROLES.ADMIN || perms.canAssignTickets) {
          payload.assignedTo = assignedTo;
        }
      }
    }

    if (req.user.role === ROLES.CUSTOMER && payload.assignedTo === undefined) {
      payload.assignedTo = await findRepresentativeWithLowestQueue();
    }

    const ticket = await Ticket.create(payload);

    const files = req.files || [];
    if (files.length) {
      await saveAttachments(files, {
        ticketId: ticket.id,
        commentId: null,
        uploadedBy: req.user.id,
      });
    }

    const fullTicket = await Ticket.findByPk(ticket.id, { include: ticketInclude });
    return res.status(201).json(fullTicket);
  } catch (err) {
    return next(err);
  }
}

async function getTickets(req, res, next) {
  try {
    const { search, status, priority, assignedTo, sortBy, sortOrder, page, limit } =
      req.query;

    const conditions = [buildTicketListFilter(req.user)];

    const statuses = parseCsvParam(status);
    if (statuses.length === 1) {
      conditions.push({ status: statuses[0] });
    } else if (statuses.length > 1) {
      conditions.push({ status: { [Op.in]: statuses } });
    }

    const priorities = parseCsvParam(priority);
    if (priorities.length === 1) {
      conditions.push({ priority: priorities[0] });
    } else if (priorities.length > 1) {
      conditions.push({ priority: { [Op.in]: priorities } });
    }

    if (assignedTo !== undefined && assignedTo !== '') {
      if (req.user.role !== 'admin') {
        throw new HttpError(403, 'Only admins can filter by assignee.');
      }
      if (assignedTo === 'unassigned') {
        conditions.push({ assignedTo: null });
      } else {
        conditions.push({ assignedTo: parseInt(assignedTo, 10) });
      }
    }

    if (search) {
      conditions.push({
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    const where =
      conditions.length === 1 ? conditions[0] : { [Op.and]: conditions };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: userAttributes },
        { model: User, as: 'assignee', attributes: userAttributes },
      ],
      order: buildOrderClause(sortBy, sortOrder),
      limit: pageSize,
      offset,
    });

    return res.json({
      tickets: rows,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize) || 1,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getTicketById(req, res, next) {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: ticketInclude,
    });

    assertTicketAccess(req.user, ticket);

    return res.json(ticket);
  } catch (err) {
    return next(err);
  }
}

async function updateTicket(req, res, next) {
  try {
    const ticket = await Ticket.findByPk(req.params.id);

    assertTicketAccess(req.user, ticket);

    if (req.user.role === 'customer') {
      throw new HttpError(403, 'Customers cannot update tickets.');
    }

    const updates = {};
    const allowedFields = ['title', 'description', 'priority'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (req.body.assignedTo !== undefined) {
      const perms = req.user.getEffectivePermissions();
      if (req.user.role === 'admin' || perms.canAssignTickets) {
        updates.assignedTo = req.body.assignedTo;
      } else {
        throw new HttpError(
          403,
          `Insufficient permissions. Required: ${PERMISSION_KEYS.CAN_ASSIGN_TICKETS}.`
        );
      }
    }

    if (req.body.status !== undefined) {
      throw new HttpError(
        400,
        'Use PATCH /tickets/:id/status to update ticket status.'
      );
    }

    await ticket.update(updates);
    return res.json(ticket);
  } catch (err) {
    return next(err);
  }
}

async function updateTicketStatus(req, res, next) {
  try {
    const ticket = await Ticket.findByPk(req.params.id);

    assertTicketAccess(req.user, ticket);

    if (req.user.role === 'customer') {
      throw new HttpError(403, 'Customers cannot change ticket status.');
    }

    const { status } = req.body;

    if (!isValidTransition(ticket.status, status)) {
      throw new HttpError(
        400,
        `Cannot transition from "${ticket.status}" to "${status}".`
      );
    }

    const updates = { status };

    if (status === 'resolved' && ticket.status !== 'resolved') {
      updates.resolvedAt = new Date();
    } else if (status !== 'resolved' && ticket.status === 'resolved') {
      updates.resolvedAt = null;
    }

    await ticket.update(updates);

    return res.json(ticket);
  } catch (err) {
    return next(err);
  }
}

async function listCustomers(req, res, next) {
  try {
    const perms = req.user.getEffectivePermissions();
    if (req.user.role !== ROLES.ADMIN && !perms.canCreateTickets) {
      throw new HttpError(403, 'Insufficient permissions to list customers.');
    }

    const customers = await User.findAll({
      where: { role: ROLES.CUSTOMER, isActive: true },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']],
    });

    return res.json({ customers });
  } catch (err) {
    return next(err);
  }
}

async function listAssignees(req, res, next) {
  try {
    const perms = req.user.getEffectivePermissions();
    if (req.user.role !== 'admin' && !perms.canAssignTickets) {
      throw new HttpError(403, 'Insufficient permissions to list assignees.');
    }

    const representatives = await User.findAll({
      where: { role: 'representative', isActive: true },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']],
    });

    return res.json({ representatives });
  } catch (err) {
    return next(err);
  }
}

async function createComment(req, res, next) {
  try {
    const ticket = await Ticket.findByPk(req.params.id);

    assertTicketAccess(req.user, ticket);

    const message = (req.body.message || '').trim();
    const files = req.files || [];

    if (!message && !files.length) {
      throw new HttpError(400, 'Message or at least one image is required.');
    }

    const comment = await Comment.create({
      ticketId: ticket.id,
      message: message || '',
      createdBy: req.user.id,
    });

    if (files.length) {
      await saveAttachments(files, {
        ticketId: ticket.id,
        commentId: comment.id,
        uploadedBy: req.user.id,
      });
    }

    const withAuthor = await Comment.findByPk(comment.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Attachment, as: 'attachments', attributes: attachmentAttributes },
      ],
    });

    return res.status(201).json(withAuthor);
  } catch (err) {
    return next(err);
  }
}

async function getComments(req, res, next) {
  try {
    const ticket = await Ticket.findByPk(req.params.id);

    assertTicketAccess(req.user, ticket);

    const comments = await Comment.findAll({
      where: { ticketId: ticket.id },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Attachment, as: 'attachments', attributes: attachmentAttributes },
      ],
      order: [['createdAt', 'ASC']],
    });

    return res.json(comments);
  } catch (err) {
    return next(err);
  }
}

async function getAttachment(req, res, next) {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    assertTicketAccess(req.user, ticket);

    const attachment = await Attachment.findOne({
      where: {
        id: req.params.attachmentId,
        ticketId: ticket.id,
      },
    });

    if (!attachment) {
      throw new HttpError(404, 'Attachment not found.');
    }

    const filePath = getAttachmentFilePath(ticket.id, attachment.storedName);

    if (!fs.existsSync(filePath)) {
      throw new HttpError(404, 'Attachment file not found.');
    }

    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${attachment.originalName.replace(/"/g, '')}"`
    );

    return res.sendFile(path.resolve(filePath));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  listCustomers,
  listAssignees,
  createComment,
  getComments,
  getAttachment,
};
