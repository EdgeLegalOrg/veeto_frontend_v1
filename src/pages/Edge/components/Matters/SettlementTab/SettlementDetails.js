import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import {
  resetFormStatusAction,
  updateFormStatusAction,
} from "slices/layouts/reducer";
import { fetchSettlementSheet, saveSettlementSheet } from "../../../apis";
import {
  CATEGORIES,
  adjustmentRow,
  calculateSettlement,
  formatSettlementMoney as currency,
  initialiseSettlement,
  settlementInput,
} from "./settlementCalculations";
import "../../../stylesheets/Settlement.css";

const message = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error?.message ||
  "Unable to load or save settlement figures. Please retry.";

/** Saved, matter-owned adjustment sheet with decimal live calculations and explicit day conventions. */
const SettlementDetails = ({ data, isArchived = false, onClose }) => {
  const dispatch = useDispatch();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedInput, setSavedInput] = useState("");
  const [reload, setReload] = useState(0);
  const activeRef = useRef(true);
  const input = useMemo(() => (sheet ? settlementInput(sheet) : null), [sheet]);
  const totals = useMemo(
    () => (sheet ? calculateSettlement(sheet) : null),
    [sheet],
  );
  const dirty = Boolean(input && JSON.stringify(input) !== savedInput);
  const editable = Boolean(sheet?.editable && !isArchived);

  useEffect(() => {
    let current = true;
    activeRef.current = true;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setSheet(null);
    fetchSettlementSheet(data.id, { signal: controller.signal })
      .then(({ data: response }) => {
        if (!current) return;
        if (!response.success || !response.data)
          throw new Error("Settlement figures could not be loaded.");
        const next = initialiseSettlement(response.data);
        setSheet(next);
        setSavedInput(JSON.stringify(settlementInput(next)));
      })
      .catch((err) => {
        if (current) setError(message(err));
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
      activeRef.current = false;
      controller.abort();
    };
  }, [data.id, reload]);

  useEffect(() => {
    dispatch(updateFormStatusAction({ key: "isFormChanged", value: dirty }));
    const warn = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, dispatch]);
  useEffect(() => () => dispatch(resetFormStatusAction()), [dispatch]);

  const change = (name, value) =>
    setSheet((previous) =>
      previous ? { ...previous, [name]: value } : previous,
    );
  const changeRow = (index, name, value) =>
    setSheet((previous) => ({
      ...previous,
      adjustments: previous.adjustments.map((row, at) =>
        at === index ? { ...row, [name]: value } : row,
      ),
    }));
  const changePayee = (index, name, value) =>
    setSheet((previous) => ({
      ...previous,
      payees: previous.payees.map((row, at) =>
        at === index ? { ...row, [name]: value } : row,
      ),
    }));
  const confirmDiscard = () =>
    !dirty || window.confirm("Discard unsaved settlement figures?");
  const save = async () => {
    if (saving || !editable || totals.errors.length) return;
    setSaving(true);
    setError("");
    try {
      const { data: response } = await saveSettlementSheet(data.id, input);
      if (!activeRef.current) return;
      if (!response.success || !response.data)
        throw new Error("Settlement figures could not be saved.");
      const next = initialiseSettlement(response.data);
      setSheet(next);
      setSavedInput(JSON.stringify(settlementInput(next)));
      toast.success("Settlement figures saved.");
    } catch (err) {
      if (activeRef.current) setError(message(err));
    } finally {
      if (activeRef.current) setSaving(false);
    }
  };
  const close = () => {
    if (!saving && confirmDiscard()) {
      dispatch(resetFormStatusAction());
      onClose();
    }
  };

  if (loading)
    return (
      <div className="text-center p-5" role="status">
        <Spinner color="primary" />
        <p className="mt-3">Loading settlement figures...</p>
      </div>
    );
  if (!sheet)
    return (
      <div className="p-3">
        <p className="text-danger" role="alert">
          {error}
        </p>
        <Button color="primary" onClick={() => setReload((v) => v + 1)}>
          Retry
        </Button>
        <Button className="ms-2" onClick={close}>
          Close
        </Button>
      </div>
    );

  return (
    <article className="settlement-sheet p-3">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
        <div>
          <h5 className="mb-1">Settlement Figures Adjustment Sheet</h5>
          <p className="text-muted mb-0">
            {sheet.version == null
              ? "New worksheet"
              : `Saved by ${sheet.updatedBy || "staff"}`}
            {dirty ? " · Unsaved changes" : ""}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            color="light"
            disabled={saving}
            onClick={() => {
              if (confirmDiscard()) setReload((v) => v + 1);
            }}
          >
            Reload
          </Button>
          {editable && (
            <Button
              color="primary"
              disabled={
                saving ||
                totals.errors.length > 0 ||
                (!dirty && sheet.version != null)
              }
              onClick={save}
            >
              {saving ? "Saving..." : "Save Figures"}
            </Button>
          )}
          <Button color="danger" disabled={saving} onClick={close}>
            Close
          </Button>
        </div>
      </div>
      {!editable && (
        <div className="alert alert-info">This worksheet is read only.</div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {totals.errors.length > 0 && (
        <div className="alert alert-warning" role="status">
          {totals.errors[0]}
          {totals.errors.length > 1
            ? ` (${totals.errors.length - 1} more incomplete field(s))`
            : ""}
          <div className="small">
            Complete the fields before saving. Incomplete adjustments are
            excluded from the displayed totals.
          </div>
        </div>
      )}
      <fieldset disabled={!editable || saving}>
        <section className="settlement-section">
          <h6>Settlement Details</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label" htmlFor="sheet-date">
                Adjustments as at
              </label>
              <input
                id="sheet-date"
                className="form-control"
                type="date"
                min="1900-01-01"
                max="2200-12-31"
                value={sheet.settlementDate || ""}
                onChange={(e) => change("settlementDate", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="sheet-day-owner">
                Settlement day belongs to
              </label>
              <select
                id="sheet-day-owner"
                className="form-select"
                value={sheet.settlementDayOwner}
                onChange={(e) => change("settlementDayOwner", e.target.value)}
              >
                <option value="VENDOR">Vendor / transferor</option>
                <option value="PURCHASER">Purchaser / transferee</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Matter</label>
              <div className="form-control bg-light">#{data.matterNumber}</div>
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="sheet-price">
                Purchase / agreed transfer price ($)
              </label>
              <input
                id="sheet-price"
                className="form-control"
                inputMode="decimal"
                value={sheet.purchasePrice}
                onChange={(e) => change("purchasePrice", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="sheet-deposit">
                Deposit paid ($)
              </label>
              <input
                id="sheet-deposit"
                className="form-control"
                inputMode="decimal"
                value={sheet.deposit}
                onChange={(e) => change("deposit", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Balance purchase price</label>
              <output className="form-control bg-light">
                {currency(totals.balancePurchasePrice)}
              </output>
            </div>
          </div>
          <p className="text-muted small mt-3 mb-0">
            Price and deposit are copied from existing Conveyancing or Business
            details for a new worksheet. Saving this sheet does not change those
            details.
          </p>
        </section>

        <section className="settlement-section">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Rates, Interest &amp; Allowances</h6>
            {editable && (
              <Button
                color="light"
                size="sm"
                disabled={sheet.adjustments.length >= 100}
                onClick={() =>
                  change("adjustments", [...sheet.adjustments, adjustmentRow()])
                }
              >
                + Add Adjustment
              </Button>
            )}
          </div>
          <p className="small text-muted">
            Enable the items required. Period start and end dates are inclusive.
            Add reimburses the vendor for the purchaser's share; Deduct allows
            the purchaser the vendor's share. Fixed amounts and interest use the
            direction you select.
          </p>
          {sheet.adjustments.length === 0 && (
            <p className="text-muted">No adjustments added.</p>
          )}
          {sheet.adjustments.map((row, index) => (
            <div
              key={index}
              className={`settlement-adjustment ${!row.enabled ? "settlement-disabled" : ""}`}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <label className="d-flex align-items-center gap-2 fw-semibold mb-0">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) =>
                      changeRow(index, "enabled", e.target.checked)
                    }
                  />
                  {CATEGORIES[row.category] || "Adjustment"}
                </label>
                {editable && (
                  <Button
                    size="sm"
                    color="light"
                    className="ms-auto"
                    aria-label={`Remove adjustment ${index + 1}`}
                    onClick={() =>
                      change(
                        "adjustments",
                        sheet.adjustments.filter((_, at) => at !== index),
                      )
                    }
                  >
                    Remove
                  </Button>
                )}
              </div>
              {row.enabled && (
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label" htmlFor={`category-${index}`}>
                      Category
                    </label>
                    <select
                      id={`category-${index}`}
                      className="form-select"
                      value={row.category}
                      onChange={(e) =>
                        changeRow(index, "category", e.target.value)
                      }
                    >
                      {Object.entries(CATEGORIES).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" htmlFor={`mode-${index}`}>
                      Calculation
                    </label>
                    <select
                      id={`mode-${index}`}
                      className="form-select"
                      value={row.mode}
                      onChange={(e) => changeRow(index, "mode", e.target.value)}
                    >
                      <option value="PRORATA">Prorated period</option>
                      <option value="FIXED">Fixed amount</option>
                      <option value="INTEREST">Simple annual interest</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label
                      className="form-label"
                      htmlFor={`direction-${index}`}
                    >
                      Adjustment direction
                    </label>
                    <select
                      id={`direction-${index}`}
                      className="form-select"
                      value={row.direction}
                      onChange={(e) =>
                        changeRow(index, "direction", e.target.value)
                      }
                    >
                      <option value="ADD">Add to amount payable</option>
                      <option value="DEDUCT">Deduct from amount payable</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" htmlFor={`amount-${index}`}>
                      {row.mode === "INTEREST"
                        ? "Interest principal ($)"
                        : row.mode === "PRORATA"
                          ? "Total period cost ($)"
                          : "Fixed amount ($)"}
                    </label>
                    <input
                      id={`amount-${index}`}
                      className="form-control"
                      inputMode="decimal"
                      value={row.amount ?? ""}
                      onChange={(e) =>
                        changeRow(index, "amount", e.target.value)
                      }
                    />
                    {row.mode === "INTEREST" && editable && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 mt-1"
                        onClick={() =>
                          changeRow(
                            index,
                            "amount",
                            totals.balancePurchasePrice,
                          )
                        }
                      >
                        Use balance purchase price
                      </button>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label
                      className="form-label"
                      htmlFor={`description-${index}`}
                    >
                      Description{row.category === "OTHER" ? " (required)" : ""}
                    </label>
                    <input
                      id={`description-${index}`}
                      className="form-control"
                      maxLength={300}
                      value={row.description || ""}
                      onChange={(e) =>
                        changeRow(index, "description", e.target.value)
                      }
                    />
                  </div>
                  {row.mode !== "FIXED" && (
                    <>
                      <div className="col-md-3">
                        <label
                          className="form-label"
                          htmlFor={`start-${index}`}
                        >
                          {row.mode === "INTEREST"
                            ? "Interest from (inclusive)"
                            : "Period start (inclusive)"}
                        </label>
                        <input
                          id={`start-${index}`}
                          className="form-control"
                          type="date"
                          min="1900-01-01"
                          max="2200-12-31"
                          value={row.startDate || ""}
                          onChange={(e) =>
                            changeRow(index, "startDate", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label" htmlFor={`end-${index}`}>
                          {row.mode === "INTEREST"
                            ? "Interest to (inclusive)"
                            : "Period end (inclusive)"}
                        </label>
                        <input
                          id={`end-${index}`}
                          className="form-control"
                          type="date"
                          min="1900-01-01"
                          max="2200-12-31"
                          value={row.endDate || ""}
                          onChange={(e) =>
                            changeRow(index, "endDate", e.target.value)
                          }
                        />
                      </div>
                    </>
                  )}
                  {row.mode === "INTEREST" && (
                    <>
                      <div className="col-md-3">
                        <label className="form-label" htmlFor={`rate-${index}`}>
                          Annual interest rate (%)
                        </label>
                        <input
                          id={`rate-${index}`}
                          className="form-control"
                          inputMode="decimal"
                          value={row.annualRate ?? ""}
                          onChange={(e) =>
                            changeRow(index, "annualRate", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label" htmlFor={`year-${index}`}>
                          Annual day basis
                        </label>
                        <select
                          id={`year-${index}`}
                          className="form-select"
                          value={row.yearDays}
                          onChange={(e) =>
                            changeRow(index, "yearDays", Number(e.target.value))
                          }
                        >
                          <option value={365}>365 days</option>
                          <option value={366}>366 days</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div className="col-12 settlement-row-result">
                    <strong>
                      {row.direction === "ADD" ? "Add" : "Deduct"}:{" "}
                      {currency(totals.rows[index].amount)}
                    </strong>
                    {row.mode === "PRORATA" && !totals.rows[index].error && (
                      <span className="ms-3 text-muted">
                        {totals.rows[index].periodDays} period days · Vendor{" "}
                        {totals.rows[index].vendorDays} · Purchaser{" "}
                        {totals.rows[index].purchaserDays}
                      </span>
                    )}
                    {row.mode === "INTEREST" && !totals.rows[index].error && (
                      <span className="ms-3 text-muted">
                        {totals.rows[index].periodDays} days, simple interest
                      </span>
                    )}
                    {totals.rows[index].error && (
                      <div className="text-danger mt-1" role="status">
                        {totals.rows[index].error}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="settlement-section">
          <h6>Statement of Settlement</h6>
          <dl className="settlement-summary">
            <dt>Purchase / agreed transfer price</dt>
            <dd>{currency(totals.purchasePrice)}</dd>
            <dt>Less deposit paid</dt>
            <dd>{currency(totals.deposit)}</dd>
            <dt>Balance purchase price</dt>
            <dd>{currency(totals.balancePurchasePrice)}</dd>
            <dt>Plus adjustments</dt>
            <dd>{currency(totals.additions)}</dd>
            <dt>Less allowances / deductions</dt>
            <dd>{currency(totals.deductions)}</dd>
            <dt className="settlement-final">Final balance due</dt>
            <dd className="settlement-final" aria-live="polite">
              {currency(totals.finalBalance)}
            </dd>
          </dl>
        </section>

        <section className="settlement-section">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Payee Cheques / Electronic Payments</h6>
            {editable && (
              <Button
                color="light"
                size="sm"
                disabled={sheet.payees.length >= 100}
                onClick={() =>
                  change("payees", [
                    ...sheet.payees,
                    { name: "", reference: "", amount: "0" },
                  ])
                }
              >
                + Add Payee
              </Button>
            )}
          </div>
          <p className="text-muted small">
            Allocate the final balance between payees. Payments do not reduce
            the balance a second time. A mortgage discharge amount allocated
            here must not also be deducted unless it is a separate agreed
            allowance.
          </p>
          <div className="table-responsive">
            <table className="table align-middle">
              <caption className="visually-hidden">
                Settlement payment allocations
              </caption>
              <thead>
                <tr>
                  <th>Payee</th>
                  <th>Reference / purpose</th>
                  <th>Amount ($)</th>
                  <th>
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sheet.payees.map((payee, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        className="form-control"
                        aria-label={`Payee ${index + 1} name`}
                        maxLength={300}
                        value={payee.name || ""}
                        onChange={(e) =>
                          changePayee(index, "name", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="form-control"
                        aria-label={`Payee ${index + 1} reference`}
                        maxLength={300}
                        value={payee.reference || ""}
                        onChange={(e) =>
                          changePayee(index, "reference", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="form-control"
                        aria-label={`Payee ${index + 1} amount`}
                        inputMode="decimal"
                        value={payee.amount}
                        onChange={(e) =>
                          changePayee(index, "amount", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      {editable && (
                        <Button
                          color="light"
                          size="sm"
                          aria-label={`Remove payee ${index + 1}`}
                          onClick={() =>
                            change(
                              "payees",
                              sheet.payees.filter((_, at) => at !== index),
                            )
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {sheet.payees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-muted">
                      No payments allocated.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <dl className="settlement-summary">
            <dt>Payments allocated</dt>
            <dd>{currency(totals.allocated)}</dd>
            <dt>Difference (balance − payments)</dt>
            <dd>{currency(totals.unallocated)}</dd>
          </dl>
          <div
            className={`alert mb-0 ${totals.reconciled && !totals.errors.length ? "alert-success" : "alert-warning"}`}
            role="status"
          >
            {totals.errors.length
              ? "Complete the worksheet to verify reconciliation."
              : totals.reconciled
                ? "Payments reconcile to the final balance."
                : "Payments do not yet reconcile. This worksheet can be saved as a draft."}
          </div>
        </section>
        <section className="settlement-section">
          <label className="form-label fw-semibold" htmlFor="sheet-notes">
            Notes / calculation assumptions
          </label>
          <textarea
            id="sheet-notes"
            className="form-control"
            rows={3}
            maxLength={4000}
            value={sheet.notes || ""}
            onChange={(e) => change("notes", e.target.value)}
          />
        </section>
      </fieldset>
    </article>
  );
};

export default SettlementDetails;
