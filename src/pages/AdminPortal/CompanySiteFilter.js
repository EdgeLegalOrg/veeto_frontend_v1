import React from "react";
import { Input } from "reactstrap";

import { getCompany, listCompanies } from "./adminPortalApi";
import { useLoad } from "./shared";

/**
 * Company, then a site of that company. Choosing a company narrows the site list to its sites;
 * changing the company clears the site. Either can be left on "All".
 */
const CompanySiteFilter = ({ companyId, siteId, onChange }) => {
  const companies = useLoad(listCompanies);
  const company = useLoad(() => (companyId ? getCompany(companyId) : Promise.resolve(null)), [companyId]);
  const sites = (company.data && company.data.sites) || [];

  return (
    <div className="ap-search" style={{ flexWrap: "wrap" }}>
      <label htmlFor="filter-company" className="ap-hint" style={{ margin: 0 }}>
        Company
      </label>
      <Input
        id="filter-company"
        bsSize="sm"
        type="select"
        style={{ width: 220 }}
        value={companyId || ""}
        onChange={(e) => onChange({ companyId: e.target.value ? Number(e.target.value) : null, siteId: null })}
      >
        <option value="">All companies</option>
        {(companies.data || []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.companyName}
          </option>
        ))}
      </Input>
      <label htmlFor="filter-site" className="ap-hint" style={{ margin: 0 }}>
        Site
      </label>
      <Input
        id="filter-site"
        bsSize="sm"
        type="select"
        style={{ width: 200 }}
        value={siteId || ""}
        disabled={!companyId}
        title={companyId ? "" : "Choose a company to filter by site"}
        onChange={(e) => onChange({ companyId, siteId: e.target.value ? Number(e.target.value) : null })}
      >
        <option value="">{companyId ? "All sites" : "Choose a company first"}</option>
        {sites.map((s) => (
          <option key={s.id} value={s.id}>
            {s.siteName}
            {s.active ? "" : " (inactive)"}
          </option>
        ))}
      </Input>
    </div>
  );
};

export default CompanySiteFilter;
