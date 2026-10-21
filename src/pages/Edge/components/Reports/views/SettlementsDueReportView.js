import ReportComparison from "../components/ReportComparison";
import React, { useEffect, useState, useMemo } from "react";
import SettlementsDueMetrics from "../components/SettlementsDueMetrics";
import SettlementsDueFilterBar from "../components/SettlementsDueFilterBar";
import SettlementsDueTable from "../components/SettlementsDueTable";
import { postSettlementsDueReport } from "../../../apis";

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

const SettlementsDueReportView = ({
  selectedSite,
  dateRange,
  comparisonRange,
  staffList,
  refreshTrigger,
  onExportFiltersChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState({
    summary: null,
    rows: [],
  });

  const [filters, setFilters] = useState({
    settlementStatus: "ALL",
    type: null,
    actingPersonId: null,
    assistingPersonId: null,
  });

  const startDateStr = useMemo(
    () => (dateRange && dateRange[0] ? formatDate(dateRange[0]) : null),
    [dateRange]
  );
  const endDateStr = useMemo(
    () => (dateRange && dateRange[1] ? formatDate(dateRange[1]) : null),
    [dateRange]
  );

  // Keep the header's CSV export aligned with this report's current filters.
  useEffect(() => {
    onExportFiltersChange?.(filters);
  }, [filters, onExportFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      settlementStatus: "ALL",
      type: null,
      actingPersonId: null,
      assistingPersonId: null,
    });
  };

  useEffect(() => {
    let isCurrent = true;

    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const payload = {
          startDate: startDateStr,
          endDate: endDateStr,
          siteId: selectedSite || null,
          settlementStatus: filters.settlementStatus,
          type: filters.type,
          actingPersonId: filters.actingPersonId,
          assistingPersonId: filters.assistingPersonId,
        };

        const response = await postSettlementsDueReport(payload);
        if (isCurrent) {
          if (response?.data?.data) {
            setReportData(response.data.data);
          } else if (response?.data) {
            setReportData(response.data);
          } else if (response?.rows) {
            setReportData(response);
          }
        }
      } catch (error) {
        if (isCurrent) {
          // Clear stale selected-period values rather than compare against a failed refresh.
          setReportData({ summary: null, rows: [] });
          console.error("Failed to load Settlements Due report:", error);
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
    filters,
    refreshTrigger,
  ]);

  return (
    <div>
      {/* Metric Cards - Interactive & Selectable */}
      <SettlementsDueMetrics
        summary={reportData.summary}
        selectedStatus={filters.settlementStatus}
        onSelectStatus={(status) => handleFilterChange("settlementStatus", status)}
      />

      {/* Filter Bar */}
      <SettlementsDueFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        staffList={staffList}
      />

      {/* Comparison reuses this report's API, filters, and detail table. */}
      <ReportComparison
        type="settlements"
        dateRange={dateRange}
        comparisonRange={comparisonRange}
        fetchReport={postSettlementsDueReport}
        payload={{
          siteId: selectedSite || null,
          settlementStatus: filters.settlementStatus,
            type: filters.type,
            actingPersonId: filters.actingPersonId,
            assistingPersonId: filters.assistingPersonId,
        }}
        summary={reportData.summary}
        isPrimaryLoading={isLoading}
        refreshTrigger={refreshTrigger}
        renderDetails={(rows) => <SettlementsDueTable rows={rows} isLoading={false} />}
      />

      {/* Data Table */}
      <SettlementsDueTable rows={reportData.rows} isLoading={isLoading} />
    </div>
  );
};

export default SettlementsDueReportView;
