---
title: React Recipes
description: TypeScript React components and hooks for moment-less — RelativeTime, CalendarLabel, DurationBadge, and useFormattedDate with live updates.
---

# React Recipes

TypeScript components and hooks for using moment-less in React applications.

## `<RelativeTime>` Component

A component that displays a live-updating relative time string. The timer updates every 30 seconds, which is sufficient for the "minute" and "hour" granularity that `fromNow()` uses.

```tsx
// components/RelativeTime.tsx
import { useEffect, useState } from 'react'
import { fromNow, fromDate } from 'moment-less'

interface RelativeTimeProps {
  /** A JS Date, an ISO string, or a Temporal.Instant */
  date: Date | string | Temporal.Instant
  /** BCP 47 locale tag, e.g. 'fr', 'es'. Defaults to browser locale. */
  locale?: string
  /** Update interval in milliseconds. Defaults to 30_000 (30 seconds). */
  updateInterval?: number
  /** Accessible datetime attribute value (ISO 8601 string). */
  dateTime?: string
}

function toInstant(date: Date | string | Temporal.Instant): Temporal.Instant {
  if (date instanceof Date) return fromDate(date)
  if (typeof date === 'string') return Temporal.Instant.from(date)
  return date
}

export function RelativeTime({
  date,
  locale,
  updateInterval = 30_000,
  dateTime,
}: RelativeTimeProps) {
  const instant = toInstant(date)

  const [label, setLabel] = useState(() =>
    fromNow(instant, Temporal.Now.instant(), locale)
  )

  useEffect(() => {
    const tick = () => {
      setLabel(fromNow(instant, Temporal.Now.instant(), locale))
    }
    tick()
    const id = setInterval(tick, updateInterval)
    return () => clearInterval(id)
  }, [instant.epochMilliseconds, locale, updateInterval])

  const isoString = dateTime ?? instant.toString()

  return (
    <time dateTime={isoString} title={isoString}>
      {label}
    </time>
  )
}
```

**Usage:**

```tsx
import { RelativeTime } from './components/RelativeTime'

function Comment({ comment }: { comment: { body: string; createdAt: string } }) {
  return (
    <article>
      <p>{comment.body}</p>
      <RelativeTime date={comment.createdAt} locale="en" />
    </article>
  )
}
```

## `<CalendarLabel>` Component

A component that renders a calendar-style label ("Today at 2:05 PM", "Monday", etc.) for a given date.

```tsx
// components/CalendarLabel.tsx
import { useMemo } from 'react'
import { calendar, fromDate } from 'moment-less'
import type { CalendarOptions } from 'moment-less'

interface CalendarLabelProps {
  date: Date | string | Temporal.Instant | Temporal.PlainDateTime
  options?: CalendarOptions
  className?: string
}

function toCalendarInput(
  date: Date | string | Temporal.Instant | Temporal.PlainDateTime
): Temporal.Instant | Temporal.PlainDateTime {
  if (date instanceof Date) return fromDate(date)
  if (typeof date === 'string') {
    // Try Instant first, then PlainDateTime
    try { return Temporal.Instant.from(date) } catch {}
    return Temporal.PlainDateTime.from(date)
  }
  return date
}

export function CalendarLabel({ date, options, className }: CalendarLabelProps) {
  const label = useMemo(() => {
    const input = toCalendarInput(date)
    const ref   = Temporal.Now.instant()
    return calendar(input, ref, options)
  }, [
    date instanceof Date ? date.getTime() : date.toString(),
    options?.locale,
    options?.timeFormat,
  ])

  return <span className={className}>{label}</span>
}
```

**Usage:**

```tsx
function MessageBubble({
  message,
}: {
  message: { text: string; sentAt: string }
}) {
  return (
    <div className="message">
      <p>{message.text}</p>
      <CalendarLabel
        date={message.sentAt}
        options={{ timeFormat: 'h12', locale: 'en' }}
        className="text-xs text-gray-400"
      />
    </div>
  )
}
```

