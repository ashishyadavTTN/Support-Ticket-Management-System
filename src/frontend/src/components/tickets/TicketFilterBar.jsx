import Button from '../ui/Button';
import FilterChips from '../ui/FilterChips';
import SearchInput from '../ui/SearchInput';
import Select from '../ui/Select';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../../constants/tickets';
import { ROLES } from '../../constants/roles';

export default function TicketFilterBar({
  user,
  searchInput,
  onSearchChange,
  isSearching,
  filters,
  representatives,
  hasActiveFilters,
  onStatusChange,
  onPriorityChange,
  onAssignedToChange,
  onClearFilters,
}) {
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <div className="space-y-4 rounded-xl border border-surface-200 bg-white p-4 shadow-xs dark:border-surface-700 dark:bg-surface-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <SearchInput
            type="search"
            placeholder="Search title or description..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            isSearching={isSearching}
            aria-label="Search tickets"
          />
        </div>
        {isAdmin && (
          <div className="w-full lg:w-52">
            <Select
              label="Assigned to"
              value={filters.assignedTo}
              onChange={(e) => onAssignedToChange(e.target.value)}
            >
              <option value="">All assignees</option>
              <option value="unassigned">Unassigned</option>
              {representatives.map((rep) => (
                <option key={rep.id} value={String(rep.id)}>
                  {rep.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="shrink-0">
            Clear filters
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FilterChips
          label="Status"
          options={TICKET_STATUSES}
          selected={filters.status}
          onChange={onStatusChange}
        />
        <FilterChips
          label="Priority"
          options={TICKET_PRIORITIES}
          selected={filters.priority}
          onChange={onPriorityChange}
        />
      </div>
    </div>
  );
}
