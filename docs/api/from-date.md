---
title: fromDate() — API Reference
description: Bridge legacy JavaScript Date objects to Temporal.Instant. The fastest migration path from new Date() to the Temporal API.
---

# fromDate()

Converts a JavaScript `Date` object to a `Temporal.Instant`, bridging legacy date handling code with the Temporal API.

## Signature

```ts
function fromDate(date: Date): Temporal.Instant
```

## Why It Exists

The JavaScript `Date` object predates `Temporal` by 30 years. If you are working with an existing codebase or a library (e.g., an ORM, a network client, a file system API) that returns `Date` objects, you cannot pass those directly to moment-less functions — they accept only Temporal types.

`fromDate()` is a one-line bridge:

```ts
Temporal.Instant.fromEpochMilliseconds(date.getTime())
```

It exists as a named export so you can import it consistently from moment-less rather than remembering the Temporal constructor name.

## Parameters

| Parameter | Type   | Description                                                     |
|-----------|--------|-----------------------------------------------------------------|
| `date`    | `Date` | Any JavaScript `Date` instance, including `new Date(0)` (epoch) and `new Date(NaN)`. |

> If `date` is an **invalid Date** (`new Date(NaN)` or `new Date('not a date')`), `fromDate()` throws a `RangeError` matching the error Temporal throws for out-of-range epoch values.

## Return Value

Returns a `Temporal.Instant` representing the same point in time as the input `Date`. An `Instant` is always UTC — it has no timezone or calendar attached. To work with a specific timezone or extract date/time fields, convert using `.toZonedDateTimeISO()`.

## Examples

### Basic Usage

```ts
import { fromDate, format } from 'moment-less'

const d = new Date('2026-04-09T14:05:00Z')
const inst = fromDate(d)

inst.toString()
// → "2026-04-09T14:05:00Z"

format(inst, 'YYYY-MM-DD HH:mm')
// → "2026-04-09 14:05"
```

### From `Date.now()`

```ts
import { fromDate, fromNow } from 'moment-less'

// Useful when you receive a timestamp from a timer or performance API
const now = fromDate(new Date(Date.now()))
const posted = fromDate(new Date(Date.now() - 3 * 60 * 60 * 1000))  // 3 hours ago

fromNow(posted, now)
// → "3 hours ago"
```

### Round-Trip with `format()`

```ts
import { fromDate, format } from 'moment-less'

// Typical API response deserialization
interface Post {
  title: string
  createdAt: Date   // returned by an ORM like Prisma or TypeORM
}

function formatPostDate(post: Post): string {
  const inst = fromDate(post.createdAt)
  return format(inst, 'MMMM Do, YYYY [at] h:mm A')
}

// Example:
formatPostDate({
  title: 'Hello World',
  createdAt: new Date('2026-04-09T14:05:00Z'),
})
// → "April 9th, 2026 at 2:05 PM"
```

### Converting to Local Time with ZonedDateTime

`fromDate()` returns an `Instant`, which is always UTC. If you need to display the time in the user's local timezone — or any other timezone — convert to `ZonedDateTime`:

```ts
import { fromDate, format } from 'moment-less'

const d = new Date('2026-04-09T08:00:00Z')
const inst = fromDate(d)

// Display in New York time (UTC-4 in April)
const nyTime = inst.toZonedDateTimeISO('America/New_York')
format(nyTime, 'h:mm A z')
// → "4:00 AM EDT"

// Display in Tokyo time (UTC+9)
const tokyoTime = inst.toZonedDateTimeISO('Asia/Tokyo')
format(tokyoTime, 'h:mm A z')
// → "5:00 PM JST"

// Display in the user's local timezone
const localTime = inst.toZonedDateTimeISO(Temporal.Now.timeZoneId())
format(localTime, 'h:mm A z')
// → depends on the user's system timezone
```

### Batch Conversion

When working with arrays of legacy data:

```ts
import { fromDate, calendar } from 'moment-less'

interface Message {
  id: string
  body: string
  sentAt: Date
}

function groupMessagesByCalendar(messages: Message[]) {
  const now = Temporal.Now.instant()

  return messages.map((msg) => ({
    ...msg,
    label: calendar(fromDate(msg.sentAt), now),
  }))
}

// Result:
// [
//   { id: '1', body: 'Hey!', sentAt: Date, label: 'Today at 9:15 AM' },
//   { id: '2', body: 'Sure!', sentAt: Date, label: 'Yesterday' },
// ]
```

### Interop with `Date` Mutability

Remember that `Date` objects are mutable. `fromDate()` reads the timestamp at the moment it is called — subsequent mutations to the `Date` object do not affect the returned `Instant`:

```ts
import { fromDate } from 'moment-less'

const d = new Date('2026-04-09T14:00:00Z')
const inst = fromDate(d)

d.setFullYear(2000)  // mutate the Date object

inst.toString()
// Still → "2026-04-09T14:00:00Z"  (Instant is immutable)
```
