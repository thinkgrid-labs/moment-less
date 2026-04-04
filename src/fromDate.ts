/**
 * Converts a legacy JavaScript `Date` object to a `Temporal.Instant`.
 *
 * This is the recommended bridge for codebases that still receive `Date`
 * values from APIs, database drivers, or third-party libraries.
 *
 * @example
 * import { fromDate, format } from 'moment-less';
 *
 * const instant = fromDate(new Date());
 * format(instant, 'YYYY-MM-DD HH:mm:ss');
 */
export function fromDate(date: Date): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime());
}
