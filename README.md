# intl-cache

A zero-dependency cache for `Intl.*` formatter constructors.

Constructing an `Intl.NumberFormat` is slow enough that doing it inside a render or a loop shows up in profiles. `intl-cache` keeps one instance per locale and options, so you can build formatters inline and still reuse them.

This is a reference implementation, not a published package. Copy the code or adapt the approach. The examples import from `intl-cache`; point that at wherever you keep the source.

## Usage

```js
import { numberFormatCache } from "intl-cache";

const usd = numberFormatCache.get("en-US", { style: "currency", currency: "USD" });

usd.format(42); // "$42.00"
usd.format(1337); // "$1,337.00"
```

Lookups are by value, not object identity. Two options objects that describe the same formatter resolve to the same instance, so inline literals are fine:

```js
numberFormatCache.get("en-US", { style: "percent" }) ===
  numberFormatCache.get("en-US", { style: "percent" }); // true
```

`locales` accepts what the native constructors accept: a string, an array of strings, an `Intl.Locale`, or an array mixing the two.

```js
numberFormatCache.get(new Intl.Locale("fr-FR")); // shares the entry for "fr-FR"
numberFormatCache.get(["fr-FR", "en-US"]);
```

## Built-in caches

One cache per constructor:

```js
import {
  collatorCache,
  dateTimeFormatCache,
  listFormatCache,
  numberFormatCache,
  pluralRulesCache,
  relativeTimeFormatCache,
  segmenterCache,
} from "intl-cache";
```

| Cache                     | Constructor               |
| ------------------------- | ------------------------- |
| `collatorCache`           | `Intl.Collator`           |
| `dateTimeFormatCache`     | `Intl.DateTimeFormat`     |
| `listFormatCache`         | `Intl.ListFormat`         |
| `numberFormatCache`       | `Intl.NumberFormat`       |
| `pluralRulesCache`        | `Intl.PluralRules`        |
| `relativeTimeFormatCache` | `Intl.RelativeTimeFormat` |
| `segmenterCache`          | `Intl.Segmenter`          |

For anything else, including a polyfill, pass the constructor to `createFormatterCache`:

```js
import { createFormatterCache } from "intl-cache";

const displayNamesCache = createFormatterCache(Intl.DisplayNames);

displayNamesCache.get("en", { type: "currency" });
```

## API

### `cache.get(locales?, options?)`

Returns the shared formatter instance for a recipe, constructing it on first use.

`locales` is an `Intl.LocalesArgument` and `options` is the constructor's options object. Both are optional.

The first call for a recipe builds the formatter. Later calls with an equivalent recipe return that same instance.

Options that `intl-cache` cannot serialize faithfully (functions, nested objects, non-finite numbers, class instances) skip the cache. The native constructor runs every time instead, so errors and behavior still come from `Intl` itself. A `minimumFractionDigits` of `NaN`, for example, throws the same `RangeError` it would from `new Intl.NumberFormat(...)`.

### `createFormatterCache(Constructor)`

Builds a cache for a constructor shaped like the `Intl.*` ones, `new (locales?, options?) => Instance`. Returns a `FormatterCache` with a `get` method.

## Notes

Entries are never evicted. They live as long as the module does, which is fine when an app has a handful of recipes. If you feed it unbounded, user-derived recipes, the map grows with them. Keep the recipe set small.

Serialization runs on every `get`. That's much cheaper than constructing a formatter, but if you're in a hot loop, hold onto the returned instance yourself.

There's no React binding in this package. The cache is plain JavaScript, so a hook is a thin wrapper over `get`.

## Contributing

Clone the repo and install dependencies:

```
pnpm install
```

Run the checks before opening a PR:

```
pnpm test
pnpm test:coverage
pnpm check
pnpm build
```

`pnpm test` runs the Vitest suite, `pnpm test:coverage` enforces the 100% thresholds, `pnpm check` handles formatting, lint, and types, and `pnpm build` produces `dist`. Issues and pull requests are welcome.

## License

MIT
