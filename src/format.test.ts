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

describe('format() — new tokens: month names', () => {
  it('MMMM — full month name', () => {
    expect(format(plainDate, 'MMMM')).toBe('April');
  });

  it('MMM — short month name', () => {
    expect(format(plainDate, 'MMM')).toBe('Apr');
  });

  it('MMMM D, YYYY — common display format', () => {
    expect(format(plainDate, 'MMMM D, YYYY')).toBe('April 9, 2026');
  });

  it('MMM D, YY', () => {
    expect(format(plainDate, 'MMM D, YY')).toBe('Apr 9, 26');
  });

  it('January edge case', () => {
    expect(format(new Temporal.PlainDate(2026, 1, 1), 'MMMM')).toBe('January');
  });

  it('December edge case', () => {
    expect(format(new Temporal.PlainDate(2026, 12, 31), 'MMMM')).toBe('December');
  });
});

describe('format() — new tokens: weekday names', () => {
  // 2026-04-09 is a Thursday
  it('dddd — full weekday name', () => {
    expect(format(plainDate, 'dddd')).toBe('Thursday');
  });

  it('ddd — short weekday name', () => {
    expect(format(plainDate, 'ddd')).toBe('Thu');
  });

  it('dddd, MMMM Do YYYY — classic Moment format', () => {
    expect(format(plainDate, 'dddd, MMMM Do YYYY')).toBe('Thursday, April 9th 2026');
  });

  it('Monday edge case', () => {
    expect(format(new Temporal.PlainDate(2026, 4, 6), 'dddd')).toBe('Monday');
  });

  it('Sunday edge case', () => {
    expect(format(new Temporal.PlainDate(2026, 4, 12), 'dddd')).toBe('Sunday');
  });

  it('throws on PlainTime (no dayOfWeek)', () => {
    expect(() => format(plainTime, 'dddd')).toThrow(/dayOfWeek/i);
  });
});

describe('format() — new tokens: ordinal day (Do)', () => {
  it('1st', () => {
    expect(format(new Temporal.PlainDate(2026, 4, 1), 'Do')).toBe('1st');
  });

  it('2nd', () => {
    expect(format(new Temporal.PlainDate(2026, 4, 2), 'Do')).toBe('2nd');
  });

  it('3rd', () => {
    expect(format(new Temporal.PlainDate(2026, 4, 3), 'Do')).toBe('3rd');
  });

  it('4th', () => {
    expect(format(new Temporal.PlainDate(2026, 4, 4), 'Do')).toBe('4th');
  });

  it('11th (teen exception)', () => {
    expect(format(new Temporal.PlainDate(2026, 4, 11), 'Do')).toBe('11th');
  });

  it('12th (teen exception)', () => {
    expect(format(new Temporal.PlainDate(2026, 4, 12), 'Do')).toBe('12th');
  });

  it('13th (teen exception)', () => {
    expect(format(new Temporal.PlainDate(2026, 4, 13), 'Do')).toBe('13th');
  });

  it('21st', () => {
    expect(format(new Temporal.PlainDate(2026, 4, 21), 'Do')).toBe('21st');
  });

  it('31st', () => {
    expect(format(new Temporal.PlainDate(2026, 1, 31), 'Do')).toBe('31st');
  });
});

describe('format() — new tokens: unpadded hours (H, h)', () => {
  it('H — 24h no padding', () => {
    expect(format(plainDateTime, 'H:mm')).toBe('14:05');
  });

  it('H — single digit hour no padding', () => {
    const dt = new Temporal.PlainDateTime(2026, 4, 9, 9, 0, 0);
    expect(format(dt, 'H:mm')).toBe('9:00');
  });

  it('h — 12h no padding (PM)', () => {
    expect(format(plainDateTime, 'h:mm A')).toBe('2:05 PM');
  });

  it('h — 12h no padding, midnight → 12', () => {
    expect(format(plainDateTimeMidnight, 'h:mm a')).toBe('12:30 am');
  });

  it('h — single digit morning hour', () => {
    const dt = new Temporal.PlainDateTime(2026, 4, 9, 9, 0, 0);
    expect(format(dt, 'h:mm A')).toBe('9:00 AM');
  });
});

