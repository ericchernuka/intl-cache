# intl-cache

A zero-dependency cache for expensive `Intl.*` formatter constructors, designed so a future React layer can look up shared formatters without paying construction cost per render.

## Language

**Recipe**:
A (locale, options) pair that identifies one formatter configuration. The cache keys recipes by value, so independently written recipes that describe the same formatter share one entry.
_Avoid_: config, format spec, cache key

**Recipe space**:
The set of distinct recipes an application produces. The caches retain every entry for the lifetime of the module and assume this set stays small, so nothing is ever evicted.
_Avoid_: bounded key space, unlimited growth

**Shared instance**:
The single native `Intl.*` formatter created for a recipe and returned by reference to every caller. Immutable by construction (Intl formatters cannot be reconfigured), so sharing is safe and referential stability is guaranteed.
_Avoid_: cached copy, pooled formatter

**Formatter cache**:
The module-level store mapping serialized recipes to shared instances; one per `Intl.*` constructor, created via a generic factory.
_Avoid_: memoizer, registry
