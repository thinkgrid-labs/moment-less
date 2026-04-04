# Getting Started

moment-less is a zero-dependency TypeScript library that brings Moment.js-style token formatting to the native [TC39 Temporal API](https://tc39.es/proposal-temporal/). If you already know `YYYY-MM-DD` format strings, you already know moment-less.

## Installation

::: code-group

```sh [npm]
npm install moment-less
```

```sh [pnpm]
pnpm add moment-less
```

```sh [yarn]
yarn add moment-less
```

:::

> **Temporal availability:** Node 22+, Chrome 127+, Firefox 139+, Safari 18.2+, and Deno 2.1+ all ship Temporal natively. For older environments, see [Browser & Runtime Support](/guide/browser-support).

## Your First Format

```ts
import { format } from 'moment-less'

const date = Temporal.PlainDate.from('2026-04-09')
console.log(format(date, 'MMMM Do, YYYY'))
// → "April 9th, 2026"
```

That's it. No configuration, no locale setup, no timezone wrangling.

## All Five Functions

### `format(temporalObj, formatString, options?)`

Token-based formatting for any Temporal type.

```ts
import { format } from 'moment-less'

const dt = Temporal.PlainDateTime.from('2026-04-09T14:05:30')
format(dt, 'YYYY-MM-DD')           // → "2026-04-09"
format(dt, 'h:mm A')               // → "2:05 PM"
format(dt, 'dddd, MMMM Do, YYYY')  // → "Thursday, April 9th, 2026"
format(dt, 'ddd MMM D YYYY')       // → "Thu Apr 9 2026"

// Escape literal text with square brackets
format(dt, '[Today is] dddd')      // → "Today is Thursday"
```

### `fromNow(temporalObj, reference?, locale?)`

Human-readable relative time string.

```ts
import { fromNow } from 'moment-less'

const now = Temporal.Now.plainDateTimeISO()
const posted = now.subtract({ hours: 3 })

fromNow(posted)        // → "3 hours ago"  (uses Temporal.Now internally)
fromNow(posted, now)   // → "3 hours ago"  (explicit reference — great for tests)

const future = now.add({ days: 2 })
fromNow(future, now)   // → "in 2 days"

// Locale support
fromNow(posted, now, 'fr')  // → "il y a 3 heures"
fromNow(posted, now, 'ja')  // → "3時間前"
```

### `calendar(temporalObj, reference?, options?)`

Context-aware calendar label, like chat apps and file managers use.

```ts
import { calendar } from 'moment-less'

const now = Temporal.Now.plainDateTimeISO()
const today    = now.subtract({ hours: 2 })
const yesterday = now.subtract({ days: 1 })
const lastWeek  = now.subtract({ days: 4 })
const oldDate   = Temporal.PlainDate.from('2025-11-15')

calendar(today, now)      // → "Today at 12:05 PM"
calendar(yesterday, now)  // → "Yesterday"
calendar(lastWeek, now)   // → "Sunday"
calendar(oldDate, now)    // → "Nov 15, 2025"
```

### `humanizeDuration(duration, locale?)`

Converts a `Temporal.Duration` to a human-readable string, picking the most significant unit.

```ts
import { humanizeDuration } from 'moment-less'

humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 0, 45))  // → "45 minutes"
humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 2, 30))  // → "3 hours"
humanizeDuration(new Temporal.Duration(0, 0, 0, 3))          // → "3 days"
humanizeDuration(new Temporal.Duration(1, 2))                // → "a year"

// Localized
humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 2), 'fr') // → "2 heures"
humanizeDuration(new Temporal.Duration(0, 0, 0, 0, 2), 'es') // → "2 horas"
```

### `fromDate(date)`

Bridges a legacy JavaScript `Date` object to a `Temporal.Instant`.

```ts
import { format, fromDate } from 'moment-less'

const inst = fromDate(new Date('2026-04-09T14:05:00Z'))
format(inst, 'YYYY-MM-DD HH:mm')  // → "2026-04-09 14:05"

// Works with Date.now() too
const now = fromDate(new Date(Date.now()))
```

## Token Quick Reference

| Token  | Output example     | Description                      |
|--------|--------------------|----------------------------------|
| `YYYY` | `2026`             | 4-digit year                     |
| `YY`   | `26`               | 2-digit year                     |
| `MMMM` | `April`            | Full month name                  |
| `MMM`  | `Apr`              | Short month name                 |
| `MM`   | `04`               | Month, zero-padded               |
| `M`    | `4`                | Month, no padding                |
| `Do`   | `9th`              | Day of month with ordinal suffix |
| `DD`   | `09`               | Day, zero-padded                 |
| `D`    | `9`                | Day, no padding                  |
| `dddd` | `Thursday`         | Full weekday name                |
| `ddd`  | `Thu`              | Short weekday name               |
| `HH`   | `14`               | 24-hour hour, zero-padded        |
| `H`    | `14`               | 24-hour hour, no padding         |
| `hh`   | `02`               | 12-hour hour, zero-padded        |
| `h`    | `2`                | 12-hour hour, no padding         |
| `mm`   | `05`               | Minutes, zero-padded             |
| `ss`   | `30`               | Seconds, zero-padded             |
| `A`    | `PM`               | AM/PM uppercase                  |
| `a`    | `pm`               | am/pm lowercase                  |
| `Z`    | `+05:30`           | UTC offset (ZonedDateTime/Instant only) |
| `[…]`  | literal text       | Escaped literal characters       |

See the full [format() API reference](/api/format) for details on which tokens are available for each Temporal type.

## Next Steps

- [Browser & Runtime Support](/guide/browser-support) — polyfill setup for older environments
- [Migrating from Moment.js](/guide/migration) — side-by-side comparison
- [format() API Reference](/api/format) — complete token documentation
