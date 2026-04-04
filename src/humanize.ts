type HumanizeUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

/**
 * Converts a `Temporal.Duration` to the most human-readable single-unit string.
 *
 * Uses `Intl.RelativeTimeFormat.formatToParts` to extract the localized value
 * and unit, stripping the directional prefix ("in") so only the magnitude is
 * returned: "2 hours", "3 jours", "2 horas".
 *
 * Units are approximate for months (30 days) and years (365 days).
 *
 * @example
 * import { humanizeDuration } from 'moment-less';
 *
 * humanizeDuration(Temporal.Duration.from({ hours: 2, minutes: 45 })); // "2 hours"
 * humanizeDuration(Temporal.Duration.from({ days: 400 }));             // "1 year"
 * humanizeDuration(Temporal.Duration.from({ seconds: 45 }), 'fr');     // "45 secondes"
 */
export function humanizeDuration(
  duration: Temporal.Duration,
  locale?: string,
): string {
  // Approximate total seconds — months/years are calendar-approximate
  const totalSeconds = Math.abs(
    duration.years * 365 * 86_400 +
    duration.months * 30 * 86_400 +
    duration.weeks * 7 * 86_400 +
    duration.days * 86_400 +
    duration.hours * 3_600 +
    duration.minutes * 60 +
    duration.seconds +
    duration.milliseconds / 1_000,
  );

  let value: number;
  let unit: HumanizeUnit;

  if (totalSeconds >= 365 * 86_400) {
    value = Math.round(totalSeconds / (365 * 86_400));
    unit = 'year';
  } else if (totalSeconds >= 30 * 86_400) {
    value = Math.round(totalSeconds / (30 * 86_400));
    unit = 'month';
  } else if (totalSeconds >= 7 * 86_400) {
    value = Math.round(totalSeconds / (7 * 86_400));
    unit = 'week';
  } else if (totalSeconds >= 86_400) {
    value = Math.round(totalSeconds / 86_400);
    unit = 'day';
  } else if (totalSeconds >= 3_600) {
    value = Math.round(totalSeconds / 3_600);
    unit = 'hour';
  } else if (totalSeconds >= 60) {
    value = Math.round(totalSeconds / 60);
    unit = 'minute';
  } else {
    value = Math.round(totalSeconds);
    unit = 'second';
  }

  // Use formatToParts with a positive (future) value to get consistent direction.
  // Slice from the first `integer` part onward to strip the directional prefix
  // ("in ", "dans ", "en ", etc.), leaving just the value + unit: "2 hours".
  const parts = new Intl.RelativeTimeFormat(locale, {
    numeric: 'always',
    style: 'long',
  }).formatToParts(value, unit);

  const intIdx = parts.findIndex((p) => p.type === 'integer');
  const meaningful = intIdx === -1 ? parts : parts.slice(intIdx);
  return meaningful.map((p) => p.value).join('').trim();
}
