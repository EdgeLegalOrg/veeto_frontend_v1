import ReportComparison from "../components/ReportComparison";
import React, { useEffect, useState, useMemo } from "react";
import OutstandingInvoicesMetrics from "../components/OutstandingInvoicesMetrics";
import OutstandingInvoicesFilterBar from "../components/OutstandingInvoicesFilterBar";
import OutstandingInvoicesTable from "../components/OutstandingInvoicesTable";
import { postOutstandingInvoicesReport } from "../../../apis";

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

const OutstandingInvoicesReportView = ({
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

  const [filters, setFilters] = useState({
    agingBucket: "ALL",
    status: "ALL",
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      agingBucket: "ALL",
      status: "ALL",
      feeEarnerId: null,
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
          agingBucket: filters.agingBucket,
          status: filters.status,
          feeEarnerId: filters.feeEarnerId,
        };

        const response = await postOutstandingInvoicesReport(payload);
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
          console.error("Failed to load Outstanding Invoices report:", error);
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
      {/* 5 Aging Bucket Metric Cards - Interactive & Selectable */}
      <OutstandingInvoicesMetrics
        summary={reportData.summary}
        selectedBucket={filters.agingBucket}
        onSelectBucket={(bucket) => handleFilterChange("agingBucket", bucket)}
      />

      {/* Filter Bar */}
      <OutstandingInvoicesFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        staffList={staffList}
      />

      {/* Comparison reuses this report's API, filters, and detail table. */}
      <ReportComparison
        type="outstanding"
        dateRange={dateRange}
        comparisonRange={comparisonRange}
        fetchReport={postOutstandingInvoicesReport}
        payload={{
          siteId: selectedSite || null,
          agingBucket: filters.agingBucket,
            status: filters.status,
            feeEarnerId: filters.feeEarnerId,
        }}
        summary={reportData.summary}
        isPrimaryLoading={isLoading}
        refreshTrigger={refreshTrigger}
        renderDetails={(rows) => <OutstandingInvoicesTable rows={rows} isLoading={false} />}
      />

      {/* Data Table */}
      <OutstandingInvoicesTable rows={reportData.rows} isLoading={isLoading} />
    </div>
  );
};

export default OutstandingInvoicesReportView;
