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
    border: "#405189",
    cardBg: "rgba(64, 81, 137, 0.05)",
    avatarBg: "rgba(64, 81, 137, 0.12)",
    iconColor: "#405189",
    activeAvatarBg: "#405189",
    activeIconColor: "#ffffff",
  },
  success: {
    border: "#0ab39c",
    cardBg: "rgba(10, 179, 156, 0.05)",
    avatarBg: "rgba(10, 179, 156, 0.12)",
    iconColor: "#0ab39c",
    activeAvatarBg: "#0ab39c",
    activeIconColor: "#ffffff",
  },
  warning: {
    border: "#f7b84b",
    cardBg: "rgba(247, 184, 75, 0.05)",
    avatarBg: "rgba(247, 184, 75, 0.15)",
    iconColor: "#d38b0e",
    activeAvatarBg: "#f7b84b",
    activeIconColor: "#212529",
  },
  info: {
    border: "#299cdb",
    cardBg: "rgba(41, 156, 219, 0.05)",
    avatarBg: "rgba(41, 156, 219, 0.12)",
    iconColor: "#299cdb",
    activeAvatarBg: "#299cdb",
    activeIconColor: "#ffffff",
  },
  danger: {
    border: "#f06548",
    cardBg: "rgba(240, 101, 72, 0.05)",
    avatarBg: "rgba(240, 101, 72, 0.12)",
    iconColor: "#f06548",
    activeAvatarBg: "#f06548",
    activeIconColor: "#ffffff",
  },
};

const OutstandingInvoicesMetrics = ({
  summary,
  selectedBucket = "ALL",
  onSelectBucket,
}) => {
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
      bucketKey: "ALL",
    },
    {
      title: "Current (0-30 Days)",
      value: formatCurrency(summary?.current0To30Balance),
      icon: "ri-checkbox-circle-line",
      color: "success",
      subText: `${bucketCounts["0-30"] || 0} Invoices (0-30d)`,
      subIcon: "ri-time-line",
      colSize: "col-xl-2 col-md-4 col-sm-6",
      bucketKey: "0-30",
    },
    {
      title: "31-60 Days Overdue",
      value: formatCurrency(summary?.overdue31To60Balance),
      icon: "ri-alarm-warning-line",
      color: "warning",
      subText: `${bucketCounts["31-60"] || 0} Invoices (31-60d)`,
      subIcon: "ri-time-line",
      colSize: "col-xl-2 col-md-4 col-sm-6",
      bucketKey: "31-60",
    },
    {
      title: "61-90 Days Overdue",
      value: formatCurrency(summary?.overdue61To90Balance),
      icon: "ri-error-warning-line",
      color: "info",
      subText: `${bucketCounts["61-90"] || 0} Invoices (61-90d)`,
      subIcon: "ri-time-line",
      colSize: "col-xl-2 col-md-6 col-sm-6",
      bucketKey: "61-90",
    },
    {
      title: "90+ Days Overdue",
      value: formatCurrency(summary?.overdue90PlusBalance),
      icon: "ri-alert-line",
      color: "danger",
      subText: `${bucketCounts["90+"] || 0} Invoices (90+d)`,
      subIcon: "ri-skull-line",
      colSize: "col-xl-2 col-md-6 col-sm-6",
      bucketKey: "90+",
    },
  ];

  const handleCardClick = (bucketKey) => {
    if (!onSelectBucket) return;
    if (bucketKey === "ALL") {
      onSelectBucket("ALL");
    } else if (selectedBucket === bucketKey) {
      onSelectBucket("ALL"); // Toggle off to show all
    } else {
      onSelectBucket(bucketKey);
    }
  };

  return (
    <Row className="mb-3 g-3">
      {metrics.map((m, idx) => {
        const isSelected =
          (m.bucketKey === "ALL" && (!selectedBucket || selectedBucket === "ALL")) ||
          selectedBucket === m.bucketKey;

        const theme = METRICS_THEMES[m.color] || METRICS_THEMES.danger;

        return (
          <Col className={m.colSize} key={idx}>
            <Card
              className="card-animate overflow-hidden h-100 mb-0"
              onClick={() => handleCardClick(m.bucketKey)}
              title={
                m.bucketKey === "ALL"
                  ? "Click to show all outstanding invoices"
                  : `Click to filter by ${m.title}`
              }
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                border: isSelected ? `2px solid ${theme.border}` : "2px solid #e9ebec",
                backgroundColor: isSelected ? theme.cardBg : "#fff",
                boxShadow: isSelected
                  ? "0 4px 14px rgba(0, 0, 0, 0.1)"
                  : "0 1px 3px rgba(0, 0, 0, 0.05)",
                transform: isSelected ? "translateY(-2px)" : "none",
              }}
            >
              <CardBody className="p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex align-items-center mb-1">
                      <p className="text-uppercase fw-medium text-muted text-truncate mb-0 fs-12">
                        {m.title}
                      </p>
                      {isSelected && m.bucketKey !== "ALL" && (
                        <Badge color={m.color} className="ms-2 fs-10 px-1 py-0">
                          Active
                        </Badge>
                      )}
                    </div>
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
                      className="rounded d-flex align-items-center justify-content-center w-100 h-100 shadow-sm"
                      style={{
                        backgroundColor: isSelected
                          ? theme.activeAvatarBg
                          : theme.avatarBg,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <i
                        className={m.icon}
                        style={{
                          color: isSelected
                            ? theme.activeIconColor
                            : theme.iconColor,
                          fontSize: "18px",
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
  );
};

export default OutstandingInvoicesMetrics;
