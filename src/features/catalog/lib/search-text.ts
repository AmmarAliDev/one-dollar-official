/**
 * Lightweight, dependency-free search-text helpers used by the DB-backed
 * catalog search (query widening + relevance scoring).
 *
 * The goal is to keep storefront search forgiving without pulling in a full
 * text-search engine:
 *  - Queries are tokenized so multi-word input matches on ANY word
 *    ("scented candle" also matches a product named "Candle Lavender").
 *  - Tokens are expanded with simple plural/singular variants so "chains"
 *    matches "chain", "candles" matches "candle", and vice versa.
 *  - Category names participate in matching, so typing a category name
 *    surfaces the products living under that category.
 */

/** Minimum token length kept when tokenizing a query (filters "a", "2", ...). */
export const MIN_SEARCH_TOKEN_LENGTH = 2;

/**
 * Splits a raw query into lowercase, deduplicated search tokens keeping only
 * letters and numbers. Runs of punctuation/whitespace act as separators.
 */
export function tokenizeSearchQuery(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= MIN_SEARCH_TOKEN_LENGTH);

  return [...new Set(tokens)];
}

/**
 * Expands a single token into itself plus plausible plural/singular variants.
 *
 * A substring match on the singular already covers the plural ("candle" is
 * contained in "candles"), so this only needs to widen the *input* side:
 *  - "ies" -> "y" / bare stem   (candies -> candy)
 *  - "es"  -> bare stem / -s    (boxes -> box, candles -> candle, dishes -> dish)
 *  - "s"   -> -s                (chains -> chain, tumblers -> tumbler)
 *
 * Both plausible strips are emitted for "es" endings ("candles" can be either
 * "candle" or "candl") because a superset of variants can only add harmless
 * false positives for the OR search — it never hides a real match. Length
 * guards keep short words ("bus") from being mangled.
 */
export function expandSearchToken(token: string): string[] {
  const variants = new Set<string>([token]);

  if (token.length > 4 && token.endsWith("ies")) {
    variants.add(token.slice(0, -3)); // candies -> candi
    variants.add(`${token.slice(0, -3)}y`); // candies -> candy
  } else if (token.length > 4 && token.endsWith("es")) {
    variants.add(token.slice(0, -2)); // boxes -> box, dishes -> dish
    variants.add(token.slice(0, -1)); // candles -> candle, apples -> apple
  } else if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) {
    variants.add(token.slice(0, -1)); // chains -> chain, tumblers -> tumbler
  }

  return [...variants];
}

/**
 * Expands every token in a query into all matching variants, deduplicated and
 * flattened. Used by the DB query layer to build the widened OR condition.
 */
export function expandSearchQuery(query: string): string[] {
  return [...new Set(tokenizeSearchQuery(query).flatMap(expandSearchToken))];
}

/**
 * True when any variant of `token` appears as a case-insensitive substring of
 * `text`. Both sides are normalized to lowercase. `null`/`undefined`/empty
 * text never matches.
 */
export function tokenMatchesText(
  token: string,
  text: string | null | undefined,
): boolean {
  if (!text) {
    return false;
  }

  const needle = token.toLowerCase();
  const haystack = text.toLowerCase();

  return expandSearchToken(needle).some((variant) => haystack.includes(variant));
}
