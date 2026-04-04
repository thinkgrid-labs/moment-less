---
title: format() — API Reference
description: Format any Temporal object (PlainDate, Instant, ZonedDateTime) using Moment.js tokens like YYYY-MM-DD, MMM Do YYYY, and HH:mm:ss. Full token reference included.
---

# format()

Token-based date and time formatting for Temporal objects.

## Signature

```ts
function format(
  temporalObj: FormattableTemporalType,
  formatString: string,
  options?: FormatOptions
): string

type FormattableTemporalType =
  | Temporal.PlainDate
  | Temporal.PlainDateTime
  | Temporal.PlainTime
  | Temporal.ZonedDateTime
  | Temporal.Instant

interface FormatOptions {
  /**
   * BCP 47 locale tag used for month and weekday names.
   * Defaults to the runtime's default locale.
   * @example 'fr', 'es', 'ja', 'de', 'zh-TW'
   */
  locale?: string
}
```

## Token Reference

Tokens are matched left-to-right. Longer tokens take precedence over shorter ones (e.g., `MMMM` is matched before `MMM`, and `MMM` before `MM`). Wrap any literal text in square brackets to prevent it from being interpreted as tokens: `[at]`, `[Today is]`.

### Date Tokens

| Token  | Type       | Example output | Description                              |
|--------|------------|----------------|------------------------------------------|
| `YYYY` | Year       | `2026`         | Full 4-digit year                        |
| `YY`   | Year       | `26`           | 2-digit year (last two digits)           |
| `MMMM` | Month      | `April`        | Full month name (locale-aware)           |
| `MMM`  | Month      | `Apr`          | Abbreviated month name (locale-aware)    |
| `MM`   | Month      | `04`           | Numeric month, zero-padded (01–12)       |
| `M`    | Month      | `4`            | Numeric month, no padding (1–12)         |
| `Do`   | Day        | `9th`          | Day of month with ordinal suffix         |
| `DD`   | Day        | `09`           | Day of month, zero-padded (01–31)        |
| `D`    | Day        | `9`            | Day of month, no padding (1–31)          |
| `dddd` | Weekday    | `Thursday`     | Full weekday name (locale-aware)         |
| `ddd`  | Weekday    | `Thu`          | Abbreviated weekday name (locale-aware)  |
| `d`    | Weekday    | `4`            | Weekday index (0=Sunday, 6=Saturday)     |

### Time Tokens

| Token  | Type       | Example output | Description                              |
|--------|------------|----------------|------------------------------------------|
| `HH`   | Hour       | `14`           | 24-hour clock, zero-padded (00–23)       |
| `H`    | Hour       | `14`           | 24-hour clock, no padding (0–23)         |
| `hh`   | Hour       | `02`           | 12-hour clock, zero-padded (01–12)       |
| `h`    | Hour       | `2`            | 12-hour clock, no padding (1–12)         |
| `mm`   | Minute     | `05`           | Minutes, zero-padded (00–59)             |
| `m`    | Minute     | `5`            | Minutes, no padding (0–59)              |
| `ss`   | Second     | `30`           | Seconds, zero-padded (00–59)             |
| `s`    | Second     | `30`           | Seconds, no padding (0–59)              |
| `SSS`  | Millisecond| `042`          | Milliseconds, zero-padded (000–999)      |
| `A`    | Period     | `PM`           | AM/PM uppercase                          |
| `a`    | Period     | `pm`           | am/pm lowercase                          |

### Timezone Tokens

| Token  | Type       | Example output | Description                              |
|--------|------------|----------------|------------------------------------------|
| `Z`    | Offset     | `+05:30`       | UTC offset with colon (ZonedDateTime / Instant only) |
| `ZZ`   | Offset     | `+0530`        | UTC offset without colon                 |
| `z`    | Abbrev     | `JST`          | Timezone abbreviation (ZonedDateTime only) |

### Escape Syntax

| Syntax      | Example input            | Example output       |
|-------------|--------------------------|----------------------|
| `[literal]` | `[Today is] dddd`        | `Today is Thursday`  |
| `[at]`      | `h:mm A [at] MMMM Do`   | `2:05 PM at April 9th` |

## Examples by Temporal Type

### PlainDate

```ts
import { format } from 'moment-less'

const date = Temporal.PlainDate.from('2026-04-09')

format(date, 'YYYY-MM-DD')           // → "2026-04-09"
format(date, 'MMMM Do, YYYY')        // → "April 9th, 2026"
format(date, 'D MMMM YYYY')          // → "9 April 2026"
format(date, 'ddd, D MMM YYYY')      // → "Thu, 9 Apr 2026"
format(date, 'DD/MM/YYYY')           // → "09/04/2026"
format(date, 'MM-DD-YY')             // → "04-09-26"
```

> **PlainDate limitation:** Time tokens (`HH`, `mm`, `A`, etc.) throw a `TypeError` when used with `PlainDate` because there is no time component.

