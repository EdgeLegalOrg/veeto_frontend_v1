import React, { useState } from "react";
import { Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";

import {
  createAdmin,
  deleteAdmin,
  listAdmins,
  readSession,
  resetAdminPassword,
  setAdminLocked,
  updateAdmin,
} from "./adminPortalApi";
import {
  ADMIN_PASSWORD_HINT,
  ConfirmModal,
  ErrorAlert,
  Loading,
  SecretModal,
  StatusBadge,
  fmtDate,
  isStrongAdminPassword,
  useLoad,
} from "./shared";

const EMPTY = { userName: "", displayName: "", email: "", temporaryPassword: "" };

const AdminsPage = () => {
  const { data, error, loading, reload } = useLoad(listAdmins);
  const me = readSession().admin;

  const [editing, setEditing] = useState(null); // null closed, {} new, {id,...} existing
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null); // { kind, admin }
  const [secret, setSecret] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  const openNew = () => {
    setForm(EMPTY);
    setProblem(null);
    setEditing({});
  };

  const openEdit = (admin) => {
    setForm({ ...EMPTY, userName: admin.userName, displayName: admin.displayName, email: admin.email || "" });
    setProblem(null);
    setEditing(admin);
  };

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      if (editing.id) {
        await updateAdmin(editing.id, { displayName: form.displayName, email: form.email });
        toast.success("Saved");
      } else {
        const created = await createAdmin(form);
        setSecret({
          title: `System admin ${created.admin.userName} created`,
          intro: "Give this temporary password to the new admin.",
          value: created.temporaryPassword,
        });
      }
      setEditing(null);
      reload();
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  const runConfirmed = async () => {
    const { kind, admin } = confirm;
    setBusy(true);
    try {
      if (kind === "lock") {
        await setAdminLocked(admin.id, true);
        toast.success(`${admin.userName} locked`);
      } else if (kind === "unlock") {
        await setAdminLocked(admin.id, false);
        toast.success(`${admin.userName} unlocked`);
      } else if (kind === "delete") {
        await deleteAdmin(admin.id);
        toast.success(`${admin.userName} removed`);
      } else if (kind === "reset") {
        const result = await resetAdminPassword(admin.id);
        setSecret({
          title: `Password reset for ${admin.userName}`,
          intro: "Their current password no longer works and any session they had has ended.",
          value: result.temporaryPassword,
        });
      }
      setConfirm(null);
      reload();
    } catch (e) {
      setConfirm(null);
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const passwordProblem = form.temporaryPassword && !isStrongAdminPassword(form.temporaryPassword);
  const canSave = editing && form.displayName.trim() && (editing.id || (form.userName.trim() && !passwordProblem));

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>System admins</h1>
          <p>People who can sign in to this portal. They belong to no company.</p>
        </div>
        <Button color="primary" onClick={openNew}>
          Add system admin
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
                <th>Username</th>
                <th>Name</th>
                <th>Status</th>
                <th>Last sign-in</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(data || []).map((admin) => {
                const self = admin.id === me.id;
                return (
                  <tr key={admin.id}>
                    <td>
                      {admin.userName} {self && <span className="ap-hint">(you)</span>}
                      {admin.email && <div className="ap-hint">{admin.email}</div>}
                    </td>
                    <td>{admin.displayName}</td>
                    <td>
                      <StatusBadge ok={!admin.locked} />{" "}
                      {admin.mustChangePassword && <span className="ap-badge ap-badge-warn">Password change pending</span>}
                    </td>
                    <td>{fmtDate(admin.lastLoginAt)}</td>
                    <td className="ap-actions">
                      <Button size="sm" color="light" onClick={() => openEdit(admin)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="light"
                        disabled={self}
                        title={self ? "Use Account to change your own password" : ""}
                        onClick={() => setConfirm({ kind: "reset", admin })}
                      >
                        Reset password
                      </Button>
                      {admin.locked ? (
                        <Button size="sm" color="light" onClick={() => setConfirm({ kind: "unlock", admin })}>
                          Unlock
                        </Button>
                      ) : (
                        <Button size="sm" color="light" disabled={self} onClick={() => setConfirm({ kind: "lock", admin })}>
                          Lock
                        </Button>
                      )}
                      <Button
                        size="sm"
                        color="outline-danger"
                        disabled={self}
                        onClick={() => setConfirm({ kind: "delete", admin })}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <p className="ap-hint" style={{ marginTop: 12 }}>
          You cannot lock, remove or reset yourself, and the last active system admin can never be locked or removed.
        </p>
      </div>

      <Modal isOpen={!!editing} centered toggle={busy ? undefined : () => setEditing(null)}>
        <Form onSubmit={save}>
          <ModalHeader toggle={busy ? undefined : () => setEditing(null)}>
            {editing && editing.id ? `Edit ${editing.userName}` : "Add system admin"}
          </ModalHeader>
          <ModalBody>
            <ErrorAlert message={problem} onClose={() => setProblem(null)} />
            <FormGroup>
              <Label>Username</Label>
              <Input
                value={form.userName}
                onChange={set("userName")}
                disabled={!!(editing && editing.id)}
                autoComplete="off"
              />
              {!(editing && editing.id) && (
                <div className="ap-hint">3 to 50 letters, numbers or . _ @ -. It cannot be changed later.</div>
              )}
            </FormGroup>
            <FormGroup>
              <Label>Name</Label>
              <Input value={form.displayName} onChange={set("displayName")} />
            </FormGroup>
            <FormGroup>
              <Label>Email (optional)</Label>
              <Input type="email" value={form.email} onChange={set("email")} />
            </FormGroup>
            {!(editing && editing.id) && (
              <FormGroup>
                <Label>Temporary password (optional)</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.temporaryPassword}
                  onChange={set("temporaryPassword")}
                  invalid={!!passwordProblem}
                />
                <div className="ap-hint">
                  Leave blank to generate one. {ADMIN_PASSWORD_HINT} They must change it at first sign-in.
                </div>
              </FormGroup>
            )}
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="light" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </Button>
            <Button color="primary" disabled={!canSave || busy}>
              Save
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirm}
        busy={busy}
        danger={confirm && (confirm.kind === "delete" || confirm.kind === "lock")}
        title={
          confirm &&
          { lock: "Lock admin", unlock: "Unlock admin", delete: "Remove admin", reset: "Reset password" }[confirm.kind]
        }
        confirmLabel={confirm && { lock: "Lock", unlock: "Unlock", delete: "Remove", reset: "Reset" }[confirm.kind]}
        onConfirm={runConfirmed}
        onCancel={() => setConfirm(null)}
      >
        {confirm && confirm.kind === "lock" && (
          <p>{confirm.admin.userName} will be signed out immediately and cannot sign in until unlocked.</p>
        )}
        {confirm && confirm.kind === "unlock" && <p>{confirm.admin.userName} will be able to sign in again.</p>}
        {confirm && confirm.kind === "delete" && (
          <p>
            Remove {confirm.admin.userName} permanently? Their past actions stay in the audit log. This cannot be undone.
          </p>
        )}
        {confirm && confirm.kind === "reset" && (
          <p>
            Replace {confirm.admin.userName}'s password with a new temporary one? They will be signed out and must choose
            their own password at next sign-in.
          </p>
        )}
      </ConfirmModal>

      <SecretModal
        title={secret && secret.title}
        intro={secret && secret.intro}
        secret={secret && secret.value}
        onClose={() => setSecret(null)}
      />
    </div>
  );
};

export default AdminsPage;
