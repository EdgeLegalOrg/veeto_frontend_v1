import React, { useState, useEffect } from "react";
import { Container, Nav, NavItem, NavLink, TabContent, TabPane, Card, CardBody } from "reactstrap";
import classnames from "classnames";
import ReportHeader from "./components/ReportHeader";
import MattersOpenedReportView from "./views/MattersOpenedReportView";
import SettlementsDueReportView from "./views/SettlementsDueReportView";
import FeesBilledReportView from "./views/FeesBilledReportView";
import {
  postExportMattersOpenedCsv,
  postExportSettlementsDueCsv,
  postExportFeesBilledCsv,
  getSiteInfo,
  getCompanyInfo,
  allStaffMember,
} from "../../apis";

const getDatePresetRange = (preset) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch (preset) {
    case "THIS_MONTH":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "LAST_MONTH":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "THIS_QUARTER": {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      break;
    }
    case "FY": {
      // Australian Financial Year: 1 July to 30 June
      const isPostJune = now.getMonth() >= 6;
      const fyStartYear = isPostJune ? now.getFullYear() : now.getFullYear() - 1;
      start = new Date(fyStartYear, 6, 1);
      end = new Date(fyStartYear + 1, 5, 30);
      break;
    }
    case "LAST_FY": {
      const isPostJune = now.getMonth() >= 6;
      const fyStartYear = (isPostJune ? now.getFullYear() : now.getFullYear() - 1) - 1;
      start = new Date(fyStartYear, 6, 1);
      end = new Date(fyStartYear + 1, 5, 30);
      break;
    }
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  return [start, end];
};

const ReportDashboard = () => {
  const [activeTab, setActiveTab] = useState("matters-opened");
  const [selectedSite, setSelectedSite] = useState(null);
  const [activePreset, setActivePreset] = useState("THIS_MONTH");
  const [dateRange, setDateRange] = useState(getDatePresetRange("THIS_MONTH"));
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

  const handlePresetSelect = (preset) => {
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
              onClick={() => setActiveTab("matters-opened")}
              style={{ cursor: "pointer" }}
            >
              <i className="ri-folder-open-line me-1 align-bottom"></i> 1. Matters Opened
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "settlements-due" }, "fw-semibold")}
              onClick={() => setActiveTab("settlements-due")}
              style={{ cursor: "pointer" }}
            >
              <i className="ri-calendar-event-line me-1 align-bottom"></i> 2. Settlements Due
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "fees-billed" }, "fw-semibold")}
              onClick={() => setActiveTab("fees-billed")}
              style={{ cursor: "pointer" }}
            >
              <i className="ri-money-dollar-circle-line me-1 align-bottom"></i> 3. Fees Billed
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "outstanding-invoices" }, "fw-semibold text-muted")}
              onClick={() => setActiveTab("outstanding-invoices")}
              style={{ cursor: "pointer" }}
            >
              <i className="ri-alarm-warning-line me-1 align-bottom"></i> 4. Outstanding Invoices
            </NavLink>
          </NavItem>
        </Nav>

        {/* Tab Contents */}
        <TabContent activeTab={activeTab}>
          <TabPane tabId="matters-opened">
            <MattersOpenedReportView
              selectedSite={selectedSite}
              dateRange={dateRange}
              staffList={staffList}
              refreshTrigger={refreshTrigger}
            />
          </TabPane>
          <TabPane tabId="settlements-due">
            <SettlementsDueReportView
              selectedSite={selectedSite}
              dateRange={dateRange}
              staffList={staffList}
              refreshTrigger={refreshTrigger}
            />
          </TabPane>
          <TabPane tabId="fees-billed">
            <FeesBilledReportView
              selectedSite={selectedSite}
              dateRange={dateRange}
              staffList={staffList}
              refreshTrigger={refreshTrigger}
            />
          </TabPane>
          <TabPane tabId="outstanding-invoices">
            <Card className="border-0 shadow-sm text-center py-5">
              <CardBody>
                <i className="ri-time-line fs-48 text-muted mb-3 d-block"></i>
                <h5>Outstanding Invoices Report</h5>
                <p className="text-muted">Aged receivables reporting view will be available in Part 4.</p>
              </CardBody>
            </Card>
          </TabPane>
        </TabContent>
      </Container>
    </div>
  );
};

export default ReportDashboard;
