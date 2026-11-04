import React, { useEffect, useState } from "react";
import { Button, DropdownItem, DropdownMenu, DropdownToggle, Input, Spinner, UncontrolledDropdown } from "reactstrap";
import { toast } from "react-toastify";

import { listAudit } from "./adminPortalApi";
import { csvCell, downloadText } from "./billing";
import { Pager, SearchBox, PAGE_SIZES } from "./paging";
import { ErrorAlert, Loading, fmtDate, useLoad } from "./shared";

// The most rows one export will gather. Keeps a very long history from being pulled into the browser.
const EXPORT_LIMIT = 20000;
const EXPORT_CHUNK = 200;

const pad = (n) => String(n).padStart(2, "0");

/** 2026-11-04 13:05:09, in the viewer's own time zone: what a spreadsheet sorts and reads correctly. */
const stamp = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const HEADERS = ["When", "Admin", "Action", "Target type", "Target id", "Detail", "From"];

const toRow = (r) => [stamp(r.createdAt), r.adminName, r.action, r.targetType, r.targetId, r.detail, r.ipAddress];

const fileName = (filter, extension) => {
  const range = [filter.from, filter.to].filter(Boolean).join("_to_");
  return `audit-log${range ? "-" + range : ""}-${stamp(new Date()).slice(0, 10)}.${extension}`;
};

const AuditPage = () => {
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);

  // The search applies a moment after typing stops, so each keystroke is not a request.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(text.trim());
      setPageNo(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [text]);

  const rangeBackwards = from && to && from > to;
  const filter = { q, from: rangeBackwards ? "" : from, to: rangeBackwards ? "" : to };

  const { data, error, loading } = useLoad(
    () => listAudit(pageNo, pageSize, filter),
    [pageNo, pageSize, q, filter.from, filter.to]
  );
  const totalRecords = data && data.page ? data.page.totalRecords : 0;
  const totalPages = Math.max(1, data && data.page ? data.page.totalPages : 1);

  const clearAll = () => {
    setText("");
    setQ("");
    setFrom("");
    setTo("");
    setPageNo(0);
  };

  /** Gathers every row the current filter matches, newest first, in chunks the server allows. */
  const gather = async () => {
    const rows = [];
    for (let page = 0; rows.length < EXPORT_LIMIT; page++) {
      const result = await listAudit(page, EXPORT_CHUNK, filter);
      rows.push(...result.rows);
      const pages = result.page ? result.page.totalPages : 0;
      if (page + 1 >= pages || result.rows.length === 0) {
        return { rows, truncated: false };
      }
    }
    return { rows: rows.slice(0, EXPORT_LIMIT), truncated: true };
  };

  const exportAs = async (kind) => {
    setExporting(true);
    try {
      const { rows, truncated } = await gather();
      if (rows.length === 0) {
        toast.info("There is nothing to export for this search.");
        return;
      }
      if (kind === "csv") {
        // A leading BOM so Excel reads accents correctly; csvCell defuses cells that start like a formula.
        const lines = [HEADERS, ...rows.map(toRow)].map((r) => r.map(csvCell).join(","));
        downloadText(fileName(filter, "csv"), "﻿" + lines.join("\r\n"));
      } else {
        // Loaded only when used: the spreadsheet library is large.
        const XLSX = await import("xlsx");
        const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows.map(toRow)]);
        sheet["!cols"] = [{ wch: 20 }, { wch: 18 }, { wch: 26 }, { wch: 16 }, { wch: 12 }, { wch: 60 }, { wch: 16 }];
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, "Audit log");
        XLSX.writeFile(book, fileName(filter, "xlsx"));
      }
      toast.success(
        truncated
          ? `Exported the newest ${rows.length} rows. Narrow the dates to export the rest.`
          : `Exported ${rows.length} row${rows.length === 1 ? "" : "s"}.`
      );
    } catch (e) {
      toast.error(e.message || "The export could not be completed.");
    } finally {
      setExporting(false);
    }
  };

  const filtered = !!(q || from || to);

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>Audit log</h1>
          <p>Every sign-in and every change made in this portal, newest first. It cannot be edited from here.</p>
        </div>
        <UncontrolledDropdown>
          <DropdownToggle color="primary" caret disabled={exporting || totalRecords === 0}>
            {exporting ? <Spinner size="sm" /> : "Export"}
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem onClick={() => exportAs("xlsx")}>Excel (.xlsx)</DropdownItem>
            <DropdownItem onClick={() => exportAs("csv")}>CSV (.csv)</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
      <ErrorAlert message={error} />
      <div className="ap-card">
        <div className="ap-toolbar">
          <SearchBox value={text} onChange={setText} placeholder="Search admin, action, target, detail or address" />
          <div className="ap-search">
            <label className="ap-hint" htmlFor="audit-from" style={{ margin: 0 }}>
              From
            </label>
            <Input
              id="audit-from"
              bsSize="sm"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => {
                setFrom(e.target.value);
                setPageNo(0);
              }}
            />
            <label className="ap-hint" htmlFor="audit-to" style={{ margin: 0 }}>
              To
            </label>
            <Input
              id="audit-to"
              bsSize="sm"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => {
                setTo(e.target.value);
                setPageNo(0);
              }}
            />
            {(filtered || text) && (
              <Button size="sm" color="light" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
        </div>
        {rangeBackwards && <div className="ap-hint">The From date is after the To date, so the dates are ignored.</div>}

        {loading && !data ? (
          <Loading />
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>Detail</th>
                <th>From</th>
              </tr>
            </thead>
            <tbody>
              {((data && data.rows) || []).map((row) => (
                <tr key={row.id}>
                  <td>{fmtDate(row.createdAt)}</td>
                  <td>{row.adminName || "—"}</td>
                  <td>
                    <code>{row.action}</code>
                  </td>
                  <td>{row.targetType ? `${row.targetType} ${row.targetId || ""}` : "—"}</td>
                  <td>{row.detail || ""}</td>
                  <td>{row.ipAddress || ""}</td>
                </tr>
              ))}
              {data && data.rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="ap-hint">
                    {filtered ? "Nothing matches your search." : "Nothing recorded yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {data && (
          <Pager
            pageNo={pageNo}
            pageSize={pageSize}
            totalRecords={totalRecords}
            totalPages={totalPages}
            onPage={setPageNo}
            onPageSize={(size) => {
              setPageSize(size);
              setPageNo(0);
            }}
          />
        )}
        <p className="ap-hint" style={{ marginTop: 12 }}>
          Export covers every row that matches the search and dates above (up to {EXPORT_LIMIT.toLocaleString()} of the
          newest), not just this page.
        </p>
      </div>
    </div>
  );
};

export default AuditPage;
