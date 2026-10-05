import React from "react";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import Select from "react-select";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Invoice Statuses" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "CANCELLED", label: "Cancelled" },
];

const TYPE_OPTIONS = [
  { value: null, label: "All Practice Areas" },
  { value: "CONVEYANCING", label: "Conveyancing" },
  { value: "FAMILY_LAW", label: "Family Law" },
  { value: "ESTATE", label: "Estate" },
  { value: "LEASES", label: "Leases" },
  { value: "BUSINESS", label: "Business" },
  { value: "GENERAL", label: "General" },
];

const selectCustomStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};

const FeesBilledFilterBar = ({
  filters,
  onFilterChange,
  onResetFilters,
  staffList,
}) => {
  const safeStaffList = Array.isArray(staffList) ? staffList : (staffList ? [staffList] : []);

  const staffOptions = [
    { value: null, label: "All Fee Earners / Staff" },
    ...safeStaffList.map((s) => ({
      value: s.id,
      label: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.emailId1 || s.userName || `Staff #${s.id}`,
    })),
  ];

  return (
    <Card className="border-0 shadow-sm mb-3">
      <CardBody className="p-3 bg-light rounded">
        <Row className="g-2 align-items-center">
          {/* Invoice Status Filter */}
          <Col lg={4} md={6} sm={12}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Invoice Status</label>
            <Select
              value={STATUS_OPTIONS.find((opt) => opt.value === filters.status) || STATUS_OPTIONS[0]}
              onChange={(opt) => onFilterChange("status", opt ? opt.value : "ALL")}
              options={STATUS_OPTIONS}
              classNamePrefix="select2-selection"
              isClearable={false}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              styles={selectCustomStyles}
            />
          </Col>

          {/* Practice Area / Matter Type Filter */}
          <Col lg={4} md={6} sm={12}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Practice Area / Type</label>
            <Select
              value={TYPE_OPTIONS.find((opt) => opt.value === filters.matterType) || TYPE_OPTIONS[0]}
              onChange={(opt) => onFilterChange("matterType", opt ? opt.value : null)}
              options={TYPE_OPTIONS}
              classNamePrefix="select2-selection"
              isClearable={false}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              styles={selectCustomStyles}
            />
          </Col>

          {/* Fee Earner Filter */}
          <Col lg={3} md={10} sm={10}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Fee Earner / Staff</label>
            <Select
              value={staffOptions.find((opt) => opt.value === filters.feeEarnerId) || staffOptions[0]}
              onChange={(opt) => onFilterChange("feeEarnerId", opt ? opt.value : null)}
              options={staffOptions}
              classNamePrefix="select2-selection"
              isClearable={false}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              styles={selectCustomStyles}
            />
          </Col>

          {/* Reset Button */}
          <Col lg={1} md={2} sm={2} className="d-flex align-items-end">
            <div className="w-100">
              <label className="form-label d-none d-md-block fs-12 text-transparent mb-1">Reset</label>
              <Button
                color="light"
                className="w-100 btn-icon waves-effect border"
                title="Reset Filters"
                onClick={onResetFilters}
              >
                <i className="ri-refresh-line fs-16 text-muted"></i>
              </Button>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default FeesBilledFilterBar;
