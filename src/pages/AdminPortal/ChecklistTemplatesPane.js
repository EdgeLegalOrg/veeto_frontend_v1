import React, { useState } from "react";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";

import {
  deleteChecklistTemplates,
  listChecklistGroups,
  listChecklistTasks,
  listChecklistTemplates,
  saveChecklistTemplate,
  syncChecklistTemplate,
} from "./adminPortalApi";
import { Pager, SearchBox, haystack, usePaging } from "./paging";
import { ConfirmModal, ErrorAlert, Loading, useLoad } from "./shared";

const NEW_TASK = "new";
const BATCH = 25;

const matches = (t, needle) =>
  haystack(t.name, t.description, (t.templateTaskList || []).map((r) => r.taskTitle)).includes(needle);

const SYNC_SCOPES = [
  { value: "EXISTING_WORKFLOWS", label: "Matters that already have this check list" },
  { value: "ALL_LINKED_MATTERS", label: "Every matter linked to it, giving the check list to those without one" },
];

/** A check list: the tasks it holds, the group each sits in, and their order. */
const ChecklistTemplatesPane = ({ companyId }) => {
  const { data, error, loading, reload } = useLoad(() => listChecklistTemplates(companyId), [companyId]);
  const tasks = useLoad(() => listChecklistTasks(companyId), [companyId]);
  const groups = useLoad(() => listChecklistGroups(companyId), [companyId]);
  const paging = usePaging(data, { filterFn: matches });

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", checksum: null, rows: [] });
  const [removing, setRemoving] = useState(null);
  const [syncing, setSyncing] = useState(null);
  const [scope, setScope] = useState(SYNC_SCOPES[0].value);
  const [progress, setProgress] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  const taskList = tasks.data || [];
  const groupList = groups.data || [];
  const taskTitle = (id) => (taskList.find((t) => t.id === id) || {}).title || "";

  const open = (template) => {
    setForm(
      template
        ? {
            name: template.name || "",
            description: template.description || "",
            checksum: template.checksum,
            rows: [...(template.templateTaskList || [])]
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((r) => ({
                id: r.id,
                taskId: r.taskId,
                taskTitle: r.taskTitle || taskTitle(r.taskId),
                mandatory: !!r.mandatory,
                taskGroupId: r.taskGroupId || "",
              })),
          }
        : { name: "", description: "", checksum: null, rows: [] }
    );
    setProblem(null);
    setEditing(template || {});
  };

  const setRow = (index, patch) => setForm({ ...form, rows: form.rows.map((r, i) => (i === index ? { ...r, ...patch } : r)) });

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= form.rows.length) return;
    const rows = [...form.rows];
    [rows[index], rows[target]] = [rows[target], rows[index]];
    setForm({ ...form, rows });
  };

  const chooseTask = (index, value) => {
    if (value === NEW_TASK) setRow(index, { taskId: null, taskTitle: "" });
    else setRow(index, { taskId: Number(value), taskTitle: taskTitle(Number(value)) });
  };

  const save = async (event) => {
    event.preventDefault();
    if (form.rows.length === 0) {
      setProblem("A check list needs at least one task.");
      return;
    }
    if (form.rows.some((r) => !r.taskId && !r.taskTitle.trim())) {
      setProblem("Every row needs a task: choose one, or type a title for a new one.");
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await saveChecklistTemplate(companyId, editing.id, {
        name: form.name,
        description: form.description,
        checksum: form.checksum,
        templateTaskList: form.rows.map((r) => ({
          id: r.id,
          taskId: r.taskId,
          // For a task that exists this is its own title, so saving never renames it.
          taskTitle: r.taskId ? taskTitle(r.taskId) : r.taskTitle,
          mandatory: r.mandatory,
          taskGroupId: r.taskGroupId ? Number(r.taskGroupId) : null,
        })),
      });
      toast.success(editing.id ? "Check list saved" : "Check list added");
      setEditing(null);
      reload();
      tasks.reload();
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await deleteChecklistTemplates(companyId, [removing.id]);
      toast.success("Check list deleted");
      setRemoving(null);
      reload();
    } catch (e) {
      setRemoving(null);
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  /** Runs the sync a batch at a time, the way the company's own screen does, until it reports complete. */
  const runSync = async () => {
    setBusy(true);
    setProblem(null);
    setProgress({ done: 0, total: 0, totals: null });
    const totals = { checklistsCreated: 0, mattersUpdated: 0, tasksAdded: 0, tasksRemoved: 0, tasksMoved: 0, tasksRenamed: 0, tasksRetainedInProgress: 0, tasksAdopted: 0 };
    try {
      let offset = 0;
      for (;;) {
        const result = await syncChecklistTemplate(companyId, syncing.id, scope, offset, BATCH);
        Object.keys(totals).forEach((k) => {
          totals[k] += result[k] || 0;
        });
        offset = result.nextOffset;
        setProgress({ done: offset, total: result.totalMatters, totals: { ...totals }, complete: result.complete });
        if (result.complete) break;
      }
      toast.success("Sync complete");
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  const closeSync = () => {
    setSyncing(null);
    setProgress(null);
    setProblem(null);
  };

  return (
    <div>
      <div className="ap-toolbar">
        <SearchBox {...paging.searchProps} placeholder="Search check lists or their tasks" />
        <Button color="primary" size="sm" onClick={() => open(null)} disabled={tasks.loading || groups.loading}>
          Add check list
        </Button>
      </div>
      <ErrorAlert message={error || tasks.error || groups.error} />
      {loading && !data ? (
        <Loading />
      ) : (
        <table className="ap-table">
          <thead>
            <tr>
              <th>Check list</th>
              <th>Tasks</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {paging.pageRows.map((t) => (
              <tr key={t.id}>
                <td>
                  {t.name}
                  {t.description && <div className="ap-hint">{t.description}</div>}
                </td>
                <td>{(t.templateTaskList || []).length}</td>
                <td className="ap-actions">
                  <Button size="sm" color="light" onClick={() => open(t)}>
                    Edit
                  </Button>
                  <Button size="sm" color="light" onClick={() => setSyncing(t)}>
                    Sync changes
                  </Button>
                  <Button size="sm" color="outline-danger" onClick={() => setRemoving(t)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {data && paging.totalRecords === 0 && (
              <tr>
                <td colSpan={3} className="ap-hint">
                  {data.length === 0 ? "No check lists yet." : "No check lists match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {data && <Pager {...paging.pagerProps} />}

      <Modal isOpen={!!editing} size="xl" centered scrollable toggle={busy ? undefined : () => setEditing(null)}>
        <Form onSubmit={save}>
          <ModalHeader toggle={busy ? undefined : () => setEditing(null)}>
            {editing && editing.id ? "Edit check list" : "Add check list"}
          </ModalHeader>
          <ModalBody>
            <ErrorAlert message={problem} onClose={() => setProblem(null)} />
            <FormGroup>
              <Label>Name *</Label>
              <Input value={form.name} maxLength={255} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                value={form.description}
                maxLength={2000}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </FormGroup>
            <Label>Tasks, in order</Label>
            <div className="ap-hint" style={{ marginBottom: 6 }}>
              Within each group the tasks keep the order shown here.
            </div>
            {form.rows.map((r, i) => (
              <div key={r.id || `row-${i}`} className="ap-search" style={{ marginBottom: 6, flexWrap: "wrap" }}>
                <Input
                  bsSize="sm"
                  type="select"
                  style={{ width: 260 }}
                  aria-label="Task"
                  value={r.taskId || NEW_TASK}
                  onChange={(e) => chooseTask(i, e.target.value)}
                >
                  <option value={NEW_TASK}>New task…</option>
                  {taskList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </Input>
                {!r.taskId && (
                  <Input
                    bsSize="sm"
                    style={{ width: 240 }}
                    placeholder="Title of the new task"
                    value={r.taskTitle}
                    maxLength={255}
                    onChange={(e) => setRow(i, { taskTitle: e.target.value })}
                  />
                )}
                <Input
                  bsSize="sm"
                  type="select"
                  style={{ width: 180 }}
                  aria-label="Group"
                  value={r.taskGroupId}
                  onChange={(e) => setRow(i, { taskGroupId: e.target.value })}
                >
                  <option value="">No group</option>
                  {groupList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </Input>
                <label style={{ whiteSpace: "nowrap", margin: 0 }}>
                  <input type="checkbox" checked={r.mandatory} onChange={(e) => setRow(i, { mandatory: e.target.checked })} />{" "}
                  Required
                </label>
                <Button size="sm" color="light" type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  ↑
                </Button>
                <Button
                  size="sm"
                  color="light"
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === form.rows.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </Button>
                <Button
                  size="sm"
                  color="outline-danger"
                  type="button"
                  onClick={() => setForm({ ...form, rows: form.rows.filter((_, j) => j !== i) })}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              color="light"
              type="button"
              onClick={() => setForm({ ...form, rows: [...form.rows, { taskId: null, taskTitle: "", mandatory: false, taskGroupId: "" }] })}
            >
              Add a task
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="light" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </Button>
            <Button color="primary" disabled={busy || !form.name.trim()}>
              {busy ? <Spinner size="sm" /> : "Save"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={!!syncing} centered toggle={busy ? undefined : closeSync}>
        <ModalHeader toggle={busy ? undefined : closeSync}>Sync changes to matters</ModalHeader>
        <ModalBody>
          <ErrorAlert message={problem} onClose={() => setProblem(null)} />
          <p>
            Push the current tasks of <strong>{syncing && syncing.name}</strong> out to the matters that use it.
          </p>
          {SYNC_SCOPES.map((s) => (
            <div key={s.value}>
              <label>
                <input
                  type="radio"
                  name="sync-scope"
                  value={s.value}
                  checked={scope === s.value}
                  disabled={busy || (progress && progress.complete)}
                  onChange={() => setScope(s.value)}
                />{" "}
                {s.label}
              </label>
            </div>
          ))}
          {progress && (
            <div style={{ marginTop: 12 }}>
              <Progress value={progress.total ? Math.round((progress.done / progress.total) * 100) : progress.complete ? 100 : 0}>
                {progress.done} of {progress.total}
              </Progress>
              {progress.complete && progress.totals && (
                <ul className="ap-hint" style={{ marginTop: 8 }}>
                  <li>{progress.totals.checklistsCreated} matter(s) given the check list</li>
                  <li>{progress.totals.mattersUpdated} matter(s) updated</li>
                  <li>
                    {progress.totals.tasksAdded} task(s) added, {progress.totals.tasksRemoved} removed,{" "}
                    {progress.totals.tasksMoved} moved, {progress.totals.tasksRenamed} renamed
                  </li>
                  <li>{progress.totals.tasksRetainedInProgress} task(s) kept because they were already under way</li>
                </ul>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={closeSync} disabled={busy}>
            {progress && progress.complete ? "Close" : "Cancel"}
          </Button>
          {!(progress && progress.complete) && (
            <Button color="primary" onClick={runSync} disabled={busy}>
              {busy ? <Spinner size="sm" /> : "Sync"}
            </Button>
          )}
        </ModalFooter>
      </Modal>

      <ConfirmModal
        isOpen={!!removing}
        busy={busy}
        danger
        title="Delete check list"
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      >
        <p>
          Delete the check list {removing && removing.name}? One that is linked to a matter type cannot be deleted:
          unlink it first.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ChecklistTemplatesPane;
