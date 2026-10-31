import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import {
  createCompanyUser,
  createRole,
  createSite,
  deleteRole,
  getCompany,
  listRights,
  resetCompanyUserPassword,
  updateCompany,
  updateCompanyUser,
  updateRole,
  updateSite,
} from "./adminPortalApi";
import {
  CompanyFieldsForm,
  EMPTY_SITE,
  RightsPicker,
  SiteFieldsForm,
  siteForRequest,
  siteFromView,
  siteProblem,
} from "./forms";
import { ConfirmModal, ErrorAlert, Loading, SecretModal, StatusBadge, useLoad } from "./shared";

const TABS = ["Details", "Sites", "Roles", "Users"];

const CompanyDetailPage = () => {
  const { companyId } = useParams();
  const { data, error, loading, reload } = useLoad(() => getCompany(companyId), [companyId]);
  const rights = useLoad(listRights);
  const [tab, setTab] = useState("Details");
  const [secret, setSecret] = useState(null);

  if (loading && !data) return <Loading />;
  if (!data) {
    return (
      <div>
        <ErrorAlert message={error || "That company could not be found."} />
        <Link to="/admin-portal/companies">Back to companies</Link>
      </div>
    );
  }

  const common = { data, companyId, reload, setSecret };

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>{data.company.companyName}</h1>
          <p>
            Company {data.id} · {data.sites.length} site(s) · {data.roles.length} role(s) · {data.users.length} user(s)
          </p>
        </div>
        <Link to="/admin-portal/companies">All companies</Link>
      </div>

      <ErrorAlert message={error} />

      <div className="ap-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Details" && <DetailsTab {...common} />}
      {tab === "Sites" && <SitesTab {...common} />}
      {tab === "Roles" && <RolesTab {...common} rights={rights.data} />}
      {tab === "Users" && <UsersTab {...common} />}

      <SecretModal
        title={secret && secret.title}
        intro={secret && secret.intro}
        secret={secret && secret.value}
        onClose={() => setSecret(null)}
      />
    </div>
  );
};

/** Runs an action, reporting success or the server's reason for refusing. */
const useAction = (reload) => {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const run = async (action, success) => {
    setBusy(true);
    setProblem(null);
    try {
      const result = await action();
      if (success) toast.success(success);
      await reload();
      return { ok: true, result };
    } catch (e) {
      setProblem(e.message);
      return { ok: false };
    } finally {
      setBusy(false);
    }
  };
  return { busy, problem, setProblem, run };
};

// ------------------------------------------------------------------ details

const DetailsTab = ({ data, companyId, reload }) => {
  const [company, setCompany] = useState(data.company);
  const { busy, problem, setProblem, run } = useAction(reload);

  return (
    <div className="ap-card">
      <h2>Company details</h2>
      <ErrorAlert message={problem} onClose={() => setProblem(null)} />
      <CompanyFieldsForm value={company} onChange={setCompany} />
      <Button
        color="primary"
        disabled={busy || !company.companyName.trim()}
        onClick={() => run(() => updateCompany(companyId, company), "Company saved")}
      >
        {busy ? <Spinner size="sm" /> : "Save"}
      </Button>
    </div>
  );
};

// -------------------------------------------------------------------- sites

