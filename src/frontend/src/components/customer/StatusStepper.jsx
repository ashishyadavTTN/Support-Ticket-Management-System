import { cn } from '../../utils/cn';
import { formatStatus } from '../../constants/tickets';

const MAIN_STEPS = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

function getStepIndex(status) {
  if (status === 'cancelled') return -1;
  return MAIN_STEPS.findIndex((s) => s.key === status);
}

export default function StatusStepper({ status }) {
  const isCancelled = status === 'cancelled';
  const currentIndex = getStepIndex(status);

  return (
    <div className="space-y-4">
      {isCancelled && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
          <svg className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <div className="absolute left-0 right-0 top-4 hidden h-0.5 bg-surface-200 dark:bg-surface-700 sm:block" />
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-0">
          {MAIN_STEPS.map((step, index) => {
            const isCompleted = !isCancelled && index < currentIndex;
            const isCurrent = !isCancelled && index === currentIndex;
            const isUpcoming = !isCancelled && index > currentIndex;

            return (
              <li key={step.key} className="relative flex flex-col items-center text-center">
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-caption font-semibold transition-colors duration-300',
                    isCompleted && 'border-brand-500 bg-brand-500 text-white',
                    isCurrent && 'border-brand-500 bg-white text-brand-700 ring-4 ring-brand-100 dark:bg-surface-900 dark:text-brand-300 dark:ring-brand-900',
                    isUpcoming && 'border-surface-300 bg-white text-surface-400 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-500',
                    isCancelled && 'border-surface-300 bg-surface-100 text-surface-400 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-500'
                  )}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-caption font-medium',
                    isCurrent ? 'text-brand-700 dark:text-brand-300' : 'text-surface-500 dark:text-surface-400',
                    isUpcoming && 'text-surface-400 dark:text-surface-500'
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
