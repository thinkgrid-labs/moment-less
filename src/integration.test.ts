/**
 * Integration tests — real-world format strings and multi-function workflows.
 *
 * These tests verify that format() and fromNow() behave correctly in the
 * patterns developers actually use, not just isolated token behaviour.
 */
import { describe, it, expect } from 'vitest';
import { format, fromNow } from './index.js';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

// A fixed Thursday at 2:05 PM
const DATE = new Temporal.PlainDate(2026, 4, 9);
const DATETIME = new Temporal.PlainDateTime(2026, 4, 9, 14, 5, 59);
const TIME = new Temporal.PlainTime(14, 5, 59);
const ZDT_UTC = Temporal.ZonedDateTime.from('2026-04-09T14:05:59+00:00[UTC]');
const ZDT_NY = Temporal.ZonedDateTime.from('2026-04-09T14:05:59-04:00[America/New_York]');
const ZDT_TOKYO = Temporal.ZonedDateTime.from('2026-04-09T14:05:59+09:00[Asia/Tokyo]');
// Fixed Instant: 2026-04-09T14:05:59Z (= 1775736000000 + 7559s)
const INSTANT = Temporal.Instant.fromEpochMilliseconds(1775743559000);

// ─── Common display patterns ──────────────────────────────────────────────────

