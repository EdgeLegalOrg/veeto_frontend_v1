import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { toast } from "react-toastify";
import { resetFormStatusAction, updateFormStatusAction } from "slices/layouts/reducer";
import { fetchSettlementSheet, saveSettlementSheet, downloadSettlementPdf, saveSettlementPdf, fetchSettlementPdfRevisions, downloadSettlementPdfRevision } from "../../../apis";
import {
  adjustmentTitle,
  changeAdjustment,
  adjustmentRow,
  calculateSettlement,
  formatSettlementMoney as currency,
  initialiseSettlement,
  settlementInput,
} from "./settlementCalculations";
import "../../../stylesheets/Settlement.css";
import SettlementDecimalInput from "./SettlementDecimalInput";
import SettlementCurrencyInput from "./SettlementCurrencyInput";
import SettlementAdjustmentFields from "./SettlementAdjustmentFields";

const dateLabel = (date) => (date ? `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}` : "Not set");
const DATE_SOURCES = { SETTLEMENT_DATE: "Settlement Date", ADJUSTMENT_DATE: "Adjustment Date" };
const matterDate = (sheet, source) => (source === "SETTLEMENT_DATE" ? sheet.matterSettlementDate : sheet.matterAdjustmentDate);

const message = (error) =>
  error.response?.data?.message || error.response?.data?.error?.message || "Unable to load or save settlement figures. Please retry.";

