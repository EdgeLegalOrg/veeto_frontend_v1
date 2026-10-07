import React, { useState, useEffect, useMemo } from "react";
import { Container, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import { useLocation, useNavigate } from "react-router-dom";

import ReportHeader from "./components/ReportHeader";
import MattersOpenedReportView from "./views/MattersOpenedReportView";
import SettlementsDueReportView from "./views/SettlementsDueReportView";
import FeesBilledReportView from "./views/FeesBilledReportView";
import OutstandingInvoicesReportView from "./views/OutstandingInvoicesReportView";

import {
  postExportMattersOpenedCsv,
  postExportSettlementsDueCsv,
  postExportFeesBilledCsv,
  postExportOutstandingInvoicesCsv,
  getSiteInfo,
  getCompanyInfo,
  allStaffMember,
} from "../../apis";

// Date preset helper calculating standard fiscal / calendar periods
const getDatePresetRange = (preset) => {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

  switch (preset) {
    case "THIS_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [startOfDay(start), endOfDay(end)];
    }
    case "LAST_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return [startOfDay(start), endOfDay(end)];
    }
    case "THIS_QUARTER": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), qMonth, 1);
      const end = new Date(now.getFullYear(), qMonth + 3, 0);
      return [startOfDay(start), endOfDay(end)];
    }
    case "FINANCIAL_YEAR": {
      // Australian Financial Year: 1 July to 30 June
      const currentYear = now.getFullYear();
      const fyStartYear = now.getMonth() >= 6 ? currentYear : currentYear - 1;
      const start = new Date(fyStartYear, 6, 1);
      const end = new Date(fyStartYear + 1, 5, 30);
      return [startOfDay(start), endOfDay(end)];
    }
    case "LAST_30_DAYS": {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return [startOfDay(start), endOfDay(now)];
    }
    case "ALL_TIME":
    default:
      return [null, null];
  }
};

const resolveTabFromPath = (pathname) => {
  if (pathname.includes("settlements-due")) return "settlements-due";
  if (pathname.includes("fees-billed")) return "fees-billed";
  if (pathname.includes("outstanding-invoices")) return "outstanding-invoices";
  return "matters-opened";
};

