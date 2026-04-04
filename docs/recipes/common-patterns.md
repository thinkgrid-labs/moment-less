---
title: Common Patterns
description: Framework-agnostic moment-less patterns — ISO 8601 API timestamps, chat grouping, timezone display, sorting Temporal objects, and countdown timers.
---

# Common Patterns

Framework-agnostic patterns for real-world use cases.

## ISO 8601 Timestamps for APIs

When sending dates over a network or storing them in a database, always use ISO 8601. Temporal makes this trivial — every Temporal type has a `.toString()` that produces a valid ISO 8601 string.

```ts
import { format } from 'moment-less'

// For APIs: Temporal.Instant → UTC ISO string (most portable)
const now = Temporal.Now.instant()
now.toString()
// → "2026-04-09T14:05:30.042Z"

// For APIs that want date-only
const today = Temporal.Now.plainDateISO()
today.toString()
// → "2026-04-09"

// For APIs that want datetime without timezone (local server time)
const dt = Temporal.Now.plainDateTimeISO()
dt.toString()
// → "2026-04-09T14:05:30.042"

// For APIs that want datetime with timezone offset
const zdt = Temporal.Now.zonedDateTimeISO()
zdt.toString()
// → "2026-04-09T14:05:30.042+05:30[Asia/Kolkata]"

// For log files / audit trails (custom format)
format(Temporal.Now.zonedDateTimeISO('UTC'), 'YYYY-MM-DDTHH:mm:ss.SSS[Z]')
// → "2026-04-09T14:05:30.042Z"
```

## Human-Readable Dates for UI

```ts
import { format } from 'moment-less'

const date = Temporal.PlainDate.from('2026-04-09')

// Locale: en-US
format(date, 'MMMM D, YYYY')         // → "April 9, 2026"
format(date, 'dddd, MMMM Do, YYYY')  // → "Thursday, April 9th, 2026"
format(date, 'D MMMM YYYY')          // → "9 April 2026"

// Locale: fr
format(date, 'D MMMM YYYY', { locale: 'fr' })   // → "9 avril 2026"
format(date, 'dddd D MMMM', { locale: 'fr' })   // → "jeudi 9 avril"

// Short formats
format(date, 'MMM D')   // → "Apr 9"
format(date, 'M/D/YY')  // → "4/9/26"
format(date, 'D/M/YY')  // → "9/4/26"
```

## File / Upload Timestamps

Show upload time with appropriate granularity depending on how long ago it happened.

```ts
import { fromNow, format, calendar, fromDate } from 'moment-less'

function fileTimestamp(uploadedAt: Date): { relative: string; absolute: string } {
  const inst = fromDate(uploadedAt)
  const now  = Temporal.Now.instant()

  const zdt = inst.toZonedDateTimeISO(Temporal.Now.timeZoneId())

  return {
    relative: fromNow(inst, now),
    absolute: format(zdt, 'MMM D, YYYY [at] h:mm A'),
  }
}

// Example:
fileTimestamp(new Date(Date.now() - 5 * 60_000))
// → { relative: "5 minutes ago", absolute: "Apr 9, 2026 at 2:00 PM" }

fileTimestamp(new Date('2026-03-01T10:00:00Z'))
// → { relative: "a month ago", absolute: "Mar 1, 2026 at 10:00 AM" }
```

## Chat Message Timestamps

Combine `calendar()` for the date label and `format()` for the inline time in a thread UI.

```ts
import { calendar, format, fromDate } from 'moment-less'

interface Message {
  id: string
  body: string
  sentAt: Date
}

function groupMessagesByDay(messages: Message[]) {
  const now = Temporal.Now.instant()
  const groups = new Map<string, { dayLabel: string; messages: Message[] }>()

  for (const msg of messages) {
    const inst = fromDate(msg.sentAt)
    // Use PlainDate for the group key (no time — groups by calendar day)
    const localDate = inst
      .toZonedDateTimeISO(Temporal.Now.timeZoneId())
      .toPlainDate()
    const dayKey   = localDate.toString()

    if (!groups.has(dayKey)) {
      groups.set(dayKey, {
        dayLabel: calendar(localDate, now.toZonedDateTimeISO(Temporal.Now.timeZoneId()).toPlainDate()),
        messages: [],
      })
    }
    groups.get(dayKey)!.messages.push(msg)
  }

  return [...groups.values()]
}

// Render the inline time for each bubble
function messageTime(msg: Message): string {
  const inst = fromDate(msg.sentAt)
  const zdt  = inst.toZonedDateTimeISO(Temporal.Now.timeZoneId())
  return format(zdt, 'h:mm A')  // → "2:05 PM"
}
```

## Countdown Timers with `humanizeDuration()`

```ts
import { humanizeDuration, fromNow } from 'moment-less'

const launchAt = Temporal.Instant.from('2026-05-01T00:00:00Z')

function getCountdown(): string {
  const now = Temporal.Now.instant()
  const remaining = now.until(launchAt)

  if (remaining.sign <= 0) return 'Launched!'

  // humanizeDuration gives magnitude: "3 days"
  // fromNow gives direction: "in 3 days"
  return fromNow(launchAt, now)  // → "in 22 days"
}

// For a more granular countdown, use Temporal arithmetic directly
function preciseCountdown(): string {
  const now = Temporal.Now.instant()
  const dur = now.until(launchAt, { largestUnit: 'hours' })

  if (dur.sign <= 0) return '00:00:00'

  const h = String(dur.hours + dur.days * 24).padStart(2, '0')
  const m = String(dur.minutes).padStart(2, '0')
  const s = String(dur.seconds).padStart(2, '0')
  return `${h}:${m}:${s}`  // → "527:43:21"
}
```

