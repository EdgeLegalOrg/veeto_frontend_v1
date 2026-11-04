import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";

import { listSessions } from "./adminPortalApi";
import CompanySiteFilter from "./CompanySiteFilter";
import { PAGE_SIZES, Pager, SearchBox } from "./paging";
import { ErrorAlert, Loading, fmtDate, useLoad } from "./shared";

const STATUSES = [
  { key: "active", label: "Signed in now" },
  { key: "ended", label: "Signed out" },
  { key: "all", label: "All" },
];

const REASONS = { LOGOUT: "Signed out", TIMEOUT: "Timed out", EXPIRED: "Expired", FORCED: "Forced out" };

const duration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  return `${h} h ${minutes % 60} min`;
};

/** Who is signed in, across every company, filterable by company and site. */
const SessionsPage = () => {
  const [scope, setScope] = useState({ companyId: null, siteId: null });
  const [status, setStatus] = useState("active");
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(text.trim());
      setPageNo(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [text]);

  const { data, error, loading, reload } = useLoad(
    () => listSessions(pageNo, pageSize, { ...scope, status, q }),
    [pageNo, pageSize, scope.companyId, scope.siteId, status, q]
  );
  const totalRecords = data && data.page ? data.page.totalRecords : 0;
  const totalPages = Math.max(1, data && data.page ? data.page.totalPages : 1);

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>Logged in users</h1>
          <p>
            Who is signed in to the application, and the history of sign-ins, across every company. Filter by company,
            then by site.
          </p>
        </div>
        <Button color="light" onClick={reload} disabled={loading}>
          Refresh
        </Button>
      </div>
      <ErrorAlert message={error} />
      <div className="ap-card">
        <div className="ap-toolbar">
          <CompanySiteFilter
            companyId={scope.companyId}
            siteId={scope.siteId}
            onChange={(next) => {
              setScope(next);
              setPageNo(0);
            }}
          />
          <SearchBox value={text} onChange={setText} placeholder="Search user, site or address" />
        </div>
        <div className="ap-tabs" style={{ marginBottom: 12 }}>
          {STATUSES.map((s) => (
            <button
              key={s.key}
              type="button"
              className={status === s.key ? "active" : ""}
              onClick={() => {
                setStatus(s.key);
                setPageNo(0);
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading && !data ? (
          <Loading />
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>User</th>
                <th>Site</th>
                <th>Signed in</th>
                <th>Length</th>
                <th>Status</th>
                <th>From</th>
              </tr>
            </thead>
            <tbody>
              {((data && data.rows) || []).map((s) => (
                <tr key={s.id}>
                  <td>{s.companyName || (s.companyId ? `Company ${s.companyId}` : "—")}</td>
                  <td>
                    {s.staffName || s.username}
                    {s.staffName && <div className="ap-hint">{s.username}</div>}
                  </td>
                  <td>{s.siteName || "—"}</td>
                  <td>{fmtDate(s.loginAt)}</td>
                  <td>{duration(s.durationMinutes)}</td>
                  <td>
                    {s.active ? (
                      <span className="ap-badge ap-badge-ok">Signed in</span>
                    ) : (
                      <>
                        <span className="ap-badge ap-badge-warn">{REASONS[s.endReason] || "Ended"}</span>
                        <div className="ap-hint">{fmtDate(s.endedAt)}</div>
                      </>
                    )}
                  </td>
                  <td>{s.ipAddress || ""}</td>
                </tr>
              ))}
              {data && data.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="ap-hint">
                    {status === "active" ? "Nobody is signed in with these filters." : "No sessions match these filters."}
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
          A session is closed when someone signs out, times out, or is forced out. One that never reported (a closed
          browser) is closed automatically once its login could no longer be valid.
        </p>
      </div>
    </div>
  );
};

export default SessionsPage;
