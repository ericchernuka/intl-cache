import { describe, expect, it } from "vite-plus/test";

import { createFormatterCache } from "./factory.js";

class FakeFormatter {
  public readonly locales: Intl.LocalesArgument | undefined;
  public readonly options: object | undefined;

  public constructor(locales?: Intl.LocalesArgument, options?: object) {
    this.locales = locales;
    this.options = options;
  }
}

describe("createFormatterCache", () => {
  it("returns the shared instance for a repeated recipe", () => {
    const cache = createFormatterCache(Intl.NumberFormat);
    const first = cache.get("en-US", { style: "percent" });
    expect(cache.get("en-US", { style: "percent" })).toBe(first);
  });

  it("hits the cache for a fresh options literal every call", () => {
    const cache = createFormatterCache(Intl.NumberFormat);
    const first = cache.get("en-US", { style: "currency", currency: "USD" });
    expect(cache.get("en-US", { currency: "USD", style: "currency" })).toBe(first);
  });

  it("constructs distinct instances for distinct locales", () => {
    const cache = createFormatterCache(Intl.NumberFormat);
    expect(cache.get("en-US")).not.toBe(cache.get("fr-FR"));
  });

  it("constructs distinct instances for distinct options", () => {
    const cache = createFormatterCache(Intl.NumberFormat);
    const percent = cache.get("en-US", { style: "percent" });
    expect(cache.get("en-US", { style: "decimal" })).not.toBe(percent);
  });

  it("caches Intl.Locale objects per locale", () => {
    // Regression guard for the Base UI #4999 class of bug, where
    // Intl.Locale instances JSON.stringify to {} and share one entry
    const cache = createFormatterCache(Intl.NumberFormat);
    const french = cache.get(new Intl.Locale("fr-FR"));
    expect(cache.get(new Intl.Locale("en-US"))).not.toBe(french);
    expect(cache.get(new Intl.Locale("fr-FR"))).toBe(french);
  });

  it("does not mask invalid locale errors with a cached default", () => {
    const cache = createFormatterCache(Intl.NumberFormat);
    const defaultFormatter = cache.get();
    expect(defaultFormatter).toBeInstanceOf(Intl.NumberFormat);
    // An empty locale is invalid, so cached defaults must not swallow the RangeError
    expect(() => cache.get("")).toThrow(RangeError);
  });

  it("does not cache options it cannot serialize faithfully", () => {
    const cache = createFormatterCache(Intl.NumberFormat);
    const defaultFormatter = cache.get("en-US");
    // A non-finite number is invalid, so the RangeError must surface rather than reuse the default
    expect(() => cache.get("en-US", { minimumFractionDigits: Number.NaN })).toThrow(RangeError);
    expect(cache.get("en-US")).toBe(defaultFormatter);
  });

  it("returns functional native formatters", () => {
    const cache = createFormatterCache(Intl.NumberFormat);
    const usd = cache.get("en-US", { style: "currency", currency: "USD" });
    expect(usd).toBeInstanceOf(Intl.NumberFormat);
    expect(usd.format(42)).toBe("$42.00");
  });

  it("works with any Intl constructor", () => {
    const cache = createFormatterCache(Intl.RelativeTimeFormat);
    const formatter = cache.get("en-US", { numeric: "auto" });
    expect(formatter).toBeInstanceOf(Intl.RelativeTimeFormat);
    expect(cache.get("en-US", { numeric: "auto" })).toBe(formatter);
  });
});

describe("recipe keying", () => {
  it("shares one instance for reordered option keys", () => {
    const cache = createFormatterCache(FakeFormatter);
    const first = cache.get("en-US", { style: "currency", currency: "USD" });
    expect(cache.get("en-US", { currency: "USD", style: "currency" })).toBe(first);
  });

  it("folds undefined-valued keys into the empty options recipe", () => {
    const cache = createFormatterCache(FakeFormatter);
    const empty = cache.get("en-US", {});
    expect(cache.get("en-US", { timeZone: undefined })).toBe(empty);
  });

  it("shares one instance for a missing locale and a missing options argument", () => {
    const cache = createFormatterCache(FakeFormatter);
    expect(cache.get("en-US")).toBe(cache.get("en-US", {}));
  });

  it("keys an empty-string locale apart from a missing locale", () => {
    const cache = createFormatterCache(FakeFormatter);
    expect(cache.get("")).not.toBe(cache.get());
  });

  it("normalizes Intl.Locale instances to their tag", () => {
    const cache = createFormatterCache(FakeFormatter);
    expect(cache.get(new Intl.Locale("fr-FR"))).toBe(cache.get("fr-FR"));
  });

  it("keys locale arrays apart from locale strings", () => {
    const cache = createFormatterCache(FakeFormatter);
    expect(cache.get(["fr-FR"])).not.toBe(cache.get("fr-FR"));
  });

  it("normalizes locale arrays containing Intl.Locale instances", () => {
    const cache = createFormatterCache(FakeFormatter);
    const locales = [new Intl.Locale("fr-FR"), "en-US"];
    expect(cache.get(locales)).toBe(cache.get(["fr-FR", "en-US"]));
  });

  it("shares one instance for boolean and finite-number options", () => {
    const cache = createFormatterCache(FakeFormatter);
    const first = cache.get("en-US", { useGrouping: false, minimumIntegerDigits: 2 });
    expect(cache.get("en-US", { minimumIntegerDigits: 2, useGrouping: false })).toBe(first);
  });

  it("bypasses the cache for function option values", () => {
    const cache = createFormatterCache(FakeFormatter);
    expect(cache.get("en-US", { style: () => "percent" })).not.toBe(
      cache.get("en-US", { style: () => "percent" }),
    );
  });

  it("bypasses the cache for object option values", () => {
    const cache = createFormatterCache(FakeFormatter);
    expect(cache.get("en-US", { currency: { code: "USD" } })).not.toBe(
      cache.get("en-US", { currency: { code: "USD" } }),
    );
  });

  it("bypasses the cache for non-finite number option values", () => {
    const cache = createFormatterCache(FakeFormatter);
    expect(cache.get("en-US", { minimumFractionDigits: Number.NaN })).not.toBe(
      cache.get("en-US", { minimumFractionDigits: Number.NaN }),
    );
  });

  it("bypasses the cache for options that are not plain objects", () => {
    const cache = createFormatterCache(FakeFormatter);
    expect(cache.get("en-US", [])).not.toBe(cache.get("en-US", []));
    expect(cache.get("en-US", new Date())).not.toBe(cache.get("en-US", new Date()));
  });

  it("keeps caching recipes after a bypassed one", () => {
    const cache = createFormatterCache(FakeFormatter);
    const shared = cache.get("en-US");
    cache.get("en-US", { style: () => "percent" });
    expect(cache.get("en-US")).toBe(shared);
  });
});
