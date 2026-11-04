import React, { useEffect, useState } from "react";

import { listFeedback } from "./adminPortalApi";
import CompanySiteFilter from "./CompanySiteFilter";
import { PAGE_SIZES, Pager, SearchBox } from "./paging";
import { ErrorAlert, Loading, fmtDate, useLoad } from "./shared";

/** The feedback people have given, from every company, each marked with the company it came from. */
const FeedbackPage = () => {
  const [scope, setScope] = useState({ companyId: null, siteId: null });
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [open, setOpen] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(text.trim());
      setPageNo(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [text]);

  const { data, error, loading } = useLoad(
    () => listFeedback(pageNo, pageSize, { ...scope, q }),
    [pageNo, pageSize, scope.companyId, scope.siteId, q]
  );
  const totalRecords = data && data.page ? data.page.totalRecords : 0;
  const totalPages = Math.max(1, data && data.page ? data.page.totalPages : 1);

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>Feedback review</h1>
          <p>
            What users have said about the application, from every company. Each response shows the company and site
            it came from, and opens to show every answer.
          </p>
        </div>
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
          <SearchBox value={text} onChange={setText} placeholder="Search person, office or role" />
        </div>

        {loading && !data ? (
          <Loading />
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Person</th>
                <th>Signed in at</th>
                <th>Answered for</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {((data && data.rows) || []).map((f) => (
                <React.Fragment key={f.id}>
                  <tr>
                    <td>
                      <strong>{f.companyName || (f.companyId ? `Company ${f.companyId}` : "—")}</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        aria-expanded={!!open[f.id]}
                        onClick={() => setOpen({ ...open, [f.id]: !open[f.id] })}
                      >
                        {open[f.id] ? "▾" : "▸"} {f.fullName || f.username}
                      </button>
                      {f.fullName && <div className="ap-hint">{f.username}</div>}
                    </td>
                    <td>{f.siteName || "—"}</td>
                    <td>
                      {f.officeName || "—"}
                      {f.roleDescription && <div className="ap-hint">{f.roleDescription}</div>}
                    </td>
                    <td>{fmtDate(f.submittedAt)}</td>
                  </tr>
                  {open[f.id] && (
                    <tr>
                      <td colSpan={5} style={{ background: "#fbfcfe" }}>
                        {f.answers.length === 0 && <span className="ap-hint">No answers were recorded.</span>}
                        {f.answers.map((a) => (
                          <div key={a.questionKey} className="ap-block" style={{ marginBottom: 8 }}>
                            <div style={{ fontWeight: 600 }}>{a.questionText}</div>
                            {a.notApplicable ? (
                              <div className="ap-hint">Not applicable</div>
                            ) : (
                              <>
                                {a.rating !== null && a.rating !== undefined && <div>Rating: {a.rating}</div>}
                                {a.answerText && <div>{a.answerText}</div>}
                              </>
                            )}
                            {a.comments && <div className="ap-hint">Comment: {a.comments}</div>}
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {data && data.rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="ap-hint">
                    No feedback matches these filters.
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
      </div>
    </div>
  );
};

export default FeedbackPage;
