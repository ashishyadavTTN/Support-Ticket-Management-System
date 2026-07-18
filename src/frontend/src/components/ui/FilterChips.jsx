import { cn } from '../../utils/cn';

export default function FilterChips({ label, options, selected, onChange }) {
  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <span className="text-label text-surface-600 dark:text-surface-400">{label}</span>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-caption font-medium transition-all duration-150',
                isActive
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-xs dark:bg-brand-950 dark:text-brand-300'
                  : 'border-surface-300 bg-white text-surface-600 hover:border-surface-400 hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-surface-500 dark:hover:bg-surface-700'
              )}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
