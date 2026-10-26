import React from "react";
import { Input } from "reactstrap";

/** Shared checkbox layout for explicit sites and exactly one role in Add and Edit User. */
const UserAccessFields = ({ siteList, roleList, siteIds, roleId, onSitesChange, onRoleChange,
  submitted = false, disabled = false, requiresRoleSelection = false }) => {
  const selectedRole = roleList.find((role) => Number(role.value) === Number(roleId));
  const hasActiveSite = siteList.some((site) => siteIds.includes(Number(site.value)));

  /** Changes one explicit site without letting the role override erase saved selections. */
  const toggleSite = (id) => {
    onSitesChange(siteIds.includes(id) ? siteIds.filter((siteId) => siteId !== id) : [...siteIds, id]);
  };

  return (
    <div className="user-access-fields">
      <fieldset disabled={disabled}>
        <legend>Sites</legend>
        <div className="user-access-grid">
          {siteList.map((site) => (
            <label className="user-access-choice" key={site.value}>
              <Input type="checkbox" checked={siteIds.includes(Number(site.value))}
                onChange={() => toggleSite(Number(site.value))} />
              <span>{site.display}</span>
            </label>
          ))}
        </div>
        {!siteList.length && <p className="text-muted">No active sites available.</p>}
        {selectedRole?.accessAllSites && (
          <p className="text-muted mt-2 mb-0">This role has Access All Sites. All active sites are accessible regardless of these selections.</p>
        )}
        {submitted && !selectedRole?.accessAllSites && !hasActiveSite && (
          <p className="text-danger mt-2 mb-0" role="alert">Select at least one site unless the role has Access All Sites.</p>
        )}
      </fieldset>
      <fieldset disabled={disabled}>
        <legend>Role</legend>
        <p className="text-muted mb-2">Select one role. It applies across all accessible sites.</p>
        {requiresRoleSelection && !roleId && (
          <p className="text-warning" role="alert">This user has different existing site roles. Choose the single role to apply when saving.</p>
        )}
        <div className="user-access-grid">
          {roleList.map((role) => (
            <label className="user-access-choice" key={role.value}>
              <Input type="checkbox" checked={Number(roleId) === Number(role.value)}
                onChange={(event) => onRoleChange(event.target.checked ? Number(role.value) : "")} />
              <span>{role.display}</span>
            </label>
          ))}
        </div>
        {submitted && !selectedRole && <p className="text-danger mt-2 mb-0" role="alert">Select a role.</p>}
      </fieldset>
    </div>
  );
};

export default UserAccessFields;
