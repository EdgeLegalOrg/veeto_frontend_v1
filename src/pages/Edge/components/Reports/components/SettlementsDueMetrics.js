import React from "react";
import { Row, Col, Card, CardBody, Badge } from "reactstrap";

const SettlementsDueMetrics = ({ summary }) => {
  const metrics = [
    {
      title: "Total Settlements Due",
      value: summary?.totalSettlements || 0,
      icon: "ri-calendar-event-line",
      color: "primary",
      subText: "In selected period",
      subIcon: "ri-calendar-line",
    },
    {
      title: "Settled / Complete",
      value: summary?.settledCount || 0,
      icon: "ri-checkbox-circle-line",
      color: "success",
      subText: "Completed files",
      subIcon: "ri-check-double-line",
    },
    {
      title: "Pending / Upcoming",
      value: summary?.pendingCount || 0,
      icon: "ri-time-line",
      color: "warning",
      subText: "Today & future dates",
      subIcon: "ri-hourglass-line",
    },
    {
      title: "Overdue / Delayed",
      value: summary?.overdueCount || 0,
      icon: "ri-alarm-warning-line",
      color: "danger",
      subText: summary?.overdueCount > 0 ? "Requires action" : "Zero overdue",
      subIcon: "ri-error-warning-line",
    },
  ];

  const subTypeCounts = summary?.countBySubType || {};
  const subTypeEntries = Object.entries(subTypeCounts);

  return (
    <>
      <Row className="mb-3 g-3">
        {metrics.map((m, idx) => (
          <Col xl={3} md={6} sm={12} key={idx}>
            <Card className="card-animate border-0 shadow-sm overflow-hidden h-100 mb-0">
              <CardBody className="p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-1 fs-12">
                      {m.title}
                    </p>
                    <h4 className="fs-22 fw-semibold ff-secondary mb-0 text-dark">
                      {m.value}
                    </h4>
                    <div className="mt-2 text-truncate text-muted fs-12 d-flex align-items-center">
                      <i className={`${m.subIcon} text-${m.color} me-1`}></i>
                      <span>{m.subText}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 avatar-sm">
                    <span className={`avatar-title bg-soft-${m.color} rounded fs-20 text-${m.color}`}>
                      <i className={m.icon}></i>
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Sub-type Distribution Badges */}
      {subTypeEntries.length > 0 && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3 px-1">
          <span className="text-muted fs-12 fw-medium">Sub-Type Breakdown:</span>
          {subTypeEntries.map(([subType, count]) => (
            <Badge key={subType} color="light" className="text-dark border fs-11 px-2 py-1">
              <span className="fw-semibold text-primary">{subType.replace(/_/g, " ")}:</span> {count}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};

export default SettlementsDueMetrics;
