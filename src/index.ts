import { createFormatterCache } from "./factory.js";

export { createFormatterCache } from "./factory.js";
export type { FormatterCache } from "./factory.js";

export const collatorCache = createFormatterCache(Intl.Collator);
export const dateTimeFormatCache = createFormatterCache(Intl.DateTimeFormat);
export const listFormatCache = createFormatterCache(Intl.ListFormat);
export const numberFormatCache = createFormatterCache(Intl.NumberFormat);
export const pluralRulesCache = createFormatterCache(Intl.PluralRules);
export const relativeTimeFormatCache = createFormatterCache(Intl.RelativeTimeFormat);
export const segmenterCache = createFormatterCache(Intl.Segmenter);
