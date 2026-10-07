import React, { useEffect, useState } from "react";
import OutstandingInvoicesMetrics from "../components/OutstandingInvoicesMetrics";
import OutstandingInvoicesFilterBar from "../components/OutstandingInvoicesFilterBar";
import OutstandingInvoicesTable from "../components/OutstandingInvoicesTable";
import { postOutstandingInvoicesReport } from "../../../apis";

const OutstandingInvoicesReportView = ({
  selectedSite,
  dateRange,
  staffList,
  refreshTrigger,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState({
    summary: null,
    rows: [],
  });

  const [filters, setFilters] = useState({
    agingBucket: "ALL",
    status: "ALL",
    feeEarnerId: null,
  });

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
        const formatDate = (d) => {
          if (!d) return null;
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const payload = {
          startDate: dateRange && dateRange[0] ? formatDate(dateRange[0]) : null,
          endDate: dateRange && dateRange[1] ? formatDate(dateRange[1]) : null,
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
  }, [dateRange, selectedSite, filters, refreshTrigger]);

  return (
    <div>
      {/* 5 Aging Bucket Metric Cards */}
      <OutstandingInvoicesMetrics summary={reportData.summary} />

      {/* Filter Bar */}
      <OutstandingInvoicesFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        staffList={staffList}
      />

      {/* Data Table */}
      <OutstandingInvoicesTable rows={reportData.rows} isLoading={isLoading} />
    </div>
  );
};

export default OutstandingInvoicesReportView;
