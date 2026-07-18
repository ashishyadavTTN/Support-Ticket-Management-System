import Avatar from '../ui/Avatar';
import PermissionBadges from './PermissionBadges';
import ActiveToggle from './ActiveToggle';
import { cn } from '../../utils/cn';

export default function RepresentativeTable({
  representatives,
  selectedId,
  onRowClick,
  onToggleActive,
  togglingId,
}) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xs dark:border-surface-700 dark:bg-surface-900 md:block">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-200 bg-surface-50/80 dark:border-surface-700 dark:bg-surface-800/80">
            <th className="px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">Name</th>
            <th className="px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">Email</th>
            <th className="w-28 px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">Status</th>
            <th className="px-4 py-3 text-left text-label text-surface-500 dark:text-surface-400">Permissions</th>
            <th className="w-32 px-4 py-3 text-right text-label text-surface-500 dark:text-surface-400">Assigned</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
          {representatives.map((rep) => (
            <tr
              key={rep.id}
              onClick={() => onRowClick(rep.id)}
              className={cn(
                'cursor-pointer transition-colors duration-150',
                selectedId === rep.id ? 'bg-brand-50/60 dark:bg-brand-950/40' : 'hover:bg-surface-50 dark:hover:bg-surface-800/60',
                !rep.isActive && 'opacity-75'
              )}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={rep.name} size="sm" />
                  <span className="text-body-sm font-medium text-surface-900 dark:text-surface-100">
                    {rep.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-body-sm text-surface-600 dark:text-surface-400">{rep.email}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <ActiveToggle
                    isActive={rep.isActive}
                    onChange={(active) => onToggleActive(rep, active)}
                    disabled={togglingId === rep.id}
                    label={`Toggle ${rep.name} active status`}
                  />
                  <span
                    className={cn(
                      'text-caption font-medium',
                      rep.isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-surface-500 dark:text-surface-400'
                    )}
                  >
                    {rep.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <PermissionBadges permissions={rep.permissions} />
              </td>
              <td className="px-4 py-3 text-right text-body-sm font-medium text-surface-700 dark:text-surface-300">
                {rep.assignedTicketCount ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RepresentativeMobileList({
  representatives,
  selectedId,
  onRowClick,
  onToggleActive,
  togglingId,
}) {
  return (
    <div className="space-y-3 md:hidden">
      {representatives.map((rep) => (
        <button
          key={rep.id}
          type="button"
          onClick={() => onRowClick(rep.id)}
          className={cn(
            'w-full rounded-xl border bg-white p-4 text-left shadow-xs transition-all duration-150 dark:bg-surface-900',
            selectedId === rep.id
              ? 'border-brand-300 ring-2 ring-brand-500/20 dark:border-brand-600'
              : 'border-surface-200 hover:border-surface-300 hover:shadow-sm dark:border-surface-700 dark:hover:border-surface-600',
            !rep.isActive && 'opacity-75'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={rep.name} size="md" />
              <div>
                <p className="text-body font-medium text-surface-900 dark:text-surface-100">{rep.name}</p>
                <p className="text-caption text-surface-500 dark:text-surface-400">{rep.email}</p>
              </div>
            </div>
            <ActiveToggle
              isActive={rep.isActive}
              onChange={(active) => onToggleActive(rep, active)}
              disabled={togglingId === rep.id}
            />
          </div>
          <div className="mt-3 space-y-2 border-t border-surface-100 pt-3 dark:border-surface-800">
            <PermissionBadges permissions={rep.permissions} />
            <p className="text-caption text-surface-500 dark:text-surface-400">
              {rep.assignedTicketCount ?? 0} ticket
              {(rep.assignedTicketCount ?? 0) !== 1 ? 's' : ''} assigned
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
