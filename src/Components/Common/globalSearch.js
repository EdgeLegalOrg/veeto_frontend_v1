// Shared vocabulary for global search, used by the header dropdown and the
// full results page so the two cannot disagree about links or icons.

export const SEARCH_HISTORY_KEY = "globalSearchHistory";

export const SEARCH_HISTORY_LIMIT = 3;

export const SECTION_ICON = {
  MATTERS: "ri-folder-2-line",
  CONTACTS: "ri-user-3-line",
  PROPERTY: "ri-home-4-line",
  SAFE_CUSTODY: "ri-safe-2-line",
  DEPOSIT_SLIPS: "ri-bank-line",
  INVOICES: "ri-bill-line",
  PAYMENTS: "ri-money-dollar-circle-line",
  SERVICE_LINES: "ri-list-check",
};

/**
 * Where a result goes when clicked.
 *
 * Matters and Safe Custody open the record itself - Matters through the query
 * params MatterList already reads, Safe Custody through its own detail route.
 * Contacts and Property carry the record id, which those pages do not read yet,
 * so today they land on the list.
 *
 * The Accounting sections have no way to open a single record, so they carry
 * the search term to their list instead of pretending to.
 */
export const resultHref = (result, term) => {
  const encoded = encodeURIComponent(term || "");

  switch (result.section) {
    case "MATTERS":
      return `/Matters?matterId=${result.id}&tab=BASIC`;

    case "SAFE_CUSTODY":
      return `/safe-custody/${result.id}`;

    case "CONTACTS":
      return `/Contacts?contactId=${result.id}`;

    case "PROPERTY":
      return `/property?propertyId=${result.id}`;

    // Invoices and Payments belong to a matter, so the matter is the most
    // useful thing to open until their own lists can target a record.
    case "INVOICES":
      return result.matterId
        ? `/Matters?matterId=${result.matterId}&tab=INVOICES`
        : `/account-invoice-list?q=${encoded}`;

    case "PAYMENTS":
      return result.matterId
        ? `/Matters?matterId=${result.matterId}&tab=INVOICES`
        : `/account-payment-list?q=${encoded}`;

    case "DEPOSIT_SLIPS":
      return `/account-deposit-slip?q=${encoded}`;

    case "SERVICE_LINES":
      return `/account-service-lines?q=${encoded}`;

    default:
      return `/search?q=${encoded}`;
  }
};

/**
 * Reads the recent search history. Wrapped because localStorage throws in
 * private windows and with site data blocked, and a broken bell of a search box
 * is worse than one with no history.
 */
export const readSearchHistory = () => {
  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.slice(0, SEARCH_HISTORY_LIMIT) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Most recent first, de-duplicated case-insensitively, capped at three.
 */
export const pushSearchHistory = (term) => {
  const trimmed = (term || "").trim();

  if (!trimmed) {
    return readSearchHistory();
  }

  const existing = readSearchHistory().filter(
    (entry) => entry.toLowerCase() !== trimmed.toLowerCase()
  );

  const next = [trimmed, ...existing].slice(0, SEARCH_HISTORY_LIMIT);

  try {
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  } catch (error) {
    // Not worth surfacing: the search itself still works.
  }

  return next;
};
