import React, { useEffect } from "react";
import { Input } from "reactstrap";

/**
 * Chooses one site of the company. The first site is chosen for you, so a company with a single
 * office never has to pick anything.
 */
const SitePicker = ({ sites, siteId, onChange }) => {
  useEffect(() => {
    if (!siteId && sites.length > 0) onChange(sites[0].id);
  }, [siteId, sites, onChange]);

  return (
    <div className="ap-search" style={{ marginBottom: 12 }}>
      <label htmlFor="site-picker" className="ap-hint" style={{ margin: 0 }}>
        Site
      </label>
      <Input
        id="site-picker"
        bsSize="sm"
        type="select"
        style={{ width: 260 }}
        value={siteId || ""}
        onChange={(e) => onChange(Number(e.target.value))}
      >
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

export default SitePicker;