describe('integration — common UI date formats', () => {
  it('ISO 8601 date', () => {
    expect(format(DATE, 'YYYY-MM-DD')).toBe('2026-04-09');
  });

  it('ISO 8601 datetime', () => {
    expect(format(DATETIME, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-04-09 14:05:59');
  });

  it('US date format MM/DD/YYYY', () => {
    expect(format(DATE, 'MM/DD/YYYY')).toBe('04/09/2026');
  });

  it('European date format DD.MM.YYYY', () => {
    expect(format(DATE, 'DD.MM.YYYY')).toBe('09.04.2026');
  });

  it('blog post date: MMMM Do, YYYY', () => {
    expect(format(DATE, 'MMMM Do, YYYY')).toBe('April 9th, 2026');
  });

  it('calendar header: MMMM YYYY', () => {
    expect(format(DATE, 'MMMM YYYY')).toBe('April 2026');
  });

  it('short date: MMM D, YYYY', () => {
    expect(format(DATE, 'MMM D, YYYY')).toBe('Apr 9, 2026');
  });

  it('full weekday long: dddd, MMMM Do YYYY', () => {
    expect(format(DATE, 'dddd, MMMM Do YYYY')).toBe('Thursday, April 9th 2026');
  });

  it('compact weekday short: ddd MMM D', () => {
    expect(format(DATE, 'ddd MMM D')).toBe('Thu Apr 9');
  });

  it('12-hour clock with AM/PM: h:mm A', () => {
    expect(format(DATETIME, 'h:mm A')).toBe('2:05 PM');
  });

  it('24-hour time: HH:mm', () => {
    expect(format(DATETIME, 'HH:mm')).toBe('14:05');
  });

  it('time with seconds: HH:mm:ss', () => {
    expect(format(DATETIME, 'HH:mm:ss')).toBe('14:05:59');
  });

  it('chat timestamp: ddd, MMM D - h:mm A', () => {
    expect(format(DATETIME, 'ddd, MMM D - h:mm A')).toBe('Thu, Apr 9 - 2:05 PM');
  });

  it('log timestamp: YYYY-MM-DD HH:mm:ss', () => {
    expect(format(DATETIME, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-04-09 14:05:59');
  });

  it('short year format: D/M/YY', () => {
    expect(format(DATE, 'D/M/YY')).toBe('9/4/26');
  });
});

// ─── Cross-type consistency ───────────────────────────────────────────────────

describe('integration — same date from different Temporal types', () => {
  it('PlainDate and PlainDateTime produce the same date part', () => {
    expect(format(DATE, 'YYYY-MM-DD')).toBe(format(DATETIME, 'YYYY-MM-DD'));
  });

  it('PlainDateTime and ZonedDateTime (UTC) produce the same output', () => {
    expect(format(DATETIME, 'YYYY-MM-DD HH:mm:ss')).toBe(
      format(ZDT_UTC, 'YYYY-MM-DD HH:mm:ss'),
    );
  });

  it('ZonedDateTime fields reflect the local timezone (New York ≠ Tokyo same instant)', () => {
    // Same instant, different local times
    expect(format(ZDT_NY, 'HH:mm')).toBe('14:05');
    expect(format(ZDT_TOKYO, 'HH:mm')).toBe('14:05');
    // But the UTC offset means they are different instants
    expect(ZDT_NY.toInstant().epochMilliseconds).not.toBe(
      ZDT_TOKYO.toInstant().epochMilliseconds,
    );
  });

  it('Instant formatted as UTC date', () => {
    expect(format(INSTANT, 'YYYY-MM-DD')).toBe('2026-04-09');
    expect(format(INSTANT, 'HH:mm:ss')).toBe('14:05:59');
  });

  it('PlainTime — time tokens only', () => {
    expect(format(TIME, 'HH:mm:ss')).toBe('14:05:59');
    expect(format(TIME, 'h:mm A')).toBe('2:05 PM');
  });
});

// ─── format() + fromNow() workflow ───────────────────────────────────────────

describe('integration — format() + fromNow() together', () => {
  const REF = Temporal.Instant.fromEpochMilliseconds(1775736000000); // 2026-04-09T12:00:00Z

  it('displays formatted date and relative time for a past event', () => {
    const eventInstant = Temporal.Instant.fromEpochMilliseconds(
      1775736000000 - 2 * 24 * 3600 * 1000, // 2 days before REF
    );
    const eventDate = eventInstant.toZonedDateTimeISO('UTC').toPlainDate();

    const label = format(eventDate, 'MMM D, YYYY');
    const relative = fromNow(eventInstant, REF);

    expect(label).toBe('Apr 7, 2026');
    expect(relative).toBe('2 days ago');
  });

  it('displays a future event', () => {
    const eventInstant = Temporal.Instant.fromEpochMilliseconds(
      1775736000000 + 7 * 24 * 3600 * 1000, // 1 week after REF
    );
    const eventDate = eventInstant.toZonedDateTimeISO('UTC').toPlainDate();

    const label = format(eventDate, 'dddd, MMMM Do');
    const relative = fromNow(eventInstant, REF);

    expect(label).toBe('Thursday, April 16th');
    expect(relative).toBe('next week');
  });

  it('handles "just now" for a very recent event', () => {
    const nearlyNow = Temporal.Instant.fromEpochMilliseconds(
      1775736000000 - 200, // 200ms before REF
    );
    expect(fromNow(nearlyNow, REF)).toBe('now');
  });
});

// ─── Moment.js compatibility layer ───────────────────────────────────────────

describe('integration — Moment.js format string parity', () => {
  // Strings that Moment.js users commonly pass — verify moment-less handles them
  it('moment default: dddd, MMMM Do YYYY, h:mm:ss a', () => {
    expect(format(DATETIME, 'dddd, MMMM Do YYYY, h:mm:ss a')).toBe(
      'Thursday, April 9th 2026, 2:05:59 pm',
    );
  });

  it('LT-style time: h:mm A', () => {
    expect(format(DATETIME, 'h:mm A')).toBe('2:05 PM');
  });

  it('LL-style: MMMM D, YYYY', () => {
    expect(format(DATE, 'MMMM D, YYYY')).toBe('April 9, 2026');
  });

  it('LLL-style: MMMM D, YYYY h:mm A', () => {
    expect(format(DATETIME, 'MMMM D, YYYY h:mm A')).toBe('April 9, 2026 2:05 PM');
  });

  it('LLLL-style: dddd, MMMM D, YYYY h:mm A', () => {
    expect(format(DATETIME, 'dddd, MMMM D, YYYY h:mm A')).toBe(
      'Thursday, April 9, 2026 2:05 PM',
    );
  });
});

// ─── Named exports from index ─────────────────────────────────────────────────

describe('integration — named exports from index', () => {
  it('format is exported from index', () => {
    expect(typeof format).toBe('function');
  });

  it('fromNow is exported from index', () => {
    expect(typeof fromNow).toBe('function');
  });

  it('both work when imported together', () => {
    const d = new Temporal.PlainDate(2026, 1, 1);
    expect(format(d, 'YYYY')).toBe('2026');
    const i = Temporal.Instant.fromEpochMilliseconds(1775736000000 - 3600000);
    expect(fromNow(i, Temporal.Instant.fromEpochMilliseconds(1775736000000))).toBe('1 hour ago');
  });
});
