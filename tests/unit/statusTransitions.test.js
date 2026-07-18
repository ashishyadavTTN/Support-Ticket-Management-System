const {
  STATUS_VALUES,
  STATUS_TRANSITIONS,
  getAllowedTransitions,
  isValidTransition,
} = require('../../src/backend/constants/statusTransitions');

describe('statusTransitions (unit)', () => {
  it('exposes the five expected statuses', () => {
    expect(STATUS_VALUES).toEqual([
      'open',
      'in_progress',
      'resolved',
      'closed',
      'cancelled',
    ]);
  });

  describe('getAllowedTransitions', () => {
    it('returns the configured targets for each status', () => {
      expect(getAllowedTransitions('open')).toEqual(['in_progress', 'cancelled']);
      expect(getAllowedTransitions('in_progress')).toEqual([
        'resolved',
        'open',
        'cancelled',
      ]);
      expect(getAllowedTransitions('resolved')).toEqual(['closed', 'in_progress']);
    });

    it('returns an empty array for terminal statuses', () => {
      expect(getAllowedTransitions('closed')).toEqual([]);
      expect(getAllowedTransitions('cancelled')).toEqual([]);
    });

    it('returns an empty array for unknown statuses', () => {
      expect(getAllowedTransitions('bogus')).toEqual([]);
      expect(getAllowedTransitions(undefined)).toEqual([]);
    });
  });

  describe('isValidTransition — required valid paths', () => {
    it.each([
      ['open', 'in_progress'],
      ['in_progress', 'resolved'],
      ['resolved', 'closed'],
      ['open', 'cancelled'],
      ['in_progress', 'cancelled'],
    ])('allows %s -> %s', (from, to) => {
      expect(isValidTransition(from, to)).toBe(true);
    });
  });

  describe('isValidTransition — invalid paths are rejected', () => {
    it.each([
      ['open', 'resolved'],
      ['open', 'closed'],
      ['resolved', 'open'],
      ['closed', 'open'],
      ['closed', 'in_progress'],
      ['cancelled', 'open'],
      ['cancelled', 'in_progress'],
    ])('rejects %s -> %s', (from, to) => {
      expect(isValidTransition(from, to)).toBe(false);
    });
  });

  it('treats a no-op transition (same status) as valid', () => {
    expect(isValidTransition('open', 'open')).toBe(true);
    expect(isValidTransition('closed', 'closed')).toBe(true);
  });

  it('keeps every configured target within the known status set', () => {
    for (const targets of Object.values(STATUS_TRANSITIONS)) {
      for (const target of targets) {
        expect(STATUS_VALUES).toContain(target);
      }
    }
  });
});
