export function formatTicketId(id) {
  if (!id) return '';
  const value = String(id).toLowerCase();
  const compact = value.replace(/-/g, '');

  // UUIDs share long common prefixes in seed data; use the trailing segment for a unique short ID.
  if (/^[0-9a-f]{32}$/.test(compact)) {
    return `#${compact.slice(-8)}`;
  }

  if (value.length <= 8) return `#${value}`;
  return `#${value.slice(0, 8)}`;
}
