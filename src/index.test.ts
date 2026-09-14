import { describe, expect, it } from "vite-plus/test";

import {
  collatorCache,
  dateTimeFormatCache,
  listFormatCache,
  numberFormatCache,
  pluralRulesCache,
  relativeTimeFormatCache,
  segmenterCache,
} from "./index.js";

const cases = [
  {
    Constructor: Intl.Collator,
    get: (): Intl.Collator => collatorCache.get("en-US"),
    name: "Intl.Collator",
  },
  {
    Constructor: Intl.DateTimeFormat,
    get: (): Intl.DateTimeFormat => dateTimeFormatCache.get("en-US", { dateStyle: "long" }),
    name: "Intl.DateTimeFormat",
  },
  {
    Constructor: Intl.ListFormat,
    get: (): Intl.ListFormat => listFormatCache.get("en-US", { type: "conjunction" }),
    name: "Intl.ListFormat",
  },
  {
    Constructor: Intl.NumberFormat,
    get: (): Intl.NumberFormat => numberFormatCache.get("en-US"),
    name: "Intl.NumberFormat",
  },
  {
    Constructor: Intl.PluralRules,
    get: (): Intl.PluralRules => pluralRulesCache.get("en-US"),
    name: "Intl.PluralRules",
  },
  {
    Constructor: Intl.RelativeTimeFormat,
    get: (): Intl.RelativeTimeFormat => relativeTimeFormatCache.get("en-US", { numeric: "auto" }),
    name: "Intl.RelativeTimeFormat",
  },
  {
    Constructor: Intl.Segmenter,
    get: (): Intl.Segmenter => segmenterCache.get("en-US", { granularity: "grapheme" }),
    name: "Intl.Segmenter",
  },
];

describe("shared caches", () => {
  it.each(cases)("shares instances of $name", ({ Constructor, get }) => {
    const first = get();
    expect(first).toBeInstanceOf(Constructor);
    expect(get()).toBe(first);
  });
});
