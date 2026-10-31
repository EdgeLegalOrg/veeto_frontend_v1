import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import {
  deleteBillingRecord,
  finaliseBillingRecord,
  generateBillingRecord,
  getBillingRecord,
} from "./adminPortalApi";
import { downloadText, money, periodLabel, recordCsv } from "./billing";
import { ConfirmModal, ErrorAlert, Loading, fmtDate, useLoad } from "./shared";

/** One company's cost record for a month: what each site is to pay, and the users behind it. */
const BillingRecordPage = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { data, error, loading, reload } = useLoad(() => getBillingRecord(recordId), [recordId]);
  const [open, setOpen] = useState({});
  const [confirm, setConfirm] = useState(null); // finalise | delete
  const [busy, setBusy] = useState(false);

  if (loading && !data) return <Loading />;
  if (!data) {
    return (
      <div>
        <ErrorAlert message={error || "That cost record could not be found."} />
        <Link to="/admin-portal/billing">Back to billing</Link>
      </div>
    );
  }

  const { record, sites } = data;
  const isDraft = record.status === "DRAFT";
  const label = periodLabel(record.year, record.month);

  const regenerate = async () => {
    setBusy(true);
    try {
      await generateBillingRecord(record.companyId, record.year, record.month);
      toast.success("Regenerated");
      reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const runConfirmed = async () => {
    setBusy(true);
    try {
      if (confirm === "finalise") {
        await finaliseBillingRecord(record.id);
        toast.success("Finalised");
        setConfirm(null);
        reload();
      } else {
        await deleteBillingRecord(record.id);
        toast.success("Deleted");
        navigate("/admin-portal/billing");
      }
    } catch (e) {
      setConfirm(null);
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const safe = record.companyName.replace(/[^A-Za-z0-9]+/g, "-");
    downloadText(`cost-${safe}-${record.year}-${String(record.month).padStart(2, "0")}.csv`, recordCsv(data));
  };

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>
            {record.companyName} · {label}
          </h1>
          <p>
            <span className={`ap-badge ${isDraft ? "ap-badge-warn" : "ap-badge-ok"}`}>
              {isDraft ? "Draft" : "Finalised"}
            </span>{" "}
            Generated {fmtDate(record.generatedAt)}
            {record.generatedBy ? ` by ${record.generatedBy}` : ""}
            {!isDraft && record.finalisedAt ? ` · finalised ${fmtDate(record.finalisedAt)} by ${record.finalisedBy || "—"}` : ""}
          </p>
        </div>
        <Link to="/admin-portal/billing">All companies</Link>
      </div>

      <ErrorAlert message={error} />

      <div className="ap-stat">
        <div>
          <b>{money(record.totalAmount)}</b>
          <span>Total for the month</span>
        </div>
        <div>
          <b>{record.standardUsers}</b>
          <span>Standard users at {money(record.standardRate)}</span>
        </div>
        <div>
          <b>{record.powerUsers}</b>
          <span>Power users at {money(record.powerRate)}</span>
        </div>
        <div>
          <b>{sites.length}</b>
          <span>Site(s) billed</span>
        </div>
      </div>

      <div className="ap-card">
        <div className="ap-title" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>What each site pays</h2>
          <div className="ap-actions">
            <Button size="sm" color="light" onClick={download}>
              Download CSV
            </Button>{" "}
            {isDraft && (
              <>
                <Button size="sm" color="light" disabled={busy} onClick={regenerate}>
                  {busy ? <Spinner size="sm" /> : "Regenerate"}
                </Button>{" "}
                <Button size="sm" color="outline-danger" disabled={busy} onClick={() => setConfirm("delete")}>
                  Delete
                </Button>{" "}
                <Button size="sm" color="primary" disabled={busy} onClick={() => setConfirm("finalise")}>
                  Finalise
                </Button>
              </>
            )}
          </div>
        </div>

        <table className="ap-table">
          <thead>
            <tr>
              <th>Site</th>
              <th>Standard users</th>
              <th>Power users</th>
              <th>Standard</th>
              <th>Power</th>
              <th>Site pays</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <React.Fragment key={site.siteId}>
                <tr>
                  <td>
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setOpen({ ...open, [site.siteId]: !open[site.siteId] })}
                      aria-expanded={!!open[site.siteId]}
                    >
                      {open[site.siteId] ? "▾" : "▸"} {site.siteName}
                    </button>
                  </td>
                  <td>{site.standardUsers}</td>
                  <td>{site.powerUsers}</td>
                  <td>{money(site.standardAmount)}</td>
                  <td>{money(site.powerAmount)}</td>
                  <td style={{ fontWeight: 600 }}>{money(site.total)}</td>
                </tr>
                {open[site.siteId] &&
                  site.users.map((u) => (
                    <tr key={u.userId} className="ap-hint">
                      <td style={{ paddingLeft: 36 }}>
                        {u.fullName || u.userName}
                        <div className="ap-hint">{u.userName}</div>
                      </td>
                      <td colSpan={3}>
                        {u.roleName || "No role"} · {u.tier === "POWER" ? "Power" : "Standard"}
                      </td>
                      <td />
                      <td>{money(u.rate)}</td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
            {sites.length === 0 && (
              <tr>
                <td colSpan={6} className="ap-hint">
                  No registered, active users were found for this company when the record was generated.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ fontWeight: 600 }}>Total</td>
              <td>{record.standardUsers}</td>
              <td>{record.powerUsers}</td>
              <td />
              <td />
              <td style={{ fontWeight: 600 }}>{money(record.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="ap-hint" style={{ marginTop: 12 }}>
          Each user is billed once, under the site of their staff record, even if they can work at other sites. The
          record is a snapshot: changing a user, role or rate afterwards does not change it.
        </p>
      </div>

      <ConfirmModal
        isOpen={!!confirm}
        busy={busy}
        danger={confirm === "delete"}
        title={confirm === "delete" ? "Delete draft" : "Finalise record"}
        confirmLabel={confirm === "delete" ? "Delete" : "Finalise"}
        onConfirm={runConfirmed}
        onCancel={() => setConfirm(null)}
      >
        {confirm === "delete" ? (
          <p>
            Delete the draft {label} record for {record.companyName}? You can generate it again.
          </p>
        ) : (
          <p>
            Finalise the {label} record for {record.companyName} ({money(record.totalAmount)})? It will be kept exactly
            as it is: it can no longer be regenerated or deleted.
          </p>
        )}
      </ConfirmModal>
    </div>
  );
};

export default BillingRecordPage;
