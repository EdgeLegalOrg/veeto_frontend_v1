import React from "react";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import Select from "react-select";

const STATUS_OPTIONS = [
  { value: null, label: "All Statuses" },
  { value: "INSTRUCTED", label: "Instructed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COOLING_OFF", label: "Cooling Off" },
  { value: "EXCHANGED", label: "Exchanged" },
  { value: "UNEXCHANGED", label: "Unexchanged" },
  { value: "COMPLETE", label: "Complete" },
  { value: "NOT_PROCEEDING", label: "Not Proceeding" },
];

const TYPE_OPTIONS = [
  { value: null, label: "All Types" },
  { value: "CONVEYANCING", label: "Conveyancing" },
  { value: "FAMILY_LAW", label: "Family Law" },
  { value: "ESTATE", label: "Estate" },
  { value: "LEASES", label: "Leases" },
  { value: "BUSINESS", label: "Business" },
  { value: "GENERAL", label: "General" },
];

const MattersOpenedFilterBar = ({
  filters,
  onFilterChange,
  onResetFilters,
  staffList,
}) => {
  const safeStaffList = Array.isArray(staffList) ? staffList : (staffList ? [staffList] : []);

  const staffOptions = [
    { value: null, label: "All Staff" },
    ...safeStaffList.map((s) => ({
      value: s.id,
      label: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.emailId1 || s.userName || `Staff #${s.id}`,
    })),
  ];

  return (
    <Card className="border-0 shadow-sm mb-3">
      <CardBody className="p-3 bg-light rounded">
        <Row className="g-2 align-items-center">
          {/* Status Filter */}
          <Col lg={3} md={6} sm={12}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Matter Status</label>
            <Select
              value={STATUS_OPTIONS.find((opt) => opt.value === filters.status) || STATUS_OPTIONS[0]}
              onChange={(opt) => onFilterChange("status", opt ? opt.value : null)}
              options={STATUS_OPTIONS}
              classNamePrefix="select2-selection"
              isClearable={false}
            />
          </Col>

          {/* Matter Type Filter */}
          <Col lg={3} md={6} sm={12}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Matter Type</label>
            <Select
              value={TYPE_OPTIONS.find((opt) => opt.value === filters.type) || TYPE_OPTIONS[0]}
              onChange={(opt) => onFilterChange("type", opt ? opt.value : null)}
              options={TYPE_OPTIONS}
              classNamePrefix="select2-selection"
              isClearable={false}
            />
          </Col>

          {/* Acting Person Filter */}
          <Col lg={3} md={6} sm={12}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Acting Person</label>
            <Select
              value={staffOptions.find((opt) => opt.value === filters.actingPersonId) || staffOptions[0]}
              onChange={(opt) => onFilterChange("actingPersonId", opt ? opt.value : null)}
              options={staffOptions}
              classNamePrefix="select2-selection"
              isClearable={false}
            />
          </Col>

          {/* Assisting Person Filter */}
          <Col lg={2} md={4} sm={10}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Assisting Person</label>
            <Select
              value={staffOptions.find((opt) => opt.value === filters.assistingPersonId) || staffOptions[0]}
              onChange={(opt) => onFilterChange("assistingPersonId", opt ? opt.value : null)}
              options={staffOptions}
              classNamePrefix="select2-selection"
              isClearable={false}
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

export default MattersOpenedFilterBar;
