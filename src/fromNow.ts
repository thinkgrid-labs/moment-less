import type { AnyTemporalObject } from './types.js';

function toInstant(obj: AnyTemporalObject): Temporal.Instant {
  if (obj instanceof Temporal.Instant) return obj;
  if (obj instanceof Temporal.ZonedDateTime) return obj.toInstant();
  if (obj instanceof Temporal.PlainDateTime) return obj.toZonedDateTime('UTC').toInstant();
  if (obj instanceof Temporal.PlainDate) return obj.toPlainDateTime({ hour: 0, minute: 0, second: 0 }).toZonedDateTime('UTC').toInstant();
  // PlainTime has no date context — cannot convert to Instant
  throw new Error('fromNow() cannot be used with Temporal.PlainTime — it has no date context');
}

type RelativeUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

export function fromNow(
  temporalObj: Exclude<AnyTemporalObject, Temporal.PlainTime>,
  reference?: Temporal.Instant,
  locale?: string,
): string {
  const ref = reference ?? Temporal.Now.instant();
  const target = toInstant(temporalObj as AnyTemporalObject);

  const diffSeconds = (target.epochMilliseconds - ref.epochMilliseconds) / 1000;
  const absDiff = Math.abs(diffSeconds);

  let value: number;
  let unit: RelativeUnit;

  if (absDiff >= 60 * 60 * 24 * 365) {
    value = Math.round(diffSeconds / (60 * 60 * 24 * 365));
    unit = 'year';
  } else if (absDiff >= 60 * 60 * 24 * 30) {
    value = Math.round(diffSeconds / (60 * 60 * 24 * 30));
    unit = 'month';
  } else if (absDiff >= 60 * 60 * 24 * 7) {
    value = Math.round(diffSeconds / (60 * 60 * 24 * 7));
    unit = 'week';
  } else if (absDiff >= 60 * 60 * 24) {
    value = Math.round(diffSeconds / (60 * 60 * 24));
    unit = 'day';
  } else if (absDiff >= 60 * 60) {
    value = Math.round(diffSeconds / (60 * 60));
    unit = 'hour';
  } else if (absDiff >= 60) {
    value = Math.round(diffSeconds / 60);
    unit = 'minute';
  } else {
    value = Math.round(diffSeconds);
    unit = 'second';
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  return rtf.format(value, unit);
}
