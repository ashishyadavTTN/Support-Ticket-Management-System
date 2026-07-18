import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { cn } from '../../utils/cn';

export default function CustomerTicketCard({ ticket, className }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className={cn(
        'group flex h-full min-h-[8.5rem] flex-col rounded-xl border border-surface-200 bg-white p-4 shadow-xs transition-all duration-150',
        'hover:border-brand-200 hover:shadow-sm active:scale-[0.99]',
        'dark:border-surface-700 dark:bg-surface-900 dark:hover:border-brand-700',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-body font-semibold text-surface-900 group-hover:text-brand-700 dark:text-surface-100 dark:group-hover:text-brand-300">
            {ticket.title}
          </p>
          <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-body-sm leading-relaxed text-surface-500 dark:text-surface-400">
            {ticket.description || 'No description'}
          </p>
        </div>
        <Badge variant={ticket.status} type="status" className="shrink-0" />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-surface-100 pt-3 text-caption text-surface-500 dark:border-surface-800 dark:text-surface-400">
        <span className="font-medium">#{ticket.id}</span>
        <span>{formatRelativeTime(ticket.createdAt)}</span>
      </div>
    </Link>
  );
}
