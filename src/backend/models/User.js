const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { ROLE_VALUES } = require('../constants/roles');
const { resolvePermissions } = require('../constants/permissions');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM(...ROLE_VALUES),
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Bcrypt hash — populated when authentication is implemented',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment:
        'Granular flags for Representatives; null means use role defaults',
    },
  },
  {
    tableName: 'Users',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['passwordHash'] },
      },
    },
  }
);

User.prototype.getEffectivePermissions = function getEffectivePermissions() {
  let storedPermissions = this.permissions;

  if (typeof storedPermissions === 'string') {
    try {
      storedPermissions = JSON.parse(storedPermissions);
    } catch {
      storedPermissions = null;
    }
  }

  return resolvePermissions(this.role, storedPermissions);
};

User.prototype.isAdmin = function isAdmin() {
  return this.role === 'admin';
};

User.prototype.isRepresentative = function isRepresentative() {
  return this.role === 'representative';
};

User.prototype.isCustomer = function isCustomer() {
  return this.role === 'customer';
};

module.exports = User;
