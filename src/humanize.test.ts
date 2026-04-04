import { describe, it, expect } from 'vitest';
import { humanizeDuration } from './humanize.js';

function dur(fields: Parameters<typeof Temporal.Duration.from>[0]) {
  return Temporal.Duration.from(fields);
}

describe('humanizeDuration() — unit selection', () => {
  it('seconds', () => {
    expect(humanizeDuration(dur({ seconds: 45 }))).toBe('45 seconds');
  });

  it('1 second', () => {
    expect(humanizeDuration(dur({ seconds: 1 }))).toBe('1 second');
  });

  it('minutes', () => {
    expect(humanizeDuration(dur({ minutes: 30 }))).toBe('30 minutes');
  });

  it('1 minute', () => {
    expect(humanizeDuration(dur({ minutes: 1 }))).toBe('1 minute');
  });

  it('hours', () => {
    expect(humanizeDuration(dur({ hours: 3 }))).toBe('3 hours');
  });

  it('1 hour', () => {
    expect(humanizeDuration(dur({ hours: 1 }))).toBe('1 hour');
  });

  it('days', () => {
    expect(humanizeDuration(dur({ days: 5 }))).toBe('5 days');
  });

  it('1 day', () => {
    expect(humanizeDuration(dur({ days: 1 }))).toBe('1 day');
  });

  it('weeks', () => {
    expect(humanizeDuration(dur({ weeks: 3 }))).toBe('3 weeks');
  });

  it('months', () => {
    expect(humanizeDuration(dur({ days: 60 }))).toBe('2 months');
  });

  it('years', () => {
    expect(humanizeDuration(dur({ days: 400 }))).toBe('1 year');
  });

  it('2 years', () => {
    expect(humanizeDuration(dur({ years: 2 }))).toBe('2 years');
  });
});

describe('humanizeDuration() — picks largest unit', () => {
  it('hours + minutes → hours', () => {
    expect(humanizeDuration(dur({ hours: 2, minutes: 45 }))).toBe('3 hours');
  });

  it('days + hours → days', () => {
    expect(humanizeDuration(dur({ days: 1, hours: 12 }))).toBe('2 days');
  });
});

describe('humanizeDuration() — negative duration (abs value)', () => {
  it('treats negative duration as positive magnitude', () => {
    expect(humanizeDuration(dur({ hours: -3 }))).toBe('3 hours');
  });
});

describe('humanizeDuration() — zero', () => {
  it('zero duration → 0 seconds', () => {
    expect(humanizeDuration(dur({ seconds: 0 }))).toBe('0 seconds');
  });
});

describe('humanizeDuration() — locale', () => {
  it('French locale', () => {
    const result = humanizeDuration(dur({ hours: 2 }), 'fr');
    expect(result).toMatch(/heure/i);
  });

  it('Spanish locale', () => {
    const result = humanizeDuration(dur({ days: 3 }), 'es');
    expect(result).toMatch(/día|dias|día/i);
  });

  it('Japanese locale returns a non-empty string', () => {
    const result = humanizeDuration(dur({ hours: 5 }), 'ja');
    expect(result.length).toBeGreaterThan(0);
  });
});