### PlainDateTime

```ts
import { format } from 'moment-less'

const dt = Temporal.PlainDateTime.from('2026-04-09T14:05:30.042')

format(dt, 'YYYY-MM-DDTHH:mm:ss')   // → "2026-04-09T14:05:30"
format(dt, 'MMMM Do, YYYY h:mm A')  // → "April 9th, 2026 2:05 PM"
format(dt, 'dddd [at] H:mm')        // → "Thursday at 14:05"
format(dt, 'HH:mm:ss.SSS')         // → "14:05:30.042"
format(dt, 'ddd, D MMM YYYY HH:mm')// → "Thu, 9 Apr 2026 14:05"
```

### PlainTime

```ts
import { format } from 'moment-less'

const time = Temporal.PlainTime.from('14:05:30')

format(time, 'HH:mm')    // → "14:05"
format(time, 'h:mm A')   // → "2:05 PM"
format(time, 'HH:mm:ss') // → "14:05:30"
format(time, 'hh:mm a')  // → "02:05 pm"
```

> **PlainTime limitation:** Date tokens (`YYYY`, `MMMM`, `dddd`, etc.) throw a `TypeError` when used with `PlainTime`.

### ZonedDateTime

```ts
import { format } from 'moment-less'

const zdt = Temporal.ZonedDateTime.from('2026-04-09T14:05:30+05:30[Asia/Kolkata]')

format(zdt, 'YYYY-MM-DD HH:mm Z')  // → "2026-04-09 14:05 +05:30"
format(zdt, 'h:mm A z')            // → "2:05 PM IST"
format(zdt, 'MMMM Do, YYYY')       // → "April 9th, 2026"
format(zdt, 'ZZ')                  // → "+0530"
```

### Instant

```ts
import { format } from 'moment-less'

const inst = Temporal.Instant.from('2026-04-09T08:35:30Z')

// Instant is always displayed in UTC
format(inst, 'YYYY-MM-DDTHH:mm:ssZ')  // → "2026-04-09T08:35:30+00:00"
format(inst, 'HH:mm [UTC]')           // → "08:35 UTC"
format(inst, 'MMMM Do, YYYY')         // → "April 9th, 2026"
```

> To display an Instant in a specific timezone, convert it first: `inst.toZonedDateTimeISO('America/New_York')`.

## Locale Option

The `locale` option affects month names (`MMMM`, `MMM`), weekday names (`dddd`, `ddd`), and ordinal suffixes (`Do`). It accepts any valid BCP 47 language tag.

```ts
import { format } from 'moment-less'

const date = Temporal.PlainDate.from('2026-04-09')

// French
format(date, 'MMMM', { locale: 'fr' })   // → "avril"
format(date, 'dddd', { locale: 'fr' })   // → "jeudi"

// Spanish
format(date, 'MMMM', { locale: 'es' })   // → "abril"
format(date, 'dddd', { locale: 'es' })   // → "jueves"

// German
format(date, 'MMMM', { locale: 'de' })   // → "April"
format(date, 'dddd', { locale: 'de' })   // → "Donnerstag"

// Japanese
format(date, 'MMMM', { locale: 'ja' })   // → "4月"
format(date, 'dddd', { locale: 'ja' })   // → "木曜日"

// Traditional Chinese
format(date, 'MMMM YYYY', { locale: 'zh-TW' }) // → "4月 2026"
```

## Token Ordering Notes

Tokens are matched using a greedy left-to-right scan. The scanner always tries longer tokens first at each position:

- `MMMM` is checked before `MMM`, which is checked before `MM`, which is checked before `M`.
- `dddd` is checked before `ddd`, which is checked before `d`.
- `YYYY` is checked before `YY`.
- `HH` is checked before `H`; `hh` before `h`; `mm` before `m`; `ss` before `s`.

This means you do not need to worry about ambiguous format strings — `MMM` will always match the 3-letter abbreviation, not two `M` tokens followed by nothing.

## Error Behavior

`format()` throws a `TypeError` in the following situations:

| Scenario                                          | Error message                                             |
|---------------------------------------------------|-----------------------------------------------------------|
| Date token used on `PlainTime`                    | `"Token 'YYYY' is not available on Temporal.PlainTime"`   |
| Time token used on `PlainDate`                    | `"Token 'HH' is not available on Temporal.PlainDate"`     |
| Timezone token on `PlainDate` / `PlainDateTime`   | `"Token 'Z' requires a ZonedDateTime or Instant"`         |
| Non-Temporal object passed as first argument      | `"Expected a Temporal object, got string"`                |
| Unknown token in strict mode (future option)      | `"Unknown token 'XX'"`                                    |

Unrecognized sequences that are not known tokens are passed through as literal text. For example, `format(date, 'Q1')` returns `"Q1"` because `Q` is not a recognized token.
