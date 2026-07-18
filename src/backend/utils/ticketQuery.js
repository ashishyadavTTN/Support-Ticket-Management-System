const SORTABLE_FIELDS = ['id', 'title', 'priority', 'status', 'createdAt', 'updatedAt'];

const PRIORITY_ORDER = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
};

function parseCsvParam(value) {
  if (!value || typeof value !== 'string') return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function buildOrderClause(sortBy, sortOrder) {
  const order = sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  if (sortBy === 'priority') {
    const cases = Object.entries(PRIORITY_ORDER)
      .map(([priority, rank]) => `WHEN '${priority}' THEN ${rank}`)
      .join(' ');
    return [
      [
        require('sequelize').literal(
          `CASE priority ${cases} ELSE 5 END`
        ),
        order,
      ],
    ];
  }

  const field = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
  return [[field, order]];
}

module.exports = {
  SORTABLE_FIELDS,
  parseCsvParam,
  buildOrderClause,
};
