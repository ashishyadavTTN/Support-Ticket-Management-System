const { CUSTOMER_PERMISSIONS } = require('../constants/permissions');
const HttpError = require('./httpError');

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
 */
function buildTicketListFilter(user) {
  if (user.role === 'admin') {
    return {};
  }

  if (user.role === 'customer') {
    return { createdBy: user.id };
  }

  if (user.role === 'representative') {
    const perms = user.getEffectivePermissions();
    if (perms.canViewAllTickets) {
      return {};
    }
    return { assignedTo: user.id };
  }

  return { id: -1 };
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
    const perms = user.getEffectivePermissions();
    if (perms.canViewAllTickets) {
      return true;
    }
    return ticket.assignedTo === user.id;
  }

  return false;
}

function assertTicketAccess(user, ticket) {
  if (!ticket) {
    throw new HttpError(404, 'Ticket not found');
  }
  if (!canAccessTicket(user, ticket)) {
    throw new HttpError(403, 'You do not have permission to access this ticket');
  }
}

module.exports = {
  toSafeUser,
  buildTicketListFilter,
  canAccessTicket,
  assertTicketAccess,
  CUSTOMER_PERMISSIONS,
};
