import { describe, it, expect } from 'vitest';
import { calendar } from './calendar.js';

// Fixed reference: Thursday 2026-04-09
const REF = Temporal.PlainDate.from('2026-04-09');

describe('calendar() — day labels', () => {
  it('same day → Today', () => {
    expect(calendar(REF, REF)).toBe('Today');
  });

  it('1 day before → Yesterday', () => {
    const yesterday = Temporal.PlainDate.from('2026-04-08');
    expect(calendar(yesterday, REF)).toBe('Yesterday');
  });

  it('1 day after → Tomorrow', () => {
    const tomorrow = Temporal.PlainDate.from('2026-04-10');
    expect(calendar(tomorrow, REF)).toBe('Tomorrow');
  });
});

describe('calendar() — weekday range (2–6 days)', () => {
  it('2 days before → Monday', () => {
    expect(calendar(Temporal.PlainDate.from('2026-04-07'), REF)).toBe('Tuesday');
  });

  it('6 days before → Friday', () => {
    expect(calendar(Temporal.PlainDate.from('2026-04-03'), REF)).toBe('Friday');
  });

  it('2 days after → Saturday', () => {
    expect(calendar(Temporal.PlainDate.from('2026-04-11'), REF)).toBe('Saturday');
  });

  it('6 days after → Wednesday', () => {
    expect(calendar(Temporal.PlainDate.from('2026-04-15'), REF)).toBe('Wednesday');
  });
});

describe('calendar() — far past/future fallback', () => {
  it('7+ days before → formatted date', () => {
    expect(calendar(Temporal.PlainDate.from('2026-03-01'), REF)).toBe('Mar 1, 2026');
  });

  it('7+ days after → formatted date', () => {
    expect(calendar(Temporal.PlainDate.from('2026-05-01'), REF)).toBe('May 1, 2026');
  });
});

describe('calendar() — with time (PlainDateTime)', () => {
  const REF_DATE = Temporal.PlainDate.from('2026-04-09');

  it('today with time → Today at 2:05 PM', () => {
    const dt = Temporal.PlainDateTime.from('2026-04-09T14:05:00');
    expect(calendar(dt, REF_DATE)).toBe('Today at 2:05 PM');
  });

  it('yesterday with time → Yesterday at 9:30 AM', () => {
    const dt = Temporal.PlainDateTime.from('2026-04-08T09:30:00');
    expect(calendar(dt, REF_DATE)).toBe('Yesterday at 9:30 AM');
  });

  it('tomorrow with time → Tomorrow at 12:00 PM', () => {
    const dt = Temporal.PlainDateTime.from('2026-04-10T12:00:00');
    expect(calendar(dt, REF_DATE)).toBe('Tomorrow at 12:00 PM');
  });

  it('weekday with time → Thursday at 3:00 PM', () => {
    const dt = Temporal.PlainDateTime.from('2026-04-07T15:00:00');
    expect(calendar(dt, REF_DATE)).toBe('Tuesday at 3:00 PM');
  });
});

describe('calendar() — with time (Instant, UTC)', () => {
  it('formats Instant time in UTC', () => {
    // 2026-04-09T14:05:00Z
    const inst = Temporal.Instant.fromEpochMilliseconds(1775743500000);
    const result = calendar(inst, REF);
    expect(result).toMatch(/^Today at/);
  });
});

describe('calendar() — custom timeFormat', () => {
  it('supports 24-hour timeFormat', () => {
    const dt = Temporal.PlainDateTime.from('2026-04-09T14:05:00');
    expect(calendar(dt, REF, { timeFormat: 'HH:mm' })).toBe('Today at 14:05');
  });
});

describe('calendar() — custom labels', () => {
  it('overrides today/yesterday/tomorrow labels', () => {
    const opts = { labels: { today: 'Heute', yesterday: 'Gestern', tomorrow: 'Morgen' } };
    expect(calendar(REF, REF, opts)).toBe('Heute');
    expect(calendar(Temporal.PlainDate.from('2026-04-08'), REF, opts)).toBe('Gestern');
    expect(calendar(Temporal.PlainDate.from('2026-04-10'), REF, opts)).toBe('Morgen');
  });
});

describe('calendar() — default reference (Temporal.Now)', () => {
  it('uses Temporal.Now.plainDateISO() when no reference passed', () => {
    // Should not throw
    const result = calendar(Temporal.Now.plainDateTimeISO());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('calendar() — throws for PlainTime', () => {
  it('throws with a descriptive error', () => {
    const time = new Temporal.PlainTime(10, 0, 0);
    // @ts-expect-error intentional
    expect(() => calendar(time, REF)).toThrow(/PlainTime/);
  });
});