/** Saved, matter-owned adjustment sheet with decimal live calculations and explicit day conventions. */
const SettlementDetails = ({ data, isArchived = false, onClose }) => {
  const dispatch = useDispatch();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedInput, setSavedInput] = useState("");
  const [pdfBusy, setPdfBusy] = useState("");
  const [pdfPreview, setPdfPreview] = useState(null);
  const [pdfHistory, setPdfHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const pdfFrame = useRef(null);
  const [reload, setReload] = useState(0);
  const [adjustmentDraft, setAdjustmentDraft] = useState(null);
  const [adjustmentSubmitted, setAdjustmentSubmitted] = useState(false);
  const initialAdjustment = useRef("");
  const activeRef = useRef(true);
  const activeMatter = useRef(data.id);
  activeMatter.current = data.id;
  const input = useMemo(() => (sheet ? settlementInput(sheet) : null), [sheet]);
  const totals = useMemo(() => (sheet ? calculateSettlement(sheet) : null), [sheet]);
  const draftResult = useMemo(
    () => (sheet && adjustmentDraft ? calculateSettlement({ ...sheet, adjustments: [adjustmentDraft], payees: [] }).rows[0] : null),
    [sheet, adjustmentDraft],
  );
  const dirty =
    Boolean(input && JSON.stringify(input) !== savedInput) ||
    Boolean(adjustmentDraft && JSON.stringify(adjustmentDraft) !== initialAdjustment.current);
  const editable = Boolean(sheet?.editable && !isArchived);
  const dateMatchesSource = Boolean(
    sheet?.calculationDateSource && sheet.settlementDate && sheet.settlementDate === matterDate(sheet, sheet.calculationDateSource),
  );

  useEffect(() => {
    let current = true;
    activeRef.current = true;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setSheet(null);
    setPdfPreview(null);
    setPdfBusy("");
    setAdjustmentDraft(null);
    setAdjustmentSubmitted(false);
    fetchSettlementSheet(data.id, { signal: controller.signal })
      .then(({ data: response }) => {
        if (!current) return;
        if (!response.success || !response.data) throw new Error("Settlement figures could not be loaded.");
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
    let current = true;
    setPdfHistory([]);
    setHistoryError("");
    fetchSettlementPdfRevisions(data.id).then(({ data: response }) => {
      if (!response.success) throw new Error("PDF history is unavailable.");
      if (current) setPdfHistory(response.data || []);
    }).catch(() => { if (current) setHistoryError("PDF history could not be loaded. Please reload to retry."); });
    return () => { current = false; };
  }, [data.id, reload]);
  useEffect(() => () => { if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url); }, [pdfPreview]);

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

  const change = (name, value) => setSheet((previous) => (previous ? { ...previous, [name]: value } : previous));
  const changeRow = (index, name, value) =>
    setSheet((previous) => ({
      ...previous,
      adjustments: previous.adjustments.map((row, at) => (at === index ? changeAdjustment(row, name, value, previous) : row)),
    }));
  const changePayee = (index, name, value) =>
    setSheet((previous) => ({ ...previous, payees: previous.payees.map((row, at) => (at === index ? { ...row, [name]: value } : row)) }));
  const selectDate = (source) => {
    setSheet((previous) =>
      previous
        ? { ...previous, calculationDateSource: source, settlementDate: matterDate(previous, source), dateSourceChanged: false }
        : previous,
    );
  };
  const openAdjustment = () => {
    if (!editable || saving || sheet.adjustments.length >= 100) return;
    const row = adjustmentRow();
    initialAdjustment.current = JSON.stringify(row);
    setAdjustmentSubmitted(false);
    setAdjustmentDraft(row);
  };
  const cancelAdjustment = () => {
    setAdjustmentDraft(null);
    setAdjustmentSubmitted(false);
  };
  const changeDraft = (name, value) =>
    setAdjustmentDraft((previous) => (previous ? changeAdjustment(previous, name, value, sheet) : previous));
  const addAdjustment = (event) => {
    event.preventDefault();
    setAdjustmentSubmitted(true);
    if (!editable || saving || !adjustmentDraft || !draftResult || draftResult.error || sheet.adjustments.length >= 100) return;
    setSheet((previous) =>
      previous
        ? { ...previous, adjustments: [...previous.adjustments, { ...adjustmentDraft, description: adjustmentDraft.description.trim() }] }
        : previous,
    );
    cancelAdjustment();
  };
  const confirmDiscard = () => !dirty || window.confirm("Discard unsaved settlement figures?");
  const save = async () => {
    if (saving || pdfBusy || !editable || adjustmentDraft || totals.errors.length) return;
    setSaving(true);
    setError("");
    try {
      const { data: response } = await saveSettlementSheet(data.id, input);
      if (!activeRef.current) return;
      if (!response.success || !response.data) throw new Error("Settlement figures could not be saved.");
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
  const pdfReady = Boolean(sheet?.version != null && !sheet.validationError && !dirty && !adjustmentDraft && !totals?.errors.length && !saving && !pdfBusy);
  const pdfAction = async (action, revision) => {
    if (pdfBusy || (action !== "revision" && !pdfReady)) return;
    const requestedMatter = data.id;
    const isCurrent = () => activeRef.current && activeMatter.current === requestedMatter;
    setPdfBusy(action);
    setError("");
    toast.info(action === "save" ? "Saving settlement PDF..." : "Preparing settlement PDF...");
    try {
      if (action === "save") {
        const { data: response } = await saveSettlementPdf(data.id, sheet.version);
        if (!response.success || !response.data) throw new Error("PDF could not be saved.");
        if (!isCurrent()) return;
        setPdfHistory((previous) => [response.data, ...previous]);
        setHistoryError("");
        toast.success(`Settlement PDF saved as version ${response.data.revision}.`);
      } else {
        const response = action === "revision" ? await downloadSettlementPdfRevision(data.id, revision.revision)
          : await downloadSettlementPdf(data.id, sheet.version);
        const filename = revision?.filename || `Settlement Figures_${data.id}.pdf`;
        const header = response.headers?.["content-disposition"] || "";
        const encoded = header.match(/filename\*=UTF-8''([^;]+)/i);
        const plain = header.match(/filename="([^"]+)"/i);
        const name = encoded ? decodeURIComponent(encoded[1]) : plain?.[1] || filename;
        const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
        if (!isCurrent()) { URL.revokeObjectURL(url); return; }
        setPdfPreview({ url, filename: name });
      }
    } catch (err) {
      let detail = err.message || message(err);
      if (err.response?.data instanceof Blob) {
        try { detail = JSON.parse(await err.response.data.text()).message || detail; } catch (_) { /* Keep the original error. */ }
      } else detail = err.response?.data?.message || detail;
      if (isCurrent()) setError(detail);
    } finally { if (isCurrent()) setPdfBusy(""); }
  };
  const close = () => {
    if (!saving && !pdfBusy && confirmDiscard()) {
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
        <Button color="primary" outline className="ms-2" onClick={close}>
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
            {sheet.version == null ? "New worksheet" : `Saved by ${sheet.updatedBy || "staff"}`}
            {dirty ? " · Unsaved changes" : ""}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2 settlement-actions">
          <Button
            color="primary" outline
            disabled={saving || Boolean(pdfBusy)}
            onClick={() => {
              if (confirmDiscard()) setReload((v) => v + 1);
            }}
          >
            Reload
          </Button>
          {editable && (
            <Button
              color="primary"
              disabled={saving || Boolean(adjustmentDraft) || totals.errors.length > 0 || (!dirty && sheet.version != null)}
              onClick={save}
            >
              {saving ? "Saving..." : "Save Figures"}
            </Button>
          )}
          <Button color="primary" outline disabled={!pdfReady} onClick={() => pdfAction("preview")}>
            {pdfBusy === "preview" ? "Preparing PDF..." : "Print / PDF"}
          </Button>
          {editable && <Button color="primary" disabled={!pdfReady} onClick={() => pdfAction("save")}>
            {pdfBusy === "save" ? "Saving PDF..." : "Save PDF to Attachments"}
          </Button>}
          <Button color="primary" outline disabled={saving || Boolean(pdfBusy)} onClick={close}>
            Close
          </Button>
        </div>
      </div>
      {!editable && <div className="alert alert-info">This worksheet is read only.</div>}
      {sheet.validationError && (
        <div className="alert alert-warning" role="alert">
          Saved worksheet needs correction: {sheet.validationError}
          <div className="small">Correct the indicated fields and save again before generating a new PDF. Existing saved values have been preserved.</div>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {sheet.settlementDate && !dateMatchesSource && (
        <div className="alert alert-warning" role="status">
          {sheet.calculationDateSource
            ? `The matter's ${DATE_SOURCES[sheet.calculationDateSource]} is now ${dateLabel(matterDate(sheet, sheet.calculationDateSource))}.`
            : "The saved calculation date no longer matches either date in Matter Summary."}{" "}
          Calculations still use the saved date, {dateLabel(sheet.settlementDate)}. Select an available matter date below only if you want
          to recalculate.
        </div>
      )}
      {totals.errors.length > 0 && (
        <div className="alert alert-warning" role="status">
          {totals.errors[0]}
          {totals.errors.length > 1 ? ` (${totals.errors.length - 1} more incomplete field(s))` : ""}
          <div className="small">Complete the fields before saving. Incomplete adjustments are excluded from the displayed totals.</div>
        </div>
      )}
      <fieldset disabled={!editable || saving || Boolean(pdfBusy)}>
        <section className="settlement-section">
          <h6>Settlement Details</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label" htmlFor="sheet-date">
                Adjustments as at
              </label>
              <select
                id="sheet-date"
                className="form-select"
                value={dateMatchesSource ? sheet.calculationDateSource : ""}
                onChange={(e) => selectDate(e.target.value)}
                aria-describedby="sheet-date-used sheet-date-help"
              >
                {!dateMatchesSource && (
                  <option value="" disabled>
                    {sheet.settlementDate ? `Saved date — ${dateLabel(sheet.settlementDate)}` : "No matter dates available"}
                  </option>
                )}
                {Object.entries(DATE_SOURCES).map(([source, label]) => (
                  <option key={source} value={source} disabled={!matterDate(sheet, source)}>
                    {label} — {dateLabel(matterDate(sheet, source))}
                  </option>
                ))}
              </select>
              <p id="sheet-date-used" className="small mt-2 mb-0" aria-live="polite">
                Calculation date used: <strong>{dateLabel(sheet.settlementDate)}</strong>
              </p>
              <p id="sheet-date-help" className="small text-muted mb-0">
                Dates come from Matter Summary. Selecting a different date recalculates the worksheet.
              </p>
            </div>
            <div className="col-md-8 align-self-center">
              {!sheet.matterSettlementDate && !sheet.matterAdjustmentDate && (
                <p className="text-warning mb-0" role="status">
                  Add a Settlement Date or Adjustment Date in Matter Summary, then reload this worksheet.
                  {sheet.settlementDate ? " The saved calculation date is retained." : " A date is required before saving."}
                </p>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="sheet-price">
                Purchase / agreed transfer price ($)
              </label>
              <SettlementCurrencyInput
                id="sheet-price"
                className="form-control"
                value={sheet.purchasePrice}
                onChange={(value) => change("purchasePrice", value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="sheet-deposit">
                Deposit paid ($)
              </label>
              <SettlementCurrencyInput
                id="sheet-deposit"
                className="form-control"
                value={sheet.deposit}
                onChange={(value) => change("deposit", value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Balance purchase price</label>
              <output className="form-control bg-light">{currency(totals.balancePurchasePrice)}</output>
            </div>
          </div>
          <div className="row g-3 mt-1">
            <div className="col-md-4">
              <label className="form-label" htmlFor="sheet-gst-rate">Worksheet GST rate (%)</label>
              <SettlementDecimalInput id="sheet-gst-rate" className="form-control" decimalPlaces={2} maxValue={100}
                value={sheet.gstRate} onChange={(value) => change("gstRate", value)} />
              <div className="small text-muted mt-1">Site default: {sheet.siteGstRate == null ? "Not configured" : `${sheet.siteGstRate}%`}. Amounts are GST-exclusive.</div>
              {editable && sheet.siteGstRate != null && <button type="button" className="btn btn-link btn-sm p-0 text-primary"
                onClick={() => change("gstRate", String(sheet.siteGstRate))}>Use site default</button>}
            </div>
            <div className="col-md-4 align-self-center">
              <label className="d-flex align-items-center gap-2">
                <input type="checkbox" checked={sheet.purchasePriceGstApplicable} onChange={(e) => change("purchasePriceGstApplicable", e.target.checked)} />
                Apply GST to purchase price
              </label>
              {sheet.purchasePriceGstApplicable && <p className="small mb-0">GST on purchase price: {currency(totals.purchasePriceGst)}</p>}
            </div>
          </div>
          <p className="text-muted small mt-3 mb-0">
            Price and deposit are copied from existing Conveyancing or Business details for a new worksheet. Saving this sheet does not
            change those details.
          </p>
        </section>

        <section className="settlement-section">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Adjustments</h6>
            {editable && (
              <Button color="primary" size="sm" disabled={sheet.adjustments.length >= 100} onClick={openAdjustment}>
                + Add Adjustment
              </Button>
            )}
          </div>
          <p className="small text-muted">
            Add the adjustments required. Paid adjustments are added; unpaid adjustments are subtracted. Out-of-period calculations can produce negative amounts. Period start and end dates are
            inclusive.
          </p>
          {sheet.adjustments.length === 0 && <p className="text-muted">No adjustments added.</p>}
          {sheet.adjustments.map((row, index) => (
            <div key={index} className={`settlement-adjustment ${!row.enabled ? "settlement-disabled" : ""}`}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <label className="d-flex align-items-center gap-2 fw-semibold mb-0">
                  <input type="checkbox" checked={row.enabled} onChange={(e) => changeRow(index, "enabled", e.target.checked)} />
                  {adjustmentTitle(row)}
                </label>
                {editable && (
                  <Button
                    size="sm"
                    color="danger"
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
                <SettlementAdjustmentFields
                  row={row}
                  idPrefix={index}
                  onChange={(name, value) => changeRow(index, name, value)}
                  balancePurchasePrice={totals.balancePurchasePrice}
                  result={totals.rows[index]}
                  editable={editable}
                  calculationDate={sheet.settlementDate}
                  matterSettlementDate={sheet.matterSettlementDate}
                  matterAdjustmentDate={sheet.matterAdjustmentDate}
                  gstRate={sheet.gstRate}
                />
              )}
            </div>
          ))}
        </section>

        <section className="settlement-section">
          <h6>Statement of Settlement</h6>
          <div className="table-responsive">
            <table className="table align-middle settlement-columns">
              <thead><tr><th>Settlement details / adjustments</th><th className="text-end">Vendor allows</th><th className="text-end">Purchaser pays</th></tr></thead>
              <tbody>
                <tr><td>Purchase / agreed transfer price</td><td></td><td className="text-end">{currency(totals.purchasePrice)}</td></tr>
                {sheet.purchasePriceGstApplicable && <tr className="text-muted"><td>GST on purchase price ({sheet.gstRate}%)</td><td></td><td className="text-end">{currency(totals.purchasePriceGst)}</td></tr>}
                <tr><td>Less deposit paid</td><td></td><td className="text-end">-{currency(totals.deposit)}</td></tr>
                {sheet.adjustments.map((row, index) => row.enabled && <React.Fragment key={index}>
                  <tr><td>{adjustmentTitle(row)}</td><td className="text-end">{row.paymentStatus === "UNPAID" ? currency(totals.rows[index].amount) : ""}</td><td className="text-end">{row.paymentStatus === "PAID" ? currency(totals.rows[index].amount) : ""}</td></tr>
                  {row.gstApplicable && <tr className="text-muted"><td>GST ({sheet.gstRate}%)</td><td className="text-end">{row.paymentStatus === "UNPAID" ? currency(totals.rows[index].gstAmount) : ""}</td><td className="text-end">{row.paymentStatus === "PAID" ? currency(totals.rows[index].gstAmount) : ""}</td></tr>}
                </React.Fragment>)}
                <tr className="fw-semibold"><td>Column totals</td><td className="text-end">{currency(totals.vendorTotal)}</td><td className="text-end">{currency(totals.purchaserTotal)}</td></tr>
                <tr className="fw-bold"><td>Balance payable (Purchaser less Vendor)</td><td></td><td className="text-end" aria-live="polite">{currency(totals.finalBalance)}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="settlement-section">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Payee Cheques / Electronic Payments</h6>
            {editable && (
              <Button
                color="primary"
                size="sm"
                disabled={sheet.payees.length >= 100}
                onClick={() => change("payees", [...sheet.payees, { name: "", reference: "", amount: "0" }])}
              >
                + Add Payee
              </Button>
            )}
          </div>
          <p className="text-muted small">
            Allocate the final balance between payees. Payments do not reduce the balance a second time. A mortgage discharge amount
            allocated here must not also be deducted unless it is a separate agreed allowance.
          </p>
          <div className="table-responsive">
            <table className="table align-middle">
              <caption className="visually-hidden">Settlement payment allocations</caption>
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
                        type="text"
                        maxLength={300}
                        value={payee.name || ""}
                        onChange={(e) => changePayee(index, "name", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control"
                        aria-label={`Payee ${index + 1} reference`}
                        type="text"
                        maxLength={300}
                        value={payee.reference || ""}
                        onChange={(e) => changePayee(index, "reference", e.target.value)}
                      />
                    </td>
                    <td>
                      <SettlementCurrencyInput
                        className="form-control"
                        aria-label={`Payee ${index + 1} amount`}
                        value={payee.amount}
                        onChange={(value) => changePayee(index, "amount", value)}
                      />
                    </td>
                    <td>
                      {editable && (
                        <Button
                          color="danger"
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
          <div className={`alert mb-0 ${totals.reconciled && !totals.errors.length ? "alert-success" : "alert-warning"}`} role="status">
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
      <section className="settlement-section">
        <h6>Settlement PDF versions</h6>
        {historyError && <p className="text-warning" role="status">{historyError}</p>}
        {!pdfHistory.length && !historyError && <p className="text-muted mb-0">No PDF versions saved.</p>}
        {pdfHistory.length > 0 && <div className="table-responsive"><table className="table align-middle settlement-pdf-history">
          <thead><tr><th>Version</th><th>File</th><th>Saved by</th><th>Saved at</th><th></th></tr></thead>
          <tbody>{pdfHistory.map((revision) => <tr key={revision.revision}><td>{revision.revision}</td><td>{revision.filename}</td><td>{revision.createdBy}</td><td>{new Date(revision.createdAt).toLocaleString()}</td><td><Button color="primary" outline size="sm" disabled={Boolean(pdfBusy)} onClick={() => pdfAction("revision", revision)}>View PDF</Button></td></tr>)}</tbody>
        </table></div>}
      </section>
      <Modal isOpen={Boolean(pdfPreview)} toggle={() => setPdfPreview(null)} size="xl" centered>
        <ModalHeader toggle={() => setPdfPreview(null)} className="bg-light p-3">Settlement Figures PDF</ModalHeader>
        <ModalBody className="p-0">{pdfPreview && <iframe ref={pdfFrame} title="Settlement Figures PDF" src={pdfPreview.url} style={{ width: "100%", height: "70vh", border: 0 }} />}</ModalBody>
        <ModalFooter>
          {pdfPreview && <a className="btn btn-primary" href={pdfPreview.url} download={pdfPreview.filename}>Download PDF</a>}
          <Button color="primary" outline onClick={() => { try { pdfFrame.current?.contentWindow?.print(); } catch (_) { toast.info("Use the print button in the PDF viewer."); } }}>Print</Button>
          <Button color="primary" outline onClick={() => setPdfPreview(null)}>Close</Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={Boolean(adjustmentDraft)} toggle={cancelAdjustment} backdrop="static" size="lg" centered>
        <ModalHeader toggle={cancelAdjustment} className="bg-light p-3">
          Add Adjustment
        </ModalHeader>
        {adjustmentDraft && (
          <form onSubmit={addAdjustment} noValidate>
            <ModalBody className="settlement-sheet p-3 w-100">
              <p className="text-muted small mb-3">
                Save adds this adjustment to the worksheet. Use Save Figures to save the complete worksheet.
              </p>
              <fieldset disabled={!editable || saving || Boolean(pdfBusy)}>
                <SettlementAdjustmentFields
                  row={adjustmentDraft}
                  idPrefix="new"
                  onChange={changeDraft}
                  balancePurchasePrice={totals.balancePurchasePrice}
                  result={draftResult}
                  editable={editable}
                  calculationDate={sheet.settlementDate}
                  matterSettlementDate={sheet.matterSettlementDate}
                  matterAdjustmentDate={sheet.matterAdjustmentDate}
                  gstRate={sheet.gstRate}
                  showErrors={adjustmentSubmitted}
                />
              </fieldset>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" outline type="button" onClick={cancelAdjustment}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={!editable || saving || sheet.adjustments.length >= 100}>
                Save Adjustment
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>
    </article>
  );
};

export default SettlementDetails;
