---
title: calendar() — API Reference
description: Render context-aware calendar labels like "Today at 2:05 PM", "Yesterday", "Monday", or "Apr 9, 2026" from any Temporal date or datetime object.
---

# calendar()

Returns a context-aware calendar label for a date or datetime, following the same conventions as messaging apps: "Today at 2:05 PM", "Yesterday", "Monday", "Apr 9, 2026".

## Signature

```ts
function calendar(
  temporalObj: CalendarInput,
  reference?: CalendarInput,
  options?: CalendarOptions
): string

type CalendarInput =
  | Temporal.PlainDate
  | Temporal.PlainDateTime
  | Temporal.ZonedDateTime
  | Temporal.Instant

interface CalendarOptions {
  /**
   * BCP 47 locale tag for weekday and month name formatting.
   * Also used to look up custom labels if provided.
   * @default runtime default locale
   */
  locale?: string

  /**
   * Hour cycle for time display.
   * 'h12' → "2:05 PM", 'h23' → "14:05"
   * @default 'h12'
   */
  timeFormat?: 'h12' | 'h23'

  /**
   * Override the string labels used for same-day, previous day, and next day.
   * Keys can be locale tags for i18n support.
   */
  labels?: CalendarLabels
}

interface CalendarLabels {
  /** Label for the same calendar day. Use '{time}' to insert the time. */
  today?: string
  /** Label for the previous calendar day. Use '{time}' to insert the time. */
  yesterday?: string
  /** Label for the next calendar day. Use '{time}' to insert the time. */
  tomorrow?: string
}
```

## Day Range Logic

`calendar()` computes the calendar-day difference (not the elapsed seconds) between `temporalObj` and `reference`. A day boundary changes at midnight in the reference's local timezone.

| Day difference | Output                               | Example                |
|----------------|--------------------------------------|------------------------|
| 0              | "Today at {time}" (if time known)    | "Today at 2:05 PM"     |
| 0 (PlainDate)  | "Today"                              | "Today"                |
| -1             | "Yesterday at {time}" (if time known)| "Yesterday at 9:30 AM" |
| -1 (PlainDate) | "Yesterday"                          | "Yesterday"            |
| +1             | "Tomorrow at {time}" (if time known) | "Tomorrow at 3:00 PM"  |
| -2 to -6       | Full weekday name                    | "Monday"               |
| +2 to +6       | Full weekday name                    | "Friday"               |
| ≤ -7 or ≥ +7   | Abbreviated date                     | "Apr 9, 2026"          |

For dates within the current calendar year, the year is omitted: "Apr 9". For dates in a different year, the year is included: "Apr 9, 2026".

## Examples

### PlainDate

When a `PlainDate` is passed, time is never shown (there is no time component).

```ts
import { calendar } from 'moment-less'

const today    = Temporal.PlainDate.from('2026-04-09')
const ref      = Temporal.PlainDate.from('2026-04-09')
const yest     = Temporal.PlainDate.from('2026-04-08')
const tom      = Temporal.PlainDate.from('2026-04-10')
const lastMon  = Temporal.PlainDate.from('2026-04-06')
const old      = Temporal.PlainDate.from('2025-11-15')
const sameYear = Temporal.PlainDate.from('2026-01-03')

calendar(today,    ref)  // → "Today"
calendar(yest,     ref)  // → "Yesterday"
calendar(tom,      ref)  // → "Tomorrow"
calendar(lastMon,  ref)  // → "Monday"
calendar(old,      ref)  // → "Nov 15, 2025"
calendar(sameYear, ref)  // → "Jan 3"
```

### PlainDateTime (with Time)

When a `PlainDateTime` is passed, the time is appended to "Today", "Yesterday", and "Tomorrow" labels.