## Working with Timezones

```ts
import { format } from 'moment-less'

const instant = Temporal.Instant.from('2026-04-09T14:00:00Z')

// Convert to multiple timezones
const zones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney']

zones.map((tz) => {
  const zdt = instant.toZonedDateTimeISO(tz)
  return {
    timezone: tz,
    display: format(zdt, 'ddd, MMM D YYYY h:mm A z'),
  }
})
// [
//   { timezone: 'America/New_York', display: 'Thu, Apr 9 2026 10:00 AM EDT' },
//   { timezone: 'Europe/London',    display: 'Thu, Apr 9 2026 3:00 PM BST'  },
//   { timezone: 'Asia/Tokyo',       display: 'Thu, Apr 9 2026 11:00 PM JST' },
//   { timezone: 'Australia/Sydney', display: 'Fri, Apr 10 2026 12:00 AM AEST' },
// ]
```

### Converting User Input to UTC

```ts
// User types "2026-04-09 14:00" in a form, in their local timezone
function localInputToInstant(localISO: string, timeZone: string): Temporal.Instant {
  const zdt = Temporal.ZonedDateTime.from(`${localISO}[${timeZone}]`)
  return zdt.toInstant()
}

const instant = localInputToInstant('2026-04-09T14:00:00', 'America/Chicago')
instant.toString()
// → "2026-04-09T19:00:00Z"  (UTC-5 in April → +5 hours to UTC)
```

## Sorting Temporal Objects

Temporal provides a static `compare()` method on every type that works with `Array.prototype.sort()` directly.

```ts
const dates = [
  Temporal.PlainDate.from('2026-03-15'),
  Temporal.PlainDate.from('2026-01-01'),
  Temporal.PlainDate.from('2026-04-09'),
  Temporal.PlainDate.from('2025-12-31'),
]

// Ascending (oldest first)
dates.sort(Temporal.PlainDate.compare)

// Descending (newest first)
dates.sort((a, b) => Temporal.PlainDate.compare(b, a))
```

For `Instant` objects (e.g., sorted feed items):

```ts
import { fromDate } from 'moment-less'

interface Post {
  title: string
  publishedAt: Date
}

function sortPostsNewestFirst(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const ia = fromDate(a.publishedAt)
    const ib = fromDate(b.publishedAt)
    return Temporal.Instant.compare(ib, ia)  // descending
  })
}
```

## Comparing Dates

```ts
const a = Temporal.PlainDate.from('2026-04-01')
const b = Temporal.PlainDate.from('2026-04-09')

// Equality
a.equals(b)                               // → false
a.equals(Temporal.PlainDate.from('2026-04-01'))  // → true

// Ordering
Temporal.PlainDate.compare(a, b)  // → -1 (a is before b)
Temporal.PlainDate.compare(b, a)  // →  1 (b is after a)
Temporal.PlainDate.compare(a, a)  // →  0 (equal)

// Convenience wrappers (if you want named predicates)
const isBefore = (x: Temporal.PlainDate, y: Temporal.PlainDate) =>
  Temporal.PlainDate.compare(x, y) < 0

const isAfter = (x: Temporal.PlainDate, y: Temporal.PlainDate) =>
  Temporal.PlainDate.compare(x, y) > 0

const isSameOrBefore = (x: Temporal.PlainDate, y: Temporal.PlainDate) =>
  Temporal.PlainDate.compare(x, y) <= 0

isBefore(a, b)       // → true
isAfter(b, a)        // → true
isSameOrBefore(a, a) // → true

// Is date in range?
function isInRange(
  date: Temporal.PlainDate,
  start: Temporal.PlainDate,
  end: Temporal.PlainDate
): boolean {
  return (
    Temporal.PlainDate.compare(date, start) >= 0 &&
    Temporal.PlainDate.compare(date, end)   <= 0
  )
}

const today = Temporal.PlainDate.from('2026-04-09')
const rangeStart = Temporal.PlainDate.from('2026-04-01')
const rangeEnd   = Temporal.PlainDate.from('2026-04-30')

isInRange(today, rangeStart, rangeEnd)  // → true
```

## Parsing Dates Safely

Temporal throws on invalid input. Wrap in a try/catch for user input:

```ts
import { format } from 'moment-less'

function safeParsePlainDate(input: string): Temporal.PlainDate | null {
  try {
    return Temporal.PlainDate.from(input)
  } catch {
    return null
  }
}

function formatUserInput(input: string): string {
  const date = safeParsePlainDate(input)
  if (!date) return 'Invalid date'
  return format(date, 'MMMM Do, YYYY')
}

formatUserInput('2026-04-09')        // → "April 9th, 2026"
formatUserInput('not-a-date')        // → "Invalid date"
formatUserInput('2026-13-01')        // → "Invalid date"  (month 13 doesn't exist)
```
