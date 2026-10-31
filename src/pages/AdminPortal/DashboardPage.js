import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";

import { listAdmins, listCompanies, listFunctions } from "./adminPortalApi";
import { ErrorAlert, Loading, useLoad } from "./shared";

const DashboardPage = () => {
  const companies = useLoad(listCompanies);
  const admins = useLoad(listAdmins);
  const functions = useLoad(listFunctions);

  const groups = useMemo(() => {
    const byGroup = {};
    (functions.data || []).forEach((f) => {
      (byGroup[f.group] = byGroup[f.group] || []).push(f);
    });
    return Object.entries(byGroup);
  }, [functions.data]);

  const totals = (companies.data || []).reduce(
    (t, c) => ({ sites: t.sites + c.siteCount, users: t.users + c.userCount }),
    { sites: 0, users: 0 }
  );

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>Dashboard</h1>
          <p>Everything a company administrator can do, and where this portal can do it for you.</p>
        </div>
        <Button color="primary" tag={Link} to="/admin-portal/companies/new">
          Create company
        </Button>
      </div>

      <ErrorAlert message={companies.error || admins.error || functions.error} />

      <div className="ap-stat" style={{ marginBottom: 18 }}>
        <div>
          <b>{companies.data ? companies.data.length : "—"}</b>
          <span>Companies</span>
        </div>
        <div>
          <b>{companies.data ? totals.sites : "—"}</b>
          <span>Sites</span>
        </div>
        <div>
          <b>{companies.data ? totals.users : "—"}</b>
          <span>Company users</span>
        </div>
        <div>
          <b>{admins.data ? admins.data.filter((a) => !a.locked).length : "—"}</b>
          <span>Active system admins</span>
        </div>
      </div>

      {functions.loading && !functions.data ? (
        <Loading />
      ) : (
        groups.map(([group, items]) => (
          <div className="ap-card" key={group}>
            <h2>{group}</h2>
            <div className="ap-grid">
              {items.map((f) => (
                <div className="ap-fn" key={f.name}>
                  <strong>{f.name}</strong>
                  <p>{f.description}</p>
                  {f.portalRoute ? (
                    <Link to={f.portalRoute}>Manage in this portal</Link>
                  ) : (
                    <span className="ap-hint">
                      {f.appRoute ? `Done by the company in the application (${f.appRoute})` : "Portal only"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardPage;
