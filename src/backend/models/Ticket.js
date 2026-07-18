const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Ticket = sequelize.define(
  'Ticket',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'open',
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Set when the ticket first transitions to resolved status',
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      comment: 'FK to a Representative (or null if unassigned)',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      comment: 'FK to the Customer who opened the ticket',
    },
  },
  {
    tableName: 'Tickets',
    timestamps: true,
  }
);

/**
 * Enforce RBAC data integrity at the model layer:
 * - createdBy must reference an active Customer
 * - assignedTo must reference an active Representative (or be null)
 */
Ticket.addHook('beforeValidate', async (ticket) => {
  const User = ticket.sequelize.models.User;

  if (ticket.createdBy != null) {
    const creator = await User.findByPk(ticket.createdBy);
    if (!creator || creator.role !== 'customer') {
      throw new Error('createdBy must reference a user with role "customer"');
    }
    if (!creator.isActive) {
      throw new Error('createdBy must reference an active customer');
    }
  }

  if (ticket.assignedTo != null) {
    const assignee = await User.findByPk(ticket.assignedTo);
    if (!assignee || assignee.role !== 'representative') {
      throw new Error(
        'assignedTo must reference a user with role "representative"'
      );
    }
    if (!assignee.isActive) {
      throw new Error('assignedTo must reference an active representative');
    }
  }
});

module.exports = Ticket;
