import { describe, it, expect } from 'vitest';
import { fromDate } from './fromDate.js';
import { format } from './format.js';

describe('fromDate()', () => {
  it('converts Unix epoch to Temporal.Instant', () => {
    const inst = fromDate(new Date(0));
    expect(inst.epochMilliseconds).toBe(0);
  });

  it('preserves millisecond precision', () => {
    const ms = 1775736000123;
    const inst = fromDate(new Date(ms));
    expect(inst.epochMilliseconds).toBe(ms);
  });

  it('round-trips through format()', () => {
    // 2026-04-09T12:00:00.000Z
    const date = new Date('2026-04-09T12:00:00.000Z');
    const inst = fromDate(date);
    expect(format(inst, 'YYYY-MM-DD')).toBe('2026-04-09');
    expect(format(inst, 'HH:mm:ss')).toBe('12:00:00');
  });

  it('works with Date.now()', () => {
    const inst = fromDate(new Date(Date.now()));
    expect(typeof inst.epochMilliseconds).toBe('number');
    expect(inst.epochMilliseconds).toBeGreaterThan(0);
  });

  it('returns a Temporal.Instant instance', () => {
    const inst = fromDate(new Date());
    expect(inst instanceof Temporal.Instant).toBe(true);
  });
});
