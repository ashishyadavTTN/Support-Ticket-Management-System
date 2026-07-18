import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { cn } from '../../utils/cn';

export default function CustomerTicketCard({ ticket, className }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className={cn(
        'block rounded-2xl border border-surface-200 bg-white p-4 shadow-xs transition-all duration-150',
        'hover:border-brand-200 hover:shadow-sm active:scale-[0.99]',
        'dark:border-surface-700 dark:bg-surface-900 dark:hover:border-brand-700',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-body font-medium text-surface-900 dark:text-surface-100">{ticket.title}</p>
          <p className="mt-1 line-clamp-2 text-body-sm text-surface-500 dark:text-surface-400">
            {ticket.description || 'No description'}
          </p>
        </div>
        <Badge variant={ticket.status} type="status" />
      </div>
      <div className="mt-3 flex items-center justify-between text-caption text-surface-500 dark:text-surface-400">
        <span>#{ticket.id}</span>
        <span>{formatRelativeTime(ticket.createdAt)}</span>
      </div>
    </Link>
  );
}
