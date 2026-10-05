import React, { useEffect, useState, useCallback } from "react";
import SettlementsDueMetrics from "../components/SettlementsDueMetrics";
import SettlementsDueFilterBar from "../components/SettlementsDueFilterBar";
import SettlementsDueTable from "../components/SettlementsDueTable";
import { postSettlementsDueReport } from "../../../apis";

const SettlementsDueReportView = ({
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
    settlementStatus: "ALL",
    subType: null,
    actingPersonId: null,
    assistingPersonId: null,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      settlementStatus: "ALL",
      subType: null,
      actingPersonId: null,
      assistingPersonId: null,
    });
  };

  const fetchReport = useCallback(async () => {
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
        settlementStatus: filters.settlementStatus,
        subType: filters.subType,
        actingPersonId: filters.actingPersonId,
        assistingPersonId: filters.assistingPersonId,
      };

      const response = await postSettlementsDueReport(payload);
      if (response && response.data && response.data.data) {
        setReportData(response.data.data);
      } else if (response && response.data) {
        setReportData(response.data);
      } else if (response && response.rows) {
        setReportData(response);
      }
    } catch (error) {
      console.error("Failed to load Settlements Due report:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, selectedSite, filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport, refreshTrigger]);

  return (
    <div>
      {/* Metric Cards */}
      <SettlementsDueMetrics summary={reportData.summary} />

      {/* Filter Bar */}
      <SettlementsDueFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        staffList={staffList}
      />

      {/* Data Table */}
      <SettlementsDueTable rows={reportData.rows} isLoading={isLoading} />
    </div>
  );
};

export default SettlementsDueReportView;
