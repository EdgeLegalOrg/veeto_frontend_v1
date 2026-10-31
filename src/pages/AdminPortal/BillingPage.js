import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import { generateAllBilling, generateBillingRecord, getBillingPeriod } from "./adminPortalApi";
import { currentMonthValue, money, parseMonthValue, periodLabel } from "./billing";
import { ConfirmModal, ErrorAlert, Loading, useLoad } from "./shared";

const STATUS_CLASS = { DRAFT: "ap-badge-warn", FINAL: "ap-badge-ok" };

/**
 * Every company's cost for one month. Generating takes a snapshot of who is registered
 * and active now, so it is meant to be run for the month just ended or the current one.
 */
const BillingPage = () => {
  const [monthValue, setMonthValue] = useState(currentMonthValue());
  const period = parseMonthValue(monthValue);
  const { data, error, loading, reload } = useLoad(
    () => (period ? getBillingPeriod(period.year, period.month) : Promise.resolve([])),
    [monthValue]
  );

  const [busyCompany, setBusyCompany] = useState(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [busyAll, setBusyAll] = useState(false);
  const [outcome, setOutcome] = useState(null);

  const rows = data || [];
  const withRecords = rows.filter((r) => r.record);
  const grandTotal = withRecords.reduce((sum, r) => sum + Number(r.record.totalAmount), 0);

  const generateOne = async (row) => {
    setBusyCompany(row.companyId);
    try {
      await generateBillingRecord(row.companyId, period.year, period.month);
      toast.success(`${row.companyName}: cost record generated`);
      reload();
    } catch (e) {
      toast.error(`${row.companyName}: ${e.message}`);
    } finally {
      setBusyCompany(null);
    }
  };

  const generateAll = async () => {
    setBusyAll(true);
    try {
      const result = await generateAllBilling(period.year, period.month);
      setOutcome(result);
      setConfirmAll(false);
      reload();
    } catch (e) {
      setConfirmAll(false);
      toast.error(e.message);
    } finally {
      setBusyAll(false);
    }
  };

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>Billing</h1>
          <p>
            What each company pays for its registered, active users, at the standard or power user rate set for that
            company. Set rates and assign each role to a tier on the company's page.
          </p>
        </div>
        <Button color="primary" disabled={!period || loading || rows.length === 0} onClick={() => setConfirmAll(true)}>
          Generate for all companies
        </Button>
      </div>

      <ErrorAlert message={error} />

      <div className="ap-card">
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <label htmlFor="billing-month" style={{ margin: 0, fontWeight: 600 }}>
            Month
          </label>
          <Input
            id="billing-month"
            type="month"
            value={monthValue}
            max={currentMonthValue()}
            min="2000-01"
            onChange={(e) => setMonthValue(e.target.value)}
            style={{ maxWidth: 200 }}
          />
          {!period && <span className="ap-hint">Choose a month.</span>}
        </div>

        {loading && !data ? (
          <Loading />
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Rate: standard / power</th>
                <th>Standard users</th>
                <th>Power users</th>
                <th>Total</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const record = row.record;
                return (
                  <tr key={row.companyId}>
                    <td>
                      <Link to={`/admin-portal/companies/${row.companyId}`}>{row.companyName}</Link>
                    </td>
                    <td>
                      {money(row.standardRate)} / {money(row.powerRate)}
                      {(row.standardRate === null || row.powerRate === null) && (
                        <div className="ap-hint">A rate is not set</div>
                      )}
                    </td>
                    <td>{record ? record.standardUsers : "—"}</td>
                    <td>{record ? record.powerUsers : "—"}</td>
                    <td>{record ? money(record.totalAmount) : "—"}</td>
                    <td>
                      {record ? (
                        <span className={`ap-badge ${STATUS_CLASS[record.status] || ""}`}>
                          {record.status === "FINAL" ? "Finalised" : "Draft"}
                        </span>
                      ) : (
                        <span className="ap-hint">Not generated</span>
                      )}
                    </td>
                    <td className="ap-actions">
                      {record && (
                        <Button size="sm" color="light" tag={Link} to={`/admin-portal/billing/${record.id}`}>
                          View
                        </Button>
                      )}
                      {(!record || record.status === "DRAFT") && (
                        <Button
                          size="sm"
                          color={record ? "light" : "primary"}
                          disabled={!period || busyCompany === row.companyId}
                          onClick={() => generateOne(row)}
                        >
                          {busyCompany === row.companyId ? <Spinner size="sm" /> : record ? "Regenerate" : "Generate"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="ap-hint">
                    No companies.
                  </td>
                </tr>
              )}
            </tbody>
            {withRecords.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ fontWeight: 600 }}>
                    Total for {period ? periodLabel(period.year, period.month) : ""} ({withRecords.length} compan
                    {withRecords.length === 1 ? "y" : "ies"})
                  </td>
                  <td style={{ fontWeight: 600 }}>{money(grandTotal)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        )}
        <p className="ap-hint" style={{ marginTop: 12 }}>
          A record is a snapshot of the registered, unlocked users when it is generated, each billed once, under the
          site of their staff record. A draft can be regenerated or deleted; finalise it to keep it as it is.
        </p>
      </div>

      <ConfirmModal
        isOpen={confirmAll}
        busy={busyAll}
        title="Generate for all companies"
        confirmLabel="Generate"
        onConfirm={generateAll}
        onCancel={() => setConfirmAll(false)}
      >
        <p>
          Generate the {period ? periodLabel(period.year, period.month) : ""} cost record for every company? Draft
          records for the month are replaced with a fresh snapshot. Finalised records are left alone. A company with
          users on a tier whose rate is not set is skipped and listed afterwards.
        </p>
      </ConfirmModal>

      <Modal isOpen={!!outcome} centered toggle={() => setOutcome(null)}>
        <ModalHeader toggle={() => setOutcome(null)}>Generated</ModalHeader>
        <ModalBody>
          {outcome && (
            <>
              <p>
                {outcome.generated} generated, {outcome.skipped} already finalised, {outcome.failed} could not be
                generated.
              </p>
              {outcome.outcomes
                .filter((o) => o.result !== "GENERATED")
                .map((o) => (
                  <div key={o.companyId} className="ap-block">
                    <strong>{o.companyName}</strong>
                    <div className="ap-hint">
                      {o.result === "SKIPPED" ? "Finalised, left as it was. " : ""}
                      {o.message}
                    </div>
                  </div>
                ))}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setOutcome(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default BillingPage;
