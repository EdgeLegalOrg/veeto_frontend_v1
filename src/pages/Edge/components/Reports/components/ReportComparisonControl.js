import React, { useState } from "react";
import { Button, Input, Label, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { comparisonDates, reportDate, rangeLabel } from "../utils/reportComparison";

const ReportComparisonControl = ({ dateRange, comparison, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("LAST_YEAR");
  const [customRange, setCustomRange] = useState(["", ""]);
  const [error, setError] = useState("");
  const canCompare = Boolean(dateRange?.[0] && dateRange?.[1]);
  const draftRange = comparisonDates(dateRange, { mode, range: customRange }) || ["", ""];
  const open = () => {
    setMode(comparison?.mode || "LAST_YEAR");
    setCustomRange(comparison?.mode === "CUSTOM" ? comparison.range : ["", ""]);
    setError("");
    setIsOpen(true);
  };
  const apply = () => {
    if (!draftRange[0] || !draftRange[1] || draftRange[1] < draftRange[0]) {
      setError("Select both comparison dates, with the end on or after the start.");
      return;
    }
    onChange({ mode, ...(mode === "CUSTOM" ? { range: customRange } : {}) });
    setIsOpen(false);
  };
  return (
    <>
      <Button color={comparison ? "primary" : "light"} size="sm" className="border"
        disabled={!canCompare && !comparison} onClick={open}>
        <i className="ri-arrow-left-right-line me-1" />{comparison ? "Edit Comparison" : "Compare"}
      </Button>
      <Modal isOpen={isOpen} toggle={() => setIsOpen(false)} centered size="md">
        <ModalHeader className="bg-light p-3" toggle={() => setIsOpen(false)}>Compare Date Range</ModalHeader>
        <ModalBody className="p-3">
          <div className="bg-light rounded p-3 mb-3">
            <div className="text-muted fs-12 mb-1">Selected Period</div>
            <div className="fw-medium fs-13">{rangeLabel(dateRange)}</div>
          </div>
          <Label htmlFor="report-comparison-mode">Compare with</Label>
          <Input id="report-comparison-mode" type="select" value={mode} onChange={(e) => {
            setMode(e.target.value); setError("");
          }}>
            <option value="LAST_YEAR">Same period last year</option>
            <option value="PREVIOUS_PERIOD">Previous period</option>
            <option value="CUSTOM">Custom date range</option>
          </Input>
          <div className="d-flex flex-wrap gap-3 mt-3">
            {["Start", "End"].map((label, index) => (
              <div className="flex-grow-1" style={{ flexBasis: "180px", minWidth: 0 }} key={label}>
                <Label htmlFor={`comparison-${label}`}>{label} Date</Label>
                <Input id={`comparison-${label}`} type="date" value={reportDate(draftRange[index])}
                  disabled={mode !== "CUSTOM"} onChange={(e) => {
                    setCustomRange((previous) => previous.map((value, i) => i === index ? e.target.value : value));
                    setError("");
                  }} />
              </div>
            ))}
          </div>
          {error && <p className="text-danger mt-3 mb-0" role="alert">{error}</p>}
        </ModalBody>
        <ModalFooter className="p-3 border-top gap-2">
          {comparison && <Button color="light" size="sm" className="me-auto" onClick={() => {
            onChange(null); setIsOpen(false);
          }}>Clear Comparison</Button>}
          <Button color="light" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button color="primary" size="sm" disabled={!canCompare} onClick={apply}>Apply</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ReportComparisonControl;
