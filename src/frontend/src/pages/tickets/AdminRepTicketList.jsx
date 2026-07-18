import { useCallback, useEffect, useRef, useState } from 'react';
import { getTickets } from '../../api/tickets';
import { getRepresentatives } from '../../api/admin';
import { getAssignees } from '../../api/tickets';
import { useAuth } from '../../context/AuthContext';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useTicketFilters } from '../../hooks/useTicketFilters';
import { ROLES } from '../../constants/roles';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonList from '../../components/ui/Skeleton';
import ErrorState from '../../components/ErrorState';
import TicketFilterBar from '../../components/tickets/TicketFilterBar';
import TicketTable, { TicketMobileList } from '../../components/tickets/TicketTable';
import TicketDetailPanel from '../../components/tickets/TicketDetailPanel';
import NewTicketModal from '../../components/tickets/NewTicketModal';

const PAGE_SIZE = 20;

export default function AdminRepTicketList() {
  const { user } = useAuth();
  const {
    filters,
    hasActiveFilters,
    updateFilters,
    clearFilters,
    setSelectedTicket,
    toggleSort,
  } = useTicketFilters();

  const {
    value: searchInput,
    setValue: setSearchInput,
    debouncedValue: debouncedSearch,
    isDebouncing,
  } = useDebouncedSearch(filters.search, 400);

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [representatives, setRepresentatives] = useState([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const fetchGenerationRef = useRef(0);

  const isAdmin = user?.role === ROLES.ADMIN;
  const canCreate = isAdmin || user?.permissions?.canCreateTickets;

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, updateFilters]);

  useEffect(() => {
    async function loadReps() {
      try {
        if (isAdmin) {
          const data = await getRepresentatives({ activeOnly: true });
          setRepresentatives(data.representatives || []);
        } else if (user?.permissions?.canAssignTickets) {
          const data = await getAssignees();
          setRepresentatives(data.representatives || []);
        }
      } catch {
        setRepresentatives([]);
      }
    }
    loadReps();
  }, [isAdmin, user?.permissions?.canAssignTickets]);

  const fetchTickets = useCallback(async () => {
    const generation = ++fetchGenerationRef.current;
    const hasSearch = Boolean(filters.search?.trim());

    setLoading(true);
    setError(null);
    if (hasSearch) {
      setIsSearching(true);
    }

    try {
      const data = await getTickets({
        search: filters.search || undefined,
        status: filters.status,
        priority: filters.priority,
        assignedTo: filters.assignedTo || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: parseInt(filters.page, 10) || 1,
        limit: PAGE_SIZE,
      });

      if (generation !== fetchGenerationRef.current) return;

      setTickets(data.tickets || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      if (generation !== fetchGenerationRef.current) return;
      setError(err.message);
    } finally {
      if (generation === fetchGenerationRef.current) {
        setLoading(false);
        setIsSearching(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleRowClick = (ticketId) => {
    setSelectedTicket(String(ticketId));
  };

  const handleTicketUpdated = (updatedTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t))
    );
  };

  const handleTicketCreated = () => {
    fetchTickets();
  };

  const goToPage = (page) => {
    updateFilters({ page: String(page) }, { resetPage: false });
  };

  const showSearchIndicator = isDebouncing || isSearching;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1 text-surface-900 dark:text-surface-100">Tickets</h1>
          <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">
            {pagination.total > 0
              ? `${pagination.total} ticket${pagination.total !== 1 ? 's' : ''}`
              : 'Manage and triage support requests'}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowNewTicket(true)}>New Ticket</Button>
        )}
      </div>

      <TicketFilterBar
        user={user}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        isSearching={showSearchIndicator}
        filters={filters}
        representatives={representatives}
        hasActiveFilters={hasActiveFilters}
        onStatusChange={(status) => updateFilters({ status })}
        onPriorityChange={(priority) => updateFilters({ priority })}
        onAssignedToChange={(assignedTo) => updateFilters({ assignedTo })}
        onClearFilters={clearFilters}
      />

      {error && <ErrorState message={error} onRetry={fetchTickets} />}

      {loading ? (
        <SkeletonList count={5} />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title={hasActiveFilters ? 'No tickets match your filters' : 'No tickets yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filter criteria.'
              : 'Create a ticket to get started.'
          }
          actionLabel={!hasActiveFilters && canCreate ? 'New Ticket' : undefined}
          onAction={!hasActiveFilters && canCreate ? () => setShowNewTicket(true) : undefined}
        />
      ) : (
        <>
          <TicketTable
            tickets={tickets}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            selectedTicketId={filters.selectedTicketId}
            onSort={toggleSort}
            onRowClick={handleRowClick}
          />
          <TicketMobileList
            tickets={tickets}
            selectedTicketId={filters.selectedTicketId}
            onRowClick={handleRowClick}
          />

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-surface-200 bg-white px-4 py-3 shadow-xs dark:border-surface-700 dark:bg-surface-900">
              <p className="text-body-sm text-surface-500 dark:text-surface-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => goToPage(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => goToPage(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <TicketDetailPanel
        ticketId={filters.selectedTicketId}
        isOpen={Boolean(filters.selectedTicketId)}
        onClose={() => setSelectedTicket('')}
        representatives={representatives}
        onTicketUpdated={handleTicketUpdated}
      />

      <NewTicketModal
        isOpen={showNewTicket}
        onClose={() => setShowNewTicket(false)}
        onCreated={handleTicketCreated}
      />
    </div>
  );
}
