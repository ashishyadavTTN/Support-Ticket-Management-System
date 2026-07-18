import { cn } from '../../utils/cn';
import { Skeleton } from '../ui/Skeleton';

export default function DashboardCard({ label, value, description, className, loading }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-surface-200 bg-white p-5 shadow-xs dark:border-surface-700 dark:bg-surface-900',
        className
      )}
    >
      <p className="text-label text-surface-500 dark:text-surface-400">{label}</p>
      {loading ? (
        <>
          <Skeleton className="mt-2 h-9 w-16" />
          <Skeleton className="mt-2 h-4 w-32" />
        </>
      ) : (
        <>
          <p className="mt-1 text-display text-surface-900 dark:text-surface-100">{value}</p>
          {description && (
            <p className="mt-1 text-caption text-surface-400 dark:text-surface-500">{description}</p>
          )}
        </>
      )}
    </div>
  );
}
