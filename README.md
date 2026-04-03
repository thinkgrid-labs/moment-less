# moment-less

Zero-dependency token-based formatting for the native JavaScript [Temporal API](https://tc39.es/proposal-temporal/).

Familiar Moment.js syntax. No legacy `Date`. No mutations. No bundle bloat.

```ts
import { format, fromNow } from 'moment-less';

const date = Temporal.Now.plainDateISO();
format(date, 'YYYY-MM-DD');  // "2026-04-09"
format(date, 'DD/MM/YY');    // "09/04/26"

const past = Temporal.Now.instant().subtract({ hours: 3 });
fromNow(past);               // "3 hours ago"
```

## Why

The TC39 Temporal API fixes JavaScript's broken `Date` object — immutable, time-zone-aware, unambiguous. But Temporal intentionally ships without a formatting method, leaving developers with the verbose `Intl.DateTimeFormat` API for even the simplest UI tasks.

`moment-less` is the missing DX bridge: token-based formatting you already know, wired directly to Temporal's properties.

## Install

```sh
npm install moment-less
# or
pnpm add moment-less
# or
yarn add moment-less
```

## Runtime & browser support

`moment-less` is a pure formatting utility — no DOM APIs, no Node.js built-ins. It runs anywhere `Temporal` is available natively or via polyfill.

**Native Temporal (no polyfill needed)**

| Runtime | Minimum version |
|---------|----------------|
| Node.js | 22.0+ |
| Chrome / Edge | 127+ |
| Firefox | 139+ |
| Safari | 18.2+ |
| Deno | 2.1+ |
| Bun | 1.2+ |

**Older environments (with polyfill)**

Install a Temporal polyfill alongside `moment-less`:

```sh
npm install temporal-polyfill
```

```ts
import 'temporal-polyfill/global'; // installs Temporal on globalThis
import { format } from 'moment-less';

format(Temporal.Now.plainDateISO(), 'YYYY-MM-DD');
```

`moment-less` has no opinion on the runtime source of `Temporal` — native or polyfilled, it works the same.

**Edge & serverless runtimes**

Works out of the box on Cloudflare Workers, Vercel Edge, and other V8-based edge runtimes that ship native Temporal support.

## API

### `format(temporalObj, formatString)`

Converts any Temporal object into a formatted string using Moment.js-style tokens.

```ts
import { format } from 'moment-less';

// PlainDate
format(Temporal.PlainDate.from('2026-04-09'), 'YYYY-MM-DD');   // "2026-04-09"

// PlainDateTime
format(Temporal.PlainDateTime.from('2026-04-09T14:05:59'), 'HH:mm:ss'); // "14:05:59"
format(Temporal.PlainDateTime.from('2026-04-09T14:05:59'), 'hh:mm A');  // "02:05 PM"

// Instant (normalized to UTC before formatting)
format(Temporal.Now.instant(), 'YYYY-MM-DD HH:mm:ss');
```

**Supported Temporal types:** `ZonedDateTime`, `PlainDateTime`, `PlainDate`, `PlainTime`, `Instant`

Using a token that requires a field not present on the type (e.g. `HH` on a `PlainDate`) throws a descriptive error.

### `fromNow(temporalObj, reference?)`

Returns a human-readable relative time string using `Intl.RelativeTimeFormat` under the hood.

```ts
import { fromNow } from 'moment-less';

const past = Temporal.Now.instant().subtract({ hours: 3 });
fromNow(past);           // "3 hours ago"

const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
fromNow(tomorrow);       // "tomorrow"

// Optional reference point (defaults to Temporal.Now.instant())
fromNow(past, someOtherInstant);
```

`PlainTime` is not supported (no date context to compute a diff from).

## Token reference

| Token | Output | Example |
|-------|--------|---------|
| `YYYY` | 4-digit year | `2026` |
| `YY` | 2-digit year | `26` |
| `MM` | Month, zero-padded | `04` |
| `M` | Month, no padding | `4` |
| `DD` | Day, zero-padded | `09` |
| `D` | Day, no padding | `9` |
| `HH` | Hour 24h, zero-padded | `14` |
| `hh` | Hour 12h, zero-padded | `02` |
| `mm` | Minute, zero-padded | `05` |
| `ss` | Second, zero-padded | `59` |
| `A` | AM / PM | `PM` |
| `a` | am / pm | `pm` |

> **Note:** Single-character tokens (`a`, `A`, `M`, `D`) are matched anywhere in the format string. Use only separator characters (`:`, `/`, `-`, spaces) as literals. Bracket escape syntax (`[literal text]`) is planned for v1.1.

## Migrating from Moment.js

Moment.js is [officially in maintenance mode](https://momentjs.com/docs/#/-project-status/). The recommended migration path is to use the native Temporal API — and `moment-less` makes that transition nearly syntax-transparent.

```ts
// Before (Moment.js)
import moment from 'moment';
moment().format('YYYY-MM-DD');
moment(someDate).fromNow();

// After (moment-less + Temporal)
import { format, fromNow } from 'moment-less';
format(Temporal.Now.plainDateISO(), 'YYYY-MM-DD');
fromNow(Temporal.Now.instant());
```

Key differences:
- **No parsing** — construct Temporal objects directly (`Temporal.PlainDate.from('2026-04-09')`) instead of `moment('2026-04-09')`
- **No manipulation** — use Temporal's native `.add()` / `.subtract()` / `.until()` instead of `moment().add()`
- **No timezone conversion** — use `Temporal.ZonedDateTime` directly
- **Immutable by default** — no footguns

## Compared to alternatives

| Library | Zero deps | Temporal native | Bundle (gzip) | Token format |
|---------|-----------|-----------------|---------------|--------------|
| **moment-less** | ✅ | ✅ | ~936 B | ✅ |
| moment | ❌ | ❌ | ~72 KB | ✅ |
| date-fns | ❌ | ❌ | ~13 KB (tree-shaken) | ✅ |
| dayjs | ❌ | ❌ | ~2.9 KB | ✅ |
| Intl.DateTimeFormat | ✅ | ✅ | 0 B | ❌ |

`moment-less` does one thing: format Temporal objects using the token syntax developers already know. It doesn't try to replace Temporal's math, parsing, or timezone engine — those are already built in.

## Frequently asked questions

**Does this work in the browser?**
Yes. It also works in Node.js, Deno, Bun, and V8-based edge runtimes (Cloudflare Workers, Vercel Edge). `moment-less` uses no platform-specific APIs — only `Temporal` and `Intl.RelativeTimeFormat`, both of which are standard across all modern JS environments. See the [Runtime & browser support](#runtime--browser-support) section for version details.

**Does this polyfill Temporal?**
No. `moment-less` is a formatting utility only. It relies on `Temporal` being available in the environment. Use `temporal-polyfill` or `@js-temporal/polyfill` if you need a polyfill.

**Can I use this with TypeScript?**
Yes. First-class TypeScript support is included — types ship with the package, no `@types/*` needed.

**Is it tree-shakeable?**
Yes. `format` and `fromNow` are separate named exports. If you only import `format`, `fromNow` is excluded from your bundle entirely.

**Why not just use `Intl.DateTimeFormat`?**
`Intl.DateTimeFormat` is powerful but verbose for common use cases. Formatting a date as `YYYY-MM-DD` requires constructing an options object and post-processing the parts manually. `moment-less` reduces that to a single readable string.

## Bundle size

| Format | Size | Gzipped |
|--------|------|---------|
| ESM | ~2.9 KB | ~936 B |
| CJS | ~2.9 KB | ~936 B |

Zero production dependencies.

## License

MIT
