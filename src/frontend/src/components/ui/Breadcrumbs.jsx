import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function Breadcrumbs({ items, className }) {
  if (!items?.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4', className)}>
      <ol className="flex min-w-0 items-center gap-1 text-caption sm:gap-1.5 sm:text-body-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1 sm:gap-1.5">
              {index > 0 && (
                <span className="shrink-0 text-surface-400 dark:text-surface-500" aria-hidden="true">
                  /
                </span>
              )}
              {isLast || !item.to ? (
                <span
                  className="truncate font-medium text-surface-700 dark:text-surface-200"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="truncate text-surface-500 transition-colors hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
