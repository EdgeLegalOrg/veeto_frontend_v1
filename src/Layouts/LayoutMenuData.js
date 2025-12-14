import {
  VIEWACCOUNTINGTAB,
  VIEWADMINTAB,
  VIEWXEROADMINTAB,
} from "pages/Edge/utils/RightConstants";
import { checkHasPermission } from "pages/Edge/utils/utilFunc";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
  const history = useNavigate();
  //state data
  const [isDashboard, setIsDashboard] = useState(false);
  const [isAccount, setIsAccount] = useState(false);

  const [isApps, setIsApps] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isPages, setIsPages] = useState(false);
  const [isBaseUi, setIsBaseUi] = useState(false);
  const [isAdvanceUi, setIsAdvanceUi] = useState(false);
  const [isForms, setIsForms] = useState(false);
  const [isTables, setIsTables] = useState(false);
  const [isCharts, setIsCharts] = useState(false);
  const [isIcons, setIsIcons] = useState(false);
  const [isMaps, setIsMaps] = useState(false);
  const [isMultiLevel, setIsMultiLevel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecklist, setChecklist] = useState(false);

  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  function updateIconSidebar(e) {
    if (e?.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        let id = item.getAttribute("subitems");
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Dashboard") {
      setIsDashboard(false);
    }
    if (iscurrentState !== "Apps") {
      setIsApps(false);
    }
    if (iscurrentState !== "Admin") {
      setIsAdmin(false);
    }
    if (iscurrentState !== "Auth") {
      setIsAuth(false);
    }
    if (iscurrentState !== "Pages") {
      setIsPages(false);
    }
    if (iscurrentState !== "BaseUi") {
      setIsBaseUi(false);
    }
    if (iscurrentState !== "AdvanceUi") {
      setIsAdvanceUi(false);
    }
    if (iscurrentState !== "Forms") {
      setIsForms(false);
    }
    if (iscurrentState !== "Tables") {
      setIsTables(false);
    }
    if (iscurrentState !== "Charts") {
      setIsCharts(false);
    }
    if (iscurrentState !== "Icons") {
      setIsIcons(false);
    }
    if (iscurrentState !== "Maps") {
      setIsMaps(false);
    }
    if (iscurrentState !== "MuliLevel") {
      setIsMultiLevel(false);
    }
    if (iscurrentState === "Widgets") {
      history("/widgets");
      document.body.classList.add("twocolumn-panel");
    }
    if (iscurrentState === "Matters") {
      history("/Matters");
      document.body.classList.add("twocolumn-panel");
    }
    if (iscurrentState === "Documents") {
      history("/Documents");
      document.body.classList.add("twocolumn-panel");
    }
    if (iscurrentState === "Contacts") {
      history("/Contacts");
      document.body.classList.add("twocolumn-panel");
    }
    if (iscurrentState === "SafeCustody") {
      history("/SafeCustody");
      document.body.classList.add("twocolumn-panel");
    }
    if (iscurrentState === "Property") {
      history("/Property");
      document.body.classList.add("twocolumn-panel");
    }
  }, [
    history,
    iscurrentState,
    isDashboard,
    isApps,
    isAuth,
    isPages,
    isBaseUi,
    isAdvanceUi,
    isForms,
    isTables,
    isCharts,
    isIcons,
    isMaps,
    isMultiLevel,
    isAccount,
    isAdmin,
  ]);

  const closeNavWithSubItems = () => {
    setIsAccount(false);
    setChecklist(false);
    setIsAdmin(false);
  };

  const menuItems = [
    {
      label: "Edge Menu",
      isHeader: true,
    },
    {
      id: "Matters",
      label: "Matters",
      icon: "ri-stack-line",
      link: "/Matters",
      show: true,
      click: function (e) {
        e.preventDefault();
        // closeNavWithSubItems();
        setIscurrentState("Matters");
      },
    },
    {
      id: "Documents",
      label: "Documents",
      icon: " ri-file-copy-2-line",
      link: "/Documents",
      show: true,
      click: function (e) {
        e.preventDefault();
        // closeNavWithSubItems();
        setIscurrentState("Documents");
      },
    },
    {
      id: "Contacts",
      label: "Contacts",
      icon: "ri-contacts-book-line",
      link: "/Contacts",
      show: true,
      click: function (e) {
        e.preventDefault();
        // closeNavWithSubItems();
        setIscurrentState("Contacts");
      },
    },
    {
      id: "SafeCustody",
      label: "Safe Custody",
      icon: " ri-safe-line",
      link: "/safe-custody",
      show: true,
      click: function (e) {
        e.preventDefault();
        // closeNavWithSubItems();
        setIscurrentState("SafeCustody");
      },
    },
    {
      id: "Property",
      label: "Property",
      icon: "ri-building-line",
      link: "/property",
      show: true,
      click: function (e) {
        e.preventDefault();
        // closeNavWithSubItems();
        setIscurrentState("Property");
      },
    },
    {
      id: "account",
      label: "Accounting",
      icon: " ri-account-box-line",
      link: "/#",
      show: checkHasPermission(VIEWACCOUNTINGTAB),
      stateVariables: isAccount,
      click: function (e) {
        e.preventDefault();
        setIsAccount(!isAccount);
        setIscurrentState("Account");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "depositSlip",
          label: "Deposit Slip",
          link: "/account-deposit-slip",
          show: true,
          parentId: "account",
        },
        {
          id: "invoiceList",
          label: "Invoice List",
          link: "/account-invoice-list",
          show: true,
          parentId: "account",
        },
        {
          id: "invoiceTemplate",
          label: "Invoice Template",
          link: "/account-invoice-template",
          show: true,
          parentId: "account",
        },
        {
          id: "payments",
          label: "Payments",
          link: "/account-payment-list",
          show: true,
          parentId: "account",
        },
        {
          id: "serviceLines",
          label: "Service Lines",
          link: "/account-service-lines",
          show: true,
          parentId: "account",
        },
        {
          id: "xeroAdmin",
          label: "Xero Admin",
          link: "/account-xero-admin",
          show: checkHasPermission(VIEWXEROADMINTAB),
          parentId: "account",
        },
      ],
    },
    {
      id: "admin",
      label: "Admin",
      icon: "ri-apps-2-line",
      link: "/#",
      show: checkHasPermission(VIEWADMINTAB),
      click: function (e) {
        e.preventDefault();
        setIsAdmin(!isAdmin);
        setIscurrentState("Admin");
        updateIconSidebar(e);
      },
      stateVariables: isAdmin,
      subItems: [
        {
          id: "checklist",
          label: "Checklist",
          link: "/#",
          show: true,
          parentId: "admin",
          click: function (e) {
            e.preventDefault();
            setChecklist(!isChecklist);
          },
          stateVariables: isChecklist,
          isChildItem: true,
          childItems: [
            {
              id: 1,
              label: "Task List",
              link: "/admin-checklist-taskList",
              show: true,
              parentId: "admin",
            },
            {
              id: 1,
              label: "Check List",
              link: "/admin-checklist-checkList",
              show: true,
              parentId: "admin",
            },
            {
              id: 1,
              label: "Link To Matter",
              link: "/admin-checklist-linkToMatter",
              show: true,
              parentId: "admin",
            },
          ],
        },
        {
          id: "companyInfo",
          label: "Company Details",
          link: "/admin-company-info",
          show: true,
          parentId: "admin",
        },
        {
          id: "letterHeads",
          label: "Letterheads",
          link: "/admin-letterheads",
          show: true,
          parentId: "admin",
        },
        {
          id: "manageRoles",
          label: "Manage Roles",
          link: "/admin-manage-roles",
          show: true,
          parentId: "admin",
        },
        {
          id: "manageUsers",
          label: "Manage Users",
          link: "/admin-manage-users",
          show: true,
          parentId: "admin",
        },
        {
          id: "manageStaff",
          label: "Manage Staff",
          link: "/admin-manage-staff",
          show: true,
          parentId: "admin",
        },
        {
          id: "Precedents",
          label: "Precedents",
          link: "/admin-precedents",
          show: true,
          parentId: "admin",
        },
        {
          id: "siteInfo",
          label: "Site Info",
          link: "/admin-site-info",
          show: true,
          parentId: "admin",
        },
        {
          id: "systemNumerals",
          label: "System Numerals",
          link: "/admin-system-numerals",
          show: true,
          parentId: "admin",
        },
      ],
    },
  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
