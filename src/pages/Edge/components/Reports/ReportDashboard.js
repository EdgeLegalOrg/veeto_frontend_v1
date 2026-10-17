import React, { useState, useEffect, useMemo } from "react";
import { Container, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import { useLocation, useNavigate } from "react-router-dom";

import { checkHasPermission } from "../../utils/utilFunc";
import {
  VIEWFEESBILLEDREPORT,
  VIEWMATTERSOPENEDREPORT,
  VIEWOUTSTANDINGINVOICESREPORT,
  VIEWSETTLEMENTSDUEREPORT,
} from "../../utils/RightConstants";
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

const ALL_REPORT_TABS = [
  {
    id: "matters-opened",
    label: "Matters Opened",
    icon: "ri-folder-open-line",
    right: VIEWMATTERSOPENEDREPORT,
    component: MattersOpenedReportView,
    exportFn: postExportMattersOpenedCsv,
    exportPrefix: "matters_opened",
  },
  {
    id: "settlements-due",
    label: "Settlements Due",
    icon: "ri-calendar-event-line",
    right: VIEWSETTLEMENTSDUEREPORT,
    component: SettlementsDueReportView,
    exportFn: postExportSettlementsDueCsv,
    exportPrefix: "settlements_due",
  },
  {
    id: "fees-billed",
    label: "Fees Billed",
    icon: "ri-money-dollar-circle-line",
    right: VIEWFEESBILLEDREPORT,
    component: FeesBilledReportView,
    exportFn: postExportFeesBilledCsv,
    exportPrefix: "fees_billed",
  },
  {
    id: "outstanding-invoices",
    label: "Outstanding Invoices",
    icon: "ri-alarm-warning-line",
    right: VIEWOUTSTANDINGINVOICESREPORT,
    component: OutstandingInvoicesReportView,
    exportFn: postExportOutstandingInvoicesCsv,
    exportPrefix: "outstanding_invoices",
  },
];

const resolveTabFromPath = (pathname, permittedTabs) => {
  let matchedId = null;
  if (pathname.includes("settlements-due")) matchedId = "settlements-due";
  else if (pathname.includes("fees-billed")) matchedId = "fees-billed";
  else if (pathname.includes("outstanding-invoices")) matchedId = "outstanding-invoices";
  else if (pathname.includes("matters-opened")) matchedId = "matters-opened";

  if (matchedId && permittedTabs.some((t) => t.id === matchedId)) {
    return matchedId;
  }
  return permittedTabs.length > 0 ? permittedTabs[0].id : null;
};

const ReportDashboard = () => {
  document.title = "Reports & Analytics | Veeto Legal";

  const location = useLocation();
  const navigate = useNavigate();

  const permittedTabs = useMemo(() => {
    return ALL_REPORT_TABS.filter((tab) => checkHasPermission(tab.right));
  }, []);

  const activeTab = useMemo(
    () => resolveTabFromPath(location.pathname, permittedTabs),
    [location.pathname, permittedTabs]
  );

  const canAccessAllSites = checkHasPermission("AccessAllSites");
  const [selectedSite, setSelectedSite] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("userDetails") || "{}");
      return checkHasPermission("AccessAllSites") ? null : (u.siteId || null);
    } catch {
      return null;
    }
  });
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

    // 2. Refresh from network asynchronously
    const loadMetadata = async () => {
      try {
        // If user cannot access all sites, only show assigned sites
        if (!canAccessAllSites) {
          const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
          const userSites = userDetails.siteInfoList || [];
          if (userSites.length > 0) {
            setSites(userSites);
          } else if (userDetails.siteId) {
            setSites([{ id: userDetails.siteId, siteName: userDetails.siteName || "Current Office" }]);
          }
        } else {
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

      const currentTab = permittedTabs.find((t) => t.id === activeTab);
      if (!currentTab || !currentTab.exportFn) return;

      const response = await currentTab.exportFn(payload);
      const filenamePrefix = currentTab.exportPrefix || "report";

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
        {permittedTabs.length > 0 && (
          <Nav tabs className="nav-tabs-custom nav-success mb-3">
            {permittedTabs.map((tab, idx) => (
              <NavItem key={tab.id}>
                <NavLink
                  className={classnames({ active: activeTab === tab.id }, "fw-semibold")}
                  onClick={() => handleTabClick(tab.id)}
                  style={{ cursor: "pointer" }}
                >
                  <i className={`${tab.icon} me-1 align-bottom`}></i> {`${idx + 1}. ${tab.label}`}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
        )}

        {/* Isolated Active Report View - Mounts and loads ONLY the active report */}
        <div className="report-content-wrapper">
          {permittedTabs.length === 0 ? (
            <div className="card shadow-sm border-0 mt-3">
              <div className="card-body text-center py-5">
                <i className="ri-lock-line fs-48 text-warning mb-3 d-block"></i>
                <h5 className="text-dark">Access Restricted</h5>
                <p className="text-muted mb-0">
                  You do not have permission to view any reports. Please contact your system administrator to assign reporting access.
                </p>
              </div>
            </div>
          ) : (
            permittedTabs.map((tab) => {
              if (tab.id !== activeTab) return null;
              const ViewComponent = tab.component;
              return (
                <ViewComponent
                  key={tab.id}
                  selectedSite={selectedSite}
                  dateRange={dateRange}
                  staffList={staffList}
                  refreshTrigger={refreshTrigger}
                />
              );
            })
          )}
        </div>
      </Container>
    </div>
  );
};

export default ReportDashboard;
