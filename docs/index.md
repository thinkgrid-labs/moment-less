---
layout: home

hero:
  name: moment-less
  text: Temporal API formatting
  tagline: Moment.js token syntax for the native Temporal API. Zero dependencies. < 2KB gzipped.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/format

features:
  - icon: 🔤
    title: Familiar Token Syntax
    details: Use the same YYYY-MM-DD, HH:mm:ss, and MMMM Do patterns you already know from Moment.js and date-fns — no new format language to learn.
  - icon: 📅
    title: Full Temporal Support
    details: Works natively with all Temporal types — PlainDate, PlainDateTime, PlainTime, ZonedDateTime, and Instant. Each type exposes only the tokens that make sense for it.
  - icon: 🕐
    title: Relative Time
    details: fromNow() returns human-readable strings like "3 hours ago" or "in 2 days". Optionally supply your own reference point for deterministic output in tests.
  - icon: 🗓️
    title: Calendar Labels
    details: calendar() returns context-aware labels — "Today at 2:05 PM", "Yesterday", "Monday", or "Apr 9, 2026" — exactly like messaging apps do.
  - icon: 🌍
    title: Locale-Aware
    details: Month names, weekday names, and relative phrases all adapt to the requested locale via the built-in Intl APIs. No locale bundles to ship.
  - icon: 📦
    title: Zero Dependencies
    details: The entire library is a single TypeScript file with no runtime dependencies. It relies only on the Temporal API and Intl, both built into the platform.
---

## Quick Look

```ts
import { format, fromNow, calendar, humanizeDuration, fromDate } from 'moment-less'

// Token-based formatting
const dt = Temporal.PlainDateTime.from('2026-04-09T14:05:00')
format(dt, 'MMMM Do, YYYY [at] h:mm A')
// → "April 9th, 2026 at 2:05 PM"

// Relative time
const past = Temporal.PlainDateTime.from('2026-04-09T11:00:00')
fromNow(past, dt)
// → "3 hours ago"

// Calendar label
calendar(past, dt)
// → "Today at 11:00 AM"

// Duration humanization
const dur = new Temporal.Duration(0, 0, 0, 0, 2, 45)
humanizeDuration(dur)
// → "3 hours"

// Bridge from legacy Date
const inst = fromDate(new Date())
format(inst, 'YYYY-MM-DDTHH:mm:ssZ')
// → "2026-04-09T14:05:00+00:00"
```
