// Ordered longest-match first to prevent partial token matches
// (e.g. MMMM before MMM before MM before M, dddd before ddd, Do before DD before D)
export const TOKEN_REGEX = /YYYY|YY|MMMM|MMM|MM|M|Do|DD|D|dddd|ddd|HH|hh|H|h|mm|ss|A|a/g;

// ─── Static English fallback tables ──────────────────────────────────────────
// Used when no locale is provided — avoids Intl overhead for the common case.

const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const WEEKDAYS_LONG = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Locale-aware name helpers ────────────────────────────────────────────────
// Construct a plain UTC Date purely for Intl formatting — never exposed to callers.

function getMonthName(month: number, year: number, style: 'long' | 'short', locale: string): string {
  const d = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat(locale, { month: style, timeZone: 'UTC' }).format(d);
}

function getWeekdayName(dayOfWeek: number, style: 'long' | 'short', locale: string): string {
  // ISO dayOfWeek: 1=Monday … 7=Sunday. 2024-01-01 is a Monday.
  const d = new Date(Date.UTC(2024, 0, 1) + (dayOfWeek - 1) * 86_400_000);
  return new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' }).format(d);
}

// ─── Ordinal suffix ───────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

// ─── Duck-typed field guards ──────────────────────────────────────────────────

type HasYear = { year: number };
type HasMonth = { month: number };
type HasDay = { day: number };
type HasDayOfWeek = { dayOfWeek: number };
type HasHour = { hour: number };
type HasMinute = { minute: number };
type HasSecond = { second: number };

function hasYear(obj: object): obj is HasYear { return 'year' in obj; }
function hasMonth(obj: object): obj is HasMonth { return 'month' in obj; }
function hasDay(obj: object): obj is HasDay { return 'day' in obj; }
function hasDayOfWeek(obj: object): obj is HasDayOfWeek { return 'dayOfWeek' in obj; }
function hasHour(obj: object): obj is HasHour { return 'hour' in obj; }
function hasMinute(obj: object): obj is HasMinute { return 'minute' in obj; }
function hasSecond(obj: object): obj is HasSecond { return 'second' in obj; }

function requireYear(obj: object, token: string): number {
  if (!hasYear(obj)) throw new Error(`Token "${token}" requires a year field (not available on PlainTime or Instant — convert first)`);
  return obj.year;
}
function requireMonth(obj: object, token: string): number {
  if (!hasMonth(obj)) throw new Error(`Token "${token}" requires a month field (not available on PlainTime or Instant — convert first)`);
  return obj.month;
}
function requireDay(obj: object, token: string): number {
  if (!hasDay(obj)) throw new Error(`Token "${token}" requires a day field (not available on PlainTime or Instant — convert first)`);
  return obj.day;
}
function requireDayOfWeek(obj: object, token: string): number {
  if (!hasDayOfWeek(obj)) throw new Error(`Token "${token}" requires a dayOfWeek field (only available on PlainDate, PlainDateTime, ZonedDateTime)`);
  return obj.dayOfWeek;
}
function requireHour(obj: object, token: string): number {
  if (!hasHour(obj)) throw new Error(`Token "${token}" requires an hour field (not available on PlainDate — use PlainDateTime or ZonedDateTime)`);
  return obj.hour;
}
function requireMinute(obj: object, token: string): number {
  if (!hasMinute(obj)) throw new Error(`Token "${token}" requires a minute field (not available on PlainDate — use PlainDateTime or ZonedDateTime)`);
  return obj.minute;
}
function requireSecond(obj: object, token: string): number {
  if (!hasSecond(obj)) throw new Error(`Token "${token}" requires a second field (not available on PlainDate — use PlainDateTime or ZonedDateTime)`);
  return obj.second;
}

// ─── Token resolver ───────────────────────────────────────────────────────────

export function resolveToken(token: string, obj: object, locale?: string): string {
  switch (token) {
    // Year
    case 'YYYY':
      return String(requireYear(obj, token));
    case 'YY':
      return String(requireYear(obj, token)).slice(-2);

    // Month
    case 'MMMM': {
      const m = requireMonth(obj, token);
      return locale
        ? getMonthName(m, requireYear(obj, token), 'long', locale)
        : (MONTHS_LONG[m - 1] ?? '');
    }
    case 'MMM': {
      const m = requireMonth(obj, token);
      return locale
        ? getMonthName(m, requireYear(obj, token), 'short', locale)
        : (MONTHS_SHORT[m - 1] ?? '');
    }
    case 'MM':
      return String(requireMonth(obj, token)).padStart(2, '0');
    case 'M':
      return String(requireMonth(obj, token));

    // Day
    case 'Do':
      return ordinal(requireDay(obj, token));
    case 'DD':
      return String(requireDay(obj, token)).padStart(2, '0');
    case 'D':
      return String(requireDay(obj, token));

    // Weekday
    case 'dddd': {
      const dow = requireDayOfWeek(obj, token);
      return locale
        ? getWeekdayName(dow, 'long', locale)
        : (WEEKDAYS_LONG[dow - 1] ?? '');
    }
    case 'ddd': {
      const dow = requireDayOfWeek(obj, token);
      return locale
        ? getWeekdayName(dow, 'short', locale)
        : (WEEKDAYS_SHORT[dow - 1] ?? '');
    }

    // Hour
    case 'HH':
      return String(requireHour(obj, token)).padStart(2, '0');
    case 'hh': {
      const h = requireHour(obj, token);
      return String(h % 12 || 12).padStart(2, '0');
    }
    case 'H':
      return String(requireHour(obj, token));
    case 'h': {
      const h = requireHour(obj, token);
      return String(h % 12 || 12);
    }

    // Minute & second
    case 'mm':
      return String(requireMinute(obj, token)).padStart(2, '0');
    case 'ss':
      return String(requireSecond(obj, token)).padStart(2, '0');

    // AM/PM
    case 'A': {
      const h = requireHour(obj, token);
      return h >= 12 ? 'PM' : 'AM';
    }
    case 'a': {
      const h = requireHour(obj, token);
      return h >= 12 ? 'pm' : 'am';
    }

    default:
      return token;
  }
}
