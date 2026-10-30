import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import { createCompany, listCompanies, listRights } from "./adminPortalApi";
import {
  CompanyFieldsForm,
  EMPTY_COMPANY,
  EMPTY_SITE,
  RightsPicker,
  SiteFieldsForm,
  siteForRequest,
  siteProblem,
} from "./forms";
import { ErrorAlert, Loading, SecretModal, useLoad } from "./shared";

const USER_NAME = /^[A-Za-z0-9._@+-]{3,100}$/;
const DEFAULT_ROLE = "Administrator";

const newRole = () => ({ key: Math.random().toString(36).slice(2), roleName: "", description: "", rightIds: [] });

const CreateCompanyPage = () => {
  const navigate = useNavigate();
  const rights = useLoad(listRights);
  const companies = useLoad(listCompanies);

  const [company, setCompany] = useState(EMPTY_COMPANY);
  const [sites, setSites] = useState([{ ...EMPTY_SITE }]);
  const [roleMode, setRoleMode] = useState("default"); // default | custom
  const [roles, setRoles] = useState([newRole()]);
  const [copyFrom, setCopyFrom] = useState("");
  const [admin, setAdmin] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    temporaryPassword: "",
    roleName: "",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);

  const roleNames = roleMode === "default" ? [DEFAULT_ROLE] : roles.map((r) => r.roleName.trim()).filter(Boolean);

  const updateSite = (index, value) => setSites(sites.map((s, i) => (i === index ? value : s)));
  const updateRole = (index, patch) => setRoles(roles.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  /** The first thing wrong with the form, in the order it is filled in, or null. */
  const problem = () => {
    if (!company.companyName.trim()) return "Give the company a name.";
    const names = new Set();
    for (const site of sites) {
      const p = siteProblem(site);
      if (p) return p;
      const key = site.siteName.trim().toLowerCase();
      if (names.has(key)) return `Two sites are called ${site.siteName}.`;
      names.add(key);
    }
    if (roleMode === "custom") {
      if (roles.some((r) => !r.roleName.trim())) return "Each role needs a name.";
      const seen = new Set();
      for (const r of roles) {
        const key = r.roleName.trim().toLowerCase();
        if (seen.has(key)) return `Two roles are called ${r.roleName}.`;
        seen.add(key);
      }
    }
    if (!USER_NAME.test(admin.userName.trim())) {
      return "The first administrator's username needs 3 to 100 letters, numbers or . _ @ + -.";
    }
    if (!admin.firstName.trim() || !admin.lastName.trim()) return "Give the first administrator's first and last name.";
    if (admin.temporaryPassword && (admin.temporaryPassword.length < 8 || admin.temporaryPassword.length > 20)) {
      return "A temporary password must be 8 to 20 characters. Leave it blank to generate one.";
    }
    if (roleNames.length === 0) return "Add at least one role for the first administrator.";
    const adminRole = roleMode === "custom" ? roles.find((r) => r.roleName.trim() === (admin.roleName || roleNames[0])) : null;
    if (adminRole && adminRole.rightIds.length === 0) {
      return `The role ${adminRole.roleName} has no rights, so the first administrator could not do anything.`;
    }
    return null;
  };

  const submit = async () => {
    const invalid = problem();
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await createCompany({
        company,
        sites: sites.map((s, i) => siteForRequest({ ...s, active: i === 0 ? true : s.active })),
        roles:
          roleMode === "default"
            ? // A null right list means "every right" to the server.
              [{ roleName: DEFAULT_ROLE, description: "Full access for the company's administrators", rightIds: null }]
            : roles.map((r) => ({ roleName: r.roleName, description: r.description, rightIds: r.rightIds })),
        copyRolesFromCompanyId: copyFrom ? Number(copyFrom) : null,
        firstAdmin: { ...admin, roleName: admin.roleName || roleNames[0] || null },
      });
      toast.success("Company created");
      setCreated(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (rights.loading && !rights.data) return <Loading />;

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>Create company</h1>
          <p>Everything is created together, or none of it is.</p>
        </div>
      </div>

      <ErrorAlert message={error || rights.error} onClose={() => setError(null)} />

      <div className="ap-card">
        <h2>1. Company</h2>
        <CompanyFieldsForm value={company} onChange={setCompany} />
      </div>

      <div className="ap-card">
        <h2>2. Sites</h2>
        <p className="ap-hint">
          A site is one office. Records, staff and numbering are kept per site. The first site is where the
          administrator is based.
        </p>
        {sites.map((site, index) => (
          <div className="ap-block" key={index}>
            <div className="ap-block-head">
              <span>{index === 0 ? "First site" : `Site ${index + 1}`}</span>
              {index > 0 && (
                <Button size="sm" color="outline-danger" onClick={() => setSites(sites.filter((_, i) => i !== index))}>
                  Remove
                </Button>
              )}
            </div>
            <SiteFieldsForm value={site} onChange={(v) => updateSite(index, v)} activeLocked={index === 0} />
          </div>
        ))}
        <Button color="light" onClick={() => setSites([...sites, { ...EMPTY_SITE }])}>
          Add another site
        </Button>
      </div>

      <div className="ap-card">
        <h2>3. Roles</h2>
        <FormGroup check>
          <Input type="radio" id="ap-roles-default" checked={roleMode === "default"} onChange={() => setRoleMode("default")} />
          <Label check for="ap-roles-default">
            Create one <strong>{DEFAULT_ROLE}</strong> role with every right. The company can add more roles itself.
          </Label>
        </FormGroup>
        <FormGroup check className="mb-3">
          <Input type="radio" id="ap-roles-custom" checked={roleMode === "custom"} onChange={() => setRoleMode("custom")} />
          <Label check for="ap-roles-custom">
            Define the roles now
          </Label>
        </FormGroup>

        {roleMode === "custom" &&
          roles.map((role, index) => (
            <div className="ap-block" key={role.key}>
              <div className="ap-block-head">
                <span>Role {index + 1}</span>
                {roles.length > 1 && (
                  <Button size="sm" color="outline-danger" onClick={() => setRoles(roles.filter((_, i) => i !== index))}>
                    Remove
                  </Button>
                )}
              </div>
              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label>Role name *</Label>
                    <Input value={role.roleName} onChange={(e) => updateRole(index, { roleName: e.target.value })} />
                  </FormGroup>
                </Col>
                <Col md={8}>
                  <FormGroup>
                    <Label>Description</Label>
                    <Input value={role.description} onChange={(e) => updateRole(index, { description: e.target.value })} />
                  </FormGroup>
                </Col>
              </Row>
              <RightsPicker
                rights={rights.data}
                selected={role.rightIds}
                onChange={(ids) => updateRole(index, { rightIds: ids })}
              />
            </div>
          ))}
        {roleMode === "custom" && (
          <Button color="light" className="mb-3" onClick={() => setRoles([...roles, newRole()])}>
            Add another role
          </Button>
        )}

        <FormGroup style={{ maxWidth: 420 }}>
          <Label>Also copy the roles of an existing company (optional)</Label>
          <Input type="select" value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)}>
            <option value="">Don't copy any</option>
            {(companies.data || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </Input>
          <div className="ap-hint">Copies each role and its rights. A role with the same name as one above is skipped.</div>
        </FormGroup>
      </div>

      <div className="ap-card">
        <h2>4. First administrator</h2>
        <p className="ap-hint">
          They are created as a staff member at the first site, with access to every site you listed. They must choose
          their own password at first sign-in.
        </p>
        <Row>
          <Col md={4}>
            <FormGroup>
              <Label>Username *</Label>
              <Input
                value={admin.userName}
                autoComplete="off"
                onChange={(e) => setAdmin({ ...admin, userName: e.target.value })}
              />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label>First name *</Label>
              <Input value={admin.firstName} onChange={(e) => setAdmin({ ...admin, firstName: e.target.value })} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label>Last name *</Label>
              <Input value={admin.lastName} onChange={(e) => setAdmin({ ...admin, lastName: e.target.value })} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label>Email</Label>
              <Input type="email" value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label>Role</Label>
              <Input type="select" value={admin.roleName} onChange={(e) => setAdmin({ ...admin, roleName: e.target.value })}>
                <option value="">{roleNames[0] ? `${roleNames[0]} (first role)` : "First role"}</option>
                {roleNames.slice(1).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label>Temporary password (optional)</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={admin.temporaryPassword}
                onChange={(e) => setAdmin({ ...admin, temporaryPassword: e.target.value })}
              />
              <div className="ap-hint">8 to 20 characters. Blank generates one.</div>
            </FormGroup>
          </Col>
        </Row>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 32 }}>
        <Button color="light" onClick={() => navigate("/admin-portal/companies")} disabled={busy}>
          Cancel
        </Button>
        <Button color="primary" onClick={submit} disabled={busy}>
          {busy ? <Spinner size="sm" /> : "Create company"}
        </Button>
      </div>

      <SecretModal
        title="Company created"
        intro={`Sign-in for ${admin.userName.trim()} is ready. Give them this temporary password.`}
        secret={created && created.temporaryPassword}
        onClose={() => navigate(`/admin-portal/companies/${created.companyId}`)}
      />
    </div>
  );
};

export default CreateCompanyPage;
