import React from "react";
import SettlementDecimalInput from "./SettlementDecimalInput";
import SettlementCurrencyInput from "./SettlementCurrencyInput";
import { CATEGORIES, adjustmentExplanation, formatSettlementMoney } from "./settlementCalculations";

/** Shared adjustment inputs keep popup creation and inline editing consistent. */
const SettlementAdjustmentFields = ({
  row,
  idPrefix,
  onChange,
  balancePurchasePrice,
  result,
  editable = true,
  showErrors = true,
  calculationDate,
  matterSettlementDate,
  matterAdjustmentDate,
  gstRate,
}) => (
  <div className="row g-3">
    <div className="col-md-3">
      <label className="form-label" htmlFor={`category-${idPrefix}`}>
        Category
      </label>
      <select
        id={`category-${idPrefix}`}
        className="form-select"
        value={row.category}
        onChange={(e) => onChange("category", e.target.value)}
      >
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
    <div className="col-md-3">
      <label className="form-label" htmlFor={`mode-${idPrefix}`}>
        Calculation
      </label>
      <select
        id={`mode-${idPrefix}`}
        className="form-select"
        disabled={["WATER_USAGE", "UNIT_ENTITLEMENT"].includes(row.category)}
        value={row.mode}
        onChange={(e) => onChange("mode", e.target.value)}
      >
        <option value="PRORATA">Prorated period</option>
        <option value="FIXED">{row.category === "WATER_USAGE" ? "Meter-based usage" : "Fixed amount"}</option>
        <option value="INTEREST">Simple annual interest</option>
      </select>
    </div>
    <div className="col-md-3">
      <label className="form-label" htmlFor={`payment-status-${idPrefix}`}>
        Paid/Unpaid
      </label>
      <select
        id={`payment-status-${idPrefix}`}
        className="form-select"
        value={row.paymentStatus}
        onChange={(e) => onChange("paymentStatus", e.target.value)}
      >
        <option value="PAID">Paid</option>
        <option value="UNPAID">Unpaid</option>
      </select>
    </div>
    <div className="col-md-3">
      <label className="form-label" htmlFor={`amount-${idPrefix}`}>
        {row.category === "WATER_USAGE"
          ? "$/kL"
          : row.mode === "INTEREST"
            ? "Interest principal ($)"
            : row.mode === "PRORATA"
              ? "Total period cost ($)"
              : "Fixed amount ($)"}
      </label>
      <SettlementCurrencyInput
        id={`amount-${idPrefix}`}
        className="form-control"
        value={row.amount ?? ""}
        onChange={(value) => onChange("amount", value)}
      />
      {row.mode === "INTEREST" && editable && (
        <button type="button" className="btn btn-link btn-sm p-0 text-primary mt-1" onClick={() => onChange("amount", balancePurchasePrice)}>
          Use balance purchase price
        </button>
      )}
    </div>
    <div className={row.category === "WATER_USAGE" ? "col-md-3" : "col-md-6"}>
      <label className="form-label" htmlFor={`description-${idPrefix}`}>
        Description{["OTHER", "UNIT_ENTITLEMENT"].includes(row.category) ? " (required)" : ""}
      </label>
      <input
        id={`description-${idPrefix}`}
        className="form-control"
        type="text"
        maxLength={300}
        value={row.description || ""}
        onChange={(e) => onChange("description", e.target.value)}
      />
    </div>
    {row.category === "UNIT_ENTITLEMENT" &&
      [
        ["unitEntitlement", "Unit entitlement"],
        ["totalEntitlements", "Total entitlements"],
      ].map(([field, label]) => (
        <div className="col-md-3" key={field}>
          <label className="form-label" htmlFor={`${field}-${idPrefix}`}>
            {label}
          </label>
          <SettlementDecimalInput
            id={`${field}-${idPrefix}`}
            className="form-control"
            value={row[field] ?? ""}
            onChange={(value) => onChange(field, value)}
          />
        </div>
      ))}
    {row.category === "WATER_USAGE" && (
      <>
        <div className="col-md-3">
          <label className="form-label" htmlFor={`usage-${idPrefix}`}>
            Average daily use (kL)
          </label>
          <SettlementDecimalInput
            id={`usage-${idPrefix}`}
            className="form-control"
            value={row.averageDailyUsage ?? ""}
            onChange={(value) => onChange("averageDailyUsage", value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor={`meter-${idPrefix}`}>
            Last meter reading date
          </label>
          <input
            id={`meter-${idPrefix}`}
            className="form-control"
            type="date"
            min="1900-01-01"
            max={[matterSettlementDate, matterAdjustmentDate, calculationDate, "2200-12-31"].filter(Boolean).sort()[0]}
            value={row.lastMeterReadingDate || ""}
            onChange={(e) => onChange("lastMeterReadingDate", e.target.value)}
          />
          {row.lastMeterReadingDate && <div className="small text-muted">{row.lastMeterReadingDate.split("-").reverse().join("/")}</div>}
        </div>
        <div className="col-md-3">
          <label className="form-label">Elapsed usage days</label>
          <output className="form-control bg-light">{result?.error ? "—" : (result?.usageDays ?? "—")}</output>
        </div>
      </>
    )}
    {row.mode !== "FIXED" && (
      <>
        <div className="col-md-3">
          <label className="form-label" htmlFor={`start-${idPrefix}`}>
            {row.mode === "INTEREST" ? "Interest from (inclusive)" : "Period start (inclusive)"}
          </label>
          <input
            id={`start-${idPrefix}`}
            className="form-control"
            type="date"
            min="1900-01-01"
            max={row.mode === "INTEREST" ? calculationDate || "2200-12-31" : row.endDate || "2200-12-31"}
            value={row.startDate || ""}
            onChange={(e) => onChange("startDate", e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor={`end-${idPrefix}`}>
            {row.mode === "INTEREST" ? "Selected date (inclusive)" : "Period end (inclusive)"}
          </label>
          <input
            id={`end-${idPrefix}`}
            className="form-control"
            type="date"
            min={row.startDate || "1900-01-01"}
            max="2200-12-31"
            readOnly={row.mode === "INTEREST"}
            value={(row.mode === "INTEREST" ? calculationDate : row.endDate) || ""}
            onChange={(e) => onChange("endDate", e.target.value)}
          />
        </div>
      </>
    )}
    {row.mode === "INTEREST" && (
      <>
        <div className="col-md-3">
          <label className="form-label" htmlFor={`rate-${idPrefix}`}>
            Annual interest rate (%)
          </label>
          <SettlementDecimalInput
            id={`rate-${idPrefix}`}
            className="form-control"
            maxValue={1000}
            value={row.annualRate ?? ""}
            onChange={(value) => onChange("annualRate", value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor={`year-${idPrefix}`}>
            Annual day basis
          </label>
          <output className="form-control bg-light">Automatic: 365 / 366 by calendar year</output>
        </div>
      </>
    )}
    <div className="col-12">
      <label className="d-flex align-items-center gap-2 mb-0">
        <input type="checkbox" checked={Boolean(row.gstApplicable)} onChange={(e) => onChange("gstApplicable", e.target.checked)} />
        Apply GST ({gstRate === "" || gstRate == null ? "set worksheet rate" : `${gstRate}%`})
      </label>
    </div>
    {result?.warnings?.map((warning) => (
      <div className="col-12" key={warning}>
        <div className="alert alert-warning mb-0" role="status">
          {warning}
        </div>
      </div>
    ))}
    <div className="col-12 settlement-row-result" aria-live="polite">
      {result?.error
        ? showErrors && (
            <div className="text-danger" role="status">
              {result.error}
            </div>
          )
        : result && <>
            <strong>{adjustmentExplanation(row, result)}</strong>
            {row.gstApplicable && <div className="text-muted mt-1">GST ({gstRate}%): {formatSettlementMoney(result.gstAmount)}</div>}
          </>}
    </div>
  </div>
);

export default SettlementAdjustmentFields;
