import ReportComparison from "../components/ReportComparison";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import FeesBilledMetrics from "../components/FeesBilledMetrics";
import FeesByTypeBreakdown from "../components/FeesByTypeBreakdown";
import FeesBilledFilterBar from "../components/FeesBilledFilterBar";
import FeesBilledTable from "../components/FeesBilledTable";
import { postFeesBilledReport } from "../../../apis";

const formatDate = (d) => {
  if (!d) return null;
  if (typeof d === "string") return d.slice(0, 10);
  if (typeof d.getFullYear === "function") {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return null;
};

const FeesBilledReportView = ({
  selectedSite,
  dateRange,
  comparisonRange,
  staffList,
  refreshTrigger,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState({
    summary: null,
    rows: [],
  });
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedCard, setSelectedCard] = useState("total");

  const [filters, setFilters] = useState({
    status: "ALL",
    matterType: null,
    feeEarnerId: null,
  });

  const startDateStr = useMemo(
    () => (dateRange && dateRange[0] ? formatDate(dateRange[0]) : null),
    [dateRange]
  );
  const endDateStr = useMemo(
    () => (dateRange && dateRange[1] ? formatDate(dateRange[1]) : null),
    [dateRange]
  );

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      status: "ALL",
      matterType: null,
      feeEarnerId: null,
    });
    setSelectedCard("total");
  }, []);

  const handleSelectMatterType = useCallback((type) => {
    setFilters((prev) => ({ ...prev, matterType: type }));
  }, []);

  const handleToggleBreakdown = useCallback(() => {
    setShowBreakdown((prev) => !prev);
  }, []);

  const handleCloseBreakdown = useCallback(() => {
    setShowBreakdown(false);
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const payload = {
          startDate: startDateStr,
          endDate: endDateStr,
          siteId: selectedSite || null,
          feeEarnerId: filters.feeEarnerId,
        };

        const response = await postFeesBilledReport(payload);
        if (isCurrent) {
          let incomingData = { summary: null, rows: [] };
          if (response?.data?.data) {
            incomingData = response.data.data;
          } else if (response?.data) {
            incomingData = response.data;
          } else if (response?.rows) {
            incomingData = response;
          }
          setReportData(incomingData);
        }
      } catch (error) {
        if (isCurrent) {
          // Clear stale selected-period values rather than compare against a failed refresh.
          setReportData({ summary: null, rows: [] });
          console.error("Failed to load Fees Billed report:", error);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      isCurrent = false;
    };
  }, [
    startDateStr,
    endDateStr,
    selectedSite,
    filters.feeEarnerId,
    refreshTrigger,
  ]);

  // Client-side filtering of rows for table view based on status and matterType
  const filterComparisonRows = useCallback((rows) => {
    return (rows || []).filter((r) => {
      if (
        filters.status &&
        filters.status !== "ALL" &&
        r.invoiceStatus !== filters.status
      ) {
        return false;
      }
      if (filters.matterType && r.matterType !== filters.matterType) {
        return false;
      }
      return true;
    });
  }, [filters.status, filters.matterType]);
  const filteredRows = useMemo(() => filterComparisonRows(reportData.rows), [reportData.rows, filterComparisonRows]);

  return (
    <div>
      {/* Metric Cards - Selectable with high contrast & toggleable breakdown */}
      <FeesBilledMetrics
        summary={reportData.summary}
        selectedCard={selectedCard}
        onSelectCard={setSelectedCard}
        showBreakdown={showBreakdown}
        onToggleBreakdown={handleToggleBreakdown}
      />

      {/* Fees by Practice Area / Type Breakdown (Memoized component) */}
      {showBreakdown && (
        <FeesByTypeBreakdown
          rows={reportData.rows}
          summary={reportData.summary}
          selectedSite={selectedSite}
          selectedMatterType={filters.matterType}
          onSelectMatterType={handleSelectMatterType}
          onClose={handleCloseBreakdown}
        />
      )}

      {/* Filter Bar */}
      <FeesBilledFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        staffList={staffList}
      />

      {/* Comparison reuses this report's API, filters, and detail table. */}
      <ReportComparison
        type="fees"
        dateRange={dateRange}
        comparisonRange={comparisonRange}
        fetchReport={postFeesBilledReport}
        payload={{
          siteId: selectedSite || null,
          feeEarnerId: filters.feeEarnerId,
        }}
        summary={reportData.summary}
        isPrimaryLoading={isLoading}
        refreshTrigger={refreshTrigger}
        renderDetails={(rows) => <FeesBilledTable rows={filterComparisonRows(rows)} isLoading={false} />}
      />

      {/* Data Table */}
      <FeesBilledTable rows={filteredRows} isLoading={isLoading} />
    </div>
  );
};

export default FeesBilledReportView;
