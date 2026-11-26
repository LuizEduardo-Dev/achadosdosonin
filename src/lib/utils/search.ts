/**
 * Normalizes strings for case- and diacritic-insensitive storefront search.
 */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Syncs `?q=` and `?loja=` query parameters cleanly without triggering a full page reload.
 */
export function syncStorefrontSearchParams(
  nextQuery: string,
  nextStore: string | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  const trimmedQuery = nextQuery.trim();

  if (trimmedQuery) {
    url.searchParams.set("q", trimmedQuery);
  } else {
    url.searchParams.delete("q");
  }

  if (nextStore) {
    url.searchParams.set("loja", nextStore);
  } else {
    url.searchParams.delete("loja");
  }

  window.history.replaceState(null, "", url.pathname + url.search);
}
