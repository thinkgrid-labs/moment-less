// Ordered longest-match first to prevent partial token matches (e.g. YYYY before YY, MM before M)
export const TOKEN_REGEX = /YYYY|YY|MM|M|DD|D|HH|hh|mm|ss|A|a/g;

type HasYear = { year: number };
type HasMonth = { month: number };
type HasDay = { day: number };
type HasHour = { hour: number };
type HasMinute = { minute: number };
type HasSecond = { second: number };

function hasYear(obj: object): obj is HasYear {
  return 'year' in obj;
}
function hasMonth(obj: object): obj is HasMonth {
  return 'month' in obj;
}
function hasDay(obj: object): obj is HasDay {
  return 'day' in obj;
}
function hasHour(obj: object): obj is HasHour {
  return 'hour' in obj;
}
function hasMinute(obj: object): obj is HasMinute {
  return 'minute' in obj;
}
function hasSecond(obj: object): obj is HasSecond {
  return 'second' in obj;
}

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

export function resolveToken(token: string, obj: object): string {
  switch (token) {
    case 'YYYY':
      return String(requireYear(obj, token));
    case 'YY':
      return String(requireYear(obj, token)).slice(-2);
    case 'MM':
      return String(requireMonth(obj, token)).padStart(2, '0');
    case 'M':
      return String(requireMonth(obj, token));
    case 'DD':
      return String(requireDay(obj, token)).padStart(2, '0');
    case 'D':
      return String(requireDay(obj, token));
    case 'HH':
      return String(requireHour(obj, token)).padStart(2, '0');
    case 'hh': {
      const h = requireHour(obj, token);
      return String(h % 12 || 12).padStart(2, '0');
    }
    case 'mm':
      return String(requireMinute(obj, token)).padStart(2, '0');
    case 'ss':
      return String(requireSecond(obj, token)).padStart(2, '0');
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
