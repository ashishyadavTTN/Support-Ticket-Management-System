export const PERMISSION_KEYS = {
  CAN_CREATE_TICKETS: 'canCreateTickets',
  CAN_COMMENT: 'canComment',
  CAN_CHANGE_STATUS: 'canChangeStatus',
  CAN_ASSIGN_TICKETS: 'canAssignTickets',
  CAN_VIEW_ALL_TICKETS: 'canViewAllTickets',
};

export const PERMISSION_LABELS = {
  [PERMISSION_KEYS.CAN_CREATE_TICKETS]: 'Create tickets',
  [PERMISSION_KEYS.CAN_COMMENT]: 'Comment',
  [PERMISSION_KEYS.CAN_CHANGE_STATUS]: 'Change status',
  [PERMISSION_KEYS.CAN_ASSIGN_TICKETS]: 'Assign tickets',
  [PERMISSION_KEYS.CAN_VIEW_ALL_TICKETS]: 'View all tickets',
};

export const REPRESENTATIVE_DEFAULT_PERMISSIONS = {
  [PERMISSION_KEYS.CAN_CREATE_TICKETS]: false,
  [PERMISSION_KEYS.CAN_COMMENT]: true,
  [PERMISSION_KEYS.CAN_CHANGE_STATUS]: true,
  [PERMISSION_KEYS.CAN_ASSIGN_TICKETS]: false,
  [PERMISSION_KEYS.CAN_VIEW_ALL_TICKETS]: false,
};

export const PERMISSION_OPTIONS = Object.entries(PERMISSION_LABELS).map(
  ([key, label]) => ({ key, label })
);

export function getEnabledPermissionKeys(permissions) {
  if (!permissions) return [];
  return Object.entries(permissions)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);
}
