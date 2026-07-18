import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api/dashboard';
import { formatAvgResolution } from '../../utils/formatDuration';
import DashboardCard from '../../components/dashboard/DashboardCard';
import ErrorState from '../../components/ErrorState';

export default function RepresentativeDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const resolution = stats
    ? formatAvgResolution(
        stats.avgResolution?.avgMs,
        stats.avgResolution?.resolvedCount,
        stats.avgResolution?.windowDays
      )
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-surface-900 dark:text-surface-100">Representative Dashboard</h1>
        <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">
          Your assigned tickets and workload at a glance
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={fetchStats} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard
          label="Assigned Open Tickets"
          value={stats ? String(stats.openAssignedTickets ?? 0) : '—'}
          description="Open or in progress, assigned to you"
          loading={loading}
        />
        <DashboardCard
          label="Avg. Resolution (30d)"
          value={resolution?.value ?? '—'}
          description={resolution?.description}
          loading={loading}
        />
      </div>
    </div>
  );
}
