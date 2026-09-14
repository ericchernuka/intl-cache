/**
 * Serialize the locales half of a recipe.
 * String() normalizes Intl.Locale instances to their tag ("fr-FR"), which
 * JSON.stringify would wrongly collapse to {}
 * Type tags keep undefined, string, and array locales in separate key spaces,
 * so an empty string (rejected by Intl with a RangeError) never collides with
 * a missing locale
 */
function serializeLocales(locales?: Intl.LocalesArgument): string {
  if (locales === undefined) {
    return "undefined:";
  }
  if (Array.isArray(locales)) {
    return `array:${locales.map(String).join(",")}`;
  }
  return `string:${String(locales)}`;
}

/**
 * True when Intl coerces a value without surprise, meaning the value can be
 * keyed faithfully; objects, functions, symbols, bigint, and non-finite
 * numbers all disqualify the recipe from caching
 */
function isFlatOptionValue(value: unknown): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  return typeof value === "string" || typeof value === "boolean";
}

/** True when options is a plain object literal, the only prototype the cache keys */
function isPlainObject(options: object): boolean {
  return Object.getPrototypeOf(options) === Object.prototype;
}

/**
 * Serialize every option entry, or undefined when a value cannot be keyed
 * faithfully. Keys are sorted so reordered properties share one cache entry,
 * and undefined-valued keys are dropped, folding `{ timeZone: undefined }` and
 * `{}` into the same recipe
 */
function serializeOptionEntries(options: object): string[] | undefined {
  // Array.prototype.toSorted is Baseline 2023 (Chrome 110, Safari 16.4, Node 20)
  const keys = Object.getOwnPropertyNames(options).toSorted((keyA, keyB) =>
    keyA.localeCompare(keyB),
  );
  const parts: string[] = [];
  for (const key of keys) {
    const value: unknown = Reflect.get(options, key);
    if (value !== undefined && !isFlatOptionValue(value)) {
      return undefined;
    }
    if (value !== undefined) {
      parts.push(`${JSON.stringify(key)}:${JSON.stringify(value)}`);
    }
  }
  return parts;
}

/**
 * Serialize the options half of a recipe, or undefined when the options cannot
 * be cached faithfully.
 * Own property names are used so inherited or non-enumerable properties, which
 * Intl still reads, never serialize to a different recipe than the one it sees
 */
function serializeOptions(options?: object): string | undefined {
  if (options === undefined) {
    return "{}";
  }
  if (!isPlainObject(options)) {
    return undefined;
  }
  const entries = serializeOptionEntries(options);
  if (entries === undefined) {
    return undefined;
  }
  return `{${entries.join(",")}}`;
}

/** Serialize a full recipe into one cache key, or undefined when it cannot be cached */
export function serializeRecipe(
  locales?: Intl.LocalesArgument,
  options?: object,
): string | undefined {
  const serializedOptions = serializeOptions(options);
  if (serializedOptions === undefined) {
    return undefined;
  }
  return `${serializeLocales(locales)}|${serializedOptions}`;
}
