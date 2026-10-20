import ReportComparisonControl from "./ReportComparisonControl";
import React, { useRef } from "react";
import { Row, Col, Button } from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { checkHasPermission } from "../../../utils/utilFunc";

// Report date range presets

const DATE_PRESETS = [
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
  { label: "This Quarter", value: "THIS_QUARTER" },
  { label: "Current Calendar Year", value: "CALENDAR_YEAR" },
  { label: "Current Financial Year", value: "FINANCIAL_YEAR" },
  { label: "Custom", value: "CUSTOM" },
];

const selectCustomStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};

const ReportHeader = ({
  title,
  sites,
  selectedSite,
  onSiteChange,
  dateRange,
  onDateChange,
  activePreset,
  onPresetSelect,
  onExportCsv,
  isExporting,
  exportDisabled,
  financialYearNote,
  comparison,
  onComparisonChange,
}) => {
  const flatpickrRef = useRef(null);
  const canAccessAllSites = checkHasPermission("AccessAllSites");
  const safeSites = Array.isArray(sites) ? sites : (sites ? [sites] : []);

  const siteListOptions = safeSites.map((s) => {
    const siteVal = s.siteId !== undefined ? s.siteId : s.id;
    return {
      value: siteVal,
      label: s.siteName || s.name || `Site #${siteVal}`,
    };
  });

  const siteOptions = canAccessAllSites
    ? [{ value: null, label: "All Offices (Company Level)" }, ...siteListOptions]
    : siteListOptions;

  const currentOption = siteOptions.find((opt) => opt.value === selectedSite) || siteOptions[0];

  const handlePresetClick = (presetValue) => {
    onPresetSelect(presetValue);
    if (presetValue === "CUSTOM") {
      setTimeout(() => {
        flatpickrRef.current?.flatpickr?.open();
      }, 50);
    }
  };

  const handleDateButtonClick = () => {
    flatpickrRef.current?.flatpickr?.open();
  };

  return (
    <div className="report-header mb-4">
      <Row className="align-items-center g-3">
        {/* Title */}
        <Col lg={4} md={12}>
          <div>
            <h4 className="fw-bold mb-1 text-primary d-flex align-items-center">
              <i className="ri-file-chart-line me-2 fs-22"></i> {title || "Reports & Analytics"}
            </h4>
            <p className="text-muted mb-0 fs-13">
              Performance metrics, matter intake, and operational breakdown.
            </p>
          </div>
        </Col>

        {/* Global Controls: Site Selector, Date Preset & Export */}
        <Col lg={8} md={12}>
          <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2">
            {/* Site / Office Selector */}
            <div style={{ minWidth: "220px" }}>
              <Select
                value={currentOption}
                onChange={(opt) => onSiteChange(opt ? opt.value : null)}
                options={siteOptions}
                placeholder="Select Office..."
                classNamePrefix="select2-selection"
                isClearable={false}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                styles={selectCustomStyles}
              />
            </div>

            {/* Date Preset Buttons */}
            <div className="btn-group btn-group-sm d-none d-xl-inline-flex" role="group">
              {DATE_PRESETS.map((p) => {
                const isActive = activePreset === p.value;
                return (
                  <Button
                    key={p.value}
                    color={isActive ? "primary" : "white"}
                    onClick={() => handlePresetClick(p.value)}
                    className={`px-3 py-1 fs-12 fw-medium border ${
                      isActive ? "shadow-sm active" : "text-dark bg-white"
                    }`}
                    style={{
                      borderColor: isActive ? "var(--vz-primary)" : "#ced4da",
                      boxShadow: isActive ? "0 2px 4px rgba(64, 81, 137, 0.25)" : "none",
                    }}
                  >
                    {p.label}
                  </Button>
                );
              })}
            </div>

            {/* Date Range Picker (Styled as a Button with Calendar Icon) */}
            <div
              className="d-flex align-items-center bg-white border rounded px-2 py-1 shadow-sm position-relative cursor-pointer"
              style={{
                minWidth: "225px",
                height: "34px",
                borderColor: activePreset === "CUSTOM" ? "var(--vz-primary)" : "#ced4da",
                cursor: "pointer",
              }}
              onClick={handleDateButtonClick}
            >
              <i className="ri-calendar-2-line text-primary me-2 fs-15 flex-shrink-0"></i>
              <div className="flex-grow-1">
                <Flatpickr
                  ref={flatpickrRef}
                  className="form-control form-control-sm border-0 p-0 bg-transparent fw-medium text-dark text-center cursor-pointer"
                  style={{ cursor: "pointer", boxShadow: "none" }}
                  value={dateRange}
                  options={{
                    mode: "range",
                    dateFormat: "Y-m-d",
                    altInput: true,
                    altInputClass:
                      "form-control form-control-sm border-0 p-0 bg-transparent fw-medium text-dark text-center cursor-pointer",
                    altFormat: "d M Y",
                    closeOnSelect: true,
                  }}
                  onChange={(dates) => {
                    if (dates.length === 2) {
                      onDateChange(dates);
                    }
                  }}
                  placeholder="Select Date Range"
                />
              </div>
              <i className="ri-arrow-down-s-line text-muted ms-1 fs-14 flex-shrink-0"></i>
            </div>

            <ReportComparisonControl
              dateRange={dateRange}
              comparison={comparison}
              onChange={onComparisonChange}
            />

            {/* Export CSV Button */}
            <Button
              color="success"
              size="sm"
              onClick={onExportCsv}
              disabled={isExporting || exportDisabled}
              className="d-flex align-items-center waves-effect waves-light"
            >
              <i
                className={
                  isExporting
                    ? "ri-loader-4-line ri-spin align-middle fs-16 me-1"
                    : "ri-file-excel-2-line align-middle fs-16 me-1"
                }
              ></i>
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </Col>
      </Row>
      {financialYearNote && <p className="text-muted fs-12 mt-2 mb-0">{financialYearNote}</p>}
    </div>
  );
};

export default ReportHeader;
