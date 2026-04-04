import { describe, it, expect } from 'vitest';
import { fromNow } from './fromNow.js';

// Fixed reference point: 2026-04-09T12:00:00Z
const REF_EPOCH_MS = 1775736000000;
const ref = Temporal.Instant.fromEpochMilliseconds(REF_EPOCH_MS);

function msBefore(ms: number): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(REF_EPOCH_MS - ms);
}
function msAfter(ms: number): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(REF_EPOCH_MS + ms);
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

describe('fromNow() — past times', () => {
  it('3 hours ago', () => {
    expect(fromNow(msBefore(3 * HOUR), ref)).toBe('3 hours ago');
  });

  it('1 minute ago', () => {
    expect(fromNow(msBefore(MINUTE), ref)).toBe('1 minute ago');
  });

  it('30 seconds ago', () => {
    expect(fromNow(msBefore(30 * SECOND), ref)).toBe('30 seconds ago');
  });

  it('2 days ago', () => {
    expect(fromNow(msBefore(2 * DAY), ref)).toBe('2 days ago');
  });

  it('3 weeks ago', () => {
    expect(fromNow(msBefore(3 * WEEK), ref)).toBe('3 weeks ago');
  });

  it('2 months ago', () => {
    expect(fromNow(msBefore(2 * MONTH), ref)).toBe('2 months ago');
  });

  it('2 years ago', () => {
    expect(fromNow(msBefore(2 * YEAR), ref)).toBe('2 years ago');
  });
});

describe('fromNow() — future times', () => {
  it('3 hours from now', () => {
    const result = fromNow(msAfter(3 * HOUR), ref);
    expect(result).toBe('in 3 hours');
  });

  it('1 day from now', () => {
    const result = fromNow(msAfter(DAY), ref);
    expect(result).toBe('tomorrow');
  });

  it('1 year from now', () => {
    const result = fromNow(msAfter(YEAR), ref);
    expect(result).toBe('next year');
  });
});

describe('fromNow() — edge cases', () => {
  it('0 seconds (same instant)', () => {
    expect(fromNow(ref, ref)).toBe('now');
  });
});

describe('fromNow() — Temporal types', () => {
  it('works with PlainDate', () => {
    const past = new Temporal.PlainDate(2025, 4, 9);
    const result = fromNow(past, ref);
    expect(result).toMatch(/year/);
  });

  it('works with PlainDateTime', () => {
    const past = new Temporal.PlainDateTime(2026, 4, 8, 12, 0, 0);
    const result = fromNow(past, ref);
    expect(result).toBe('yesterday');
  });

  it('works with ZonedDateTime', () => {
    const past = new Temporal.ZonedDateTime(
      BigInt(REF_EPOCH_MS - 3 * HOUR) * BigInt(1_000_000),
      'UTC',
    );
    const result = fromNow(past, ref);
    expect(result).toBe('3 hours ago');
  });

  it('throws for PlainTime', () => {
    const time = new Temporal.PlainTime(10, 0, 0);
    // PlainTime is excluded from the type but we test the runtime guard
    // @ts-expect-error intentional
    expect(() => fromNow(time, ref)).toThrow(/PlainTime/);
  });
});

describe('fromNow() — seconds rounding', () => {
  it('rounds 600ms to 1 second ago', () => {
    // Math.round(-0.6) = -1, so 600ms in the past → "1 second ago"
    const past = Temporal.Instant.fromEpochMilliseconds(REF_EPOCH_MS - 600);
    expect(fromNow(past, ref)).toBe('1 second ago');
  });

  it('rounds 0ms to now', () => {
    expect(fromNow(ref, ref)).toBe('now');
  });

  it('rounds sub-second future to now', () => {
    const future = Temporal.Instant.fromEpochMilliseconds(REF_EPOCH_MS + 499);
    expect(fromNow(future, ref)).toBe('now');
  });
});

describe('fromNow() — locale', () => {
  it('returns English by default', () => {
    expect(fromNow(msBefore(3 * HOUR), ref)).toBe('3 hours ago');
  });

  it('returns Spanish with locale "es"', () => {
    const result = fromNow(msBefore(3 * HOUR), ref, 'es');
    expect(result).toMatch(/hace/i);
  });

  it('returns French with locale "fr"', () => {
    const result = fromNow(msBefore(DAY), ref, 'fr');
    expect(result).toMatch(/hier|jour/i);
  });
});

describe('fromNow() — unit boundary conditions', () => {
  // Exactly at each boundary — value rounds to 1, triggering the next unit

  it('exactly 60 seconds → 1 minute ago', () => {
    expect(fromNow(msBefore(60 * SECOND), ref)).toBe('1 minute ago');
  });

  it('exactly 1 hour → 1 hour ago', () => {
    expect(fromNow(msBefore(HOUR), ref)).toBe('1 hour ago');
  });

  it('exactly 24 hours → 1 day ago (yesterday)', () => {
    expect(fromNow(msBefore(DAY), ref)).toBe('yesterday');
  });

  it('exactly 7 days → last week (numeric: auto)', () => {
    // Intl.RelativeTimeFormat numeric:'auto' converts -1 week to "last week"
    expect(fromNow(msBefore(WEEK), ref)).toBe('last week');
  });

  it('exactly 30 days → last month (numeric: auto)', () => {
    expect(fromNow(msBefore(MONTH), ref)).toBe('last month');
  });

  it('exactly 365 days → 1 year ago', () => {
    expect(fromNow(msBefore(YEAR), ref)).toBe('last year');
  });

  it('59 seconds stays in seconds', () => {
    expect(fromNow(msBefore(59 * SECOND), ref)).toBe('59 seconds ago');
  });

  it('just under 1 hour stays in minutes', () => {
    expect(fromNow(msBefore(59 * MINUTE), ref)).toBe('59 minutes ago');
  });
});

describe('fromNow() — large values', () => {
  it('10 years ago', () => {
    expect(fromNow(msBefore(10 * YEAR), ref)).toBe('10 years ago');
  });

  it('100 days ago → months', () => {
    const result = fromNow(msBefore(100 * DAY), ref);
    expect(result).toMatch(/month/);
  });
});

describe('fromNow() — Instant default reference', () => {
  it('uses Temporal.Now.instant() when no reference passed', () => {
    // Create a date 5 years in the past from actual now
    const wayBack = Temporal.Now.instant().subtract({ hours: 5 });
    const result = fromNow(wayBack);
    expect(result).toBe('5 hours ago');
  });
});
