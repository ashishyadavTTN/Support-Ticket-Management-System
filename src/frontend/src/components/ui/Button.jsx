import { cn } from '../../utils/cn';

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm disabled:bg-brand-300',
  secondary:
    'bg-white text-surface-700 border border-surface-300 hover:bg-surface-50 active:bg-surface-100 shadow-xs disabled:text-surface-400 dark:bg-surface-800 dark:text-surface-200 dark:border-surface-600 dark:hover:bg-surface-700 dark:active:bg-surface-600',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm disabled:bg-red-300',
  ghost:
    'bg-transparent text-surface-600 hover:bg-surface-100 active:bg-surface-200 disabled:text-surface-400 dark:text-surface-300 dark:hover:bg-surface-800 dark:active:bg-surface-700',
};

const sizes = {
  sm: 'h-8 px-3 text-body-sm gap-1.5',
  md: 'h-10 px-4 text-body-sm gap-2',
  lg: 'h-11 px-5 text-body gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  isLoading,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded font-medium transition-colors',
        'focus-visible:ring-brand-500 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}
