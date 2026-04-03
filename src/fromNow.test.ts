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
