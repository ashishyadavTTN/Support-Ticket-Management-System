/**
 * Granular permission flags for Representatives (and explicit overrides).
 * Admins receive all permissions implicitly via role; Customers receive
 * restrictive defaults via role. Representatives store an explicit JSON object.
 */
const PERMISSION_KEYS = Object.freeze({
  CAN_CREATE_TICKETS: 'canCreateTickets',
  CAN_COMMENT: 'canComment',
  CAN_CHANGE_STATUS: 'canChangeStatus',
  CAN_ASSIGN_TICKETS: 'canAssignTickets',
  CAN_VIEW_ALL_TICKETS: 'canViewAllTickets',
});

const ALL_PERMISSIONS = Object.freeze({
  [PERMISSION_KEYS.CAN_CREATE_TICKETS]: true,
  [PERMISSION_KEYS.CAN_COMMENT]: true,
  [PERMISSION_KEYS.CAN_CHANGE_STATUS]: true,
  [PERMISSION_KEYS.CAN_ASSIGN_TICKETS]: true,
  [PERMISSION_KEYS.CAN_VIEW_ALL_TICKETS]: true,
});

const CUSTOMER_PERMISSIONS = Object.freeze({
  [PERMISSION_KEYS.CAN_CREATE_TICKETS]: true,
  [PERMISSION_KEYS.CAN_COMMENT]: true,
  [PERMISSION_KEYS.CAN_CHANGE_STATUS]: false,
  [PERMISSION_KEYS.CAN_ASSIGN_TICKETS]: false,
  [PERMISSION_KEYS.CAN_VIEW_ALL_TICKETS]: false,
});

const REPRESENTATIVE_BASE_PERMISSIONS = Object.freeze({
  [PERMISSION_KEYS.CAN_CREATE_TICKETS]: false,
  [PERMISSION_KEYS.CAN_COMMENT]: true,
  [PERMISSION_KEYS.CAN_CHANGE_STATUS]: true,
  [PERMISSION_KEYS.CAN_ASSIGN_TICKETS]: false,
  [PERMISSION_KEYS.CAN_VIEW_ALL_TICKETS]: false,
});

/**
 * Resolve effective permissions for a user based on role and stored overrides.
 * @param {string} role
 * @param {object|null} permissions - JSON from DB (Representative overrides)
 */
function resolvePermissions(role, permissions) {
  switch (role) {
    case 'admin':
      return { ...ALL_PERMISSIONS };
    case 'customer':
      return { ...CUSTOMER_PERMISSIONS };
    case 'representative':
      return { ...REPRESENTATIVE_BASE_PERMISSIONS, ...(permissions || {}) };
    default:
      return { ...CUSTOMER_PERMISSIONS };
  }
}

module.exports = {
  PERMISSION_KEYS,
  ALL_PERMISSIONS,
  CUSTOMER_PERMISSIONS,
  REPRESENTATIVE_BASE_PERMISSIONS,
  resolvePermissions,
};
