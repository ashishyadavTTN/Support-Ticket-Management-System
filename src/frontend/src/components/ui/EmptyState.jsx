import { Link } from 'react-router-dom';
import Button from './Button';

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-300 bg-white px-6 py-16 text-center dark:border-surface-600 dark:bg-surface-900">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-100 text-surface-400 dark:bg-surface-800 dark:text-surface-500">
          {icon}
        </div>
      )}
      <h3 className="text-h3 text-surface-900 dark:text-surface-100">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-body-sm text-surface-500 dark:text-surface-400">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="mt-6">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