const SitesTab = ({ data, companyId, reload }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_SITE);
  const { busy, problem, setProblem, run } = useAction(reload);

  const open = (site) => {
    setForm(site ? siteFromView(site) : { ...EMPTY_SITE });
    setProblem(null);
    setEditing(site || {});
  };

  const save = async (event) => {
    event.preventDefault();
    const invalid = siteProblem(form);
    if (invalid) {
      setProblem(invalid);
      return;
    }
    const body = siteForRequest(form);
    const outcome = await run(
      () => (editing.id ? updateSite(companyId, editing.id, body) : createSite(companyId, body)),
      editing.id ? "Site saved" : "Site added"
    );
    if (outcome.ok) setEditing(null);
  };

  return (
    <div className="ap-card">
      <div className="ap-title" style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Sites</h2>
        <Button color="primary" size="sm" onClick={() => open(null)}>
          Add site
        </Button>
      </div>
      <table className="ap-table">
        <thead>
          <tr>
            <th>Site</th>
            <th>Code</th>
            <th>Time zone</th>
            <th>GST</th>
            <th>Users</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.sites.map((s) => (
            <tr key={s.id}>
              <td>
                {s.siteName}
                <div className="ap-hint">Site {s.id}</div>
              </td>
              <td>{s.siteCode || "—"}</td>
              <td>{s.timeZone || "—"}</td>
              <td>{s.gstRate === null || s.gstRate === undefined ? <span className="ap-badge ap-badge-warn">Not set</span> : `${s.gstRate}%`}</td>
              <td>{s.userCount}</td>
              <td>
                <StatusBadge ok={s.active} okText="Active" badText="Inactive" />
              </td>
              <td className="ap-actions">
                <Button size="sm" color="light" onClick={() => open(s)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={!!editing} size="lg" centered toggle={busy ? undefined : () => setEditing(null)}>
        <Form onSubmit={save}>
          <ModalHeader toggle={busy ? undefined : () => setEditing(null)}>
            {editing && editing.id ? `Edit ${editing.siteName}` : "Add site"}
          </ModalHeader>
          <ModalBody>
            <ErrorAlert message={problem} onClose={() => setProblem(null)} />
            <SiteFieldsForm value={form} onChange={setForm} />
            <p className="ap-hint mb-0">The last active site of a company cannot be made inactive.</p>
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="light" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </Button>
            <Button color="primary" disabled={busy}>
              {busy ? <Spinner size="sm" /> : "Save"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

// -------------------------------------------------------------------- roles

const RolesTab = ({ data, companyId, reload, rights }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ roleName: "", description: "", rightIds: [] });
  const [removing, setRemoving] = useState(null);
  const { busy, problem, setProblem, run } = useAction(reload);

  const open = (role) => {
    setForm(role ? { roleName: role.roleName, description: role.description || "", rightIds: role.rightIds } : { roleName: "", description: "", rightIds: [] });
    setProblem(null);
    setEditing(role || {});
  };

  const save = async (event) => {
    event.preventDefault();
    const outcome = await run(
      () => (editing.id ? updateRole(companyId, editing.id, form) : createRole(companyId, form)),
      editing.id ? "Role saved" : "Role added"
    );
    if (outcome.ok) setEditing(null);
  };

  const remove = async () => {
    const outcome = await run(() => deleteRole(companyId, removing.id), "Role deleted");
    if (!outcome.ok) toast.error("That role could not be deleted.");
    setRemoving(null);
  };

  return (
    <div className="ap-card">
      <div className="ap-title" style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Roles</h2>
        <Button color="primary" size="sm" onClick={() => open(null)}>
          Add role
        </Button>
      </div>
      <ErrorAlert message={!editing ? problem : null} onClose={() => setProblem(null)} />
      <table className="ap-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Rights</th>
            <th>Users</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.roles.map((r) => (
            <tr key={r.id}>
              <td>
                {r.roleName}
                {r.description && <div className="ap-hint">{r.description}</div>}
              </td>
              <td>{r.rightIds.length}</td>
              <td>{r.userCount}</td>
              <td className="ap-actions">
                <Button size="sm" color="light" onClick={() => open(r)}>
                  Edit
                </Button>
                <Button size="sm" color="outline-danger" disabled={r.userCount > 0} title={r.userCount > 0 ? "Still assigned to users" : ""} onClick={() => setRemoving(r)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={!!editing} size="lg" centered toggle={busy ? undefined : () => setEditing(null)}>
        <Form onSubmit={save}>
          <ModalHeader toggle={busy ? undefined : () => setEditing(null)}>
            {editing && editing.id ? `Edit ${editing.roleName}` : "Add role"}
          </ModalHeader>
          <ModalBody>
            <ErrorAlert message={problem} onClose={() => setProblem(null)} />
            <Row>
              <Col md={5}>
                <FormGroup>
                  <Label>Role name *</Label>
                  <Input value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })} />
                </FormGroup>
              </Col>
              <Col md={7}>
                <FormGroup>
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </FormGroup>
              </Col>
            </Row>
            <Label>Rights</Label>
            <RightsPicker rights={rights} selected={form.rightIds} onChange={(ids) => setForm({ ...form, rightIds: ids })} />
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="light" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </Button>
            <Button color="primary" disabled={busy || !form.roleName.trim()}>
              {busy ? <Spinner size="sm" /> : "Save"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ConfirmModal
        isOpen={!!removing}
        busy={busy}
        danger
        title="Delete role"
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      >
        <p>Delete the role {removing && removing.roleName}? This cannot be undone.</p>
      </ConfirmModal>
    </div>
  );
};

// -------------------------------------------------------------------- users

const EMPTY_USER = { userName: "", firstName: "", lastName: "", email: "", temporaryPassword: "", roleId: "", siteIds: [] };

const UsersTab = ({ data, companyId, reload, setSecret }) => {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_USER);
  const [resetting, setResetting] = useState(null);
  const { busy, problem, setProblem, run } = useAction(reload);

  const open = (user) => {
    setForm(
      user
        ? { ...EMPTY_USER, roleId: user.roleId || "", siteIds: user.siteIds }
        : { ...EMPTY_USER, roleId: data.roles[0] ? data.roles[0].id : "", siteIds: data.sites.filter((s) => s.active).slice(0, 1).map((s) => s.id) }
    );
    setProblem(null);
    setEditing(user || {});
  };

  const toggleSite = (id) =>
    setForm({ ...form, siteIds: form.siteIds.includes(id) ? form.siteIds.filter((x) => x !== id) : [...form.siteIds, id] });

  const save = async (event) => {
    event.preventDefault();
    const isNew = !editing.id;
    const body = { ...form, roleId: form.roleId ? Number(form.roleId) : null };
    const outcome = await run(
      () => (isNew ? createCompanyUser(companyId, body) : updateCompanyUser(companyId, editing.id, body)),
      isNew ? null : "User saved"
    );
    if (outcome.ok) {
      setEditing(null);
      if (isNew) {
        setSecret({
          title: `User ${form.userName.trim()} created`,
          intro: "Give this temporary password to the new user.",
          value: outcome.result.temporaryPassword,
        });
      }
    }
  };

  const toggleLock = (user) =>
    run(() => updateCompanyUser(companyId, user.id, { locked: !user.locked }), user.locked ? "User unlocked" : "User locked");

  const reset = async () => {
    const outcome = await run(() => resetCompanyUserPassword(companyId, resetting.id));
    if (outcome.ok) {
      setSecret({
        title: `Password reset for ${resetting.userName}`,
        intro: "Their old password no longer works. They must choose a new one at next sign-in.",
        value: outcome.result.temporaryPassword,
      });
    }
    setResetting(null);
  };

  const siteName = (id) => (data.sites.find((s) => s.id === id) || {}).siteName || `Site ${id}`;
  const isNew = editing && !editing.id;
  const canSave = isNew
    ? form.userName.trim() && form.firstName.trim() && form.lastName.trim() && form.roleId && form.siteIds.length > 0
    : form.roleId && form.siteIds.length > 0;

  return (
    <div className="ap-card">
      <div className="ap-title" style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Users</h2>
        <Button color="primary" size="sm" onClick={() => open(null)} disabled={data.roles.length === 0}>
          Add user
        </Button>
      </div>
      <ErrorAlert message={!editing ? problem : null} onClose={() => setProblem(null)} />
      <table className="ap-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Sites</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.users.map((u) => (
            <tr key={u.id}>
              <td>
                {u.userName}
                <div className="ap-hint">{[u.firstName, u.lastName].filter(Boolean).join(" ")}</div>
              </td>
              <td>{u.roleName || <span className="ap-badge ap-badge-warn">No role</span>}</td>
              <td>{u.siteIds.map(siteName).join(", ") || "—"}</td>
              <td>
                <StatusBadge ok={!u.locked} />
              </td>
              <td className="ap-actions">
                <Button size="sm" color="light" onClick={() => open(u)}>
                  Role and sites
                </Button>
                <Button size="sm" color="light" onClick={() => toggleLock(u)} disabled={busy}>
                  {u.locked ? "Unlock" : "Lock"}
                </Button>
                <Button size="sm" color="light" onClick={() => setResetting(u)}>
                  Reset password
                </Button>
              </td>
            </tr>
          ))}
          {data.users.length === 0 && (
            <tr>
              <td colSpan={5} className="ap-hint">
                No users yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Modal isOpen={!!editing} centered toggle={busy ? undefined : () => setEditing(null)}>
        <Form onSubmit={save}>
          <ModalHeader toggle={busy ? undefined : () => setEditing(null)}>
            {isNew ? "Add user" : `Role and sites for ${editing && editing.userName}`}
          </ModalHeader>
          <ModalBody>
            <ErrorAlert message={problem} onClose={() => setProblem(null)} />
            {isNew && (
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label>Username *</Label>
                    <Input value={form.userName} autoComplete="off" onChange={(e) => setForm({ ...form, userName: e.target.value })} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>First name *</Label>
                    <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Last name *</Label>
                    <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                  </FormGroup>
                </Col>
                <Col md={12}>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </FormGroup>
                </Col>
              </Row>
            )}
            <FormGroup>
              <Label>Role *</Label>
              <Input type="select" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                {data.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roleName}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>Sites *</Label>
              {data.sites.map((s) => (
                <div key={s.id}>
                  <label>
                    <input type="checkbox" checked={form.siteIds.includes(s.id)} onChange={() => toggleSite(s.id)} /> {s.siteName}{" "}
                    {!s.active && <span className="ap-hint">(inactive)</span>}
                  </label>
                </div>
              ))}
            </FormGroup>
            {isNew && (
              <FormGroup>
                <Label>Temporary password (optional)</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.temporaryPassword}
                  onChange={(e) => setForm({ ...form, temporaryPassword: e.target.value })}
                />
                <div className="ap-hint">8 to 20 characters. Blank generates one.</div>
              </FormGroup>
            )}
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="light" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </Button>
            <Button color="primary" disabled={busy || !canSave}>
              {busy ? <Spinner size="sm" /> : "Save"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ConfirmModal
        isOpen={!!resetting}
        busy={busy}
        title="Reset password"
        confirmLabel="Reset"
        onConfirm={reset}
        onCancel={() => setResetting(null)}
      >
        <p>
          Replace {resetting && resetting.userName}'s password with a new temporary one? They must choose their own at
          next sign-in.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default CompanyDetailPage;
