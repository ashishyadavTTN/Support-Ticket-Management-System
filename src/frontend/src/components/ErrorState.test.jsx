import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('renders the error message', () => {
    render(<ErrorState message="Failed to load tickets." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load tickets.');
  });

  it('calls onRetry when Try again is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Boom" onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides the retry button when onRetry is omitted', () => {
    render(<ErrorState message="Boom" />);
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });
});
