import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Col, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import {
  generateBillingRecord,
  getBillingRates,
  listCompanyBillingRecords,
  setBillingRates,
} from "./adminPortalApi";
import { currentMonthValue, money, parseMonthValue, parseRateInput, periodLabel } from "./billing";
import { ErrorAlert, Loading, fmtDate, useLoad } from "./shared";

const toText = (value) => (value === null || value === undefined ? "" : Number(value).toFixed(2));

/** The company's rate at each tier, and its monthly cost records. Roles are assigned to a tier on the Roles tab. */
const CompanyBillingTab = ({ data, companyId }) => {
  const rates = useLoad(() => getBillingRates(companyId), [companyId]);
  const records = useLoad(() => listCompanyBillingRecords(companyId), [companyId]);

  const [standard, setStandard] = useState("");
  const [power, setPower] = useState("");
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState(null);

  const [monthValue, setMonthValue] = useState(currentMonthValue());
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (rates.data) {
      setStandard(toText(rates.data.standardRate));
      setPower(toText(rates.data.powerRate));
    }
  }, [rates.data]);

  const powerRoles = data.roles.filter((r) => r.tier === "POWER");
  const powerRateMissing = power.trim() === "" && powerRoles.length > 0;

  const save = async (event) => {
    event.preventDefault();
    const s = parseRateInput(standard);
    const p = parseRateInput(power);
    if (s.error || p.error) {
      setProblem(s.error || p.error);
      return;
    }
    setSaving(true);
    setProblem(null);
    try {
      await setBillingRates(companyId, { standardRate: s.value, powerRate: p.value });
      toast.success("Rates saved");
      rates.reload();
    } catch (e) {
      setProblem(e.message);
    } finally {
      setSaving(false);
    }
  };

  const generate = async () => {
    const period = parseMonthValue(monthValue);
    if (!period) return;
    setGenerating(true);
    try {
      await generateBillingRecord(companyId, period.year, period.month);
      toast.success(`${periodLabel(period.year, period.month)} cost record generated`);
      records.reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (rates.loading && !rates.data) return <Loading />;

  return (
    <div>
      <div className="ap-card">
        <h2>Monthly rate per user</h2>
        <p className="ap-hint">
          Charged for each registered, unlocked user, every month. A user is on the tier of their role; set a role's
          tier on the Roles tab. Leave a rate blank if it is not set.
        </p>
        <ErrorAlert message={problem || rates.error} onClose={() => setProblem(null)} />
        <form onSubmit={save}>
          <Row>
            <Col md={4}>
              <FormGroup>
                <Label>Standard user ($ per month)</Label>
                <Input inputMode="decimal" value={standard} onChange={(e) => setStandard(e.target.value)} placeholder="Not set" />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label>Power user ($ per month)</Label>
                <Input inputMode="decimal" value={power} onChange={(e) => setPower(e.target.value)} placeholder="Not set" />
                {powerRateMissing && (
                  <div className="ap-hint" style={{ color: "#b3261e" }}>
                    {powerRoles.length} role(s) are power roles, so a cost record cannot be generated until this is
                    set.
                  </div>
                )}
              </FormGroup>
            </Col>
            <Col md={4} style={{ display: "flex", alignItems: "flex-end" }}>
              <FormGroup>
                <Button color="primary" disabled={saving}>
                  {saving ? <Spinner size="sm" /> : "Save rates"}
                </Button>
              </FormGroup>
            </Col>
          </Row>
        </form>
        {rates.data && rates.data.updatedAt && (
          <div className="ap-hint">
            Last changed {fmtDate(rates.data.updatedAt)}
            {rates.data.updatedBy ? ` by ${rates.data.updatedBy}` : ""}. Records already generated keep the rate they
            were generated at.
          </div>
        )}
      </div>

      <div className="ap-card">
        <div className="ap-title" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Cost records</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Input
              type="month"
              value={monthValue}
              max={currentMonthValue()}
              min="2000-01"
              onChange={(e) => setMonthValue(e.target.value)}
              style={{ maxWidth: 180 }}
              aria-label="Month"
            />
            <Button color="primary" size="sm" disabled={generating || !parseMonthValue(monthValue)} onClick={generate}>
              {generating ? <Spinner size="sm" /> : "Generate"}
            </Button>
          </div>
        </div>
        <ErrorAlert message={records.error} />
        {records.loading && !records.data ? (
          <Loading />
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Standard</th>
                <th>Power</th>
                <th>Total</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(records.data || []).map((r) => (
                <tr key={r.id}>
                  <td>{periodLabel(r.year, r.month)}</td>
                  <td>{r.standardUsers}</td>
                  <td>{r.powerUsers}</td>
                  <td>{money(r.totalAmount)}</td>
                  <td>
                    <span className={`ap-badge ${r.status === "FINAL" ? "ap-badge-ok" : "ap-badge-warn"}`}>
                      {r.status === "FINAL" ? "Finalised" : "Draft"}
                    </span>
                  </td>
                  <td className="ap-actions">
                    <Button size="sm" color="light" tag={Link} to={`/admin-portal/billing/${r.id}`}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {records.data && records.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="ap-hint">
                    No cost records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CompanyBillingTab;
