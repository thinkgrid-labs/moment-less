# Recipes

Real-world patterns for common use cases. These examples are framework-agnostic unless noted otherwise. For framework-specific integrations see the [React](/recipes/react) and [Vue](/recipes/vue) recipe pages.

## Blog Post Date

Display a post's publish date in a human-friendly format with a relative hint for recent posts.

```ts
import { format, fromNow, fromDate } from 'moment-less'

interface Post {
  title: string
  publishedAt: Date
}

function postDateLabel(post: Post): string {
  const inst = fromDate(post.publishedAt)
  const now  = Temporal.Now.instant()

  // Use relative time for posts in the last 7 days
  const daysDiff = now.until(inst).total({ unit: 'days', relativeTo: Temporal.Now.plainDateISO() })
  if (Math.abs(daysDiff) < 7) {
    return fromNow(inst, now)  // → "2 days ago"
  }

  // Fall back to absolute date
  const zdt = inst.toZonedDateTimeISO(Temporal.Now.timeZoneId())
  return format(zdt, 'MMMM Do, YYYY')  // → "March 27, 2026"
}
```

## Chat Timestamp

Messaging apps use calendar labels for recent messages and absolute dates for older ones. `calendar()` does this automatically.

```ts
import { calendar, fromDate } from 'moment-less'

function chatTimestamp(sentAt: Date, locale = 'en'): string {
  const inst = fromDate(sentAt)
  const now  = Temporal.Now.instant()

  return calendar(inst, now, { locale, timeFormat: 'h12' })
  // → "Today at 2:05 PM"
  // → "Yesterday"
  // → "Monday"
  // → "Apr 1, 2026"
}
```

## Countdown Timer

Show how long until a future event, updating every second.

```ts
import { humanizeDuration } from 'moment-less'

function countdown(targetISO: string): string {
  const target = Temporal.Instant.from(targetISO)
  const now    = Temporal.Now.instant()
  const dur    = now.until(target)

  if (dur.sign < 0) return 'Event has passed'
  return humanizeDuration(dur)  // → "in 2 hours" — use fromNow() for "in X"
}

// Live countdown using setInterval
function startCountdown(targetISO: string, el: HTMLElement): () => void {
  const tick = () => { el.textContent = countdown(targetISO) }
  tick()
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)  // cleanup function
}
```

## File Upload Timestamp

Show when a file was uploaded, with granularity that matches the age.

```ts
import { format, fromNow, fromDate } from 'moment-less'

function uploadLabel(uploadedAt: Date): string {
  const inst = fromDate(uploadedAt)
  const now  = Temporal.Now.instant()

  const elapsed = now.since(inst)
  const totalSeconds = elapsed.total({ unit: 'seconds', relativeTo: Temporal.Now.plainDateISO() })

  if (totalSeconds < 3600) {
    return fromNow(inst, now)                       // "12 minutes ago"
  }

  if (totalSeconds < 86400) {
    const zdt = inst.toZonedDateTimeISO(Temporal.Now.timeZoneId())
    return format(zdt, '[Today at] h:mm A')         // "Today at 3:42 PM"
  }

  const zdt = inst.toZonedDateTimeISO(Temporal.Now.timeZoneId())
  return format(zdt, 'MMM D, YYYY [at] h:mm A')     // "Apr 7, 2026 at 3:42 PM"
}
```

## Log Entry

For developer tools and log viewers, ISO 8601 is unambiguous and sortable.

```ts
import { format } from 'moment-less'

function logTimestamp(): string {
  const now = Temporal.Now.zonedDateTimeISO('UTC')
  return format(now, 'YYYY-MM-DD HH:mm:ss.SSS [UTC]')
  // → "2026-04-09 14:05:30.042 UTC"
}

interface LogEntry {
  level: 'info' | 'warn' | 'error'
  message: string
}

function formatLogEntry(entry: LogEntry): string {
  return `[${logTimestamp()}] ${entry.level.toUpperCase()} ${entry.message}`
  // → "[2026-04-09 14:05:30.042 UTC] ERROR Connection refused"
}
```

## More Recipes

- [React Recipes](/recipes/react) — Components and hooks for React + TypeScript
- [Vue 3 Recipes](/recipes/vue) — Composables and directives for Vue 3
- [Common Patterns](/recipes/common-patterns) — Timezones, sorting, comparing, ISO APIs
