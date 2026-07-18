import { useEffect, useState } from 'react';
import { getAdminDashboardStats } from '../../api/dashboard';
import {
  formatActiveUsersBreakdown,
  formatAvgResolution,
} from '../../utils/formatDuration';
import DashboardCard from '../../components/dashboard/DashboardCard';
import ErrorState from '../../components/ErrorState';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDashboardStats();
      setStats(data);
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
        <h1 className="text-h1 text-surface-900 dark:text-surface-100">Admin Dashboard</h1>
        <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">
          Overview of your support operations
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={fetchStats} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          label="Open Tickets"
          value={stats ? String(stats.openTickets?.total ?? 0) : '—'}
          description="Open or in progress"
          loading={loading}
        />
        <DashboardCard
          label="Active Users"
          value={stats ? String(stats.activeUsers?.total ?? 0) : '—'}
          description={
            stats ? formatActiveUsersBreakdown(stats.activeUsers?.byRole || {}) : undefined
          }
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
