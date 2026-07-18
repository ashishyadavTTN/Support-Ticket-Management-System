import Input from './Input';
import { cn } from '../../utils/cn';

export default function SearchInput({
  value,
  onChange,
  isSearching,
  className,
  inputClassName,
  ...props
}) {
  return (
    <div className={cn('relative', className)}>
      <Input
        value={value}
        onChange={onChange}
        className={cn(isSearching && 'pr-32', inputClassName)}
        {...props}
      />
      {isSearching && (
        <div
          className={cn(
            'pointer-events-none absolute right-3 flex items-center gap-1.5 text-caption text-brand-600 dark:text-brand-400',
            props.label ? 'bottom-2' : 'top-1/2 -translate-y-1/2'
          )}
          aria-live="polite"
        >
          <svg
            className="h-3.5 w-3.5 animate-spin"
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
          <span>Searching...</span>
        </div>
      )}
    </div>
  );
}
