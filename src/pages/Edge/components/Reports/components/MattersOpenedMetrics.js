import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";

const MattersOpenedMetrics = ({ summary }) => {
  const formatType = (type) => {
    if (!type) return "N/A";
    return type.replace(/_/g, " ");
  };

  const metrics = [
    {
      title: "Total Matters Opened",
      value: summary?.totalMatters || 0,
      icon: "ri-folder-open-line",
      color: "primary",
      subText: "In selected period",
      subIcon: "ri-calendar-line",
    },
    {
      title: "Active / In-Progress",
      value: summary?.openCount || 0,
      icon: "ri-time-line",
      color: "warning",
      subText: "Instructed & Active",
      subIcon: "ri-flashlight-line",
    },
    {
      title: "Completed / Settled",
      value: summary?.closedCount || 0,
      icon: "ri-checkbox-circle-line",
      color: "success",
      subText: "Concluded matters",
      subIcon: "ri-check-double-line",
    },
    {
      title: "Top Practice Area",
      value: formatType(summary?.topMatterType),
      icon: "ri-pie-chart-2-line",
      color: "info",
      subText: summary?.countByType && summary?.topMatterType
        ? `${summary.countByType[summary.topMatterType] || 0} matters`
        : "No data",
      subIcon: "ri-bar-chart-fill",
    },
  ];

  return (
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
  );
};

export default MattersOpenedMetrics;
