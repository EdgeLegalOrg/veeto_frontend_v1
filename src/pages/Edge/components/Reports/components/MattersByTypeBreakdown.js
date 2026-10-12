import React, { useState, useMemo } from "react";
import { Card, CardBody, Table, Button, Badge } from "reactstrap";
import ReportChartModal from "./ReportChartModal";

const formatTypeLabel = (type, subType) => {
  if (!type && !subType) return "Other";
  const cleanType = (type || "").replace(/_/g, " ");
  if (subType && subType.toLowerCase().includes("strata") && !cleanType.toLowerCase().includes("strata")) {
    return `${cleanType} Strata`;
  }
  return cleanType;
};

const MattersByTypeBreakdown = ({
  rows = [],
  summary = null,
  selectedSite = null,
  selectedType = null,
  onSelectType,
  onClose,
}) => {
  const [showChartModal, setShowChartModal] = useState(false);

  // Group data by site and type
  const { siteGroups, aggregatedTypes, isMultiSite } = useMemo(() => {
    const isMulti = selectedSite === null;
    const sitesMap = {};
    const aggMap = {};

    (rows || []).forEach((r) => {
      const siteName = r.siteName || "Head Office";
      const typeLabel = formatTypeLabel(r.type, r.subType);

      if (!sitesMap[siteName]) {
        sitesMap[siteName] = {};
      }
      sitesMap[siteName][typeLabel] = (sitesMap[siteName][typeLabel] || 0) + 1;
      aggMap[typeLabel] = (aggMap[typeLabel] || 0) + 1;
    });

    const siteBreakdowns = Object.entries(sitesMap).map(([siteName, typesMap]) => {
      const items = Object.entries(typesMap)
        .map(([type, count]) => ({ type, value: count }))
        .sort((a, b) => b.value - a.value);
      const total = items.reduce((acc, curr) => acc + curr.value, 0);
      return { siteName, items, total };
    });

    return {
      siteGroups: siteBreakdowns,
      aggregatedTypes: aggMap,
      isMultiSite: isMulti && siteBreakdowns.length > 1,
    };
  }, [rows, selectedSite]);

  const singleSiteItems = useMemo(() => {
    return Object.entries(aggregatedTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [aggregatedTypes]);

  const singleSiteTotal = useMemo(() => {
    return singleSiteItems.reduce((acc, curr) => acc + curr.count, 0);
  }, [singleSiteItems]);

  const handleRowClick = (type) => {
    if (!onSelectType) return;
    if (selectedType === type) {
      onSelectType(null); // toggle off
    } else {
      onSelectType(type);
    }
  };

  return (
    <>
      <Card className="border border-primary border-opacity-25 shadow-sm mb-3">
        <CardBody className="p-3">
          {/* Header */}
          <div className="d-flex flex-wrap align-items-center justify-content-between pb-2 mb-3 border-bottom">
            <div className="d-flex align-items-center">
              <span className="badge bg-primary-subtle text-primary p-2 rounded me-2">
                <i className="ri-folder-shared-line fs-18"></i>
              </span>
              <div>
                <h6 className="mb-0 fw-semibold text-dark">
                  Matters by Type Breakdown
                  {isMultiSite ? " (Across All Offices)" : ""}
                </h6>
                <small className="text-muted">
                  Intake distribution by practice area & matter type
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
              <Button
                color="primary"
                size="sm"
                className="d-flex align-items-center px-3"
                onClick={() => setShowChartModal(true)}
              >
                <i className="ri-pie-chart-2-line me-1 fs-14"></i>
                View Charts
              </Button>
              {onClose && (
                <Button
                  color="light"
                  size="sm"
                  className="btn-icon"
                  onClick={onClose}
                  title="Close breakdown"
                >
                  <i className="ri-close-line fs-16"></i>
                </Button>
              )}
            </div>
          </div>

          {/* Breakdown Content */}
          {rows.length === 0 ? (
            <div className="text-center py-3 text-muted fs-13">
              No matters recorded for the selected period.
            </div>
          ) : !isMultiSite ? (
            /* Single Site View: Vertical List with Total */
            <div className="table-responsive" style={{ maxWidth: "520px" }}>
              <Table size="sm" hover className="align-middle mb-0">
                <thead className="table-light fs-12 text-muted">
                  <tr>
                    <th scope="col">Practice Area / Type</th>
                    <th scope="col" className="text-end" style={{ width: "100px" }}>
                      Matters
                    </th>
                  </tr>
                </thead>
                <tbody className="fs-13">
                  {singleSiteItems.map(({ type, count }) => {
                    const isSelected = selectedType === type;
                    return (
                      <tr
                        key={type}
                        onClick={() => handleRowClick(type)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: isSelected ? "rgba(64, 81, 137, 0.08)" : "transparent",
                          fontWeight: isSelected ? "600" : "normal",
                        }}
                        title={`Click to filter list by ${type}`}
                      >
                        <td className="text-dark py-2">
                          {type}
                          {isSelected && (
                            <Badge color="primary" className="ms-2 fs-10">Filtered</Badge>
                          )}
                        </td>
                        <td className="text-end fw-semibold text-dark py-2">{count}</td>
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="table-light fw-bold">
                    <td className="py-2 text-primary">Total</td>
                    <td className="text-end py-2 text-primary">{singleSiteTotal}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          ) : (
            /* Multi-Site View: Side-by-Side Columns Comparison matching Frank mockup */
            <div className="table-responsive">
              <div className="d-flex flex-nowrap gap-3 pb-2" style={{ overflowX: "auto" }}>
                {siteGroups.map((group) => (
                  <div
                    key={group.siteName}
                    className="border rounded bg-light bg-opacity-50 p-2 flex-grow-1"
                    style={{ minWidth: "260px", maxWidth: "340px" }}
                  >
                    <div className="fw-bold text-dark border-bottom pb-1 mb-2 fs-13 d-flex justify-content-between align-items-center">
                      <span>{group.siteName}</span>
                      <span className="badge bg-secondary-subtle text-secondary fs-11">
                        {group.total}
                      </span>
                    </div>
                    <Table size="sm" borderless className="mb-0 fs-12">
                      <tbody>
                        {group.items.map(({ type, value }) => {
                          const isSelected = selectedType === type;
                          return (
                            <tr
                              key={type}
                              onClick={() => handleRowClick(type)}
                              style={{
                                cursor: "pointer",
                                backgroundColor: isSelected ? "rgba(64, 81, 137, 0.12)" : "transparent",
                                borderRadius: "4px",
                              }}
                              title={`Click to filter list by ${type}`}
                            >
                              <td className="py-1 text-muted text-truncate" style={{ maxWidth: "180px" }}>
                                {type}
                              </td>
                              <td className="text-end fw-semibold text-dark py-1" style={{ width: "50px" }}>
                                {value}
                              </td>
                            </tr>
                          );
                        })}
                        {/* Site Total */}
                        <tr className="border-top fw-bold text-primary">
                          <td className="pt-2">Total</td>
                          <td className="text-end pt-2">{group.total}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Chart Popup Window */}
      <ReportChartModal
        isOpen={showChartModal}
        toggle={() => setShowChartModal(!showChartModal)}
        title="Matters Opened - Practice Area Analytics"
        reportType="MATTERS"
        siteBreakdowns={siteGroups}
        aggregatedTypes={aggregatedTypes}
        isMultiSite={isMultiSite}
      />
    </>
  );
};

export default MattersByTypeBreakdown;
