import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTickets } from '../../api/tickets';
import { getDashboardStats } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonList, { Skeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ErrorState';
import CustomerTicketCard from '../../components/customer/CustomerTicketCard';
import CustomerCreateTicketModal from '../../components/customer/CustomerCreateTicketModal';
import { cn } from '../../utils/cn';

const STATUS_GROUPS = [
  {
    key: 'open',
    label: 'Open',
    color: 'text-status-open dark:text-sky-300',
    bg: 'bg-status-open-bg dark:bg-sky-950 dark:border-sky-900',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    color: 'text-status-in-progress dark:text-amber-300',
    bg: 'bg-status-in-progress-bg dark:bg-amber-950 dark:border-amber-900',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    color: 'text-status-resolved dark:text-emerald-300',
    bg: 'bg-status-resolved-bg dark:bg-emerald-950 dark:border-emerald-900',
  },
  {
    key: 'closed',
    label: 'Closed',
    color: 'text-status-closed dark:text-stone-300',
    bg: 'bg-status-closed-bg dark:bg-stone-900 dark:border-stone-700',
  },
];

export default function CustomerPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [statusCounts, setStatusCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(
    searchParams.get('create') === 'true'
  );

  const firstName = user?.name?.split(' ')[0] || 'there';

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTickets({
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
  }, []);

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
    fetchStats();
  }, [fetchTickets, fetchStats]);

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

  return (
    <div className="relative pb-24 md:pb-6">
      <div className="mb-8">
        <h1 className="text-display text-surface-900 dark:text-surface-100">Hi, {firstName}</h1>
        <p className="mt-2 text-body text-surface-600 dark:text-surface-400">
          Here&apos;s an overview of your support requests
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={fetchTickets} />}

      {loading && statsLoading ? (
        <SkeletonList count={4} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATUS_GROUPS.map((group) => (
              <div
                key={group.key}
                className={cn(
                  'rounded-2xl border border-surface-200 p-4 text-center shadow-xs dark:border-surface-700',
                  group.bg
                )}
              >
                {statsLoading ? (
                  <Skeleton className="mx-auto h-9 w-10" />
                ) : (
                  <p className={cn('text-display font-bold', group.color)}>
                    {statusCounts?.[group.key] ?? 0}
                  </p>
                )}
                <p className="mt-1 text-caption font-medium text-surface-600 dark:text-surface-400">
                  {group.label}
                </p>
              </div>
            ))}
          </div>

          {!statsLoading && statusCounts?.cancelled > 0 && (
            <p className="mt-3 text-center text-caption text-surface-500 dark:text-surface-400">
              {statusCounts.cancelled} cancelled request
              {statusCounts.cancelled !== 1 ? 's' : ''}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-h2 text-surface-900 dark:text-surface-100">Your requests</h2>
            <Button
              className="hidden md:inline-flex"
              onClick={() => setShowCreateModal(true)}
            >
              New request
            </Button>
          </div>

          {loading ? (
            <div className="mt-4">
              <SkeletonList count={3} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="No requests yet"
                description="Need help? Submit a support request and we'll take care of it."
                actionLabel="Get help"
                onAction={() => setShowCreateModal(true)}
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {tickets.map((ticket) => (
                <CustomerTicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </>
      )}

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
