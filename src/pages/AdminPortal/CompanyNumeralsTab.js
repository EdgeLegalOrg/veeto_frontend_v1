import React, { useEffect, useState } from "react";
import { Button, Input, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import { getNumerals, saveNumerals } from "./adminPortalApi";
import SitePicker from "./SitePicker";
import { ErrorAlert, Loading, useLoad } from "./shared";

const asInt = (text) => (/^\d{1,9}$/.test(String(text).trim()) ? Number(text) : NaN);

/** The number series (matters, invoices and so on) of one site of the company. */
const CompanyNumeralsTab = ({ data, companyId }) => {
  const [siteId, setSiteId] = useState(null);
  const loaded = useLoad(() => (siteId ? getNumerals(companyId, siteId) : Promise.resolve(null)), [companyId, siteId]);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    if (loaded.data) {
      setRows(loaded.data.series.map((s) => ({ ...s, base: String(s.base), ceiling: String(s.ceiling) })));
      setProblem(null);
    }
  }, [loaded.data]);

  const set = (key, field, value) => setRows(rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const rowProblem = (r) => {
    const base = asInt(r.base);
    const ceiling = asInt(r.ceiling);
    if (Number.isNaN(base) || Number.isNaN(ceiling)) return "Use whole numbers from 0 up.";
    if (r.use && (base < 1 || ceiling < base)) return "Start at 1 or more, and end at or after the start.";
    return null;
  };

  const save = async () => {
    const bad = rows.find((r) => rowProblem(r));
    if (bad) {
      setProblem(`${bad.label}: ${rowProblem(bad)}`);
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await saveNumerals(companyId, siteId, {
        series: rows.map((r) => ({ key: r.key, use: r.use, base: asInt(r.base), ceiling: asInt(r.ceiling) })),
      });
      toast.success("System numerals saved");
      loaded.reload();
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ap-card">
      <h2>System numerals</h2>
      <p className="ap-hint">
        The range each kind of number is drawn from, for one site. Switched off, numbers carry on from the highest
        already used.
      </p>
      <SitePicker sites={data.sites} siteId={siteId} onChange={setSiteId} />
      <ErrorAlert message={problem || loaded.error} onClose={() => setProblem(null)} />
      {loaded.loading && !loaded.data ? (
        <Loading />
      ) : (
        <>
          <table className="ap-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Use a range</th>
                <th>From</th>
                <th>Up to</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const invalid = rowProblem(r);
                return (
                  <tr key={r.key}>
                    <td>{r.label}</td>
                    <td>
                      <Input
                        type="checkbox"
                        checked={r.use}
                        aria-label={`Use a range for ${r.label}`}
                        onChange={(e) => set(r.key, "use", e.target.checked)}
                      />
                    </td>
                    <td>
                      <Input
                        bsSize="sm"
                        inputMode="numeric"
                        style={{ width: 130 }}
                        value={r.base}
                        invalid={!!invalid}
                        onChange={(e) => set(r.key, "base", e.target.value)}
                        aria-label={`${r.label} from`}
                      />
                    </td>
                    <td>
                      <Input
                        bsSize="sm"
                        inputMode="numeric"
                        style={{ width: 130 }}
                        value={r.ceiling}
                        invalid={!!invalid}
                        onChange={(e) => set(r.key, "ceiling", e.target.value)}
                        aria-label={`${r.label} up to`}
                      />
                      {invalid && <div className="ap-hint" style={{ color: "#b3261e" }}>{invalid}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Button color="primary" onClick={save} disabled={busy || !siteId || rows.length === 0}>
            {busy ? <Spinner size="sm" /> : "Save numerals"}
          </Button>
          <p className="ap-hint" style={{ marginTop: 12 }}>
            The numbers already used are not checked here. If a range ends below the highest number in use, the
            application will report that series as used up when someone next needs a number.
          </p>
        </>
      )}
    </div>
  );
};

export default CompanyNumeralsTab;
