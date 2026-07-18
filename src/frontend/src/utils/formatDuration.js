/**
 * Format milliseconds into a human-readable duration for dashboard stats.
 */
export function formatAvgResolution(avgMs, resolvedCount, windowDays = 30) {
  if (!resolvedCount || avgMs == null || avgMs < 0) {
    return {
      value: '—',
      description: `No resolved tickets in the last ${windowDays} days`,
    };
  }

  const hours = avgMs / (1000 * 60 * 60);

  if (hours < 1) {
    const minutes = Math.max(1, Math.round(avgMs / (1000 * 60)));
    return {
      value: `${minutes}m`,
      description: `Across ${resolvedCount} ticket${resolvedCount !== 1 ? 's' : ''} (${windowDays}d)`,
    };
  }

  if (hours < 24) {
    return {
      value: `${hours.toFixed(1)}h`,
      description: `Across ${resolvedCount} ticket${resolvedCount !== 1 ? 's' : ''} (${windowDays}d)`,
    };
  }

  const days = hours / 24;
  return {
    value: `${days.toFixed(1)}d`,
    description: `Across ${resolvedCount} ticket${resolvedCount !== 1 ? 's' : ''} (${windowDays}d)`,
  };
}

export function formatActiveUsersBreakdown(byRole) {
  const parts = [];

  if (byRole.representative) {
    parts.push(`${byRole.representative} Representative${byRole.representative !== 1 ? 's' : ''}`);
  }
  if (byRole.customer) {
    parts.push(`${byRole.customer} Customer${byRole.customer !== 1 ? 's' : ''}`);
  }
  if (byRole.admin) {
    parts.push(`${byRole.admin} Admin${byRole.admin !== 1 ? 's' : ''}`);
  }

  return parts.join(', ') || 'No active users';
}
