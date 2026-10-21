import React from "react";
import { Input, Label } from "reactstrap";
import { getFinancialYearRange, validateFinancialYearStart } from "../../../utils/financialYear";

const SiteFinancialYearFields = ({ value, onChange, columnClassName = "col-md-3" }) => {
  const invalid = validateFinancialYearStart(value);
  const end = invalid ? null : getFinancialYearRange(value)[1];
  const endLabel = end ? `${String(end.getDate()).padStart(2, "0")}/${String(end.getMonth() + 1).padStart(2, "0")}` : "";
  const handleChange = (event) => onChange({ target: {
    name: event.target.name,
    value: event.target.value === "" ? null : Number(event.target.value),
  } });
  return (
    <>
      <div className={`${columnClassName} mt-3`}>
        <div className="mb-3">
          <Label htmlFor="financialYearStartDay">Financial Year Start (DD/MM)</Label>
          {/* Recurring day/month values never include a year or timezone conversion. */}
          <div className="d-flex align-items-center gap-2">
            <Input id="financialYearStartDay" type="select" name="financialYearStartDay"
              aria-label="Financial year start day" value={value.financialYearStartDay ?? ""} onChange={handleChange}>
              <option value="">DD</option>
              {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day}>{String(day).padStart(2, "0")}</option>
              ))}
            </Input>
            <span className="text-muted">/</span>
            <Input id="financialYearStartMonth" type="select" name="financialYearStartMonth"
              aria-label="Financial year start month" value={value.financialYearStartMonth ?? ""} onChange={handleChange}>
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>{String(month).padStart(2, "0")}</option>
              ))}
            </Input>
          </div>
        </div>
      </div>
      <div className={`${columnClassName} mt-3`}>
        <div className="mb-3">
          <Label htmlFor="financialYearEnd">Financial Year End (automatic)</Label>
          <Input id="financialYearEnd" type="text" value={endLabel} readOnly className="bg-light"
            placeholder="Calculated from start" />
        </div>
      </div>
      <p className="col-12 text-muted fs-12 mb-0">
        Set the recurring start day and month. The end date and current financial year are calculated automatically.
        Leave both blank to use 01/07–30/06.
        {Number(value.financialYearStartDay) === 29 && Number(value.financialYearStartMonth) === 2
          ? " A 29/02 start uses 28/02 in non-leap years." : ""}
      </p>
    </>
  );
};

export default SiteFinancialYearFields;
