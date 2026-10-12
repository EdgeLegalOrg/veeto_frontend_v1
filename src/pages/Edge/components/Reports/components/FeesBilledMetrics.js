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
};

const FeesBilledMetrics = ({
  summary,
  selectedCard = "total",
  onSelectCard,
  showBreakdown = false,
  onToggleBreakdown,
}) => {
  const typeFees = summary?.feesByMatterType || {};
  const typeCount = Object.keys(typeFees).length;

  const metrics = [
    {
      id: "total",
      title: "Total Fees (Excl. GST)",
      value: formatCurrency(summary?.totalProfessionalFeesExGst),
      icon: "ri-money-dollar-circle-line",
      color: "primary",
      subText: `${summary?.totalInvoicesCount || 0} Invoices Billed`,
      subIcon: "ri-file-list-3-line",
      isTotal: true,
    },
    {
      id: "gross",
      title: "Total Fees (Incl. GST)",
      value: formatCurrency(summary?.totalProfessionalFeesIncGst),
      icon: "ri-wallet-3-line",
      color: "success",
      subText: "Gross Revenue Billed",
      subIcon: "ri-funds-line",
    },
    {
      id: "avg",
      title: "Avg Fee / Matter",
      value: formatCurrency(summary?.averageFeePerMatter),
      icon: "ri-calculator-line",
      color: "warning",
      subText: `Across ${summary?.invoicedMattersCount || 0} Matters`,
      subIcon: "ri-folder-user-line",
    },
    {
      id: "by_type",
      title: "Fees by Practice Area",
      value: typeCount > 0 ? `${typeCount} Practice Areas` : "$0.00",
      icon: "ri-pie-chart-2-line",
      color: "info",
      subText: showBreakdown ? "Click to hide breakdown" : "Click to view breakdown list",
      subIcon: "ri-list-check-2",
      isBreakdownToggle: true,
    },
  ];

  const handleCardClick = (m) => {
    if (m.isBreakdownToggle) {
      if (onToggleBreakdown) {
        onToggleBreakdown();
      }
      return;
    }
    if (onSelectCard) {
      onSelectCard(m.id === selectedCard ? null : m.id);
    }
  };

  return (
    <Row className="mb-3 g-3">
      {metrics.map((m, idx) => {
        let isSelected = false;
        if (m.isBreakdownToggle) {
          isSelected = Boolean(showBreakdown);
        } else if (m.isTotal) {
          isSelected = (!selectedCard || selectedCard === "total") && !showBreakdown;
        } else {
          isSelected = selectedCard === m.id && !showBreakdown;
        }

        const theme = METRICS_THEMES[m.color] || METRICS_THEMES.primary;

        return (
          <Col xl={3} md={6} sm={12} key={idx}>
            <Card
              className="card-animate overflow-hidden h-100 mb-0"
              onClick={() => handleCardClick(m)}
              title={
                m.isBreakdownToggle
                  ? "Click to display practice area revenue breakdown list"
                  : m.isTotal
                  ? "Click to show all fees"
                  : `Click to select ${m.title}`
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
                      {isSelected && (
                        <Badge color={m.color} className="ms-2 fs-10 px-1 py-0">
                          {m.isBreakdownToggle ? "Showing" : "Active"}
                        </Badge>
                      )}
                    </div>
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
  );
};

export default FeesBilledMetrics;
