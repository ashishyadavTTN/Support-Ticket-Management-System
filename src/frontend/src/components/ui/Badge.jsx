import { cn } from '../../utils/cn';

const statusStyles = {
  open: 'bg-status-open-bg text-status-open dark:bg-sky-950 dark:text-sky-300',
  in_progress:
    'bg-status-in-progress-bg text-status-in-progress dark:bg-amber-950 dark:text-amber-300',
  resolved:
    'bg-status-resolved-bg text-status-resolved dark:bg-emerald-950 dark:text-emerald-300',
  closed: 'bg-status-closed-bg text-status-closed dark:bg-stone-800 dark:text-stone-300',
  cancelled:
    'bg-status-cancelled-bg text-status-cancelled dark:bg-red-950 dark:text-red-300',
};

const priorityStyles = {
  low: 'bg-priority-low-bg text-priority-low dark:bg-slate-800 dark:text-slate-300',
  medium:
    'bg-priority-medium-bg text-priority-medium dark:bg-violet-950 dark:text-violet-300',
  high: 'bg-priority-high-bg text-priority-high dark:bg-orange-950 dark:text-orange-300',
  critical:
    'bg-priority-critical-bg text-priority-critical dark:bg-red-950 dark:text-red-300',
};

const defaultStyles = 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300';

function formatLabel(value) {
  if (!value) return '';
  return value.replace(/_/g, ' ');
}

export default function Badge({ variant = 'default', type = 'status', children, className }) {
  const value = children || variant;
  const styles =
    type === 'priority'
      ? priorityStyles[variant] || defaultStyles
      : statusStyles[variant] || defaultStyles;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium capitalize',
        styles,
        className
      )}
    >
      {formatLabel(value)}
    </span>
  );
}
