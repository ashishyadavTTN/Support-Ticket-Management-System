import { describe, expect, it } from 'vitest';
import { formatTicketId } from './formatTicketId';

describe('formatTicketId', () => {
  it('returns distinct short IDs for UUIDs that share a common prefix', () => {
    const ids = [
      'a1000001-0001-4000-8000-000000000001',
      'a1000001-0001-4000-8000-000000000002',
      'a1000001-0001-4000-8000-000000000003',
    ].map(formatTicketId);

    expect(ids).toEqual(['#00000001', '#00000002', '#00000003']);
    expect(new Set(ids).size).toBe(3);
  });

  it('formats short legacy IDs unchanged', () => {
    expect(formatTicketId('42')).toBe('#42');
    expect(formatTicketId('12345678')).toBe('#12345678');
  });

  it('truncates other long non-UUID values from the start', () => {
    expect(formatTicketId('legacy-ticket-identifier')).toBe('#legacy-t');
  });

  it('returns empty string for missing ids', () => {
    expect(formatTicketId(null)).toBe('');
    expect(formatTicketId(undefined)).toBe('');
  });
});
