import { cn } from '../../utils/cn';
import {
  PERMISSION_LABELS,
  getEnabledPermissionKeys,
} from '../../constants/permissions';

export default function PermissionBadges({ permissions, className }) {
  const enabled = getEnabledPermissionKeys(permissions);

  if (enabled.length === 0) {
    return (
      <span className={cn('text-caption text-surface-400', className)}>
        No permissions
      </span>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {enabled.map((key) => (
        <span
          key={key}
          className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-caption font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
        >
          {PERMISSION_LABELS[key] || key}
        </span>
      ))}
    </div>
  );
}
