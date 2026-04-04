import { format } from './format.js';
import type { AnyTemporalObject } from './types.js';

export type CalendarInput = Exclude<AnyTemporalObject, Temporal.PlainTime>;

export interface CalendarOptions {
  /** BCP 47 locale for weekday/month names and time formatting. */
  locale?: string;
  /**
   * Moment.js-style token string for the time portion.
   * @default 'h:mm A'
   */
  timeFormat?: string;
  /** Override the day labels. Useful for localisation or custom copy. */
  labels?: {
    today?: string;
    yesterday?: string;
    tomorrow?: string;
  };
}

function toDateAndTime(obj: CalendarInput): {
  date: Temporal.PlainDate;
  time: Temporal.PlainTime | undefined;
} {
  if (obj instanceof Temporal.PlainDate)
    return { date: obj, time: undefined };
  if (obj instanceof Temporal.PlainDateTime)
    return { date: obj.toPlainDate(), time: obj.toPlainTime() };
  if (obj instanceof Temporal.ZonedDateTime)
    return { date: obj.toPlainDate(), time: obj.toPlainTime() };
  if (obj instanceof Temporal.Instant) {
    const zdt = obj.toZonedDateTimeISO('UTC');
    return { date: zdt.toPlainDate(), time: zdt.toPlainTime() };
  }
  throw new Error('calendar() cannot be used with Temporal.PlainTime — it has no date context');
}

/**
 * Returns a human-readable calendar label for a date relative to a reference
 * point, in the style of Moment.js `.calendar()`.
 *
 * | Diff from reference | Output |
 * |---------------------|--------|
 * | Same day            | `Today at 2:05 PM` |
 * | 1 day before        | `Yesterday at 11:30 AM` |
 * | 1 day after         | `Tomorrow at 9:00 AM` |
 * | 2–6 days before/after | `Monday at 2:05 PM` |
 * | Further away        | `Apr 9, 2026` |
 *
 * @example
 * import { calendar } from 'moment-less';
 *
 * calendar(Temporal.Now.plainDateTimeISO());           // "Today at 2:05 PM"
 * calendar(pastDateTime, undefined, { locale: 'fr' }); // "Hier à 14:05"
 */
export function calendar(
  temporalObj: CalendarInput,
  reference?: Temporal.PlainDate,
  options?: CalendarOptions,
): string {
  const { date, time } = toDateAndTime(temporalObj);
  const ref = reference ?? Temporal.Now.plainDateISO();
  const locale = options?.locale;
  const timeFormat = options?.timeFormat ?? 'h:mm A';
  const labels = {
    today: options?.labels?.today ?? 'Today',
    yesterday: options?.labels?.yesterday ?? 'Yesterday',
    tomorrow: options?.labels?.tomorrow ?? 'Tomorrow',
  };

  // diff.days > 0: target is in the future; < 0: target is in the past
  const diff = ref.until(date, { largestUnit: 'day' });
  const days = diff.days;

  const fmtOpts = locale !== undefined ? { locale } : undefined;
  const timeSuffix =
    time !== undefined ? ` at ${format(time, timeFormat, fmtOpts)}` : '';

  if (days === 0) return `${labels.today}${timeSuffix}`;
  if (days === -1) return `${labels.yesterday}${timeSuffix}`;
  if (days === 1) return `${labels.tomorrow}${timeSuffix}`;
  if (days >= -6 && days <= -2) return `${format(date, 'dddd', fmtOpts)}${timeSuffix}`;
  if (days >= 2 && days <= 6) return `${format(date, 'dddd', fmtOpts)}${timeSuffix}`;
  return format(date, 'MMM D, YYYY', fmtOpts);
}
