import { cn } from '../../utils/cn';

export default function ActiveToggle({ isActive, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={label || (isActive ? 'Deactivate' : 'Activate')}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!isActive);
      }}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        isActive ? 'bg-brand-600' : 'bg-surface-300 dark:bg-surface-600'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200',
          isActive ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}
