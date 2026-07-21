import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TicketFilterBar from './TicketFilterBar';
import { ROLES } from '../../constants/roles';

const baseProps = {
  searchInput: '',
  onSearchChange: vi.fn(),
  isSearching: false,
  filters: {
    status: [],
    priority: [],
    assignedTo: '',
  },
  representatives: [
    { id: 2, name: 'Bob Representative' },
    { id: 4, name: 'Diana Representative' },
  ],
  hasActiveFilters: false,
  onStatusChange: vi.fn(),
  onPriorityChange: vi.fn(),
  onAssignedToChange: vi.fn(),
  onClearFilters: vi.fn(),
};

describe('TicketFilterBar', () => {
  it('shows assignee filter only for admins', () => {
    const { rerender } = render(
      <TicketFilterBar {...baseProps} user={{ role: ROLES.REPRESENTATIVE }} />
    );
    expect(screen.queryByText(/^assigned to$/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    rerender(<TicketFilterBar {...baseProps} user={{ role: ROLES.ADMIN }} />);
    expect(screen.getByText(/^assigned to$/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('forwards search input changes', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(
      <TicketFilterBar
        {...baseProps}
        user={{ role: ROLES.ADMIN }}
        onSearchChange={onSearchChange}
      />
    );

    await user.type(screen.getByLabelText(/search tickets/i), 'billing');
    expect(onSearchChange).toHaveBeenCalled();
    expect(onSearchChange.mock.calls.some((call) => call[0] === 'b')).toBe(true);
  });

  it('toggles a status chip and shows clear filters when active', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const onClearFilters = vi.fn();

    render(
      <TicketFilterBar
        {...baseProps}
        user={{ role: ROLES.ADMIN }}
        filters={{ status: ['open'], priority: [], assignedTo: '' }}
        hasActiveFilters
        onStatusChange={onStatusChange}
        onClearFilters={onClearFilters}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onStatusChange).toHaveBeenCalledWith([]);

    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});
