import { useId } from 'react';
import { cn } from '../../utils/cn';

const inputClasses =
  'block w-full rounded border border-surface-300 bg-white px-3 py-2 text-body text-surface-900 shadow-xs transition-colors placeholder:text-surface-400 hover:border-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-surface-500 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-100 dark:placeholder:text-surface-500 dark:hover:border-surface-500 dark:disabled:bg-surface-800';

export function FieldWrapper({ label, htmlFor, error, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-label text-surface-700 dark:text-surface-300">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-caption text-surface-500 dark:text-surface-400">{hint}</p>
      )}
      {error && (
        <p className="text-caption text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Input({
  label,
  id,
  error,
  hint,
  required,
  className,
  ...props
}) {
  const generatedId = useId();
  // Prefer explicit id/name; fall back so label htmlFor always binds (AI scaffolds often omit both).
  const inputId = id || props.name || generatedId;

  return (
    <FieldWrapper
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
    >
      <input
        id={inputId}
        className={cn(
          inputClasses,
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
    </FieldWrapper>
  );
}
