const { Op, fn, col } = require('sequelize');
const { User, Ticket } = require('../models');
const { ROLES } = require('../constants/roles');

/** Ticket statuses that count toward a representative's active queue. */
const QUEUE_STATUSES = ['open', 'in_progress'];

/**
 * Find the active representative with the fewest tickets in their queue.
 * Ties are broken by lowest user id for deterministic assignment.
 * @returns {Promise<number|null>} Representative user id, or null if none available
 */
async function findRepresentativeWithLowestQueue() {
  const representatives = await User.findAll({
    where: { role: ROLES.REPRESENTATIVE, isActive: true },
    attributes: ['id'],
    order: [['id', 'ASC']],
    raw: true,
  });

  if (representatives.length === 0) {
    return null;
  }

  const repIds = representatives.map((rep) => rep.id);
  const countRows = await Ticket.findAll({
    attributes: ['assignedTo', [fn('COUNT', col('id')), 'count']],
    where: {
      assignedTo: { [Op.in]: repIds },
      status: { [Op.in]: QUEUE_STATUSES },
    },
    group: ['assignedTo'],
    raw: true,
  });

  const countMap = Object.fromEntries(
    countRows.map((row) => [row.assignedTo, parseInt(row.count, 10)])
  );

  let selectedId = repIds[0];
  let lowestCount = countMap[selectedId] || 0;

  for (const repId of repIds.slice(1)) {
    const count = countMap[repId] || 0;
    if (count < lowestCount) {
      lowestCount = count;
      selectedId = repId;
    }
  }

  return selectedId;
}

module.exports = {
  QUEUE_STATUSES,
  findRepresentativeWithLowestQueue,
};
