const ROLES = Object.freeze({
  ADMIN: 'admin',
  REPRESENTATIVE: 'representative',
  CUSTOMER: 'customer',
});

const ROLE_VALUES = Object.values(ROLES);

/** Legacy role from initial scaffold — migrated to representative */
const LEGACY_AGENT_ROLE = 'agent';

module.exports = {
  ROLES,
  ROLE_VALUES,
  LEGACY_AGENT_ROLE,
};
