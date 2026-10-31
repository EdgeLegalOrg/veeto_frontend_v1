import React from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";

import { listCompanies } from "./adminPortalApi";
import { ErrorAlert, Loading, useLoad } from "./shared";

const CompaniesPage = () => {
  const { data, error, loading } = useLoad(listCompanies);

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>Companies</h1>
          <p>Each company's sites, roles and users are kept separate from every other company's.</p>
        </div>
        <Button color="primary" tag={Link} to="/admin-portal/companies/new">
          Create company
        </Button>
      </div>
      <ErrorAlert message={error} />
      <div className="ap-card">
        {loading && !data ? (
          <Loading />
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Location</th>
                <th>Sites</th>
                <th>Roles</th>
                <th>Users</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(data || []).map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/admin-portal/companies/${c.id}`}>{c.companyName}</Link>
                    <div className="ap-hint">Company {c.id}</div>
                  </td>
                  <td>{[c.city, c.state].filter(Boolean).join(", ") || "—"}</td>
                  <td>
                    {c.activeSiteCount}
                    {c.siteCount !== c.activeSiteCount ? ` of ${c.siteCount}` : ""}
                  </td>
                  <td>{c.roleCount}</td>
                  <td>{c.userCount}</td>
                  <td className="ap-actions">
                    <Button size="sm" color="light" tag={Link} to={`/admin-portal/companies/${c.id}`}>
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
              {data && data.length === 0 && (
                <tr>
                  <td colSpan={6} className="ap-hint">
                    No companies yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
