import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dropdown, DropdownMenu, DropdownToggle, Form, Input } from "reactstrap";
import { v1 as uuidv1 } from "uuid";
import { siteChange } from "../pages/Edge/apis";
import { removeAllStorage } from "../pages/Edge/utils/utilFunc";

//import images
import logoSm from "../assets/images/logo-sm.png";
import logoDark from "../assets/images/logo-dark.png";
import logoLight from "../assets/images/logo-light.png";

//import Components
import SearchOption from "../Components/Common/SearchOption";
import LanguageDropdown from "../Components/Common/LanguageDropdown";

import FullScreenDropdown from "../Components/Common/FullScreenDropdown";
import NotificationDropdown from "../Components/Common/NotificationDropdown";
import ProfileDropdown from "../Components/Common/ProfileDropdown";
import LightDark from "../Components/Common/LightDark";

import { changeSidebarVisibility } from "../slices/thunks";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

const Header = ({ onChangeLayoutMode, layoutModeType, headerClass }) => {
  const dispatch = useDispatch();

  // simple selector for a single primitive value — no need for createSelector
  const selectSidebarVisibility = (state) => state.Layout.sidebarVisibilitytype;
  const sidebarVisibilitytype = useSelector(selectSidebarVisibility);

  const [search, setSearch] = useState(false);
  const [siteList, setSiteList] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");

  const updateActiveSiteDisplay = () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
      const companyInfo = JSON.parse(localStorage.getItem("companyInfo") || "{}");

      const currentSiteId = userDetails.siteId;
      const rawSiteList = userDetails.siteInfoList || companyInfo.siteInfoList || [];

      const normalizedSiteList = rawSiteList.map((site) => ({
        siteId: site.siteId !== undefined ? site.siteId : site.id,
        siteName: site.siteName || site.name || "",
      }));

      setSiteList(normalizedSiteList);

      if (currentSiteId) {
        setSelectedSiteId(String(currentSiteId));
      } else if (normalizedSiteList.length > 0) {
        setSelectedSiteId(String(normalizedSiteList[0].siteId));
      }
    } catch (err) {
      console.error("Error reading active site info:", err);
    }
  };

  const handleHeaderSiteChange = async (e) => {
    const newSiteId = parseInt(e.target.value, 10);
    const targetSite = siteList.find((s) => s.siteId === newSiteId);
    if (!targetSite) return;

    try {
      await siteChange({
        requestId: uuidv1(),
        data: {
          siteId: targetSite.siteId,
          siteName: targetSite.siteName,
        },
      });
      removeAllStorage();
      window.location.href = "/home/matters";
    } catch (error) {
      console.error("Error changing site:", error);
    }
  };

  useEffect(() => {
    updateActiveSiteDisplay();

    const handleSiteChange = () => {
      updateActiveSiteDisplay();
    };

    window.addEventListener("siteChanged", handleSiteChange);
    window.addEventListener("storage", handleSiteChange);

    return () => {
      window.removeEventListener("siteChanged", handleSiteChange);
      window.removeEventListener("storage", handleSiteChange);
    };
  }, []);

  const toogleSearch = () => {
    setSearch(!search);
  };

  const toogleMenuBtn = () => {
    var windowSize = document.documentElement.clientWidth;
    dispatch(changeSidebarVisibility("show"));

    if (windowSize > 767)
      document.querySelector(".hamburger-icon").classList.toggle("open");

    //For collapse horizontal menu
    if (document.documentElement.getAttribute("data-layout") === "horizontal") {
      document.body.classList.contains("menu")
        ? document.body.classList.remove("menu")
        : document.body.classList.add("menu");
    }

    //For collapse vertical and semibox menu
    if (
      sidebarVisibilitytype === "show" &&
      (document.documentElement.getAttribute("data-layout") === "vertical" ||
        document.documentElement.getAttribute("data-layout") === "semibox")
    ) {
      if (windowSize < 1025 && windowSize > 767) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "sm"
          ? document.documentElement.setAttribute("data-sidebar-size", "")
          : document.documentElement.setAttribute("data-sidebar-size", "sm");
      } else if (windowSize > 1025) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "lg"
          ? document.documentElement.setAttribute("data-sidebar-size", "sm")
          : document.documentElement.setAttribute("data-sidebar-size", "lg");
      } else if (windowSize <= 767) {
        document.body.classList.add("vertical-sidebar-enable");
        document.documentElement.setAttribute("data-sidebar-size", "lg");
      }
    }

    //Two column menu
    if (document.documentElement.getAttribute("data-layout") === "twocolumn") {
      document.body.classList.contains("twocolumn-panel")
        ? document.body.classList.remove("twocolumn-panel")
        : document.body.classList.add("twocolumn-panel");
    }
  };

  return (
    <React.Fragment>
      <header id="page-topbar" className={headerClass}>
        <div className="layout-width">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box horizontal-logo">
                <Link to="/" className="logo logo-dark">
                  <span className="logo-sm">
                    <img src={logoSm} alt="" height="22" />
                  </span>
                  <span className="logo-lg">
                    <img src={logoDark} alt="" height="28" />
                  </span>
                </Link>

                <Link to="/" className="logo logo-light">
                  <span className="logo-sm">
                    <img src={logoSm} alt="" height="22" />
                  </span>
                  <span className="logo-lg">
                    <img src={logoLight} alt="" height="28" />
                  </span>
                </Link>
              </div>

              <button
                onClick={toogleMenuBtn}
                type="button"
                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                id="topnav-hamburger-icon"
              >
                <span className="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>

              <SearchOption />
            </div>

            <div className="d-flex align-items-center">
              <Dropdown
                isOpen={search}
                toggle={toogleSearch}
                className="d-md-none topbar-head-dropdown header-item"
              >
                <DropdownToggle
                  type="button"
                  tag="button"
                  className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                >
                  <i className="bx bx-search fs-22"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                  <Form className="p-3">
                    <div className="form-group m-0">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search ..."
                          aria-label="Recipient's username"
                        />
                        <button className="btn btn-primary" type="submit">
                          <i className="mdi mdi-magnify"></i>
                        </button>
                      </div>
                    </div>
                  </Form>
                </DropdownMenu>
              </Dropdown>

              {/* LanguageDropdown */}
              <LanguageDropdown />

              {/* FullScreenDropdown */}
              <FullScreenDropdown />

              {/* Dark/Light Mode set */}
              <LightDark
                layoutMode={layoutModeType}
                onChangeLayoutMode={onChangeLayoutMode}
              />

              {/* NotificationDropdown */}
              <NotificationDropdown />

              {/* Active Site Selection Dropdown */}
              {siteList && siteList.length > 0 ? (
                <div className="active-site-badge d-flex align-items-center me-3 px-2 py-1 bg-light border rounded">
                  <i className="ri-building-line text-primary me-1 fs-15" style={{ flexShrink: 0 }}></i>
                  <Input
                    type="select"
                    name="headerSiteSelect"
                    className="form-select form-select-sm border-0 bg-transparent fw-semibold text-primary fs-13 cursor-pointer py-0"
                    style={{
                      boxShadow: "none",
                      width: "auto",
                      minWidth: "120px",
                      paddingLeft: "4px",
                      paddingRight: "26px",
                      backgroundPosition: "right 6px center",
                    }}
                    value={selectedSiteId}
                    onChange={handleHeaderSiteChange}
                  >
                    {siteList.map((site) => (
                      <option key={site.siteId} value={site.siteId} style={{ color: "#333" }}>
                        {site.siteName}
                      </option>
                    ))}
                  </Input>
                </div>
              ) : null}

              {/* ProfileDropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

export default Header;
