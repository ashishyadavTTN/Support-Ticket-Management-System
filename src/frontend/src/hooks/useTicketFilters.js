import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULTS = {
  search: '',
  status: [],
  priority: [],
  assignedTo: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: '1',
  ticket: '',
};

function parseList(value) {
  if (!value) return [];
  return value.split(',').filter(Boolean);
}

function serializeList(list) {
  return list.length > 0 ? list.join(',') : '';
}

export function useTicketFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || DEFAULTS.search,
      status: parseList(searchParams.get('status')),
      priority: parseList(searchParams.get('priority')),
      assignedTo: searchParams.get('assignedTo') || DEFAULTS.assignedTo,
      sortBy: searchParams.get('sortBy') || DEFAULTS.sortBy,
      sortOrder: searchParams.get('sortOrder') || DEFAULTS.sortOrder,
      page: searchParams.get('page') || DEFAULTS.page,
      selectedTicketId: searchParams.get('ticket') || DEFAULTS.ticket,
    }),
    [searchParams]
  );

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    Boolean(filters.assignedTo);

  const updateFilters = useCallback(
    (updates, { resetPage = true } = {}) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        Object.entries(updates).forEach(([key, value]) => {
          if (key === 'status' || key === 'priority') {
            const serialized = serializeList(value);
            if (serialized) next.set(key, serialized);
            else next.delete(key);
            return;
          }

          if (value === '' || value === null || value === undefined) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });

        if (resetPage && !updates.page) {
          next.set('page', '1');
        }

        return next;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      const ticket = prev.get('ticket');
      if (ticket) next.set('ticket', ticket);
      return next;
    });
  }, [setSearchParams]);

  const setSelectedTicket = useCallback(
    (ticketId) => {
      updateFilters({ ticket: ticketId || '' }, { resetPage: false });
    },
    [updateFilters]
  );

  const toggleSort = useCallback(
    (column) => {
      if (filters.sortBy === column) {
        updateFilters(
          { sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' },
          { resetPage: false }
        );
      } else {
        updateFilters({ sortBy: column, sortOrder: 'desc' }, { resetPage: false });
      }
    },
    [filters.sortBy, filters.sortOrder, updateFilters]
  );

  return {
    filters,
    hasActiveFilters,
    updateFilters,
    clearFilters,
    setSelectedTicket,
    toggleSort,
  };
}
