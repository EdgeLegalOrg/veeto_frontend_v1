import React, { useMemo, useState } from "react";
import { Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";

import {
  createMatterSubType,
  createMatterType,
  deleteMatterSubType,
  deleteMatterType,
  getMatterCatalog,
  updateMatterSubType,
  updateMatterType,
} from "./adminPortalApi";
import { ConfirmModal, ErrorAlert, Loading, useLoad } from "./shared";

// One form for both kinds, so the dialog never reads a field the other kind left out.
const EMPTY_FORM = { displayName: "", subTypeCodes: [], tabs: [], statuses: [], typeCodes: [] };

/** "12 matters, 3 precedents" for a usage map, or "" when nothing uses it. */
const describeUsage = (usage) =>
  Object.entries(usage || {})
    .map(([what, count]) => `${count} ${what}`)
    .join(", ");

const toggle = (list, code) => (list.includes(code) ? list.filter((c) => c !== code) : [...list, code]);

const MatterTypesPage = () => {
  const { data, error, loading, reload } = useLoad(getMatterCatalog);

  const [view, setView] = useState("types"); // types | subTypes
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null); // { kind, code? } while the dialog is open
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirm, setConfirm] = useState(null); // { kind, item }
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  const types = (data && data.types) || [];
  const subTypes = (data && data.subTypes) || [];
  const typeName = useMemo(() => Object.fromEntries(types.map((t) => [t.code, t.displayName])), [types]);
  const subTypeName = useMemo(() => Object.fromEntries(subTypes.map((s) => [s.code, s.displayName])), [subTypes]);
  const tabTitle = useMemo(
    () => Object.fromEntries(((data && data.availableTabs) || []).map((o) => [o.code, o.title])),
    [data]
  );

  const needle = filter.trim().toLowerCase();
  const matches = (item) => !needle || item.displayName.toLowerCase().includes(needle) || item.code.toLowerCase().includes(needle);
  const shownTypes = types.filter(matches);
  const shownSubTypes = subTypes.filter(matches);

  const openType = (type) => {
    setForm(type ? { ...EMPTY_FORM, displayName: type.displayName, subTypeCodes: type.subTypeCodes } : EMPTY_FORM);
    setProblem(null);
    setEditing({ kind: "type", code: type && type.code });
  };

  const openSubType = (sub) => {
    setForm(
      sub
        ? { ...EMPTY_FORM, displayName: sub.displayName, tabs: sub.tabs, statuses: sub.statuses, typeCodes: sub.typeCodes }
        : EMPTY_FORM
    );
    setProblem(null);
    setEditing({ kind: "subType", code: sub && sub.code });
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      if (editing.kind === "type") {
        const body = { displayName: form.displayName, subTypeCodes: form.subTypeCodes };
        if (editing.code) await updateMatterType(editing.code, body);
        else await createMatterType(body);
      } else {
        const body = {
          displayName: form.displayName,
          tabs: form.tabs,
          statuses: form.statuses,
          typeCodes: form.typeCodes,
        };
        if (editing.code) await updateMatterSubType(editing.code, body);
        else await createMatterSubType(body);
      }
      toast.success("Saved");
      setEditing(null);
      reload();
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      if (confirm.kind === "type") await deleteMatterType(confirm.item.code);
      else await deleteMatterSubType(confirm.item.code);
      toast.success(`${confirm.item.displayName} removed`);
      setConfirm(null);
      reload();
    } catch (e) {
      setConfirm(null);
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const whyNotRemovable = (item) => {
    if (item.builtIn) return "The application relies on this one. It can be renamed but not removed.";
    const used = describeUsage(item.usage);
    return used ? `Still used by ${used}.` : "";
  };

  const sortedForPicking = (items) => [...items].sort((a, b) => a.displayName.localeCompare(b.displayName));

  // Sub types of a type keep the order they already have; ones ticked now join the end.
  const onPickSubType = (code) => setForm({ ...form, subTypeCodes: toggle(form.subTypeCodes, code) });

  const editingType = !!editing && editing.kind === "type";

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>Matter types</h1>
          <p>
            The matter types and sub types every company uses. A change here reaches every company at once. A new
            type or sub type appears in the application when users next sign in or reload.
          </p>
        </div>
        <div className="ap-actions">
          <Button color="primary" onClick={() => (view === "types" ? openType(null) : openSubType(null))}>
            {view === "types" ? "Add matter type" : "Add sub type"}
          </Button>
        </div>
      </div>

      <ErrorAlert message={error} />

      <div className="ap-tabs">
        <button type="button" className={view === "types" ? "active" : ""} onClick={() => setView("types")}>
          Matter types ({types.length})
        </button>
        <button type="button" className={view === "subTypes" ? "active" : ""} onClick={() => setView("subTypes")}>
          Sub types ({subTypes.length})
        </button>
      </div>

      <div className="ap-card">
        <Input
          placeholder="Search by name or code"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ maxWidth: 320, marginBottom: 12 }}
        />

        {loading && !data ? (
          <Loading />
        ) : view === "types" ? (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sub types</th>
                <th>In use</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shownTypes.map((type) => {
                const blocked = whyNotRemovable(type);
                return (
                  <tr key={type.code}>
                    <td>
                      {type.displayName}
                      <div className="ap-hint">{type.code}</div>
                    </td>
                    <td>
                      {type.subTypeCodes.length === 0 ? (
                        <span className="ap-hint">None</span>
                      ) : (
                        type.subTypeCodes.map((c) => subTypeName[c] || c).join(", ")
                      )}
                    </td>
                    <td>{describeUsage(type.usage) || <span className="ap-hint">Not used</span>}</td>
                    <td className="ap-actions">
                      <Button size="sm" color="light" onClick={() => openType(type)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="outline-danger"
                        disabled={!!blocked}
                        title={blocked}
                        onClick={() => setConfirm({ kind: "type", item: type })}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {shownTypes.length === 0 && (
                <tr>
                  <td colSpan={4} className="ap-hint">
                    No matter types match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Offered under</th>
                <th>Tabs</th>
                <th>In use</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shownSubTypes.map((sub) => {
                const blocked = whyNotRemovable(sub);
                return (
                  <tr key={sub.code}>
                    <td>
                      {sub.displayName}
                      <div className="ap-hint">{sub.code}</div>
                    </td>
                    <td>
                      {sub.typeCodes.length === 0 ? (
                        <span className="ap-hint">No type</span>
                      ) : (
                        sub.typeCodes.map((c) => typeName[c] || c).join(", ")
                      )}
                    </td>
                    <td>
                      {sub.tabs.length === 0 ? (
                        <span className="ap-hint">Standard tabs only</span>
                      ) : (
                        sub.tabs.map((c) => tabTitle[c] || c).join(", ")
                      )}
                      {sub.statuses.length > 0 && <div className="ap-hint">+ {sub.statuses.length} extra status(es)</div>}
                    </td>
                    <td>{describeUsage(sub.usage) || <span className="ap-hint">Not used</span>}</td>
                    <td className="ap-actions">
                      <Button size="sm" color="light" onClick={() => openSubType(sub)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="outline-danger"
                        disabled={!!blocked}
                        title={blocked}
                        onClick={() => setConfirm({ kind: "subType", item: sub })}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {shownSubTypes.length === 0 && (
                <tr>
                  <td colSpan={5} className="ap-hint">
                    No sub types match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <p className="ap-hint" style={{ marginTop: 12 }}>
          Matters store a type's code, not its name, so renaming one never changes a matter. Something that matters,
          precedents, letter heads, contact roles or checklists still use cannot be removed.
        </p>
      </div>

      <Modal isOpen={!!editing} centered scrollable toggle={busy ? undefined : () => setEditing(null)}>
        <Form onSubmit={save}>
          <ModalHeader toggle={busy ? undefined : () => setEditing(null)}>
            {editing && editing.code ? "Edit" : "Add"} {editingType ? "matter type" : "sub type"}
          </ModalHeader>
          <ModalBody>
            <ErrorAlert message={problem} onClose={() => setProblem(null)} />
            <FormGroup>
              <Label>Name</Label>
              <Input value={form.displayName} maxLength={200} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
              {editing && !editing.code && (
                <div className="ap-hint">The code kept on matters is made from this name and cannot be changed later.</div>
              )}
            </FormGroup>

            {!editing ? null : editingType ? (
              <FormGroup>
                <Label>Sub types offered under this type</Label>
                <div className="ap-rights">
                  {sortedForPicking(subTypes).map((sub) => (
                    <label key={sub.code}>
                      <input
                        type="checkbox"
                        checked={form.subTypeCodes.includes(sub.code)}
                        onChange={() => onPickSubType(sub.code)}
                      />{" "}
                      {sub.displayName}
                    </label>
                  ))}
                </div>
                <div className="ap-hint">
                  Unticking one is refused while a matter, contact role or checklist uses it under this type.
                </div>
              </FormGroup>
            ) : (
              <>
                <FormGroup>
                  <Label>Tabs a matter of this sub type shows</Label>
                  <div className="ap-hint">
                    Matter Summary, Contacts, Attachments, Invoices and Time Billing are always shown.
                  </div>
                  <div className="ap-rights">
                    {((data && data.availableTabs) || []).map((tab) => (
                      <label key={tab.code}>
                        <input
                          type="checkbox"
                          checked={form.tabs.includes(tab.code)}
                          onChange={() => setForm({ ...form, tabs: toggle(form.tabs, tab.code) })}
                        />{" "}
                        {tab.title}
                      </label>
                    ))}
                  </div>
                </FormGroup>
                <FormGroup>
                  <Label>Extra statuses</Label>
                  <div className="ap-hint">Instructed, In Progress, Not Proceeding and Complete are always offered.</div>
                  <div className="ap-rights">
                    {((data && data.availableStatuses) || []).map((status) => (
                      <label key={status.code}>
                        <input
                          type="checkbox"
                          checked={form.statuses.includes(status.code)}
                          onChange={() => setForm({ ...form, statuses: toggle(form.statuses, status.code) })}
                        />{" "}
                        {status.title}
                      </label>
                    ))}
                  </div>
                </FormGroup>
                <FormGroup>
                  <Label>Offered under these matter types</Label>
                  <div className="ap-rights">
                    {types.map((type) => (
                      <label key={type.code}>
                        <input
                          type="checkbox"
                          checked={form.typeCodes.includes(type.code)}
                          onChange={() => setForm({ ...form, typeCodes: toggle(form.typeCodes, type.code) })}
                        />{" "}
                        {type.displayName}
                      </label>
                    ))}
                  </div>
                </FormGroup>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="light" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </Button>
            <Button color="primary" disabled={busy || !form.displayName.trim()}>
              Save
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirm}
        busy={busy}
        danger
        title={confirm && (confirm.kind === "type" ? "Remove matter type" : "Remove sub type")}
        confirmLabel="Remove"
        onConfirm={remove}
        onCancel={() => setConfirm(null)}
      >
        {confirm && (
          <p>
            Remove {confirm.item.displayName}? Nothing uses it, so no matter or setting is affected. This cannot be
            undone, though it can be added again.
          </p>
        )}
      </ConfirmModal>
    </div>
  );
};

export default MatterTypesPage;
