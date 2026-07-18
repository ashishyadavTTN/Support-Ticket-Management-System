import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

const ALL_VALUE = 'all';

export default function StatusFilterDropdown({
  options,
  selected,
  onChange,
  className,
  label = 'Status',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const isAllSelected = selected.includes(ALL_VALUE);
  const specificSelected = selected.filter((value) => value !== ALL_VALUE);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleOption = (value) => {
    if (value === ALL_VALUE) {
      onChange(isAllSelected ? ['open'] : [ALL_VALUE]);
      return;
    }

    if (isAllSelected) {
      onChange([value]);
      return;
    }

    if (specificSelected.includes(value)) {
      const next = specificSelected.filter((item) => item !== value);
      onChange(next.length > 0 ? next : ['open']);
      return;
    }

    onChange([...specificSelected, value]);
  };

  const getButtonLabel = () => {
    if (isAllSelected) return 'All statuses';
    if (specificSelected.length === 1) {
      return options.find((option) => option.value === specificSelected[0])?.label || 'Status';
    }
    return `${specificSelected.length} statuses`;
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex min-w-[10.5rem] items-center justify-between gap-2 rounded-lg border border-surface-300 bg-white px-3 py-2 text-body-sm font-medium text-surface-700 shadow-xs transition-colors',
          'hover:border-surface-400 hover:bg-surface-50',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          'dark:border-surface-600 dark:bg-surface-900 dark:text-surface-200 dark:hover:border-surface-500 dark:hover:bg-surface-800',
          open && 'border-brand-500 ring-2 ring-brand-500/20'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${getButtonLabel()}`}
      >
        <span className="truncate">{getButtonLabel()}</span>
        <svg
          className={cn('h-4 w-4 shrink-0 text-surface-400 transition-transform', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-1.5 w-52 rounded-xl border border-surface-200 bg-white p-1.5 shadow-lg dark:border-surface-700 dark:bg-surface-900"
          role="listbox"
          aria-label={label}
          aria-multiselectable="true"
        >
          {options.map((option) => {
            const isSelected =
              option.value === ALL_VALUE
                ? isAllSelected
                : !isAllSelected && specificSelected.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => toggleOption(option.value)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body-sm transition-colors',
                  isSelected
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-surface-700 hover:bg-surface-50 dark:text-surface-200 dark:hover:bg-surface-800'
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                    isSelected
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-surface-300 bg-white dark:border-surface-600 dark:bg-surface-900'
                  )}
                >
                  {isSelected && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { ALL_VALUE };
