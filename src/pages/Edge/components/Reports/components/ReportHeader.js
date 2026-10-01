import React from "react";
import { Row, Col, Button, ButtonGroup } from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

const DATE_PRESETS = [
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
  { label: "This Quarter", value: "THIS_QUARTER" },
  { label: "FY 2025/26", value: "FY" },
  { label: "Custom", value: "CUSTOM" },
];

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
}) => {
  const safeSites = Array.isArray(sites) ? sites : (sites ? [sites] : []);

  const siteOptions = [
    { value: null, label: "All Offices (Company Level)" },
    ...safeSites.map((s) => {
      const siteVal = s.siteId !== undefined ? s.siteId : s.id;
      return {
        value: siteVal,
        label: s.siteName || s.name || `Site #${siteVal}`,
      };
    }),
  ];

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
                value={siteOptions.find((opt) => opt.value === selectedSite) || siteOptions[0]}
                onChange={(opt) => onSiteChange(opt ? opt.value : null)}
                options={siteOptions}
                placeholder="Select Office..."
                classNamePrefix="select2-selection"
                isClearable={false}
              />
            </div>

            {/* Date Preset Buttons */}
            <ButtonGroup size="sm" className="d-none d-xl-inline-flex">
              {DATE_PRESETS.map((p) => (
                <Button
                  key={p.value}
                  color={activePreset === p.value ? "primary" : "light"}
                  onClick={() => onPresetSelect(p.value)}
                  className="px-2 fs-12"
                >
                  {p.label}
                </Button>
              ))}
            </ButtonGroup>

            {/* Flatpickr Date Range Picker */}
            <div style={{ width: "220px" }}>
              <Flatpickr
                className="form-control form-control-sm bg-light border-0"
                value={dateRange}
                options={{
                  mode: "range",
                  dateFormat: "Y-m-d",
                  altInput: true,
                  altFormat: "d M Y",
                }}
                onChange={(dates) => {
                  if (dates.length === 2) {
                    onDateChange(dates);
                  }
                }}
                placeholder="Select Date Range"
              />
            </div>

            {/* Export CSV Button */}
            <Button
              color="success"
              size="sm"
              onClick={onExportCsv}
              disabled={isExporting}
              className="d-flex align-items-center waves-effect waves-light"
            >
              <i className={isExporting ? "ri-loader-4-line ri-spin align-middle fs-16 me-1" : "ri-file-excel-2-line align-middle fs-16 me-1"}></i>
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ReportHeader;
