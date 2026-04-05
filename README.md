# moment-less

[![npm version](https://img.shields.io/npm/v/moment-less)](https://www.npmjs.com/package/moment-less)
[![bundle size](https://img.shields.io/bundlephobia/minzip/moment-less)](https://bundlephobia.com/package/moment-less)
[![CI](https://github.com/thinkgrid-labs/moment-less/actions/workflows/ci.yml/badge.svg)](https://github.com/thinkgrid-labs/moment-less/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/moment-less)](./LICENSE)

**The Moment.js-style date formatting library built for the native JavaScript Temporal API.**

Format `Temporal.PlainDate`, `Temporal.ZonedDateTime`, `Temporal.Instant`, and more using the familiar `YYYY-MM-DD` token syntax — with zero dependencies and a ~936B gzipped footprint.

```ts
import { format, fromNow } from 'moment-less';

// Format any Temporal object with Moment.js tokens
const date = Temporal.Now.plainDateISO();
format(date, 'YYYY-MM-DD');       // "2026-04-09"
format(date, 'DD/MM/YY');         // "09/04/26"

// Relative time without any extra libraries
const past = Temporal.Now.instant().subtract({ hours: 3 });
fromNow(past);                    // "3 hours ago"
```

## Features

- **Moment.js-compatible token syntax** — `YYYY`, `MMMM`, `MMM`, `MM`, `DD`, `Do`, `dddd`, `ddd`, `HH`, `hh`, `H`, `h`, `mm`, `ss`, `A/a`
- **Full Temporal API support** — `ZonedDateTime`, `PlainDateTime`, `PlainDate`, `PlainTime` (format only), `Instant`
- **Relative time** — `fromNow()` powered by native `Intl.RelativeTimeFormat`, with optional locale
- **Zero production dependencies** — nothing to audit, nothing to update
- **First-class TypeScript** — strict types, no `@types/*` package needed
- **Tree-shakeable** — import only `format` or only `fromNow`, pay for what you use
- **Universal runtime** — browser, Node.js, Deno, Bun, Cloudflare Workers, Vercel Edge

## Why moment-less?

The TC39 Temporal API fixes JavaScript's broken `Date` object with immutable, time-zone-aware, calendar-correct primitives. But Temporal intentionally ships **without a formatting method** — the spec delegates that to `Intl.DateTimeFormat`, which is powerful but verbose for everyday UI tasks.

Developers migrating away from Moment.js (now [officially in maintenance mode](https://momentjs.com/docs/#/-project-status/)) still need a way to write `format(date, 'MMM D, YYYY')` without pulling in a 13–72KB library that doesn't even understand Temporal objects.

`moment-less` is the missing bridge: the token syntax you already know, wired directly to Temporal's native properties. No parsing engine, no mutation, no timezone layer — Temporal already handles all of that.

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

**Older environments — use with a Temporal polyfill**

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
format(Temporal.PlainDate.from('2026-04-09'), 'YYYY-MM-DD');              // "2026-04-09"
format(Temporal.PlainDate.from('2026-04-09'), 'MMMM Do, YYYY');           // "April 9th, 2026"
format(Temporal.PlainDate.from('2026-04-09'), 'dddd, MMM D');             // "Thursday, Apr 9"

// PlainDateTime
format(Temporal.PlainDateTime.from('2026-04-09T14:05:59'), 'HH:mm:ss'); // "14:05:59"
format(Temporal.PlainDateTime.from('2026-04-09T14:05:59'), 'hh:mm A');  // "02:05 PM"

// ZonedDateTime
format(Temporal.ZonedDateTime.from('2026-04-09T14:05:59[America/New_York]'), 'YYYY-MM-DD HH:mm');

// Instant (normalized to UTC before formatting)
format(Temporal.Now.instant(), 'YYYY-MM-DD HH:mm:ss');
```

**Supported Temporal types:** `ZonedDateTime`, `PlainDateTime`, `PlainDate`, `PlainTime`, `Instant`

Using a token that requires a field not present on the type (e.g. `HH` on a `PlainDate`) throws a descriptive error.

### `fromNow(temporalObj, reference?, locale?)`

Returns a human-readable relative time string. Uses the native `Intl.RelativeTimeFormat` API — no manual duration math.

```ts
import { fromNow } from 'moment-less';

fromNow(Temporal.Now.instant().subtract({ hours: 3 }));        // "3 hours ago"
fromNow(Temporal.Now.plainDateISO().add({ days: 1 }));         // "tomorrow"
fromNow(Temporal.Now.instant().subtract({ years: 1 }));        // "last year"

// Pass an explicit reference point instead of Temporal.Now
fromNow(somePastInstant, someOtherInstant);

// Pass a BCP 47 locale tag for localised output
fromNow(Temporal.Now.instant().subtract({ hours: 3 }), undefined, 'fr'); // "il y a 3 heures"
fromNow(Temporal.Now.instant().subtract({ hours: 3 }), undefined, 'es'); // "hace 3 horas"
```

`PlainTime` is not supported (no date context to compute a diff from). Omitting `locale` uses the system locale.

## Token reference

| Token | Description | Example output |
|-------|-------------|----------------|
| `YYYY` | 4-digit year | `2026` |
| `YY` | 2-digit year | `26` |
| `MMMM` | Full month name | `April` |
| `MMM` | Short month name | `Apr` |
| `MM` | Month, zero-padded | `04` |
| `M` | Month, no padding | `4` |
| `Do` | Day of month, ordinal | `9th` |
| `DD` | Day of month, zero-padded | `09` |
| `D` | Day of month, no padding | `9` |
| `dddd` | Full weekday name | `Thursday` |
| `ddd` | Short weekday name | `Thu` |
| `HH` | Hour (24h), zero-padded | `14` |
| `H` | Hour (24h), no padding | `14` |
| `hh` | Hour (12h), zero-padded | `02` |
| `h` | Hour (12h), no padding | `2` |
| `mm` | Minute, zero-padded | `05` |
| `ss` | Second, zero-padded | `59` |
| `A` | AM / PM (uppercase) | `PM` |
| `a` | am / pm (lowercase) | `pm` |

> **Note:** Tokens are matched longest-first (`MMMM` before `MMM` before `MM` before `M`, etc.), so there is no ambiguity. Use only non-alphabetic separators (`:`, `/`, `-`, spaces, `,`) as literal characters. Bracket escape syntax (`[literal text]`) is planned for v1.1.

## Migrating from Moment.js

Moment.js is in maintenance mode and [recommends migrating](https://momentjs.com/docs/#/-project-status/) to native platform APIs. `moment-less` + Temporal makes that migration nearly token-transparent:

```ts
// Before — Moment.js (72KB gzipped, mutable, legacy Date)
import moment from 'moment';
moment().format('YYYY-MM-DD');
moment().add(1, 'days').format('DD/MM/YYYY');
moment(someDate).fromNow();

// After — moment-less + Temporal (< 1KB gzipped, immutable, no legacy Date)
import { format, fromNow } from 'moment-less';
format(Temporal.Now.plainDateISO(), 'YYYY-MM-DD');
format(Temporal.Now.plainDateISO().add({ days: 1 }), 'DD/MM/YYYY');
fromNow(Temporal.Now.instant());
```

Key differences:
- **No parsing** — use `Temporal.PlainDate.from('2026-04-09')` instead of `moment('2026-04-09')`
- **No manipulation on this library** — use Temporal's built-in `.add()` / `.subtract()` / `.until()`
- **No timezone layer needed** — use `Temporal.ZonedDateTime` directly
- **Immutable by design** — every Temporal operation returns a new object

## moment-less vs moment.js, date-fns, and dayjs

| Library | Zero deps | Works with Temporal | Gzipped | Token format (`YYYY-MM-DD`) |
|---------|-----------|---------------------|---------|----------------------------|
| **moment-less** | ✅ | ✅ native | ~936 B | ✅ |
| moment | ❌ | ❌ legacy Date only | ~72 KB | ✅ |
| date-fns | ❌ | ❌ legacy Date only | ~13 KB (tree-shaken) | ✅ |
| dayjs | ❌ | ❌ legacy Date only | ~2.9 KB | ✅ |
| Intl.DateTimeFormat | ✅ | ✅ via Instant | 0 B | ❌ verbose |

`moment-less` is intentionally scoped: **format Temporal objects, nothing else.** Date arithmetic, parsing, and timezone conversion are Temporal's job — it already does them better than any library can.

## Frequently asked questions

**How do I format a date as YYYY-MM-DD in JavaScript with Temporal?**
Use `format(Temporal.Now.plainDateISO(), 'YYYY-MM-DD')` from `moment-less`. No setup needed beyond the import.

**Is this a Moment.js replacement?**
For formatting and relative time, yes — the token syntax is intentionally compatible. For date math and parsing, use the Temporal API directly (`.add()`, `.subtract()`, `.from()`). Temporal replaces those parts of Moment natively.

**Does this work in the browser?**
Yes. It also works in Node.js, Deno, Bun, and V8-based edge runtimes (Cloudflare Workers, Vercel Edge). `moment-less` uses no platform-specific APIs. See [Runtime & browser support](#runtime--browser-support) for version details.

**Does this polyfill the Temporal API?**
No. `moment-less` is a formatting utility only. Use `temporal-polyfill` or `@js-temporal/polyfill` for environments that don't have native Temporal yet.

**Does it support TypeScript?**
Yes, fully. Types are bundled — no separate `@types/moment-less` package needed. All Temporal types are inferred correctly.

**Is it tree-shakeable?**
Yes. `format` and `fromNow` are independent named exports. Importing only `format` produces a bundle under 600B gzipped.

**Why not just use `Intl.DateTimeFormat`?**
`Intl.DateTimeFormat` is great for locale-sensitive display strings but unwieldy for structural formats like `YYYY-MM-DD HH:mm:ss`. You'd need to call `.formatToParts()`, reduce the parts array, and handle zero-padding yourself. `moment-less` makes that a one-liner.

## Bundle size

| Export | Raw | Gzipped |
|--------|-----|---------|
| Full (`format` + `fromNow`) ESM | ~2.9 KB | ~936 B |
| `format` only (tree-shaken) | ~1.5 KB | ~550 B |

Zero production dependencies.

## Contributing

Issues and pull requests are welcome. Run the test suite with:

```sh
pnpm test
pnpm test:coverage
```

## License

MIT
