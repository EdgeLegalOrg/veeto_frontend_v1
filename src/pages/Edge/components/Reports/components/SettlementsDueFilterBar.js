import React from "react";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import Select from "react-select";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Settlement Statuses" },
  { value: "OVERDUE", label: "Overdue / Delayed" },
  { value: "TODAY", label: "Due Today" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "SETTLED", label: "Settled / Complete" },
];

const SUB_TYPE_OPTIONS = [
  { value: null, label: "All Sub-Types" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "SALE", label: "Sale" },
  { value: "OFF_THE_PLAN", label: "Off The Plan" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "REFINANCE", label: "Refinance" },
  { value: "COMMERCIAL", label: "Commercial" },
];

const selectCustomStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};

const SettlementsDueFilterBar = ({
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
          {/* Settlement Status Filter */}
          <Col lg={3} md={6} sm={12}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Settlement Status</label>
            <Select
              value={STATUS_OPTIONS.find((opt) => opt.value === filters.settlementStatus) || STATUS_OPTIONS[0]}
              onChange={(opt) => onFilterChange("settlementStatus", opt ? opt.value : "ALL")}
              options={STATUS_OPTIONS}
              classNamePrefix="select2-selection"
              isClearable={false}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              styles={selectCustomStyles}
            />
          </Col>

          {/* Sub-Type Filter */}
          <Col lg={3} md={6} sm={12}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Conveyancing Sub-Type</label>
            <Select
              value={SUB_TYPE_OPTIONS.find((opt) => opt.value === filters.subType) || SUB_TYPE_OPTIONS[0]}
              onChange={(opt) => onFilterChange("subType", opt ? opt.value : null)}
              options={SUB_TYPE_OPTIONS}
              classNamePrefix="select2-selection"
              isClearable={false}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              styles={selectCustomStyles}
            />
          </Col>

          {/* Acting Person Filter */}
          <Col lg={3} md={6} sm={12}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Acting Staff</label>
            <Select
              value={staffOptions.find((opt) => opt.value === filters.actingPersonId) || staffOptions[0]}
              onChange={(opt) => onFilterChange("actingPersonId", opt ? opt.value : null)}
              options={staffOptions}
              classNamePrefix="select2-selection"
              isClearable={false}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              styles={selectCustomStyles}
            />
          </Col>

          {/* Assisting Person Filter */}
          <Col lg={2} md={4} sm={10}>
            <label className="form-label fs-12 fw-medium text-muted mb-1">Assisting Staff</label>
            <Select
              value={staffOptions.find((opt) => opt.value === filters.assistingPersonId) || staffOptions[0]}
              onChange={(opt) => onFilterChange("assistingPersonId", opt ? opt.value : null)}
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

export default SettlementsDueFilterBar;