describe('format() — token collision guard', () => {
  it('MMMM before MMM before MM before M', () => {
    expect(format(plainDate, 'MMMM')).toBe('April');
    expect(format(plainDate, 'MMM')).toBe('Apr');
    expect(format(plainDate, 'MM')).toBe('04');
    expect(format(plainDate, 'M')).toBe('4');
  });

  it('Do before DD before D', () => {
    expect(format(plainDate, 'Do')).toBe('9th');
    expect(format(plainDate, 'DD')).toBe('09');
    expect(format(plainDate, 'D')).toBe('9');
  });

  it('HH before H, hh before h', () => {
    expect(format(plainDateTime, 'HH')).toBe('14');
    expect(format(plainDateTime, 'H')).toBe('14');
    expect(format(plainDateTime, 'hh')).toBe('02');
    expect(format(plainDateTime, 'h')).toBe('2');
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

describe('format() — unknown token passthrough', () => {
  it('passes through unrecognised tokens unchanged', () => {
    // 'Q' is not a supported token — should survive in the output
    expect(format(plainDate, 'YYYY-QQ-DD')).toBe('2026-QQ-09');
  });

  it('preserves separator-only strings with no tokens', () => {
    expect(format(plainDate, '---')).toBe('---');
  });
});

describe('format() — all 12 months (MMMM / MMM)', () => {
  const MONTHS_LONG = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  for (let m = 1; m <= 12; m++) {
    it(`month ${m} full name`, () => {
      const d = new Temporal.PlainDate(2026, m, 1);
      expect(format(d, 'MMMM')).toBe(MONTHS_LONG[m - 1]);
    });
    it(`month ${m} short name`, () => {
      const d = new Temporal.PlainDate(2026, m, 1);
      expect(format(d, 'MMM')).toBe(MONTHS_SHORT[m - 1]);
    });
  }
});

describe('format() — all 7 weekdays (dddd / ddd)', () => {
  // Week starting Monday 2026-04-06
  const WEEKDAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    it(`day ${i + 1} full name`, () => {
      const d = new Temporal.PlainDate(2026, 4, 6 + i); // 6=Mon … 12=Sun
      expect(format(d, 'dddd')).toBe(WEEKDAYS_LONG[i]);
    });
    it(`day ${i + 1} short name`, () => {
      const d = new Temporal.PlainDate(2026, 4, 6 + i);
      expect(format(d, 'ddd')).toBe(WEEKDAYS_SHORT[i]);
    });
  }
});

describe('format() — boundary & calendar edge cases', () => {
  it('leap year Feb 29', () => {
    const d = new Temporal.PlainDate(2028, 2, 29);
    expect(format(d, 'YYYY-MM-DD')).toBe('2028-02-29');
    expect(format(d, 'MMMM Do')).toBe('February 29th');
  });

  it('year 2000: YY produces "00"', () => {
    const d = new Temporal.PlainDate(2000, 1, 1);
    expect(format(d, 'YY')).toBe('00');
  });

  it('hour 23 in 12h format is 11 PM', () => {
    const dt = new Temporal.PlainDateTime(2026, 4, 9, 23, 59, 0);
    expect(format(dt, 'h:mm A')).toBe('11:59 PM');
    expect(format(dt, 'hh:mm A')).toBe('11:59 PM');
  });

  it('hour 11 in 12h format is 11 AM', () => {
    const dt = new Temporal.PlainDateTime(2026, 4, 9, 11, 0, 0);
    expect(format(dt, 'h A')).toBe('11 AM');
  });

  it('ZonedDateTime in non-UTC timezone reflects local fields', () => {
    // 2026-04-09T14:05:59+09:00[Asia/Tokyo]
    const zdt = Temporal.ZonedDateTime.from('2026-04-09T14:05:59+09:00[Asia/Tokyo]');
    expect(format(zdt, 'HH:mm')).toBe('14:05');
    expect(format(zdt, 'YYYY-MM-DD')).toBe('2026-04-09');
  });
});
