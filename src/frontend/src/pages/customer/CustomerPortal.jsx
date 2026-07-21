import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTickets } from '../../api/tickets';
import { getDashboardStats } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import SearchInput from '../../components/ui/SearchInput';
import SkeletonList, { Skeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ErrorState';
import StatusFilterDropdown, { ALL_VALUE } from '../../components/ui/StatusFilterDropdown';
import CustomerTicketCard from '../../components/customer/CustomerTicketCard';
import CustomerCreateTicketModal from '../../components/customer/CustomerCreateTicketModal';
import { cn } from '../../utils/cn';

const STATUS_GROUPS = [
  {
    key: 'open',
    label: 'Open',
    color: 'text-status-open dark:text-sky-300',
    bg: 'bg-status-open-bg dark:bg-sky-950',
    border: 'border-sky-200/80 dark:border-sky-900',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    color: 'text-status-in-progress dark:text-amber-300',
    bg: 'bg-status-in-progress-bg dark:bg-amber-950',
    border: 'border-amber-200/80 dark:border-amber-900',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    color: 'text-status-resolved dark:text-emerald-300',
    bg: 'bg-status-resolved-bg dark:bg-emerald-950',
    border: 'border-emerald-200/80 dark:border-emerald-900',
  },
  {
    key: 'closed',
    label: 'Closed',
    color: 'text-status-closed dark:text-stone-300',
    bg: 'bg-status-closed-bg dark:bg-stone-900',
    border: 'border-stone-200/80 dark:border-stone-700',
  },
];

const STATUS_FILTER_OPTIONS = [
  { value: ALL_VALUE, label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DEFAULT_STATUS_FILTER = ['open'];

function buildStatusQuery(statusFilter) {
  if (statusFilter.includes(ALL_VALUE)) {
    return undefined;
  }
  return statusFilter.length > 0 ? statusFilter : undefined;
}

export default function CustomerPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [statusCounts, setStatusCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER);
  const {
    value: searchInput,
    setValue: setSearchInput,
    debouncedValue: debouncedSearch,
    isDebouncing,
  } = useDebouncedSearch('', 400);
  const [showCreateModal, setShowCreateModal] = useState(
    searchParams.get('create') === 'true'
  );

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hasSearch = Boolean(debouncedSearch.trim());
  const isFiltering = !statusFilter.includes(ALL_VALUE) || hasSearch;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTickets({
        search: debouncedSearch.trim() || undefined,
        status: buildStatusQuery(statusFilter),
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 100,
      });
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getDashboardStats();
      setStatusCounts(data.stats?.ticketsByStatus || null);
    } catch {
      setStatusCounts(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCreated = (ticket) => {
    fetchTickets();
    fetchStats();
    navigate(`/tickets/${ticket.id}`);
  };

  const handleStatusFilterChange = (nextFilter) => {
    setStatusFilter(nextFilter);
  };

  const handleStatusCardClick = (statusKey) => {
    setStatusFilter([statusKey]);
  };

  const emptyTitle = isFiltering ? 'No matching requests' : 'No requests yet';
  const emptyDescription = isFiltering
    ? 'Try a different keyword or status, or clear your filters.'
    : "Need help? Submit a support request and we'll take care of it.";

  const clearFilters = () => {
    setStatusFilter([ALL_VALUE]);
    setSearchInput('');
  };

  return (
    <div className="relative mx-auto max-w-5xl pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-display text-surface-900 dark:text-surface-100">Hi, {firstName}</h1>
        <p className="mt-1.5 text-body text-surface-600 dark:text-surface-400">
          Here&apos;s an overview of your support requests
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={fetchTickets} />}

      <section aria-label="Ticket status summary">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_GROUPS.map((group) => {
            const isActive = statusFilter.length === 1 && statusFilter[0] === group.key;

            return (
              <button
                key={group.key}
                type="button"
                onClick={() => handleStatusCardClick(group.key)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all duration-150',
                  group.bg,
                  group.border,
                  isActive
                    ? 'ring-2 ring-brand-500/40 shadow-sm'
                    : 'hover:shadow-sm active:scale-[0.98]'
                )}
                aria-pressed={isActive}
              >
                {statsLoading ? (
                  <Skeleton className="h-8 w-10" />
                ) : (
                  <p className={cn('text-3xl font-bold tracking-tight', group.color)}>
                    {statusCounts?.[group.key] ?? 0}
                  </p>
                )}
                <p className="mt-1 text-caption font-medium text-surface-600 dark:text-surface-400">
                  {group.label}
                </p>
              </button>
            );
          })}
        </div>

        {!statsLoading && statusCounts?.cancelled > 0 && (
          <p className="mt-3 text-caption text-surface-500 dark:text-surface-400">
            {statusCounts.cancelled} cancelled request
            {statusCounts.cancelled !== 1 ? 's' : ''}
          </p>
        )}
      </section>

      <section className="mt-10" aria-label="Your requests">
        <div className="flex flex-col gap-4 border-b border-surface-200 pb-4 dark:border-surface-700 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-h2 text-surface-900 dark:text-surface-100">Your requests</h2>
            {!loading && (
              <p className="mt-0.5 text-body-sm text-surface-500 dark:text-surface-400">
                {tickets.length} request{tickets.length !== 1 ? 's' : ''}
                {isFiltering ? ' matching your filter' : ''}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <SearchInput
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search your requests..."
              isSearching={isDebouncing || (loading && hasSearch)}
              className="min-w-0 flex-1 sm:w-56"
              aria-label="Search requests by keyword"
            />
            <StatusFilterDropdown
              options={STATUS_FILTER_OPTIONS}
              selected={statusFilter}
              onChange={handleStatusFilterChange}
            />
            <Button
              className="hidden shrink-0 md:inline-flex"
              onClick={() => setShowCreateModal(true)}
            >
              New request
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6">
            <SkeletonList count={3} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title={emptyTitle}
              description={emptyDescription}
              actionLabel={isFiltering ? 'Clear filters' : 'Get help'}
              onAction={() => (isFiltering ? clearFilters() : setShowCreateModal(true))}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {tickets.map((ticket) => (
              <CustomerTicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all hover:bg-brand-700 hover:shadow-md active:scale-95 md:hidden"
        aria-label="Create new support request"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <CustomerCreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
