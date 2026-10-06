import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "$0.00";
  return (
    "$" +
    Number(val).toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const OutstandingInvoicesMetrics = ({ summary }) => {
  const bucketCounts = summary?.countByAgingBucket || {};

  const metrics = [
    {
      title: "Total Outstanding",
      value: formatCurrency(summary?.totalOutstandingBalance),
      icon: "ri-money-dollar-circle-line",
      color: "danger",
      subText: `${summary?.totalUnpaidInvoicesCount || 0} Unpaid Invoices`,
      subIcon: "ri-file-list-3-line",
      colSize: "col-xl-4 col-md-4 col-sm-12",
    },
    {
      title: "Current (0-30 Days)",
      value: formatCurrency(summary?.current0To30Balance),
      icon: "ri-checkbox-circle-line",
      color: "success",
      subText: `${bucketCounts["0-30"] || 0} Invoices (0-30d)`,
      subIcon: "ri-time-line",
      colSize: "col-xl-2 col-md-4 col-sm-6",
    },
    {
      title: "31-60 Days Overdue",
      value: formatCurrency(summary?.overdue31To60Balance),
      icon: "ri-alarm-warning-line",
      color: "warning",
      subText: `${bucketCounts["31-60"] || 0} Invoices (31-60d)`,
      subIcon: "ri-time-line",
      colSize: "col-xl-2 col-md-4 col-sm-6",
    },
    {
      title: "61-90 Days Overdue",
      value: formatCurrency(summary?.overdue61To90Balance),
      icon: "ri-error-warning-line",
      color: "info",
      subText: `${bucketCounts["61-90"] || 0} Invoices (61-90d)`,
      subIcon: "ri-time-line",
      colSize: "col-xl-2 col-md-6 col-sm-6",
    },
    {
      title: "90+ Days Overdue",
      value: formatCurrency(summary?.overdue90PlusBalance),
      icon: "ri-alert-line",
      color: "danger",
      subText: `${bucketCounts["90+"] || 0} Invoices (90+d)`,
      subIcon: "ri-skull-line",
      colSize: "col-xl-2 col-md-6 col-sm-6",
    },
  ];

  return (
    <Row className="mb-3 g-3">
      {metrics.map((m, idx) => (
        <Col className={m.colSize} key={idx}>
          <Card className="card-animate border-0 shadow-sm overflow-hidden h-100 mb-0">
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-1 fs-12">
                    {m.title}
                  </p>
                  <h4 className="fs-18 fw-semibold ff-secondary mb-0 text-dark">
                    {m.value}
                  </h4>
                  <div className="mt-2 text-truncate text-muted fs-12 d-flex align-items-center">
                    <i className={`${m.subIcon} text-${m.color} me-1`}></i>
                    <span>{m.subText}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 avatar-sm ms-2">
                  <span
                    className={`avatar-title bg-soft-${m.color} rounded fs-18 text-${m.color}`}
                  >
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

export default OutstandingInvoicesMetrics;
