import React from "react";
import { Row, Col, Card, CardBody, Badge } from "reactstrap";

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

const FeesBilledMetrics = ({ summary }) => {
  const metrics = [
    {
      title: "Total Fees (Excl. GST)",
      value: formatCurrency(summary?.totalProfessionalFeesExGst),
      icon: "ri-money-dollar-circle-line",
      color: "primary",
      subText: `${summary?.totalInvoicesCount || 0} Invoices Billed`,
      subIcon: "ri-file-list-3-line",
    },
    {
      title: "GST on Fees",
      value: formatCurrency(summary?.totalGst),
      icon: "ri-percent-line",
      color: "info",
      subText: "10% Tax Component",
      subIcon: "ri-scales-3-line",
    },
    {
      title: "Total Fees (Incl. GST)",
      value: formatCurrency(summary?.totalProfessionalFeesIncGst),
      icon: "ri-wallet-3-line",
      color: "success",
      subText: "Gross Revenue Billed",
      subIcon: "ri-funds-line",
    },
    {
      title: "Avg Fee / Matter",
      value: formatCurrency(summary?.averageFeePerMatter),
      icon: "ri-calculator-line",
      color: "warning",
      subText: `Across ${summary?.invoicedMattersCount || 0} Matters`,
      subIcon: "ri-folder-user-line",
    },
  ];

  const typeFees = summary?.feesByMatterType || {};
  const typeEntries = Object.entries(typeFees);

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
                    <h4 className="fs-20 fw-semibold ff-secondary mb-0 text-dark">
                      {m.value}
                    </h4>
                    <div className="mt-2 text-truncate text-muted fs-12 d-flex align-items-center">
                      <i className={`${m.subIcon} text-${m.color} me-1`}></i>
                      <span>{m.subText}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 avatar-sm">
                    <span
                      className={`avatar-title bg-soft-${m.color} rounded fs-20 text-${m.color}`}
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

      {/* Practice Area Distribution Breakdown */}
      {typeEntries.length > 0 && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3 px-1">
          <span className="text-muted fs-12 fw-medium">
            Practice Area Breakdown (Excl. GST):
          </span>
          {typeEntries.map(([mType, amount]) => (
            <Badge
              key={mType}
              color="light"
              className="text-dark border fs-11 px-2 py-1"
            >
              <span className="fw-semibold text-primary">
                {mType.replace(/_/g, " ")}:
              </span>{" "}
              {formatCurrency(amount)}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};

export default FeesBilledMetrics;