```ts
import { calendar } from 'moment-less'

const ref    = Temporal.PlainDateTime.from('2026-04-09T14:30:00')
const todayM = Temporal.PlainDateTime.from('2026-04-09T11:00:00')
const yesterM = Temporal.PlainDateTime.from('2026-04-08T09:30:00')
const lastThu = Temporal.PlainDateTime.from('2026-04-03T16:00:00')
const future  = Temporal.PlainDateTime.from('2026-04-11T10:00:00')

calendar(todayM,  ref)  // → "Today at 11:00 AM"
calendar(yesterM, ref)  // → "Yesterday at 9:30 AM"
calendar(lastThu, ref)  // → "Friday at 4:00 PM"  (within 6 days)
calendar(future,  ref)  // → "Saturday at 10:00 AM"
```

### Instant (UTC)

`Instant` values are converted to UTC for comparison and display. If you want a local timezone, convert to `ZonedDateTime` first.

```ts
import { calendar } from 'moment-less'

const now   = Temporal.Instant.from('2026-04-09T14:30:00Z')
const sent  = Temporal.Instant.from('2026-04-09T09:15:00Z')
const sent2 = Temporal.Instant.from('2026-04-07T18:00:00Z')

calendar(sent,  now)  // → "Today at 9:15 AM"
calendar(sent2, now)  // → "Tuesday"
```

### 24-Hour Time Format

```ts
import { calendar } from 'moment-less'

const ref  = Temporal.PlainDateTime.from('2026-04-09T14:30:00')
const msg  = Temporal.PlainDateTime.from('2026-04-09T09:05:00')

calendar(msg, ref, { timeFormat: 'h23' })
// → "Today at 9:05"

calendar(msg, ref, { timeFormat: 'h12' })
// → "Today at 9:05 AM"  (default)
```

### Custom Labels (i18n)

Use the `labels` option to override the "Today", "Yesterday", and "Tomorrow" strings for internationalized UIs. Use `{time}` as the placeholder for the time portion.

```ts
import { calendar } from 'moment-less'

const ref   = Temporal.PlainDateTime.from('2026-04-09T14:30:00')
const msg   = Temporal.PlainDateTime.from('2026-04-09T10:00:00')
const yest  = Temporal.PlainDateTime.from('2026-04-08T18:00:00')
const tom   = Temporal.PlainDateTime.from('2026-04-10T09:00:00')

// German labels
const deOpts = {
  locale: 'de',
  labels: {
    today: 'Heute um {time}',
    yesterday: 'Gestern um {time}',
    tomorrow: 'Morgen um {time}',
  },
}

calendar(msg,  ref, deOpts)  // → "Heute um 10:00 AM"
calendar(yest, ref, deOpts)  // → "Gestern um 6:00 PM"
calendar(tom,  ref, deOpts)  // → "Morgen um 9:00 AM"

// Spanish labels
const esOpts = {
  locale: 'es',
  labels: {
    today: 'Hoy a las {time}',
    yesterday: 'Ayer a las {time}',
    tomorrow: 'Mañana a las {time}',
  },
}

calendar(msg, ref, esOpts)  // → "Hoy a las 10:00 AM"
```

### PlainDate with Custom Labels

When the input is a `PlainDate`, `{time}` is replaced with an empty string and the label is trimmed:

```ts
import { calendar } from 'moment-less'

const today = Temporal.PlainDate.from('2026-04-09')
const ref   = Temporal.PlainDate.from('2026-04-09')

calendar(today, ref, {
  labels: {
    today: 'Heute um {time}',
  },
})
// → "Heute"  (time placeholder stripped and trailing " um" trimmed)
```

## Throws for PlainTime

`Temporal.PlainTime` is not supported by `calendar()` because there is no calendar component — it is impossible to determine which day a time belongs to.

```ts
import { calendar } from 'moment-less'

const time = Temporal.PlainTime.from('14:05:00')
calendar(time)
// Throws: TypeError: calendar() does not support Temporal.PlainTime.
//         Use PlainDate or PlainDateTime instead.
```
