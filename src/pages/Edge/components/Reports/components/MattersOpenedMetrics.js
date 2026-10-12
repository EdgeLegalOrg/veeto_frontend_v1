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
  warning: {
    border: "#f7b84b",
    cardBg: "rgba(247, 184, 75, 0.05)",
    avatarBg: "rgba(247, 184, 75, 0.15)",
    iconColor: "#d38b0e",
    activeAvatarBg: "#f7b84b",
    activeIconColor: "#212529",
  },
  success: {
    border: "#0ab39c",
    cardBg: "rgba(10, 179, 156, 0.05)",
    avatarBg: "rgba(10, 179, 156, 0.12)",
    iconColor: "#0ab39c",
    activeAvatarBg: "#0ab39c",
    activeIconColor: "#ffffff",
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

const MattersOpenedMetrics = ({
  summary,
  selectedStatus = null,
  selectedType = null,
  onSelectFilter,
}) => {
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
      filterKey: "status",
      filterValue: null,
      isTotal: true,
    },
    {
      title: "Active / In-Progress",
      value: summary?.openCount || 0,
      icon: "ri-time-line",
      color: "warning",
      subText: "Instructed & Active",
      subIcon: "ri-flashlight-line",
      filterKey: "status",
      filterValue: "IN_PROGRESS",
    },
    {
      title: "Completed / Settled",
      value: summary?.closedCount || 0,
      icon: "ri-checkbox-circle-line",
      color: "success",
      subText: "Concluded matters",
      subIcon: "ri-check-double-line",
      filterKey: "status",
      filterValue: "COMPLETE",
    },
    {
      title: "Top Practice Area",
      value: formatType(summary?.topMatterType),
      icon: "ri-pie-chart-2-line",
      color: "info",
      subText:
        summary?.countByType && summary?.topMatterType
          ? `${summary.countByType[summary.topMatterType] || 0} matters`
          : "No data",
      subIcon: "ri-bar-chart-fill",
      filterKey: "type",
      filterValue: summary?.topMatterType || null,
    },
  ];

  const handleCardClick = (m) => {
    if (!onSelectFilter) return;
    if (m.isTotal) {
      onSelectFilter("status", null);
    } else if (m.filterKey === "status") {
      if (selectedStatus === m.filterValue) {
        onSelectFilter("status", null); // Toggle off
      } else {
        onSelectFilter("status", m.filterValue);
      }
    } else if (m.filterKey === "type" && m.filterValue) {
      if (selectedType === m.filterValue) {
        onSelectFilter("type", null); // Toggle off
      } else {
        onSelectFilter("type", m.filterValue);
      }
    }
  };

  return (
    <Row className="mb-3 g-3">
      {metrics.map((m, idx) => {
        let isSelected = false;
        if (m.isTotal) {
          isSelected = !selectedStatus && !selectedType;
        } else if (m.filterKey === "status") {
          isSelected = selectedStatus === m.filterValue;
        } else if (m.filterKey === "type") {
          isSelected = selectedType === m.filterValue && Boolean(m.filterValue);
        }

        const theme = METRICS_THEMES[m.color] || METRICS_THEMES.primary;

        return (
          <Col xl={3} md={6} sm={12} key={idx}>
            <Card
              className="card-animate overflow-hidden h-100 mb-0"
              onClick={() => handleCardClick(m)}
              title={
                m.isTotal
                  ? "Click to show all matters"
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
                      {isSelected && !m.isTotal && (
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
  );
};

export default MattersOpenedMetrics;
