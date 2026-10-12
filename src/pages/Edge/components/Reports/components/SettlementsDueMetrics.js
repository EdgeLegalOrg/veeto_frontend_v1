import React from "react";
import { Row, Col, Card, CardBody, Badge } from "reactstrap";

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
  danger: {
    border: "#f06548",
    cardBg: "rgba(240, 101, 72, 0.05)",
    avatarBg: "rgba(240, 101, 72, 0.12)",
    iconColor: "#f06548",
    activeAvatarBg: "#f06548",
    activeIconColor: "#ffffff",
  },
};

const SettlementsDueMetrics = ({
  summary,
  selectedStatus = "ALL",
  onSelectStatus,
}) => {
  const metrics = [
    {
      title: "Total Settlements Due",
      value: summary?.totalSettlements || 0,
      icon: "ri-calendar-event-line",
      color: "primary",
      subText: "In selected period",
      subIcon: "ri-calendar-line",
      statusKey: "ALL",
    },
    {
      title: "Settled / Complete",
      value: summary?.settledCount || 0,
      icon: "ri-checkbox-circle-line",
      color: "success",
      subText: "Completed files",
      subIcon: "ri-check-double-line",
      statusKey: "SETTLED",
    },
    {
      title: "Pending / Upcoming",
      value: summary?.pendingCount || 0,
      icon: "ri-time-line",
      color: "warning",
      subText: "Today & future dates",
      subIcon: "ri-hourglass-line",
      statusKey: "PENDING",
    },
    {
      title: "Overdue / Delayed",
      value: summary?.overdueCount || 0,
      icon: "ri-alarm-warning-line",
      color: "danger",
      subText: summary?.overdueCount > 0 ? "Requires action" : "Zero overdue",
      subIcon: "ri-error-warning-line",
      statusKey: "OVERDUE",
    },
  ];

  const subTypeCounts = summary?.countBySubType || {};
  const subTypeEntries = Object.entries(subTypeCounts);

  const handleCardClick = (statusKey) => {
    if (!onSelectStatus) return;
    if (statusKey === "ALL") {
      onSelectStatus("ALL");
    } else if (selectedStatus === statusKey) {
      onSelectStatus("ALL"); // Toggle off to show all
    } else {
      onSelectStatus(statusKey);
    }
  };

  return (
    <>
      <Row className="mb-3 g-3">
        {metrics.map((m, idx) => {
          const isSelected =
            (m.statusKey === "ALL" && (!selectedStatus || selectedStatus === "ALL")) ||
            selectedStatus === m.statusKey;

          const theme = METRICS_THEMES[m.color] || METRICS_THEMES.primary;

          return (
            <Col xl={3} md={6} sm={12} key={idx}>
              <Card
                className="card-animate overflow-hidden h-100 mb-0"
                onClick={() => handleCardClick(m.statusKey)}
                title={
                  m.statusKey === "ALL"
                    ? "Click to show all settlements"
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
                        {isSelected && m.statusKey !== "ALL" && (
                          <Badge color={m.color} className="ms-2 fs-10 px-1 py-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <h4 className="fs-22 fw-semibold ff-secondary mb-0 text-dark">
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
