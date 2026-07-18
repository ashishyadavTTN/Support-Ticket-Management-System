const { Op } = require('sequelize');
const { CUSTOMER_PERMISSIONS } = require('../constants/permissions');
const HttpError = require('./httpError');

const DENY_ALL_TICKET_ID = '00000000-0000-0000-0000-000000000000';

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    permissions: user.getEffectivePermissions(),
  };
}

/**
 * Build Sequelize `where` clause for ticket list queries based on role.
 * Access is always derived from the authenticated user in the JWT.
 */
function buildTicketListFilter(user) {
  if (user.role === 'admin') {
    return {};
  }

  if (user.role === 'customer') {
    return { createdBy: user.id };
  }

  if (user.role === 'representative') {
    return {
      [Op.or]: [{ assignedTo: user.id }, { assignedTo: null }],
    };
  }

  return { id: DENY_ALL_TICKET_ID };
}

/**
 * Returns true if the user may access a specific ticket (read/write).
 */
function canAccessTicket(user, ticket) {
  if (!ticket) return false;

  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'customer') {
    return ticket.createdBy === user.id;
  }

  if (user.role === 'representative') {
    return ticket.assignedTo === user.id || ticket.assignedTo === null;
  }

  return false;
}

function assertTicketAccess(user, ticket) {
  if (!ticket || !canAccessTicket(user, ticket)) {
    throw new HttpError(404, 'Ticket not found');
  }
}

module.exports = {
  toSafeUser,
  buildTicketListFilter,
  canAccessTicket,
  assertTicketAccess,
  CUSTOMER_PERMISSIONS,
};
