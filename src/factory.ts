import { serializeRecipe } from "./serialize.js";

export interface FormatterCache<Options extends object, Instance> {
  /** Shared instance for one recipe, constructed once and returned by reference */
  get: (locales?: Intl.LocalesArgument, options?: Options) => Instance;
}

/**
 * Create a formatter cache for one Intl constructor.
 *
 * A plain Map keyed by serialized recipe beats a WeakMap: WeakMap keys must be
 * objects, which locale strings are not, and identity-keyed caches miss on
 * every fresh options literal
 * Entries are retained for the lifetime of the cache and the recipe space is
 * assumed small, matching how comparable Intl caches behave, so nothing evicts
 * Recipes are serialized on every lookup; that cost is paid deliberately
 * because it stays far cheaper than constructing a formatter, and options
 * that cannot be serialized faithfully bypass the cache entirely
 */
export function createFormatterCache<Options extends object, Instance>(
  Constructor: new (locales?: Intl.LocalesArgument, options?: Options) => Instance,
): FormatterCache<Options, Instance> {
  const cache = new Map<string, Instance>();

  return {
    get(locales?: Intl.LocalesArgument, options?: Options): Instance {
      const key = serializeRecipe(locales, options);
      if (key === undefined) {
        // Serialize-unsafe options skip the cache so the native constructor stays authoritative
        return new Constructor(locales, options);
      }
      let instance = cache.get(key);
      if (instance === undefined) {
        instance = new Constructor(locales, options);
        cache.set(key, instance);
      }
      return instance;
    },
  };
}