const ReportDashboard = () => {
  document.title = "Reports & Analytics | Veeto Legal";

  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => resolveTabFromPath(location.pathname), [location.pathname]);

  const [selectedSite, setSelectedSite] = useState(null);
  const [dateRange, setDateRange] = useState(getDatePresetRange("FINANCIAL_YEAR"));
  const [activePreset, setActivePreset] = useState("FINANCIAL_YEAR");

  const [sites, setSites] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load sites and staff metadata for dropdowns
  useEffect(() => {
    // 1. Immediate initialization from localStorage
    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
      const compInfo = JSON.parse(localStorage.getItem("companyInfo") || "{}");
      const localSites = userDetails.siteInfoList || compInfo.siteInfoList || [];
      if (Array.isArray(localSites) && localSites.length > 0) {
        setSites(localSites);
      }
    } catch (e) {
      console.error("Error reading sites from storage:", e);
    }

    // 2. Fetch fresh sites and staff metadata
    const loadMetadata = async () => {
      try {
        // Fetch company info for full site list
        try {
          const compRes = await getCompanyInfo();
          if (compRes?.data?.data?.siteInfoList && Array.isArray(compRes.data.data.siteInfoList)) {
            setSites(compRes.data.data.siteInfoList);
          } else if (compRes?.data?.siteInfoList && Array.isArray(compRes.data.siteInfoList)) {
            setSites(compRes.data.siteInfoList);
          }
        } catch (compErr) {
          console.warn("Could not fetch company sites, falling back to siteinfo:", compErr);
          const sitesRes = await getSiteInfo();
          if (sitesRes?.data?.data) {
            setSites(Array.isArray(sitesRes.data.data) ? sitesRes.data.data : [sitesRes.data.data]);
          }
        }

        // Fetch staff list
        const staffRes = await allStaffMember({ staffActive: true });
        let staffArr = [];
        if (staffRes && staffRes.data) {
          if (Array.isArray(staffRes.data.data?.staffMemberList)) {
            staffArr = staffRes.data.data.staffMemberList;
          } else if (Array.isArray(staffRes.data.data)) {
            staffArr = staffRes.data.data;
          } else if (Array.isArray(staffRes.data)) {
            staffArr = staffRes.data;
          }
        }
        setStaffList(staffArr);
      } catch (err) {
        console.error("Error loading report metadata:", err);
      }
    };
    loadMetadata();
  }, []);

  const handleTabClick = (tabId) => {
    if (tabId === activeTab) return;
    navigate(`/reports/${tabId}`);
  };

  const handlePresetSelect = (preset) => {
    if (activePreset === preset && preset !== "CUSTOM") return;
    setActivePreset(preset);
    if (preset !== "CUSTOM") {
      setDateRange(getDatePresetRange(preset));
    }
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
    setActivePreset("CUSTOM");
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
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
      };

      let response;
      let filenamePrefix = "report";

      if (activeTab === "matters-opened") {
        response = await postExportMattersOpenedCsv(payload);
        filenamePrefix = "matters_opened";
      } else if (activeTab === "settlements-due") {
        response = await postExportSettlementsDueCsv(payload);
        filenamePrefix = "settlements_due";
      } else if (activeTab === "fees-billed") {
        response = await postExportFeesBilledCsv(payload);
        filenamePrefix = "fees_billed";
      } else if (activeTab === "outstanding-invoices") {
        response = await postExportOutstandingInvoicesCsv(payload);
        filenamePrefix = "outstanding_invoices";
      }

      if (response && response.data) {
        const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "_");
        link.setAttribute("download", `${filenamePrefix}_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export CSV failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        {/* Header Controls */}
        <ReportHeader
          title="Reports & Analytics"
          sites={sites}
          selectedSite={selectedSite}
          onSiteChange={setSelectedSite}
          dateRange={dateRange}
          onDateChange={handleDateChange}
          activePreset={activePreset}
          onPresetSelect={handlePresetSelect}
          onExportCsv={handleExportCsv}
          isExporting={isExporting}
        />

        {/* Tab Navigation */}
        <Nav tabs className="nav-tabs-custom nav-success mb-3">
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "matters-opened" }, "fw-semibold")}
              onClick={() => handleTabClick("matters-opened")}
              style={{ cursor: "pointer" }}
            >
              <i className="ri-folder-open-line me-1 align-bottom"></i> 1. Matters Opened
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "settlements-due" }, "fw-semibold")}
              onClick={() => handleTabClick("settlements-due")}
              style={{ cursor: "pointer" }}
            >
              <i className="ri-calendar-event-line me-1 align-bottom"></i> 2. Settlements Due
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "fees-billed" }, "fw-semibold")}
              onClick={() => handleTabClick("fees-billed")}
              style={{ cursor: "pointer" }}
            >
              <i className="ri-money-dollar-circle-line me-1 align-bottom"></i> 3. Fees Billed
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "outstanding-invoices" }, "fw-semibold")}
              onClick={() => handleTabClick("outstanding-invoices")}
              style={{ cursor: "pointer" }}
            >
              <i className="ri-alarm-warning-line me-1 align-bottom"></i> 4. Outstanding Invoices
            </NavLink>
          </NavItem>
        </Nav>

        {/* Isolated Active Report View - Mounts and loads ONLY the active report */}
        <div className="report-content-wrapper">
          {activeTab === "matters-opened" && (
            <MattersOpenedReportView
              selectedSite={selectedSite}
              dateRange={dateRange}
              staffList={staffList}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === "settlements-due" && (
            <SettlementsDueReportView
              selectedSite={selectedSite}
              dateRange={dateRange}
              staffList={staffList}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === "fees-billed" && (
            <FeesBilledReportView
              selectedSite={selectedSite}
              dateRange={dateRange}
              staffList={staffList}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === "outstanding-invoices" && (
            <OutstandingInvoicesReportView
              selectedSite={selectedSite}
              dateRange={dateRange}
              staffList={staffList}
              refreshTrigger={refreshTrigger}
            />
          )}
        </div>
      </Container>
    </div>
  );
};

export default ReportDashboard;
