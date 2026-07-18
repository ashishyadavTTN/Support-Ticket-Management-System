/** Build a return path from router location state (pathname + search). */
export function getReturnPath(from) {
  if (!from) return null;
  if (typeof from === 'string') return from;
  const path = from.pathname || '';
  const search = from.search || '';
  // Support legacy state that stored the full path in pathname only
  if (path.includes('?') && !search) return path;
  return `${path}${search}`;
}
