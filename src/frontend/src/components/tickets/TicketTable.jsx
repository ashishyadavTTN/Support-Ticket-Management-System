import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { formatTicketId } from '../../utils/formatTicketId';
import { cn } from '../../utils/cn';

function SortIcon({ active, direction }) {
  return (
    <svg
      className={cn('ml-1 h-3.5 w-3.5', active ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {active && direction === 'asc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      )}
    </svg>
  );
}

function AssigneeCell({ assignee }) {
  if (!assignee) {
    return <span className="text-body-sm text-surface-400 dark:text-surface-500">Unassigned</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <Avatar name={assignee.name} size="sm" />
      <span className="truncate text-body-sm text-surface-700 dark:text-surface-300">{assignee.name}</span>
    </div>
  );
}

export default function TicketTable({
  tickets,
  sortBy,
  sortOrder,
  selectedTicketId,
  onSort,
  onRowClick,
}) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xs dark:border-surface-700 dark:bg-surface-900 md:block">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-surface-200 bg-surface-50/80 dark:border-surface-700 dark:bg-surface-800/80">
            <th className="w-16 px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">
              <button type="button" onClick={() => onSort('id')} className="inline-flex items-center transition-colors hover:text-surface-800 dark:hover:text-surface-200">
                ID
                <SortIcon active={sortBy === 'id'} direction={sortOrder} />
              </button>
            </th>
            <th className="w-[28%] px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">
              <button type="button" onClick={() => onSort('title')} className="inline-flex items-center transition-colors hover:text-surface-800 dark:hover:text-surface-200">
                Title
                <SortIcon active={sortBy === 'title'} direction={sortOrder} />
              </button>
            </th>
            <th className="w-24 px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">
              <button type="button" onClick={() => onSort('priority')} className="inline-flex items-center transition-colors hover:text-surface-800 dark:hover:text-surface-200">
                Priority
                <SortIcon active={sortBy === 'priority'} direction={sortOrder} />
              </button>
            </th>
            <th className="w-28 px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">
              <button type="button" onClick={() => onSort('status')} className="inline-flex items-center transition-colors hover:text-surface-800 dark:hover:text-surface-200">
                Status
                <SortIcon active={sortBy === 'status'} direction={sortOrder} />
              </button>
            </th>
            <th className="w-[18%] px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">
              Assigned To
            </th>
            <th className="w-[14%] px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">
              Created By
            </th>
            <th className="w-28 px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">
              <button type="button" onClick={() => onSort('createdAt')} className="inline-flex items-center transition-colors hover:text-surface-800 dark:hover:text-surface-200">
                Created
                <SortIcon active={sortBy === 'createdAt'} direction={sortOrder} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => onRowClick(ticket.id)}
              className={cn(
                'cursor-pointer transition-colors duration-150',
                selectedTicketId === String(ticket.id)
                  ? 'bg-brand-50/60 dark:bg-brand-950/40'
                  : 'hover:bg-surface-50 dark:hover:bg-surface-800/60'
              )}
            >
              <td className="px-4 py-3 text-body-sm font-medium text-surface-500 dark:text-surface-400">
                {formatTicketId(ticket.id)}
              </td>
              <td className="px-4 py-3">
                <p className="truncate text-body-sm font-medium text-surface-900 dark:text-surface-100">
                  {ticket.title}
                </p>
              </td>
              <td className="px-4 py-3">
                <Badge variant={ticket.priority} type="priority" />
              </td>
              <td className="px-4 py-3">
                <Badge variant={ticket.status} type="status" />
              </td>
              <td className="px-4 py-3">
                <AssigneeCell assignee={ticket.assignee} />
              </td>
              <td className="px-4 py-3">
                <span className="truncate text-body-sm text-surface-600 dark:text-surface-400">
                  {ticket.creator?.name || '—'}
                </span>
              </td>
              <td
                className="px-4 py-3 text-body-sm text-surface-500 dark:text-surface-400"
                title={new Date(ticket.createdAt).toLocaleString()}
              >
                {formatRelativeTime(ticket.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TicketMobileList({ tickets, selectedTicketId, onRowClick }) {
  return (
    <div className="space-y-3 md:hidden">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          type="button"
          onClick={() => onRowClick(ticket.id)}
          className={cn(
            'w-full rounded-xl border bg-white p-4 text-left shadow-xs transition-all duration-150 dark:bg-surface-900',
            selectedTicketId === String(ticket.id)
              ? 'border-brand-300 ring-2 ring-brand-500/20 dark:border-brand-600'
              : 'border-surface-200 hover:border-surface-300 hover:shadow-sm dark:border-surface-700 dark:hover:border-surface-600'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-caption font-medium text-surface-500 dark:text-surface-400">{formatTicketId(ticket.id)}</p>
              <p className="mt-0.5 text-body font-medium text-surface-900 dark:text-surface-100">{ticket.title}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Badge variant={ticket.status} type="status" />
              <Badge variant={ticket.priority} type="priority" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-surface-100 pt-3 dark:border-surface-800">
            <div className="flex items-center gap-2">
              {ticket.assignee ? (
                <>
                  <Avatar name={ticket.assignee.name} size="sm" />
                  <span className="text-caption text-surface-600 dark:text-surface-400">{ticket.assignee.name}</span>
                </>
              ) : (
                <span className="text-caption text-surface-400 dark:text-surface-500">Unassigned</span>
              )}
            </div>
            <span className="text-caption text-surface-500 dark:text-surface-400">
              {formatRelativeTime(ticket.createdAt)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
