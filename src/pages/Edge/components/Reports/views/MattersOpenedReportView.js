import ReportComparison from "../components/ReportComparison";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import MattersOpenedMetrics from "../components/MattersOpenedMetrics";
import MattersByTypeBreakdown from "../components/MattersByTypeBreakdown";
import MattersOpenedFilterBar from "../components/MattersOpenedFilterBar";
import MattersOpenedTable from "../components/MattersOpenedTable";
import { postMattersOpenedReport } from "../../../apis";

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

const MattersOpenedReportView = ({
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

  const [filters, setFilters] = useState({
    status: null,
    type: null,
    isStrata: null,
    subType: null,
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

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // If setting type explicitly from filter bar, clear isStrata flag
      ...(key === "type" ? { isStrata: null } : {}),
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      status: null,
      type: null,
      isStrata: null,
      subType: null,
      actingPersonId: null,
      assistingPersonId: null,
    });
  }, []);

  const handleSelectType = useCallback((type, isStrata) => {
    setFilters((prev) => ({
      ...prev,
      type: type || null,
      isStrata: isStrata !== undefined ? isStrata : null,
      subType: null,
    }));
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
          actingPersonId: filters.actingPersonId,
          assistingPersonId: filters.assistingPersonId,
        };

        const response = await postMattersOpenedReport(payload);
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
          console.error("Failed to load Matters Opened report:", error);
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
    filters.actingPersonId,
    filters.assistingPersonId,
    refreshTrigger,
  ]);

  // Client-side filtering of rows for table view based on status, type, isStrata, and subType
  const filterComparisonRows = useCallback((rows) => {
    return (rows || []).filter((r) => {
      if (filters.status && r.status !== filters.status) {
        return false;
      }
      if (filters.type && r.type !== filters.type) {
        return false;
      }
      if (filters.isStrata !== null && filters.isStrata !== undefined) {
        const itemIsStrata = Boolean(r.subType && r.subType.toLowerCase().includes("strata"));
        if (filters.isStrata && !itemIsStrata) return false;
        if (!filters.isStrata && itemIsStrata) return false;
      }
      if (filters.subType && r.subType !== filters.subType) {
        return false;
      }
      return true;
    });
  }, [filters.status, filters.type, filters.isStrata, filters.subType]);
  const filteredRows = useMemo(() => filterComparisonRows(reportData.rows), [reportData.rows, filterComparisonRows]);

  return (
    <div>
      {/* Metric Cards - Interactive & Selectable */}
      <MattersOpenedMetrics
        summary={reportData.summary}
        selectedStatus={filters.status}
        selectedType={filters.type}
        onSelectFilter={handleFilterChange}
        showBreakdown={showBreakdown}
        onToggleBreakdown={handleToggleBreakdown}
      />

      {/* Matters by Type Breakdown (Memoized component) */}
      {showBreakdown && (
        <MattersByTypeBreakdown
          rows={reportData.rows}
          summary={reportData.summary}
          selectedSite={selectedSite}
          selectedType={filters.type}
          selectedIsStrata={filters.isStrata}
          onSelectType={handleSelectType}
          onClose={handleCloseBreakdown}
        />
      )}

      {/* Filter Bar */}
      <MattersOpenedFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        staffList={staffList}
      />

      {/* Comparison reuses this report's API, filters, and detail table. */}
      <ReportComparison
        type="matters"
        dateRange={dateRange}
        comparisonRange={comparisonRange}
        fetchReport={postMattersOpenedReport}
        payload={{
          siteId: selectedSite || null,
          actingPersonId: filters.actingPersonId,
            assistingPersonId: filters.assistingPersonId,
        }}
        summary={reportData.summary}
        isPrimaryLoading={isLoading}
        refreshTrigger={refreshTrigger}
        renderDetails={(rows) => <MattersOpenedTable rows={filterComparisonRows(rows)} isLoading={false} />}
      />

      {/* Data Table */}
      <MattersOpenedTable rows={filteredRows} isLoading={isLoading} />
    </div>
  );
};

export default MattersOpenedReportView;
