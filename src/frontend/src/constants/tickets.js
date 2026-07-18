export const TICKET_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const STATUS_TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'open', 'cancelled'],
  resolved: ['closed', 'in_progress'],
  closed: [],
  cancelled: [],
};

export function getAllowedTransitions(currentStatus) {
  return STATUS_TRANSITIONS[currentStatus] || [];
}

export function isValidTransition(fromStatus, toStatus) {
  if (fromStatus === toStatus) return true;
  return getAllowedTransitions(fromStatus).includes(toStatus);
}

export function getTransitionBlockReason(fromStatus, toStatus) {
  if (fromStatus === toStatus) return null;
  const allowed = getAllowedTransitions(fromStatus);
  if (allowed.length === 0) {
    return `"${formatStatus(fromStatus)}" is a terminal status and cannot be changed.`;
  }
  if (!allowed.includes(toStatus)) {
    return `Tickets in "${formatStatus(fromStatus)}" can only move to: ${allowed.map(formatStatus).join(', ')}.`;
  }
  return null;
}

export function formatStatus(status) {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const SORTABLE_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
];
