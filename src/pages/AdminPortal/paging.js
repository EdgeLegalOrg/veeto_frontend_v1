import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "reactstrap";

// Page sizes offered. The first is the default: 20 rows.
export const PAGE_SIZES = [20, 50, 100];

/**
 * Search and paging for a list the portal already holds in full. Searching goes back to the
 * first page, and a page that no longer exists (rows removed, a narrower search) is pulled back
 * to the last one rather than shown empty.
 *
 * filterFn(row, needle) gets the search text already lower-cased and trimmed, and is only
 * called when there is some.
 */
export const usePaging = (rows, { filterFn, initialPageSize = PAGE_SIZES[0] } = {}) => {
  const [search, setSearchText] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const needle = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    const all = rows || [];
    return needle && filterFn ? all.filter((row) => filterFn(row, needle)) : all;
  }, [rows, needle, filterFn]);

  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(pageNo, totalPages - 1);

  useEffect(() => {
    if (safePage !== pageNo) setPageNo(safePage);
  }, [safePage, pageNo]);

  const pageRows = useMemo(
    () => filtered.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [filtered, safePage, pageSize]
  );

  return {
    pageRows,
    filtered,
    totalRecords,
    searchProps: {
      value: search,
      onChange: (text) => {
        setSearchText(text);
        setPageNo(0);
      },
    },
    pagerProps: {
      pageNo: safePage,
      pageSize,
      totalRecords,
      totalPages,
      onPage: setPageNo,
      onPageSize: (size) => {
        setPageSizeState(size);
        setPageNo(0);
      },
    },
  };
};

/** One search box for a list. Enter is not needed: the list narrows as you type. */
export const SearchBox = ({ value, onChange, placeholder = "Search", style }) => (
  <div className="ap-search" style={style}>
    <Input
      bsSize="sm"
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <Button size="sm" color="light" type="button" onClick={() => onChange("")} title="Clear the search">
        Clear
      </Button>
    )}
  </div>
);

/** The page numbers to show: the first, the last, and the pages around the current one. */
const pageList = (current, total) => {
  const wanted = new Set([0, total - 1, current - 1, current, current + 1]);
  if (current < 3) [1, 2, 3].forEach((n) => wanted.add(n));
  if (current > total - 4) [total - 2, total - 3, total - 4].forEach((n) => wanted.add(n));
  const pages = [...wanted].filter((n) => n >= 0 && n < total).sort((a, b) => a - b);
  const out = [];
  pages.forEach((n, i) => {
    if (i > 0 && n - pages[i - 1] > 1) out.push("gap" + n);
    out.push(n);
  });
  return out;
};

/**
 * Laid out like the main application's pager: "Showing x to y of z" on the left, Previous,
 * page numbers and Next in the middle, and the rows-per-page choice on the right.
 */
export const Pager = ({ pageNo, pageSize, totalRecords, totalPages, onPage, onPageSize, hideWhenSingle = false }) => {
  if (hideWhenSingle && totalRecords <= Math.min(...PAGE_SIZES)) return null;
  const first = totalRecords === 0 ? 0 : pageNo * pageSize + 1;
  const last = Math.min((pageNo + 1) * pageSize, totalRecords);

  return (
    <div className="ap-pager">
      <div className="text-muted">
        Showing <span className="fw-semibold">{first}</span> to <span className="fw-semibold">{last}</span> of{" "}
        <span className="fw-semibold">{totalRecords}</span>
      </div>
      <div className="ap-pager-pages">
        <Button type="button" color="light" className="mx-1" disabled={pageNo === 0} onClick={() => onPage(pageNo - 1)}>
          Previous
        </Button>
        {pageList(pageNo, totalPages).map((n) =>
          typeof n === "string" ? (
            <span key={n} className="mx-1 text-muted">
              …
            </span>
          ) : (
            <Button
              key={n}
              type="button"
              color={n === pageNo ? "primary" : "light"}
              className="mx-1"
              aria-current={n === pageNo ? "page" : undefined}
              onClick={() => onPage(n)}
            >
              {n + 1}
            </Button>
          )
        )}
        <Button
          type="button"
          color="light"
          className="mx-1"
          disabled={pageNo >= totalPages - 1}
          onClick={() => onPage(pageNo + 1)}
        >
          Next
        </Button>
      </div>
      <Input
        type="select"
        bsSize="sm"
        value={pageSize}
        style={{ width: 110 }}
        aria-label="Rows per page"
        onChange={(e) => onPageSize(Number(e.target.value))}
      >
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}/page
          </option>
        ))}
      </Input>
    </div>
  );
};

/** Joins whatever text fields a row has into one lower-case string to search. */
export const haystack = (...parts) =>
  parts
    .flat()
    .filter((p) => p !== null && p !== undefined)
    .join(" ")
    .toLowerCase();
