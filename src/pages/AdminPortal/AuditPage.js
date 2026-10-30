import React, { useState } from "react";
import { Button } from "reactstrap";

import { listAudit } from "./adminPortalApi";
import { ErrorAlert, Loading, fmtDate, useLoad } from "./shared";

const PAGE_SIZE = 50;

const AuditPage = () => {
  const [page, setPage] = useState(0);
  const { data, error, loading } = useLoad(() => listAudit(page, PAGE_SIZE), [page]);
  const totalPages = data && data.page ? data.page.totalPages : 0;

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>Audit log</h1>
          <p>Every sign-in and every change made in this portal, newest first. It cannot be edited from here.</p>
        </div>
      </div>
      <ErrorAlert message={error} />
      <div className="ap-card">
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
                    Nothing recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <Button size="sm" color="light" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Newer
            </Button>
            <span className="ap-hint" style={{ alignSelf: "center" }}>
              Page {page + 1} of {totalPages}
            </span>
            <Button size="sm" color="light" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
              Older
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditPage;
