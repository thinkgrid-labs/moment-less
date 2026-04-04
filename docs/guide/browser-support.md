---
title: Browser & Runtime Support
description: moment-less works in Node.js 22+, Chrome 127+, Firefox 139+, Safari 18.2+, Deno, Bun, and Cloudflare Workers. Polyfill guide for older environments.
---

# Browser & Runtime Support

moment-less has zero runtime dependencies of its own, but it requires two platform APIs: **Temporal** and **Intl**. `Intl` is universally available; Temporal is newer and may need a polyfill in some environments.

## Native Temporal Support

The following runtimes ship Temporal natively with no polyfill required.

| Environment         | Minimum version | Notes                                      |
|---------------------|-----------------|--------------------------------------------|
| Node.js             | 22.0.0          | Behind `--harmony-temporal` in 21          |
| Chrome / Edge       | 127             | Shipped in July 2024                       |
| Firefox             | 139             | Shipped in May 2025                        |
| Safari              | 18.2            | Shipped in December 2024                   |
| Deno                | 2.1             | Stable Temporal since Deno 2.1             |
| Bun                 | 1.2             | Bun 1.2+ includes V8 with Temporal         |

> **Check at runtime:** If you are unsure whether the current environment has Temporal, guard with `typeof Temporal !== 'undefined'`. moment-less does not perform this check internally — it is your application's responsibility to ensure Temporal is available before calling any moment-less function.

## Polyfill Setup

For environments that do not yet support Temporal natively (Node < 22, older browsers, React Native), install a polyfill before importing moment-less.

### Option A — `temporal-polyfill` (recommended, tree-shakeable)

```sh
npm install temporal-polyfill
```

```ts
// Entry point — must run before any moment-less import
import 'temporal-polyfill/global'

import { format } from 'moment-less'

const d = Temporal.PlainDate.from('2026-04-09')
format(d, 'MMMM Do, YYYY')  // → "April 9th, 2026"
```

`temporal-polyfill` is spec-compliant, tree-shakeable, and around 17KB gzipped. It targets the Stage 3 Temporal spec.

### Option B — `@js-temporal/polyfill` (official TC39 reference)

```sh
npm install @js-temporal/polyfill
```

```ts
import { Temporal, Intl, toTemporalInstant } from '@js-temporal/polyfill'

// Patch globals if you want bare `Temporal.PlainDate.from(...)` syntax
Object.assign(globalThis, { Temporal, Intl, toTemporalInstant })

import { format } from 'moment-less'
```

`@js-temporal/polyfill` is the reference implementation maintained by TC39 champions. It is larger (~60KB gzipped) but has the most complete coverage of edge cases.

### Vite / webpack bundler setup

If you are using a bundler, add the polyfill import to your entry file **before** any other application code:

```ts
// src/main.ts  (Vite) or  src/index.ts  (webpack)
import 'temporal-polyfill/global'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

For Next.js, add it to `instrumentation.ts` or at the top of `_app.tsx`:

```ts
// pages/_app.tsx
import 'temporal-polyfill/global'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
```

## Edge Runtimes

### Cloudflare Workers

Cloudflare Workers runs V8 but exposes a subset of APIs. Temporal is **not** available natively in Cloudflare Workers as of April 2026. Use `temporal-polyfill`:

```sh
npm install temporal-polyfill
```

```ts
// worker.ts
import 'temporal-polyfill/global'
import { format } from 'moment-less'

export default {
  async fetch(request: Request): Promise<Response> {
    const now = Temporal.Now.plainDateTimeISO('UTC')
    return new Response(format(now, 'YYYY-MM-DD HH:mm:ss [UTC]'))
  },
}
```

The polyfill adds ~17KB to your worker bundle. Keep this in mind if you are approaching the 1MB uncompressed limit.

### Vercel Edge Functions

Same situation as Cloudflare Workers — V8-based, no native Temporal yet. Add the polyfill:

```ts
// api/hello/route.ts  (App Router Edge route)
import 'temporal-polyfill/global'
import { fromNow } from 'moment-less'

export const runtime = 'edge'

export async function GET() {
  const posted = Temporal.PlainDateTime.from('2026-04-01T09:00:00')
  return Response.json({ label: fromNow(posted) })
}
```

## SSR Notes

When using moment-less in a server-side rendering context (Next.js, Nuxt, SvelteKit, Remix), be aware of the following:

**Avoid `Temporal.Now` in server-rendered output that is also hydrated client-side.** If the server renders "3 hours ago" and the client hydrates with a slightly different clock, you will see a hydration mismatch. Two patterns avoid this:

**Pattern 1 — Serialize the reference point:**

```ts
// Server: serialize the reference timestamp to a prop
const referenceISO = Temporal.Now.instant().toString()

// Client: deserialize and call fromNow() with the same reference
import { fromNow } from 'moment-less'
const ref = Temporal.Instant.from(referenceISO)
const label = fromNow(event.postedAt, ref)
```

**Pattern 2 — Render relative labels only on the client:**

```tsx
// React: suppress hydration warning and render on client only
const [label, setLabel] = useState('')
useEffect(() => {
  setLabel(fromNow(postedAt))
}, [postedAt])

return <time suppressHydrationWarning>{label}</time>
```

Both patterns are shown in the [React Recipes](/recipes/react) page.
