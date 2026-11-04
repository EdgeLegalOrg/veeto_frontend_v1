import React, { useState } from "react";
import { Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import { deleteChecklistTasks, listChecklistTasks, saveChecklistTask } from "./adminPortalApi";
import { Pager, SearchBox, haystack, usePaging } from "./paging";
import { ConfirmModal, ErrorAlert, Loading, useLoad } from "./shared";

const matches = (t, needle) =>
  haystack(t.title, t.description, (t.subTaskList || []).map((s) => s.title)).includes(needle);

const EMPTY = { title: "", description: "", checksum: null, subTaskList: [] };

/** The tasks a check list is made of, and the sub tasks each one has. */
const ChecklistTasksPane = ({ companyId }) => {
  const { data, error, loading, reload } = useLoad(() => listChecklistTasks(companyId), [companyId]);
  const paging = usePaging(data, { filterFn: matches });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  const open = (task) => {
    setForm(
      task
        ? {
            title: task.title || "",
            description: task.description || "",
            checksum: task.checksum,
            subTaskList: (task.subTaskList || []).map((s) => ({ id: s.id, title: s.title || "", mandatory: !!s.mandatory })),
          }
        : { ...EMPTY, subTaskList: [] }
    );
    setProblem(null);
    setEditing(task || {});
  };

  const setSub = (index, patch) =>
    setForm({ ...form, subTaskList: form.subTaskList.map((s, i) => (i === index ? { ...s, ...patch } : s)) });

  const save = async (event) => {
    event.preventDefault();
    if (form.subTaskList.some((s) => !s.title.trim())) {
      setProblem("Every sub task needs a title. Remove the empty ones.");
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await saveChecklistTask(companyId, editing.id, form);
      toast.success(editing.id ? "Task saved" : "Task added");
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
      await deleteChecklistTasks(companyId, [removing.id]);
      toast.success("Task deleted");
      setRemoving(null);
      reload();
    } catch (e) {
      setRemoving(null);
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="ap-toolbar">
        <SearchBox {...paging.searchProps} placeholder="Search tasks" />
        <Button color="primary" size="sm" onClick={() => open(null)}>
          Add task
        </Button>
      </div>
      <ErrorAlert message={error} />
      {loading && !data ? (
        <Loading />
      ) : (
        <table className="ap-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Sub tasks</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {paging.pageRows.map((t) => (
              <tr key={t.id}>
                <td>
                  {t.title}
                  {t.description && <div className="ap-hint">{t.description}</div>}
                </td>
                <td>{(t.subTaskList || []).length || <span className="ap-hint">None</span>}</td>
                <td className="ap-actions">
                  <Button size="sm" color="light" onClick={() => open(t)}>
                    Edit
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
                  {data.length === 0 ? "No tasks yet." : "No tasks match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {data && <Pager {...paging.pagerProps} />}

      <Modal isOpen={!!editing} size="lg" centered toggle={busy ? undefined : () => setEditing(null)}>
        <Form onSubmit={save}>
          <ModalHeader toggle={busy ? undefined : () => setEditing(null)}>
            {editing && editing.id ? "Edit task" : "Add task"}
          </ModalHeader>
          <ModalBody>
            <ErrorAlert message={problem} onClose={() => setProblem(null)} />
            <FormGroup>
              <Label>Title *</Label>
              <Input value={form.title} maxLength={255} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="textarea"
                rows={2}
                value={form.description}
                maxLength={2000}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </FormGroup>
            <Label>Sub tasks</Label>
            {form.subTaskList.map((s, i) => (
              <div key={s.id || `new-${i}`} className="ap-search" style={{ marginBottom: 6 }}>
                <Input
                  bsSize="sm"
                  value={s.title}
                  placeholder="Sub task title"
                  maxLength={255}
                  onChange={(e) => setSub(i, { title: e.target.value })}
                />
                <label style={{ whiteSpace: "nowrap", margin: 0 }}>
                  <input type="checkbox" checked={s.mandatory} onChange={(e) => setSub(i, { mandatory: e.target.checked })} />{" "}
                  Required
                </label>
                <Button
                  size="sm"
                  color="outline-danger"
                  type="button"
                  onClick={() => setForm({ ...form, subTaskList: form.subTaskList.filter((_, j) => j !== i) })}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              color="light"
              type="button"
              onClick={() => setForm({ ...form, subTaskList: [...form.subTaskList, { title: "", mandatory: false }] })}
            >
              Add sub task
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="light" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </Button>
            <Button color="primary" disabled={busy || !form.title.trim()}>
              {busy ? <Spinner size="sm" /> : "Save"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ConfirmModal
        isOpen={!!removing}
        busy={busy}
        danger
        title="Delete task"
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      >
        <p>
          Delete the task {removing && removing.title}? A task that is in a check list cannot be deleted: take it out of
          the check list first.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ChecklistTasksPane;
