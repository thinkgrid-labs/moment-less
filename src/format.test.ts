import { describe, it, expect } from 'vitest';
import { format } from './format.js';

const plainDate = new Temporal.PlainDate(2026, 4, 9);
const plainDateTime = new Temporal.PlainDateTime(2026, 4, 9, 14, 5, 59);
const plainTime = new Temporal.PlainTime(2, 5, 59);
const plainDateTimeMidnight = new Temporal.PlainDateTime(2026, 4, 9, 0, 30, 0);
const zonedDateTime = new Temporal.ZonedDateTime(
  BigInt(1744200000000000000), // ~2026-04-09T...UTC
  'UTC',
);
const instant = Temporal.Instant.fromEpochMilliseconds(1744200000000);

describe('format() — PlainDate', () => {
  it('YYYY-MM-DD', () => {
    expect(format(plainDate, 'YYYY-MM-DD')).toBe('2026-04-09');
  });

  it('YY', () => {
    expect(format(plainDate, 'YY')).toBe('26');
  });

  it('M (no padding)', () => {
    expect(format(plainDate, 'M/D/YYYY')).toBe('4/9/2026');
  });

  it('DD (zero-padded)', () => {
    expect(format(plainDate, 'DD')).toBe('09');
  });

  it('mixed literal text (separators and numbers only)', () => {
    expect(format(plainDate, 'DD/MM/YYYY')).toBe('09/04/2026');
  });

  it('throws on time token', () => {
    expect(() => format(plainDate, 'HH:mm')).toThrow(/hour/i);
  });
});

describe('format() — PlainDateTime', () => {
  it('HH:mm:ss (24-hour)', () => {
    expect(format(plainDateTime, 'HH:mm:ss')).toBe('14:05:59');
  });

  it('hh:mm A (12-hour PM)', () => {
    expect(format(plainDateTime, 'hh:mm A')).toBe('02:05 PM');
  });

  it('hh:mm a (lowercase am)', () => {
    expect(format(plainDateTimeMidnight, 'hh:mm a')).toBe('12:30 am');
  });

  it('12-hour midnight edge: hour=0 → 12', () => {
    const dt = new Temporal.PlainDateTime(2026, 1, 1, 0, 0, 0);
    expect(format(dt, 'hh')).toBe('12');
  });

  it('12-hour noon edge: hour=12 → 12', () => {
    const dt = new Temporal.PlainDateTime(2026, 1, 1, 12, 0, 0);
    expect(format(dt, 'hh A')).toBe('12 PM');
  });

  it('full format', () => {
    expect(format(plainDateTime, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-04-09 14:05:59');
  });
});

describe('format() — PlainTime', () => {
  it('HH:mm:ss', () => {
    expect(format(plainTime, 'HH:mm:ss')).toBe('02:05:59');
  });

  it('throws on date token', () => {
    expect(() => format(plainTime, 'YYYY')).toThrow(/year/i);
  });
});

describe('format() — ZonedDateTime', () => {
  it('formats all tokens', () => {
    const result = format(zonedDateTime, 'YYYY-MM-DD HH:mm:ss');
    // Just ensure it returns a valid-looking string without throwing
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});

describe('format() — Instant (normalized to UTC ZonedDateTime)', () => {
  it('returns a formatted date string', () => {
    const result = format(instant, 'YYYY-MM-DD');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formats time tokens', () => {
    const result = format(instant, 'HH:mm:ss');
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

describe('format() — token collision guard', () => {
  it('MM does not match as two Ms', () => {
    // single-digit month should produce '4', not a collision
    const singleMonth = new Temporal.PlainDate(2026, 4, 1);
    expect(format(singleMonth, 'M')).toBe('4');
    expect(format(singleMonth, 'MM')).toBe('04');
  });

  it('YYYY does not match as two YYs', () => {
    expect(format(plainDate, 'YYYY')).toBe('2026');
    expect(format(plainDate, 'YY')).toBe('26');
  });
});

describe('format() — repeated calls (regex lastIndex reset)', () => {
  it('produces consistent output on repeated calls', () => {
    const result1 = format(plainDate, 'YYYY-MM-DD');
    const result2 = format(plainDate, 'YYYY-MM-DD');
    expect(result1).toBe(result2);
  });
});
