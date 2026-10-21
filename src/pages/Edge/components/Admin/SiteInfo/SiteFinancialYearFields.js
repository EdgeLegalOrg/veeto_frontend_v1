import React from "react";
import { Input, Label } from "reactstrap";

export const validateFinancialYearRange = ({ financialYearStart, financialYearEnd }) => {
  if ((!financialYearStart) !== (!financialYearEnd) ||
      (financialYearStart && financialYearEnd <= financialYearStart)) {
    return "Provide both financial year dates, with the end date after the start date.";
  }
  return null;
};

const SiteFinancialYearFields = ({ value, onChange, columnClassName = "col-md-3" }) => (
  <>
    <div className={`${columnClassName} mt-3`}>
      <div className="mb-3">
        <Label htmlFor="financialYearStart">Current Financial Year Start</Label>
        {/* Preserve date-only values without timezone conversion. */}
        <Input
          id="financialYearStart"
          type="date"
          name="financialYearStart"
          value={value.financialYearStart || ""}
          onChange={onChange}
        />
      </div>
    </div>
    <div className={`${columnClassName} mt-3`}>
      <div className="mb-3">
        <Label htmlFor="financialYearEnd">Current Financial Year End</Label>
        <Input
          id="financialYearEnd"
          type="date"
          name="financialYearEnd"
          value={value.financialYearEnd || ""}
          onChange={onChange}
        />
      </div>
    </div>
    <p className="col-12 text-muted fs-12 mb-0">
      Set both dates for this site and update them each financial year.
      Leave both blank to use the default July–June range in reports.
    </p>
  </>
);

export default SiteFinancialYearFields;
