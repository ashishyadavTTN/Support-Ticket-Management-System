import { describe, expect, it } from 'vitest';
import {
  getTransitionBlockReason,
  isValidTransition,
  STATUS_TRANSITIONS,
} from './tickets';

describe('frontend statusTransitions mirror', () => {
  it('allows the Core happy path and cancel paths', () => {
    expect(isValidTransition('open', 'in_progress')).toBe(true);
    expect(isValidTransition('in_progress', 'resolved')).toBe(true);
    expect(isValidTransition('resolved', 'closed')).toBe(true);
    expect(isValidTransition('open', 'cancelled')).toBe(true);
    expect(isValidTransition('in_progress', 'cancelled')).toBe(true);
  });

  it('rejects invalid jumps the UI should disable', () => {
    expect(isValidTransition('open', 'closed')).toBe(false);
    expect(isValidTransition('resolved', 'open')).toBe(false);
    expect(isValidTransition('closed', 'open')).toBe(false);
    expect(getTransitionBlockReason('open', 'closed')).toMatch(/can only move to/i);
    expect(getTransitionBlockReason('closed', 'open')).toMatch(/terminal/i);
  });

  it('keeps configured targets within known statuses', () => {
    const known = new Set(Object.keys(STATUS_TRANSITIONS));
    for (const targets of Object.values(STATUS_TRANSITIONS)) {
      for (const target of targets) {
        expect(known.has(target)).toBe(true);
      }
    }
  });
});
