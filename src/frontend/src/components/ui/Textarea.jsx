import { useId } from 'react';
import { cn } from '../../utils/cn';
import { FieldWrapper } from './Input';

const textareaClasses =
  'block w-full resize-y rounded border border-surface-300 bg-white px-3 py-2 text-body text-surface-900 shadow-xs transition-colors placeholder:text-surface-400 hover:border-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-surface-100 min-h-[100px] dark:border-surface-600 dark:bg-surface-900 dark:text-surface-100 dark:placeholder:text-surface-500 dark:hover:border-surface-500 dark:disabled:bg-surface-800';

export default function Textarea({
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
  const textareaId = id || props.name || generatedId;

  return (
    <FieldWrapper
      label={label}
      htmlFor={textareaId}
      error={error}
      hint={hint}
      required={required}
    >
      <textarea
        id={textareaId}
        className={cn(
          textareaClasses,
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    </FieldWrapper>
  );
}
