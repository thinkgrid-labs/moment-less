# Migrating from Moment.js

This guide is for teams moving from Moment.js (or date-fns, Luxon, dayjs) to the native Temporal API with moment-less. The token syntax is nearly identical, but the underlying model is fundamentally different — and in all the ways that make your code more correct.

## Key Conceptual Differences

| Concept              | Moment.js                            | Temporal + moment-less                         |
|----------------------|--------------------------------------|------------------------------------------------|
| Mutability           | Mutable by default (`.add()` mutates) | Always immutable — `.add()` returns a new object |
| Timezone model       | Attached to the moment object at parse time | `ZonedDateTime` is an explicit type; `PlainDateTime` has no timezone |
| Parsing              | `moment('2026-04-09', 'YYYY-MM-DD')` | `Temporal.PlainDate.from('2026-04-09')` (ISO only — no format guessing) |
| Type safety          | Everything is a `Moment` object      | Different types for date-only, time-only, date+time, instant |
| Bundle size          | ~67KB min+gzip (deprecated)          | moment-less < 2KB + platform Temporal (0KB in modern runtimes) |

## Side-by-Side Comparison

### Formatting

| Operation                    | Moment.js                                     | moment-less                                          |
|------------------------------|-----------------------------------------------|------------------------------------------------------|
| Basic date                   | `moment().format('YYYY-MM-DD')`               | `format(Temporal.Now.plainDateISO(), 'YYYY-MM-DD')`  |
| Date + time                  | `moment().format('MMMM Do YYYY, h:mm a')`     | `format(Temporal.Now.plainDateTimeISO(), 'MMMM Do YYYY, h:mm a')` |
| Ordinal day                  | `moment('2026-04-09').format('Do')`           | `format(Temporal.PlainDate.from('2026-04-09'), 'Do')`|
| Full weekday                 | `moment().format('dddd')`                     | `format(Temporal.Now.plainDateISO(), 'dddd')`        |
| 24-hour clock                | `moment().format('HH:mm')`                    | `format(Temporal.Now.plainDateTimeISO(), 'HH:mm')`   |
| AM/PM                        | `moment().format('h:mm A')`                   | `format(Temporal.Now.plainDateTimeISO(), 'h:mm A')`  |
| Escaped literal              | `moment().format('[Today is] dddd')`          | `format(Temporal.Now.plainDateISO(), '[Today is] dddd')` |
| UTC/ISO 8601                 | `moment().utc().toISOString()`                | `Temporal.Now.instant().toString()`                  |

### Relative Time

| Operation                    | Moment.js                          | moment-less                        |
|------------------------------|------------------------------------|------------------------------------|
| "X ago"                      | `moment(date).fromNow()`           | `fromNow(temporalObj)`             |
| "in X"                       | `moment(future).fromNow()`         | `fromNow(future)`                  |
| Relative to custom reference | `moment(a).from(b)`                | `fromNow(a, b)`                    |
| Localized relative           | `moment.locale('fr'); moment(d).fromNow()` | `fromNow(d, undefined, 'fr')`|

### Parsing

| Operation                    | Moment.js                                    | Temporal                                       |
|------------------------------|----------------------------------------------|------------------------------------------------|
| From ISO string              | `moment('2026-04-09')`                       | `Temporal.PlainDate.from('2026-04-09')`        |
| From JS Date                 | `moment(new Date())`                         | `fromDate(new Date())` (returns `Instant`)     |
| From timestamp (ms)          | `moment(1712678700000)`                      | `Temporal.Instant.fromEpochMilliseconds(ms)`   |
| With explicit timezone       | `moment.tz('2026-04-09T12:00', 'Asia/Tokyo')`| `Temporal.ZonedDateTime.from('2026-04-09T12:00[Asia/Tokyo]')` |

### Arithmetic

| Operation                    | Moment.js                                    | Temporal                                                    |
|------------------------------|----------------------------------------------|-------------------------------------------------------------|
| Add 3 days                   | `moment(d).add(3, 'days')`                   | `d.add({ days: 3 })`                                       |
| Subtract 1 month             | `moment(d).subtract(1, 'month')`             | `d.subtract({ months: 1 })`                                |
| Difference in days           | `moment(b).diff(a, 'days')`                  | `a.until(b).total({ unit: 'days' })`                       |
| Duration from string         | `moment.duration('P3DT2H')`                  | `Temporal.Duration.from('P3DT2H')`                         |

