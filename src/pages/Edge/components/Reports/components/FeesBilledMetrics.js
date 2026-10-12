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

const METRICS_THEMES = {
  primary: {
    avatarBg: "rgba(64, 81, 137, 0.12)",
    iconColor: "#405189",
  },
  info: {
    avatarBg: "rgba(41, 156, 219, 0.12)",
    iconColor: "#299cdb",
  },
  success: {
    avatarBg: "rgba(10, 179, 156, 0.12)",
    iconColor: "#0ab39c",
  },
  warning: {
    avatarBg: "rgba(247, 184, 75, 0.15)",
    iconColor: "#d38b0e",
  },
};

const FeesBilledMetrics = ({
  summary,
  selectedMatterType = null,
  onSelectMatterType,
}) => {
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

  const handleTypeClick = (mType) => {
    if (!onSelectMatterType) return;
    if (selectedMatterType === mType) {
      onSelectMatterType(null); // Toggle off
    } else {
      onSelectMatterType(mType);
    }
  };

  return (
    <>
      <Row className="mb-3 g-3">
        {metrics.map((m, idx) => {
          const theme = METRICS_THEMES[m.color] || METRICS_THEMES.primary;

          return (
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
                        className="rounded d-flex align-items-center justify-content-center w-100 h-100 shadow-sm"
                        style={{
                          backgroundColor: theme.avatarBg,
                        }}
                      >
                        <i
                          className={m.icon}
                          style={{
                            color: theme.iconColor,
                            fontSize: "20px",
                          }}
                        ></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Practice Area Distribution Breakdown */}
      {typeEntries.length > 0 && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3 px-1">
          <span className="text-muted fs-12 fw-medium">
            Practice Area Breakdown (Excl. GST):
          </span>
          {typeEntries.map(([mType, amount]) => {
            const isSelected = selectedMatterType === mType;
            return (
              <Badge
                key={mType}
                color={isSelected ? "primary" : "light"}
                className={`${
                  isSelected ? "text-white" : "text-dark"
                } border fs-11 px-2 py-1`}
                onClick={() => handleTypeClick(mType)}
                style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                title={`Filter by ${mType.replace(/_/g, " ")}`}
              >
                <span className={isSelected ? "fw-bold text-white" : "fw-semibold text-primary"}>
                  {mType.replace(/_/g, " ")}:
                </span>{" "}
                {formatCurrency(amount)}
                {isSelected && " ✕"}
              </Badge>
            );
          })}
        </div>
      )}
    </>
  );
};

export default FeesBilledMetrics;
