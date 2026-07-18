const STATUS_VALUES = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];

const STATUS_TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'open', 'cancelled'],
  resolved: ['closed', 'in_progress'],
  closed: [],
  cancelled: [],
};

function getAllowedTransitions(currentStatus) {
  return STATUS_TRANSITIONS[currentStatus] || [];
}

function isValidTransition(fromStatus, toStatus) {
  if (fromStatus === toStatus) return true;
  return getAllowedTransitions(fromStatus).includes(toStatus);
}

module.exports = {
  STATUS_VALUES,
  STATUS_TRANSITIONS,
  getAllowedTransitions,
  isValidTransition,
};
