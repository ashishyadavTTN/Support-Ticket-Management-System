import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StatusFilterDropdown, { ALL_VALUE } from './StatusFilterDropdown';

const OPTIONS = [
  { value: ALL_VALUE, label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

describe('StatusFilterDropdown', () => {
  it('opens and selects a specific status', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <StatusFilterDropdown
        options={OPTIONS}
        selected={['open']}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /status:/i }));
    await user.click(screen.getByRole('option', { name: 'Closed' }));

    expect(onChange).toHaveBeenCalledWith(['open', 'closed']);
  });

  it('switches to all statuses when All is chosen', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <StatusFilterDropdown
        options={OPTIONS}
        selected={['open']}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /status:/i }));
    await user.click(screen.getByRole('option', { name: 'All' }));

    expect(onChange).toHaveBeenCalledWith([ALL_VALUE]);
  });
});
