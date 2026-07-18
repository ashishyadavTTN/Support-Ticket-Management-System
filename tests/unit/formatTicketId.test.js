const fs = require('fs');
const path = require('path');

function loadFormatTicketId() {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../../src/frontend/src/utils/formatTicketId.js'),
    'utf8'
  );
  const body = source.replace('export ', '');
  // eslint-disable-next-line no-new-func
  return new Function(`${body}; return formatTicketId;`)();
}

describe('formatTicketId (unit)', () => {
  const formatTicketId = loadFormatTicketId();

  it('returns distinct short IDs for seeded demo UUIDs', () => {
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
});