## `<DurationBadge>` Component

A badge that shows a humanized duration, useful for file upload times, task durations, or video lengths.

```tsx
// components/DurationBadge.tsx
import { humanizeDuration } from 'moment-less'

interface DurationBadgeProps {
  /** Temporal.Duration or ISO 8601 duration string like "PT2H30M" */
  duration: Temporal.Duration | string
  locale?: string
  className?: string
}

export function DurationBadge({ duration, locale, className }: DurationBadgeProps) {
  const dur =
    typeof duration === 'string'
      ? Temporal.Duration.from(duration)
      : duration

  const label = humanizeDuration(dur, locale)

  return (
    <span
      className={className}
      aria-label={`Duration: ${label}`}
      title={dur.toString()}
    >
      {label}
    </span>
  )
}
```

**Usage:**

```tsx
function VideoCard({ video }: { video: { title: string; duration: string } }) {
  return (
    <div className="video-card">
      <h3>{video.title}</h3>
      <DurationBadge
        duration={video.duration}  // e.g. "PT1H23M"
        className="text-sm font-medium bg-black/70 text-white px-2 py-0.5 rounded"
      />
    </div>
  )
}
```

## `useFormattedDate` Hook

A memoized hook for formatting a Temporal object with a format string. Useful when you need inline formatting without creating a full component.

```tsx
// hooks/useFormattedDate.ts
import { useMemo } from 'react'
import { format, fromDate } from 'moment-less'
import type { FormatOptions, FormattableTemporalType } from 'moment-less'

type DateInput = Date | string | FormattableTemporalType

function toFormattable(input: DateInput): FormattableTemporalType {
  if (input instanceof Date) return fromDate(input)
  if (typeof input === 'string') {
    // Detect ISO format: if it contains 'T' and ends with 'Z', treat as Instant
    if (/^\d{4}-\d{2}-\d{2}T.*Z$/.test(input)) {
      return Temporal.Instant.from(input)
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(input)) {
      return Temporal.PlainDateTime.from(input)
    }
    return Temporal.PlainDate.from(input)
  }
  return input
}

export function useFormattedDate(
  date: DateInput,
  formatString: string,
  options?: FormatOptions
): string {
  // Stable cache key — serialize the date to a primitive
  const dateKey =
    date instanceof Date
      ? date.getTime()
      : typeof date === 'string'
      ? date
      : date.toString()

  return useMemo(() => {
    try {
      return format(toFormattable(date), formatString, options)
    } catch {
      return ''
    }
  }, [dateKey, formatString, options?.locale])
}
```

**Usage:**

```tsx
import { useFormattedDate } from './hooks/useFormattedDate'

function ProfileHeader({ user }: { user: { name: string; joinedAt: string } }) {
  const joined = useFormattedDate(user.joinedAt, 'MMMM YYYY')
  // → "April 2026"

  return (
    <header>
      <h1>{user.name}</h1>
      <p>Member since {joined}</p>
    </header>
  )
}
```

## SSR / Hydration Safety

When rendering relative time on the server (Next.js App Router, Remix, etc.), avoid hydration mismatches by rendering the relative label only on the client:

```tsx
// components/ClientRelativeTime.tsx
'use client'

import { useEffect, useState } from 'react'
import { fromNow } from 'moment-less'

interface ClientRelativeTimeProps {
  isoString: string
  fallback?: string
}

export function ClientRelativeTime({ isoString, fallback = '' }: ClientRelativeTimeProps) {
  const [label, setLabel] = useState(fallback)

  useEffect(() => {
    const instant = Temporal.Instant.from(isoString)
    const update  = () => setLabel(fromNow(instant, Temporal.Now.instant()))

    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [isoString])

  return (
    <time
      dateTime={isoString}
      suppressHydrationWarning
    >
      {label}
    </time>
  )
}
```

The `suppressHydrationWarning` prop tells React to ignore the mismatch between server (empty string) and client (live relative time) on first paint.
