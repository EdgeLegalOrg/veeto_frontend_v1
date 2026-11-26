import React, { useEffect, useMemo, useState } from "react";
import CustomSideDrawer from "../../customComponents/CustomSideDrawer";
import { formatCurrency, formatDateFunc } from "pages/Edge/utils/utilFunc";
import "./TimedList.css";

// Keep the existing billing-date order, with entry ID resolving dates that are equal.
const compareEntries = (a, b) => new Date(a.billingDate || 0) - new Date(b.billingDate || 0) || (a.id || 0) - (b.id || 0);

/** Compact unbilled-entry picker shared by Add Invoice and Edit Invoice. */
const TimedList = (props) => {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (props.active) setSelected(props.formData?.timeBillingList || []);
  }, [props.formData, props.active]);

  const available = useMemo(() => {
    const selectedIds = new Set(selected.map((entry) => entry.id));
    return (props.timedList || [])
      .filter((entry) => !entry.invoiceId && !selectedIds.has(entry.id))
      .slice().sort(compareEntries);
  }, [props.timedList, selected]);

  const handleSelect = (entry) => {
    // Selecting an available entry adds it immediately, as in the existing picker.
    const next = [...selected, entry].sort(compareEntries);
    setSelected(next);
    props.onChange?.("timeBillingList", next);
  };

  const body = () => (
    <div className="timed-entry-picker">
      <div className="timed-entry-picker-summary">
        <div>
          <strong>Choose time entries</strong>
          <div className="small text-muted" role="status" aria-live="polite">
            {available.length} available · {selected.length} selected
          </div>
        </div>
      </div>
      {available.length ? (
        <ul className="timed-entry-picker-list">
          {available.map((entry) => (
            <li key={entry.id}>
              <button type="button" className="timed-entry-picker-row" onClick={() => handleSelect(entry)}
                aria-label={`Add time billing: ${entry.description || "No description"}, ${formatDateFunc(entry.billingDate) || "No date"}, ${entry.units ?? 0} units`}>
                <span className="timed-entry-picker-content">
                  <span className="timed-entry-picker-meta">
                    <span>{formatDateFunc(entry.billingDate) || "No date"}</span>
                    <span>{entry.units ?? 0} {Number(entry.units) === 1 ? "unit" : "units"}</span>
                    <strong>{entry.total == null ? "—" : formatCurrency(entry.total)}</strong>
                  </span>
                  <span className="timed-entry-picker-description">{entry.description?.trim() || "No description"}</span>
                </span>
                <span className="timed-entry-picker-add" aria-hidden="true">+</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="timed-entry-picker-empty" role="status">
          {selected.length ? "No more unbilled entries available to add." : "No unbilled time entries available."}
        </div>
      )}
    </div>
  );

  return <CustomSideDrawer active={props.active} onClose={props.close} heading="Time Billing" body={body} />;
};

export default TimedList;
