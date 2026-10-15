import React, { useState, useMemo } from "react";
import { Card, CardBody, Table, Button, Badge } from "reactstrap";
import ReportChartModal from "./ReportChartModal";

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

const formatTypeLabel = (type) => {
  if (!type) return "General / Other";
  return type.replace(/_/g, " ");
};

const FeesByTypeBreakdown = ({
  rows = [],
  summary = null,
  selectedSite = null,
  selectedMatterType = null,
  onSelectMatterType,
  onClose,
}) => {
  const [showChartModal, setShowChartModal] = useState(false);

  // Group data by site and practice area
  const { siteGroups, aggregatedTypes, isMultiSite } = useMemo(() => {
    const isMulti = selectedSite === null;
    const sitesMap = {};
    const aggMap = {};

    (rows || []).forEach((r) => {
      const siteName = r.siteName || "Head Office";
      const rawType = r.matterType || "GENERAL";
      const label = formatTypeLabel(r.matterType);
      const netFee = Number(r.netFees) || 0;

      if (!sitesMap[siteName]) {
        sitesMap[siteName] = {};
      }
      if (!sitesMap[siteName][rawType]) {
        sitesMap[siteName][rawType] = { rawType, label, value: 0 };
      }
      sitesMap[siteName][rawType].value += netFee;

      if (!aggMap[rawType]) {
        aggMap[rawType] = { rawType, label, amount: 0 };
      }
      aggMap[rawType].amount += netFee;
    });

    const siteBreakdowns = Object.entries(sitesMap).map(([siteName, mapObj]) => {
      const items = Object.values(mapObj).sort((a, b) => b.value - a.value);
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
    return Object.values(aggregatedTypes).sort((a, b) => b.amount - a.amount);
  }, [aggregatedTypes]);

  const singleSiteTotal = useMemo(() => {
    return singleSiteItems.reduce((acc, curr) => acc + curr.amount, 0);
  }, [singleSiteItems]);

  const chartAggregatedMap = useMemo(() => {
    const m = {};
    Object.values(aggregatedTypes).forEach((item) => {
      m[item.label] = item.amount;
    });
    return m;
  }, [aggregatedTypes]);

  const handleRowClick = (rawType) => {
    if (!onSelectMatterType) return;
    if (selectedMatterType === rawType) {
      onSelectMatterType(null); // toggle off
    } else {
      onSelectMatterType(rawType);
    }
  };

  return (
    <>
      <Card className="border border-success border-opacity-25 shadow-sm mb-3">
        <CardBody className="p-3">
          {/* Header */}
          <div className="d-flex flex-wrap align-items-center justify-content-between pb-2 mb-3 border-bottom">
            <div className="d-flex align-items-center">
              <span className="badge bg-success-subtle text-success p-2 rounded me-2">
                <i className="ri-money-dollar-circle-line fs-18"></i>
              </span>
              <div>
                <h6 className="mb-0 fw-semibold text-dark">
                  Fees Billed by Practice Area / Type Breakdown (Excl. GST)
                  {isMultiSite ? " (Across All Offices)" : ""}
                </h6>
                <small className="text-muted">
                  Professional legal fee revenue distribution (exclusive of GST, disbursements & sundries)
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
              <Button
                color="success"
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
              No billed fees recorded for the selected period.
            </div>
          ) : !isMultiSite ? (
            /* Single Site View: Vertical List with Currency Total */
            <div className="table-responsive" style={{ maxWidth: "560px" }}>
              <Table size="sm" hover className="align-middle mb-0">
                <thead className="table-light fs-12 text-muted">
                  <tr>
                    <th scope="col">Practice Area / Type</th>
                    <th scope="col" className="text-end" style={{ width: "160px" }}>
                      Fees (Excl. GST)
                    </th>
                  </tr>
                </thead>
                <tbody className="fs-13">
                  {singleSiteItems.map(({ rawType, label, amount }) => {
                    const isSelected = selectedMatterType === rawType;
                    return (
                      <tr
                        key={rawType}
                        onClick={() => handleRowClick(rawType)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: isSelected ? "rgba(10, 179, 156, 0.08)" : "transparent",
                          fontWeight: isSelected ? "600" : "normal",
                        }}
                        title={`Click to filter list by ${label}`}
                      >
                        <td className="text-dark py-2">
                          {label}
                          {isSelected && (
                            <Badge color="success" className="ms-2 fs-10">Filtered</Badge>
                          )}
                        </td>
                        <td className="text-end fw-semibold text-dark py-2">
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="table-light fw-bold">
                    <td className="py-2 text-success">Total</td>
                    <td className="text-end py-2 text-success">
                      {formatCurrency(singleSiteTotal)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          ) : (
            /* Multi-Site View: Side-by-Side Columns Comparison */
            <div className="table-responsive">
              <div className="d-flex flex-nowrap gap-3 pb-2" style={{ overflowX: "auto" }}>
                {siteGroups.map((group) => (
                  <div
                    key={group.siteName}
                    className="border rounded bg-light bg-opacity-50 p-2 flex-grow-1"
                    style={{ minWidth: "280px", maxWidth: "360px" }}
                  >
                    <div className="fw-bold text-dark border-bottom pb-1 mb-2 fs-13 d-flex justify-content-between align-items-center">
                      <span>{group.siteName}</span>
                      <span className="badge bg-success-subtle text-success fs-11">
                        {formatCurrency(group.total)}
                      </span>
                    </div>
                    <Table size="sm" borderless className="mb-0 fs-12">
                      <tbody>
                        {group.items.map(({ rawType, label, value }) => {
                          const isSelected = selectedMatterType === rawType;
                          return (
                            <tr
                              key={rawType}
                              onClick={() => handleRowClick(rawType)}
                              style={{
                                cursor: "pointer",
                                backgroundColor: isSelected ? "rgba(10, 179, 156, 0.12)" : "transparent",
                                borderRadius: "4px",
                              }}
                              title={`Click to filter list by ${label}`}
                            >
                              <td className="py-1 text-muted text-truncate" style={{ maxWidth: "180px" }}>
                                {label}
                              </td>
                              <td className="text-end fw-semibold text-dark py-1" style={{ width: "90px" }}>
                                {formatCurrency(value)}
                              </td>
                            </tr>
                          );
                        })}
                        {/* Site Total */}
                        <tr className="border-top fw-bold text-success">
                          <td className="pt-2">Total</td>
                          <td className="text-end pt-2">{formatCurrency(group.total)}</td>
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
        title="Fees Billed - Practice Area Revenue Analytics"
        reportType="FEES"
        siteBreakdowns={siteGroups}
        aggregatedTypes={chartAggregatedMap}
        isMultiSite={isMultiSite}
      />
    </>
  );
};

export default React.memo(FeesByTypeBreakdown);
