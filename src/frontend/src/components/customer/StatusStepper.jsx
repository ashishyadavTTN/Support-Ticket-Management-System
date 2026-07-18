import { cn } from '../../utils/cn';
import { formatStatus } from '../../constants/tickets';

const MAIN_STEPS = [
  { key: 'open', label: 'Open', shortLabel: 'Open' },
  { key: 'in_progress', label: 'In Progress', shortLabel: 'Active' },
  { key: 'resolved', label: 'Resolved', shortLabel: 'Resolved' },
  { key: 'closed', label: 'Closed', shortLabel: 'Closed' },
];

function getStepIndex(status) {
  if (status === 'cancelled') return -1;
  return MAIN_STEPS.findIndex((s) => s.key === status);
}

export default function StatusStepper({ status, className }) {
  const isCancelled = status === 'cancelled';
  const currentIndex = getStepIndex(status);

  return (
    <div className={cn('space-y-3', className)}>
      {isCancelled && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-800 dark:bg-red-950">
          <svg className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <p className="text-body-sm font-medium text-red-800 dark:text-red-300">Ticket cancelled</p>
            <p className="text-caption text-red-600 dark:text-red-400">
              This request was cancelled and will not progress further.
            </p>
          </div>
        </div>
      )}

      <div
        className={cn('relative', isCancelled && 'opacity-50')}
        aria-label={`Ticket status: ${formatStatus(status)}`}
      >
        <ol className="flex items-start justify-between gap-1">
          {MAIN_STEPS.map((step, index) => {
            const isCompleted = !isCancelled && index < currentIndex;
            const isCurrent = !isCancelled && index === currentIndex;
            const isUpcoming = !isCancelled && index > currentIndex;
            const isLast = index === MAIN_STEPS.length - 1;

            return (
              <li key={step.key} className="relative flex min-w-0 flex-1 flex-col items-center">
                {!isLast && (
                  <div
                    className="absolute left-[calc(50%+0.75rem)] right-[calc(-50%+0.75rem)] top-3.5 hidden h-0.5 sm:block"
                    aria-hidden="true"
                  >
                    <div className="h-full w-full bg-surface-200 dark:bg-surface-700" />
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 bg-brand-500 transition-all duration-300',
                        isCompleted ? 'w-full' : 'w-0'
                      )}
                    />
                  </div>
                )}

                <div
                  className={cn(
                    'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[0.625rem] font-semibold transition-colors duration-300 sm:h-8 sm:w-8 sm:text-caption',
                    isCompleted && 'border-brand-500 bg-brand-500 text-white',
                    isCurrent && 'border-brand-500 bg-white text-brand-700 ring-2 ring-brand-100 dark:bg-surface-900 dark:text-brand-300 dark:ring-brand-900/50 sm:ring-4',
                    isUpcoming && 'border-surface-300 bg-white text-surface-400 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-500',
                    isCancelled && 'border-surface-300 bg-surface-100 text-surface-400 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-500'
                  )}
                >
                  {isCompleted ? (
                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <span className="h-2 w-2 rounded-full bg-brand-500" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <span
                  className={cn(
                    'mt-1.5 w-full truncate px-0.5 text-center text-[0.625rem] font-medium leading-tight sm:mt-2 sm:text-caption',
                    isCurrent ? 'text-brand-700 dark:text-brand-300' : 'text-surface-500 dark:text-surface-400',
                    isUpcoming && 'text-surface-400 dark:text-surface-500'
                  )}
                >
                  <span className="sm:hidden">{step.shortLabel}</span>
                  <span className="hidden sm:inline">{step.label}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
