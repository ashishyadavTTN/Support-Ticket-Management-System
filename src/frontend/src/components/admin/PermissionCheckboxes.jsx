import { cn } from '../../utils/cn';
import { PERMISSION_OPTIONS } from '../../constants/permissions';

export default function PermissionCheckboxes({ permissions, onChange, disabled }) {
  const toggle = (key) => {
    onChange({ ...permissions, [key]: !permissions[key] });
  };

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-label text-surface-700 dark:text-surface-300">Permissions</legend>
      <div className="space-y-2 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800">
        {PERMISSION_OPTIONS.map(({ key, label }) => (
          <label
            key={key}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-md p-2 transition-colors hover:bg-white dark:hover:bg-surface-700',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <input
              type="checkbox"
              checked={Boolean(permissions[key])}
              onChange={() => toggle(key)}
              disabled={disabled}
              className="mt-0.5 h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500 dark:border-surface-600 dark:bg-surface-900"
            />
            <span>
              <span className="block text-body-sm font-medium text-surface-800 dark:text-surface-200">
                {label}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
