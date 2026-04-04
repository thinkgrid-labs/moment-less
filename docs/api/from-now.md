# fromNow()

Returns a human-readable relative time string such as "3 hours ago" or "in 2 days".

## Signature

```ts
function fromNow(
  temporalObj: RelativeTemporalType,
  reference?: RelativeTemporalType,
  locale?: string
): string

type RelativeTemporalType =
  | Temporal.PlainDate
  | Temporal.PlainDateTime
  | Temporal.ZonedDateTime
  | Temporal.Instant
```

> **Note:** `Temporal.PlainTime` is not supported because it has no calendar component — it is impossible to determine whether a time is in the past or future without a date.

## Parameters

| Parameter      | Type                   | Default                         | Description                                                                 |
|----------------|------------------------|---------------------------------|-----------------------------------------------------------------------------|
| `temporalObj`  | `RelativeTemporalType` | required                        | The Temporal object to describe relative to the reference.                  |
| `reference`    | `RelativeTemporalType` | `Temporal.Now.*` (matching type) | The point in time to measure from. If omitted, uses the current time.      |
| `locale`       | `string`               | runtime default locale          | BCP 47 locale tag. Controls the language of the output string.              |

When `reference` is omitted, moment-less calls `Temporal.Now.instant()` internally. This is fine for display purposes but makes output non-deterministic — always pass an explicit `reference` in unit tests.

## Unit Selection Logic

The unit displayed is chosen based on the absolute difference between `temporalObj` and `reference`:

| Difference                   | Unit displayed   | Example output               |
|------------------------------|------------------|------------------------------|
| < 45 seconds                 | seconds          | "a few seconds ago"          |
| 45 seconds – 44 minutes 29s  | minutes          | "3 minutes ago"              |
| 44:30 – 21 hours 29 minutes  | hours            | "3 hours ago"                |
| 21:30 – 25.5 days            | days             | "3 days ago"                 |
| 25.5 – 45 days               | weeks            | "a month ago" (approx)       |
| 45 days – 10.5 months        | months           | "3 months ago"               |
| > 10.5 months                | years            | "a year ago" / "2 years ago" |

Single-unit boundaries (e.g., exactly 1 hour) use "an hour ago" / "in an hour" instead of "1 hour ago".

## Examples

### Past — Each Unit

```ts
import { fromNow } from 'moment-less'

const now = Temporal.PlainDateTime.from('2026-04-09T14:00:00')

// Seconds
const s10 = now.subtract({ seconds: 10 })
fromNow(s10, now)   // → "a few seconds ago"

// Minutes
const m3 = now.subtract({ minutes: 3 })
fromNow(m3, now)    // → "3 minutes ago"

const m1 = now.subtract({ minutes: 1 })
fromNow(m1, now)    // → "a minute ago"

// Hours
const h3 = now.subtract({ hours: 3 })
fromNow(h3, now)    // → "3 hours ago"

const h1 = now.subtract({ hours: 1 })
fromNow(h1, now)    // → "an hour ago"

// Days
const d2 = now.subtract({ days: 2 })
fromNow(d2, now)    // → "2 days ago"

// Weeks
const w2 = now.subtract({ weeks: 2 })
fromNow(w2, now)    // → "2 weeks ago"

// Months
const mo3 = now.subtract({ months: 3 })
fromNow(mo3, now)   // → "3 months ago"

// Years
const y1 = now.subtract({ years: 1 })
fromNow(y1, now)    // → "a year ago"

const y5 = now.subtract({ years: 5 })
fromNow(y5, now)    // → "5 years ago"
```

### Future

```ts
import { fromNow } from 'moment-less'

const now = Temporal.PlainDateTime.from('2026-04-09T14:00:00')

fromNow(now.add({ minutes: 5 }), now)   // → "in 5 minutes"
fromNow(now.add({ hours: 2 }), now)     // → "in 2 hours"
fromNow(now.add({ days: 3 }), now)      // → "in 3 days"
fromNow(now.add({ weeks: 1 }), now)     // → "in a week"
fromNow(now.add({ months: 2 }), now)    // → "in 2 months"
fromNow(now.add({ years: 1 }), now)     // → "in a year"
```

### With an Explicit Reference Point

Passing an explicit reference makes `fromNow()` deterministic — essential for tests, snapshots, and server-rendered output:

```ts
import { fromNow } from 'moment-less'

const posted = Temporal.Instant.from('2026-04-09T08:00:00Z')
const viewed = Temporal.Instant.from('2026-04-09T12:30:00Z')

fromNow(posted, viewed)
// → "4 hours ago"
// Always returns this string regardless of when the test runs.
```

### Using Instant

```ts
import { fromNow, fromDate } from 'moment-less'

const postedAt = Temporal.Instant.from('2026-04-08T10:00:00Z')
const now = Temporal.Now.instant()

fromNow(postedAt, now)
// → "a day ago"  (or "28 hours ago" depending on actual difference)
```

### Using ZonedDateTime

```ts
import { fromNow } from 'moment-less'

const meeting = Temporal.ZonedDateTime.from(
  '2026-04-10T09:00:00+09:00[Asia/Tokyo]'
)
const now = Temporal.Now.zonedDateTimeISO('Asia/Tokyo')

fromNow(meeting, now)
// → "in 19 hours"  (depending on actual current time)
```

## Locale Examples

`fromNow()` uses `Intl.RelativeTimeFormat` internally, which means locale support is zero-cost — no locale bundles to ship.

```ts
import { fromNow } from 'moment-less'

const now  = Temporal.PlainDateTime.from('2026-04-09T14:00:00')
const past = now.subtract({ hours: 3 })

// English (default)
fromNow(past, now)             // → "3 hours ago"

// French
fromNow(past, now, 'fr')       // → "il y a 3 heures"

// Spanish
fromNow(past, now, 'es')       // → "hace 3 horas"

// German
fromNow(past, now, 'de')       // → "vor 3 Stunden"

// Japanese
fromNow(past, now, 'ja')       // → "3時間前"

// Brazilian Portuguese
fromNow(past, now, 'pt-BR')    // → "há 3 horas"

// Arabic (right-to-left)
fromNow(past, now, 'ar')       // → "قبل ٣ ساعات"
```

## Supported Temporal Types

| Type                   | Supported | Notes                                                      |
|------------------------|-----------|------------------------------------------------------------|
| `Temporal.PlainDate`   | Yes       | Day-level precision; seconds/minutes not considered        |
| `Temporal.PlainDateTime` | Yes     | Full precision                                             |
| `Temporal.ZonedDateTime` | Yes     | Uses wall clock time for comparison                        |
| `Temporal.Instant`     | Yes       | Compares epoch-nanoseconds directly                        |
| `Temporal.PlainTime`   | No        | Throws — no calendar component, cannot determine past/future |

> When mixing types (e.g., passing a `PlainDateTime` as `temporalObj` and an `Instant` as `reference`), moment-less converts both to `Instant` using `Temporal.Now.timeZoneId()` and UTC. Prefer using the same type for `temporalObj` and `reference` to avoid unexpected timezone coercion.
