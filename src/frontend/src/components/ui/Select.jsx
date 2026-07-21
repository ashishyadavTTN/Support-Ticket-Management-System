import { useId } from 'react';
import { cn } from '../../utils/cn';
import { FieldWrapper } from './Input';

const selectClasses =
  'block w-full appearance-none rounded border border-surface-300 bg-white px-3 py-2 pr-10 text-body text-surface-900 shadow-xs transition-colors hover:border-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-surface-100 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-100 dark:hover:border-surface-500 dark:disabled:bg-surface-800';

export default function Select({
  label,
  id,
  error,
  hint,
  required,
  className,
  children,
  ...props
}) {
  const generatedId = useId();
  // Prefer explicit id/name; fall back so label htmlFor always binds (AI scaffolds often omit both).
  const selectId = id || props.name || generatedId;

  return (
    <FieldWrapper
      label={label}
      htmlFor={selectId}
      error={error}
      hint={hint}
      required={required}
    >
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            selectClasses,
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </FieldWrapper>
  );
}
