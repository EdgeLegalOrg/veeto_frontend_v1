import React from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";

import { listCompanies } from "./adminPortalApi";
import { Pager, SearchBox, haystack, usePaging } from "./paging";
import { ErrorAlert, Loading, useLoad } from "./shared";

const matchesCompany = (c, needle) => haystack(c.companyName, c.city, c.state, c.id).includes(needle);

const CompaniesPage = () => {
  const { data, error, loading } = useLoad(listCompanies);
  const paging = usePaging(data, { filterFn: matchesCompany });

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
        <div className="ap-toolbar">
          <SearchBox {...paging.searchProps} placeholder="Search companies" />
        </div>
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
              {paging.pageRows.map((c) => (
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
              {data && paging.totalRecords === 0 && (
                <tr>
                  <td colSpan={6} className="ap-hint">
                    {data.length === 0 ? "No companies yet." : "No companies match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {data && <Pager {...paging.pagerProps} />}
      </div>
    </div>
  );
};

export default CompaniesPage;
