import React, { useEffect, useState } from "react";
import FeesBilledMetrics from "../components/FeesBilledMetrics";
import FeesBilledFilterBar from "../components/FeesBilledFilterBar";
import FeesBilledTable from "../components/FeesBilledTable";
import { postFeesBilledReport } from "../../../apis";

const FeesBilledReportView = ({
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
    status: "ALL",
    matterType: null,
    feeEarnerId: null,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "ALL",
      matterType: null,
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
          status: filters.status,
          matterType: filters.matterType,
          feeEarnerId: filters.feeEarnerId,
        };

        const response = await postFeesBilledReport(payload);
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
  }, [dateRange, selectedSite, filters, refreshTrigger]);

  return (
    <div>
      {/* Metric Cards */}
      <FeesBilledMetrics summary={reportData.summary} />

      {/* Filter Bar */}
      <FeesBilledFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        staffList={staffList}
      />

      {/* Data Table */}
      <FeesBilledTable rows={reportData.rows} isLoading={isLoading} />
    </div>
  );
};

export default FeesBilledReportView;
