---
title: Vue 3 Recipes
description: Vue 3 composables and components for moment-less — RelativeTime.vue, useCalendar, useHumanizedDuration, and a v-date-format custom directive.
---

# Vue 3 Recipes

TypeScript components and composables for using moment-less in Vue 3 applications.

## `RelativeTime.vue` Component

A reactive component that displays a live-updating relative time string. Uses `onUnmounted` to clean up the interval.

```vue
<!-- components/RelativeTime.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { fromNow, fromDate } from 'moment-less'

interface Props {
  /** ISO 8601 string, JS Date, or Temporal.Instant */
  date: string | Date | Temporal.Instant
  locale?: string
  updateInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  locale: undefined,
  updateInterval: 30_000,
})

function toInstant(date: string | Date | Temporal.Instant): Temporal.Instant {
  if (date instanceof Date) return fromDate(date)
  if (typeof date === 'string') return Temporal.Instant.from(date)
  return date
}

const instant = computed(() => toInstant(props.date))
const label   = ref('')

function updateLabel() {
  label.value = fromNow(instant.value, Temporal.Now.instant(), props.locale)
}

let intervalId: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  updateLabel()
  intervalId = setInterval(updateLabel, props.updateInterval)
})

onUnmounted(() => {
  if (intervalId !== undefined) clearInterval(intervalId)
})

// Re-render if date prop changes
watch(() => props.date, updateLabel)

const isoString = computed(() => instant.value.toString())
</script>

<template>
  <time :datetime="isoString" :title="isoString">{{ label }}</time>
</template>
```

**Usage:**

```vue
<script setup lang="ts">
import RelativeTime from '@/components/RelativeTime.vue'

const comment = {
  body: 'This is a great post!',
  createdAt: '2026-04-09T10:00:00Z',
}
</script>

<template>
  <article>
    <p>{{ comment.body }}</p>
    <RelativeTime :date="comment.createdAt" locale="en" />
  </article>
</template>
```

## `useCalendar` Composable

A composable that returns a reactive calendar label for a date, updating whenever a reactive reference point changes.

```ts
// composables/useCalendar.ts
import { computed, type Ref, type MaybeRef, toValue } from 'vue'
import { calendar, fromDate } from 'moment-less'
import type { CalendarOptions } from 'moment-less'

type CalendarInput =
  | Date
  | string
  | Temporal.PlainDate
  | Temporal.PlainDateTime
  | Temporal.Instant

function toCalendarTemporal(input: CalendarInput) {
  if (input instanceof Date) return fromDate(input)
  if (typeof input === 'string') {
    try { return Temporal.Instant.from(input) } catch {}
    try { return Temporal.PlainDateTime.from(input) } catch {}
    return Temporal.PlainDate.from(input)
  }
  return input
}

export function useCalendar(
  date: MaybeRef<CalendarInput>,
  options?: MaybeRef<CalendarOptions>
) {
  const label = computed(() => {
    const input = toCalendarTemporal(toValue(date))
    const ref   = Temporal.Now.instant()
    const opts  = toValue(options)
    return calendar(input, ref, opts)
  })

  return { label }
}
```

**Usage in a component:**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useCalendar } from '@/composables/useCalendar'

const sentAt = ref('2026-04-09T09:15:00Z')
const { label } = useCalendar(sentAt, { timeFormat: 'h12' })
</script>

<template>
  <span class="text-sm text-gray-500">{{ label }}</span>
</template>
```

## `useHumanizedDuration` Composable

```ts
// composables/useHumanizedDuration.ts
import { computed, type MaybeRef, toValue } from 'vue'
import { humanizeDuration } from 'moment-less'

export function useHumanizedDuration(
  duration: MaybeRef<Temporal.Duration | string>,
  locale?: MaybeRef<string>
) {
  const label = computed(() => {
    const raw = toValue(duration)
    const dur = typeof raw === 'string' ? Temporal.Duration.from(raw) : raw
    return humanizeDuration(dur, toValue(locale))
  })

  return { label }
}
```

**Usage:**

```vue
<script setup lang="ts">
import { useHumanizedDuration } from '@/composables/useHumanizedDuration'

const props = defineProps<{ duration: string }>()
const { label } = useHumanizedDuration(() => props.duration)
</script>

<template>
  <span class="badge">{{ label }}</span>
</template>
```

## `v-date-format` Custom Directive

A custom directive that formats an element's text content with a format string. This is most useful when you want declarative formatting directly in templates without creating wrapper components.

```ts
// directives/vDateFormat.ts
import type { DirectiveBinding } from 'vue'
import { format, fromDate } from 'moment-less'

interface DateFormatBinding {
  /** Format string, e.g. 'MMMM Do, YYYY' */
  format: string
  /** Optional BCP 47 locale tag */
  locale?: string
  /** The date value: ISO string, Date, or Temporal object */
  value?: string | Date | Temporal.PlainDate | Temporal.PlainDateTime | Temporal.Instant
}

function applyFormat(el: HTMLElement, binding: DirectiveBinding<DateFormatBinding>) {
  const { format: fmt, locale, value } = binding.value

  let temporal: Parameters<typeof format>[0]
  const raw = value ?? el.textContent?.trim() ?? ''

  if (raw instanceof Date) {
    temporal = fromDate(raw)
  } else if (typeof raw === 'string') {
    try { temporal = Temporal.Instant.from(raw) }
    catch { temporal = Temporal.PlainDate.from(raw) }
  } else {
    temporal = raw
  }

  el.textContent = format(temporal, fmt, { locale })
}

export const vDateFormat = {
  mounted: applyFormat,
  updated: applyFormat,
}
```

**Registration (global):**

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { vDateFormat } from './directives/vDateFormat'

const app = createApp(App)
app.directive('date-format', vDateFormat)
app.mount('#app')
```

**Usage in templates:**

```vue
<template>
  <!-- Format the ISO string inside the element -->
  <time
    v-date-format="{
      format: 'MMMM Do, YYYY',
      locale: 'en',
      value: post.publishedAt,
    }"
    :datetime="post.publishedAt"
  />

  <!-- French month name -->
  <span
    v-date-format="{
      format: 'MMMM YYYY',
      locale: 'fr',
      value: '2026-04-09',
    }"
  />
  <!-- → "avril 2026" -->
</template>
```

## Pinia Store Integration

If you use Pinia for state management, you can keep formatting logic close to your store data using getters:

```ts
// stores/notifications.ts
import { defineStore } from 'pinia'
import { calendar, fromDate } from 'moment-less'

interface Notification {
  id: string
  message: string
  createdAt: Date
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [] as Notification[],
  }),

  getters: {
    formattedItems: (state) =>
      state.items.map((n) => ({
        ...n,
        timeLabel: calendar(
          fromDate(n.createdAt),
          Temporal.Now.instant(),
          { timeFormat: 'h12' }
        ),
      })),
  },

  actions: {
    add(message: string) {
      this.items.unshift({
        id: crypto.randomUUID(),
        message,
        createdAt: new Date(),
      })
    },
  },
})
```
