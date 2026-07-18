const { User, Ticket } = require('../models');
const { Op, fn, col } = require('sequelize');const { hashPassword } = require('../utils/password');
const { toSafeUser } = require('../utils/userHelpers');
const HttpError = require('../utils/httpError');
const { ROLES } = require('../constants/roles');
const { REPRESENTATIVE_BASE_PERMISSIONS } = require('../constants/permissions');

async function createRepresentative(req, res, next) {
  try {
    const { name, email, password, permissions } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new HttpError(409, 'An account with this email already exists.');
    }

    const passwordHash = await hashPassword(password);
    const mergedPermissions = {
      ...REPRESENTATIVE_BASE_PERMISSIONS,
      ...(permissions || {}),
    };

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: ROLES.REPRESENTATIVE,
      isActive: true,
      permissions: mergedPermissions,
    });

    return res.status(201).json({ user: toSafeUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function updateRepresentativePermissions(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      throw new HttpError(404, 'Representative not found.');
    }

    if (user.role !== ROLES.REPRESENTATIVE) {
      throw new HttpError(400, 'User is not a representative.');
    }

    const { permissions, isActive } = req.body;

    const updates = {};

    if (permissions !== undefined) {
      updates.permissions = {
        ...REPRESENTATIVE_BASE_PERMISSIONS,
        ...permissions,
      };
    }

    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    await user.update(updates);

    return res.json({ user: toSafeUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function listRepresentatives(req, res, next) {
  try {
    const activeOnly = req.query.activeOnly === 'true';

    const where = { role: ROLES.REPRESENTATIVE };
    if (activeOnly) {
      where.isActive = true;
    }

    const representatives = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'permissions'],
      order: [['name', 'ASC']],
    });

    if (activeOnly) {
      return res.json({
        representatives: representatives.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        })),
      });
    }

    const repIds = representatives.map((user) => user.id);
    const countMap = {};

    if (repIds.length > 0) {
      const countRows = await Ticket.findAll({
        attributes: ['assignedTo', [fn('COUNT', col('id')), 'count']],
        where: { assignedTo: { [Op.in]: repIds } },
        group: ['assignedTo'],
        raw: true,
      });

      countRows.forEach((row) => {
        countMap[row.assignedTo] = parseInt(row.count, 10);
      });
    }

    return res.json({
      representatives: representatives.map((user) => ({
        ...toSafeUser(user),
        assignedTicketCount: countMap[user.id] || 0,
      })),
    });
  } catch (err) {
    return next(err);
  }
}
async function listCustomers(req, res, next) {
  try {
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

async function getDefaultPermissions(req, res, next) {
  try {
    return res.json({
      template: { ...REPRESENTATIVE_BASE_PERMISSIONS },
      description:
        'Default permission flags applied when creating a new representative. Individual overrides can be set per user.',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createRepresentative,
  updateRepresentativePermissions,
  listRepresentatives,
  listCustomers,
  getDefaultPermissions,
};