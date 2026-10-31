import React from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import "./portal.css";
import { PORTAL_BASE, clearSession, readSession } from "./adminPortalApi";
import AdminPortalLogin from "./AdminPortalLogin";
import AccountPage from "./AccountPage";
import DashboardPage from "./DashboardPage";
import CompaniesPage from "./CompaniesPage";
import CreateCompanyPage from "./CreateCompanyPage";
import CompanyDetailPage from "./CompanyDetailPage";
import AdminsPage from "./AdminsPage";
import MatterTypesPage from "./MatterTypesPage";
import AuditPage from "./AuditPage";

/**
 * Everything under /admin-portal. Mounted as one route from Routes/index.js and
 * deliberately outside AuthProtected and the application layout: those belong
 * to the application's own session (the userJWT cookie), which has nothing to
 * do with a system admin.
 */
const Shell = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = readSession();

  if (!session) {
    return <Navigate to={`${PORTAL_BASE}/login`} replace />;
  }

  // A new or reset account may do nothing but choose a password. The server
  // enforces this too; this just takes them to the one page that works.
  const accountPath = `${PORTAL_BASE}/account`;
  if (session.mustChangePassword && location.pathname !== accountPath) {
    return <Navigate to={accountPath} replace />;
  }

  const signOut = () => {
    clearSession();
    navigate(`${PORTAL_BASE}/login`, { replace: true });
  };

  return (
    <div className="ap-root">
      <header className="ap-topbar">
        <div className="ap-brand">
          Veeto <small>System Admin Portal</small>
        </div>
        {!session.mustChangePassword && (
          <nav className="ap-nav">
            <NavLink to={PORTAL_BASE} end>
              Dashboard
            </NavLink>
            <NavLink to={`${PORTAL_BASE}/companies`}>Companies</NavLink>
            <NavLink to={`${PORTAL_BASE}/matter-types`}>Matter Types</NavLink>
            <NavLink to={`${PORTAL_BASE}/admins`}>System Admins</NavLink>
            <NavLink to={`${PORTAL_BASE}/audit`}>Audit Log</NavLink>
          </nav>
        )}
        <div className="ap-user">
          <span>{session.admin && session.admin.displayName}</span>
          <NavLink to={accountPath}>Account</NavLink>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <div className="ap-notice">
        You are signed in as a platform administrator. What you change here affects every company.
      </div>
      <main className="ap-main">{children}</main>
    </div>
  );
};

const AdminPortalApp = () => {
  document.title = "System Admin Portal | Veeto";
  return (
    <Routes>
      <Route path="login" element={<AdminPortalLogin />} />
      <Route
        path=""
        element={
          <Shell>
            <DashboardPage />
          </Shell>
        }
      />
      <Route
        path="account"
        element={
          <Shell>
            <AccountPage />
          </Shell>
        }
      />
      <Route
        path="companies"
        element={
          <Shell>
            <CompaniesPage />
          </Shell>
        }
      />
      <Route
        path="companies/new"
        element={
          <Shell>
            <CreateCompanyPage />
          </Shell>
        }
      />
      <Route
        path="companies/:companyId"
        element={
          <Shell>
            <CompanyDetailPage />
          </Shell>
        }
      />
      <Route
        path="matter-types"
        element={
          <Shell>
            <MatterTypesPage />
          </Shell>
        }
      />
      <Route
        path="admins"
        element={
          <Shell>
            <AdminsPage />
          </Shell>
        }
      />
      <Route
        path="audit"
        element={
          <Shell>
            <AuditPage />
          </Shell>
        }
      />
      <Route path="*" element={<Navigate to={PORTAL_BASE} replace />} />
    </Routes>
  );
};

export default AdminPortalApp;
