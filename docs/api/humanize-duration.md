---
title: humanizeDuration() — API Reference
description: Convert a Temporal.Duration to a human-readable string — "2 hours", "3 days", "1 year". Locale-aware via Intl.RelativeTimeFormat.
---

# humanizeDuration()

Converts a `Temporal.Duration` to a human-readable string, choosing the most significant unit based on the total magnitude of the duration.

## Signature

```ts
function humanizeDuration(
  duration: Temporal.Duration,
  locale?: string
): string
```

## Parameters

| Parameter  | Type                | Default                | Description                                                                     |
|------------|---------------------|------------------------|---------------------------------------------------------------------------------|
| `duration` | `Temporal.Duration` | required               | The duration to humanize. Negative durations produce output like "−3 hours".   |
| `locale`   | `string`            | runtime default locale | BCP 47 locale tag. Controls the language and number formatting of the output.   |

## Unit Selection Logic

`humanizeDuration()` converts the entire duration to seconds (using approximate month = 30 days, approximate year = 365 days), then selects the unit whose threshold the total meets or exceeds. Only the largest unit is shown — this is a humanization function, not a precise formatter.

| Total seconds (approx)     | Unit displayed | Example output       |
|----------------------------|----------------|----------------------|
| < 45                       | seconds        | "a few seconds"      |
| 45 – 2,699 (< 45 min)      | minutes        | "3 minutes"          |
| 2,700 – 75,599 (< 21 hr)   | hours          | "2 hours"            |
| 75,600 – 2,203,199 (< 25.5d) | days         | "3 days"             |
| 2,203,200 – 3,887,999 (< 45d) | weeks       | "a week" / "3 weeks" |
| 3,888,000 – 27,647,999 (< 10.5mo) | months | "2 months"           |
| ≥ 27,648,000               | years          | "a year" / "2 years" |

Single-unit boundaries use "a …" instead of "1 …": "a minute", "an hour", "a day", "a week", "a month", "a year".

## Examples

### By Unit

```ts
import { humanizeDuration } from 'moment-less'

// Seconds
humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 0, 0, 20))
// → "a few seconds"

// Minutes
humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 0, 3))
// → "3 minutes"

humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 0, 1))
// → "a minute"

// Hours
humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 2))
// → "2 hours"

humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 1))
// → "an hour"

// Days
humanizeDuration(new Temporal.Duration(0, 0, 0, 3))
// → "3 days"

humanizeDuration(new Temporal.Duration(0, 0, 0, 1))
// → "a day"

// Weeks
humanizeDuration(new Temporal.Duration(0, 0, 2))
// → "2 weeks"

humanizeDuration(new Temporal.Duration(0, 0, 1))
// → "a week"

// Months
humanizeDuration(new Temporal.Duration(0, 3))
// → "3 months"

humanizeDuration(new Temporal.Duration(0, 1))
// → "a month"

// Years
humanizeDuration(new Temporal.Duration(2))
// → "2 years"

humanizeDuration(new Temporal.Duration(1))
// → "a year"
```

### Multi-Field Durations

When a duration has multiple non-zero fields (e.g., 2 hours and 45 minutes), `humanizeDuration()` converts the total to seconds and picks the most appropriate unit based on the combined magnitude. This mirrors how humans think about time: "I waited 2 hours and 45 minutes" is naturally expressed as "about 3 hours".

```ts
import { humanizeDuration } from 'moment-less'

// 2h 45m → treated as 2.75 hours → rounds to "3 hours"
humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 2, 45))
// → "3 hours"

// 1h 10m → 1.17 hours → still "an hour"
humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 1, 10))
// → "an hour"

// 23h 59m → just under 1 day → "a day"
humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 23, 59))
// → "a day"

// 3 days 6 hours → 3.25 days → "3 days"
humanizeDuration(new Temporal.Duration(0, 0, 0, 3, 6))
// → "3 days"

// 1 month 15 days → ~45 days → "a month"
humanizeDuration(new Temporal.Duration(0, 1, 0, 15))
// → "2 months"
```

### Locale Examples

`humanizeDuration()` uses `Intl.RelativeTimeFormat` (in absolute mode) to produce locale-appropriate strings.

```ts
import { humanizeDuration } from 'moment-less'

const twoHours = new Temporal.Duration(0, 0, 0, 0, 2)

humanizeDuration(twoHours)          // → "2 hours"         (en)
humanizeDuration(twoHours, 'fr')    // → "2 heures"        (French)
humanizeDuration(twoHours, 'es')    // → "2 horas"         (Spanish)
humanizeDuration(twoHours, 'de')    // → "2 Stunden"       (German)
humanizeDuration(twoHours, 'ja')    // → "2時間"            (Japanese)
humanizeDuration(twoHours, 'pt-BR') // → "2 horas"         (Brazilian Portuguese)
humanizeDuration(twoHours, 'ko')    // → "2시간"            (Korean)
humanizeDuration(twoHours, 'ar')    // → "ساعتان"           (Arabic)
humanizeDuration(twoHours, 'zh')    // → "2小时"            (Simplified Chinese)
```

```ts
import { humanizeDuration } from 'moment-less'

const threeMonths = new Temporal.Duration(0, 3)

humanizeDuration(threeMonths)          // → "3 months"
humanizeDuration(threeMonths, 'fr')    // → "3 mois"
humanizeDuration(threeMonths, 'es')    // → "3 meses"
humanizeDuration(threeMonths, 'de')    // → "3 Monate"
```

### Negative Durations

Negative durations produce negated output:

```ts
import { humanizeDuration } from 'moment-less'

humanizeDuration(new Temporal.Duration(0, 0, 0, 0, -3))
// → "3 hours"  (sign is dropped — use fromNow() if you need "ago" / "in X")
```

> `humanizeDuration()` is a magnitude function — it tells you how long a duration *is*, not whether it is in the past or future. For past/future framing, use [`fromNow()`](/api/from-now).

## Approximate Months and Years

`Temporal.Duration` months and years are calendar-aware, meaning their exact length depends on context (a month can be 28, 29, 30, or 31 days). Because `humanizeDuration()` does not have a reference date, it uses approximate values for conversion:

- **1 month ≈ 30 days** (2,592,000 seconds)
- **1 year ≈ 365 days** (31,536,000 seconds)

These approximations are intentional — `humanizeDuration()` is designed for human-readable display, not precise calendar arithmetic. For precise date arithmetic, use `Temporal.PlainDate.until()` with a reference date.

```ts
// If you need precise "how many months between these dates":
const a = Temporal.PlainDate.from('2026-01-15')
const b = Temporal.PlainDate.from('2026-04-09')
const dur = a.until(b, { largestUnit: 'months' })

dur.months  // → 2  (exactly 2 months and 25 days)
humanizeDuration(dur)  // → "3 months"  (approximate, based on total days)
```
