const { Op } = require('sequelize');
const { Ticket, User } = require('../models');
const { ROLES } = require('../constants/roles');

const RESOLUTION_WINDOW_DAYS = 30;
const OPEN_STATUSES = ['open', 'in_progress'];

function getWindowStart() {
  const start = new Date();
  start.setDate(start.getDate() - RESOLUTION_WINDOW_DAYS);
  return start;
}

async function computeAvgResolutionMs(where) {
  const tickets = await Ticket.findAll({
    where: {
      ...where,
      resolvedAt: {
        [Op.ne]: null,
        [Op.gte]: getWindowStart(),
      },
    },
    attributes: ['createdAt', 'resolvedAt'],
  });

  if (tickets.length === 0) {
    return { avgMs: null, resolvedCount: 0, windowDays: RESOLUTION_WINDOW_DAYS };
  }

  const totalMs = tickets.reduce((sum, ticket) => {
    return sum + (new Date(ticket.resolvedAt) - new Date(ticket.createdAt));
  }, 0);

  return {
    avgMs: Math.round(totalMs / tickets.length),
    resolvedCount: tickets.length,
    windowDays: RESOLUTION_WINDOW_DAYS,
  };
}

async function getAdminDashboardStats() {
  const openTickets = await Ticket.count({
    where: { status: { [Op.in]: OPEN_STATUSES } },
  });

  const activeUsers = await User.findAll({
    where: { isActive: true },
    attributes: ['role'],
  });

  const byRole = {
    admin: 0,
    representative: 0,
    customer: 0,
  };

  activeUsers.forEach((user) => {
    if (byRole[user.role] !== undefined) {
      byRole[user.role] += 1;
    }
  });

  const avgResolution = await computeAvgResolutionMs({});

  return {
    openTickets: { total: openTickets },
    activeUsers: { total: activeUsers.length, byRole },
    avgResolution,
  };
}

async function getRepresentativeDashboardStats(userId) {
  const openAssignedTickets = await Ticket.count({
    where: {
      assignedTo: userId,
      status: { [Op.in]: OPEN_STATUSES },
    },
  });

  const avgResolution = await computeAvgResolutionMs({ assignedTo: userId });

  return {
    openAssignedTickets,
    avgResolution,
  };
}

async function getCustomerDashboardStats(userId) {
  const tickets = await Ticket.findAll({
    where: { createdBy: userId },
    attributes: ['status'],
  });

  const ticketsByStatus = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    cancelled: 0,
  };

  tickets.forEach((ticket) => {
    if (ticketsByStatus[ticket.status] !== undefined) {
      ticketsByStatus[ticket.status] += 1;
    }
  });

  return { ticketsByStatus, totalTickets: tickets.length };
}

async function getRoleDashboardStats(user) {
  switch (user.role) {
    case ROLES.ADMIN:
      return { role: ROLES.ADMIN, stats: await getAdminDashboardStats() };
    case ROLES.REPRESENTATIVE:
      return {
        role: ROLES.REPRESENTATIVE,
        stats: await getRepresentativeDashboardStats(user.id),
      };
    case ROLES.CUSTOMER:
      return {
        role: ROLES.CUSTOMER,
        stats: await getCustomerDashboardStats(user.id),
      };
    default:
      return { role: user.role, stats: {} };
  }
}

module.exports = {
  RESOLUTION_WINDOW_DAYS,
  getAdminDashboardStats,
  getRepresentativeDashboardStats,
  getCustomerDashboardStats,
  getRoleDashboardStats,
};