### Comparison

| Operation                    | Moment.js                                    | Temporal                                       |
|------------------------------|----------------------------------------------|------------------------------------------------|
| Is before                    | `moment(a).isBefore(b)`                      | `Temporal.PlainDate.compare(a, b) < 0`         |
| Is same                      | `moment(a).isSame(b, 'day')`                 | `a.equals(b)` (for same-type objects)          |
| Is after                     | `moment(a).isAfter(b)`                       | `Temporal.PlainDate.compare(a, b) > 0`         |
| Min / Max                    | `moment.min(a, b)`                           | `Temporal.PlainDate.compare(a, b) < 0 ? a : b`|

## Common Migration Patterns

### Pattern 1: Rendering a post date

**Before (Moment.js):**
```js
import moment from 'moment'

function PostDate({ isoString }) {
  return moment(isoString).format('MMMM Do, YYYY')
}
```

**After (moment-less):**
```ts
import { format } from 'moment-less'

function PostDate({ isoString }: { isoString: string }) {
  const date = Temporal.PlainDate.from(isoString)
  return format(date, 'MMMM Do, YYYY')
}
```

### Pattern 2: Relative time on a comment

**Before (Moment.js):**
```js
moment(comment.createdAt).fromNow()
// → "3 hours ago"
```

**After (moment-less):**
```ts
import { fromDate, fromNow } from 'moment-less'

// comment.createdAt is a JS Date from your API client
const instant = fromDate(comment.createdAt)
fromNow(instant)
// → "3 hours ago"
```

### Pattern 3: Adding time — watch the mutability trap

Moment.js mutates in place, which causes subtle bugs:

```js
// BUGGY Moment.js — both variables point to the same mutated object
const start = moment('2026-04-09')
const end = start.add(7, 'days')  // start is now April 16!
```

Temporal is always immutable:

```ts
// Safe — Temporal.add() returns a new object
const start = Temporal.PlainDate.from('2026-04-09')
const end = start.add({ days: 7 })  // start is still April 9
```

### Pattern 4: Locale-aware formatting

**Before (Moment.js):**
```js
import 'moment/locale/fr'
moment.locale('fr')
moment('2026-04-09').format('MMMM')
// → "avril"
```

**After (moment-less):**
```ts
import { format } from 'moment-less'

format(Temporal.PlainDate.from('2026-04-09'), 'MMMM', { locale: 'fr' })
// → "avril"
```

No locale files to import. moment-less uses `Intl.DateTimeFormat` under the hood, which is always available and ships zero locale data.

### Pattern 5: Working with timezones

Moment-timezone required a separate package and massive timezone data bundles:

```js
// Moment.js + moment-timezone (~500KB)
import moment from 'moment-timezone'
const tokyoTime = moment.tz(date, 'Asia/Tokyo').format('HH:mm')
```

Temporal has timezone support built in, using the platform's IANA database (always up to date):

```ts
import { format } from 'moment-less'

const instant = Temporal.Now.instant()
const tokyo = instant.toZonedDateTimeISO('Asia/Tokyo')
format(tokyo, 'HH:mm z')  // → "23:05 JST"
```

## What Temporal Replaces (No moment-less Needed)

Some things moment-less doesn't cover because Temporal handles them natively:

| Moment.js operation          | Temporal equivalent                              |
|------------------------------|--------------------------------------------------|
| `moment().toDate()`          | `instant.toZonedDateTimeISO('UTC').toPlainDateTime()` or just use the Temporal object |
| `moment.duration(hours, 'hours')` | `new Temporal.Duration(0, 0, 0, 0, hours)` |
| `moment(d).startOf('month')`  | `d.with({ day: 1 })`                            |
| `moment(d).endOf('month')`    | `d.with({ day: d.daysInMonth })`                |
| `moment(d).isValid()`         | Temporal throws on invalid input — wrap in try/catch |
| `moment().clone()`            | Not needed — Temporal objects are immutable      |
| `moment.utc()`               | `Temporal.Now.instant()` (already UTC)           |
