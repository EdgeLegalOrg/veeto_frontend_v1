import React, { useState } from "react";
import { Button, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import { deleteChecklistGroup, listChecklistGroups, saveChecklistGroup } from "./adminPortalApi";
import { Pager, SearchBox, haystack, usePaging } from "./paging";
import { ConfirmModal, ErrorAlert, Loading, useLoad } from "./shared";

const matches = (g, needle) => haystack(g.title, g.description).includes(needle);

const EMPTY = { title: "", description: "", displayOrder: "0" };

/** The groups tasks are arranged in on a matter's Workflow tab. */
const ChecklistGroupsPane = ({ companyId }) => {
  const { data, error, loading, reload } = useLoad(() => listChecklistGroups(companyId), [companyId]);
  const paging = usePaging(data, { filterFn: matches });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  const open = (group) => {
    setForm(
      group
        ? { title: group.title || "", description: group.description || "", displayOrder: String(group.displayOrder ?? 0) }
        : EMPTY
    );
    setProblem(null);
    setEditing(group || {});
  };

  const orderOk = /^\d{1,4}$/.test(form.displayOrder);

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      await saveChecklistGroup(companyId, editing.id, { ...form, displayOrder: Number(form.displayOrder) });
      toast.success(editing.id ? "Group saved" : "Group added");
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
      await deleteChecklistGroup(companyId, removing.id);
      toast.success("Group deleted");
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
        <SearchBox {...paging.searchProps} placeholder="Search task groups" />
        <Button color="primary" size="sm" onClick={() => open(null)}>
          Add task group
        </Button>
      </div>
      <ErrorAlert message={error} />
      {loading && !data ? (
        <Loading />
      ) : (
        <table className="ap-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Description</th>
              <th>Order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {paging.pageRows.map((g) => (
              <tr key={g.id}>
                <td>{g.title}</td>
                <td>{g.description || <span className="ap-hint">—</span>}</td>
                <td>{g.displayOrder}</td>
                <td className="ap-actions">
                  <Button size="sm" color="light" onClick={() => open(g)}>
                    Edit
                  </Button>
                  <Button size="sm" color="outline-danger" onClick={() => setRemoving(g)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {data && paging.totalRecords === 0 && (
              <tr>
                <td colSpan={4} className="ap-hint">
                  {data.length === 0 ? "No task groups yet." : "No task groups match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {data && <Pager {...paging.pagerProps} />}
      <p className="ap-hint" style={{ marginTop: 12 }}>
        Groups show lowest order first. An icon can be set from the company's own Task Groups screen.
      </p>

      <Modal isOpen={!!editing} centered toggle={busy ? undefined : () => setEditing(null)}>
        <Form onSubmit={save}>
          <ModalHeader toggle={busy ? undefined : () => setEditing(null)}>
            {editing && editing.id ? "Edit task group" : "Add task group"}
          </ModalHeader>
          <ModalBody>
            <ErrorAlert message={problem} onClose={() => setProblem(null)} />
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label>Title *</Label>
                  <Input value={form.title} maxLength={255} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </FormGroup>
              </Col>
              <Col md={12}>
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
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Order</Label>
                  <Input
                    inputMode="numeric"
                    value={form.displayOrder}
                    invalid={!orderOk}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="light" onClick={() => setEditing(null)} disabled={busy}>
              Cancel
            </Button>
            <Button color="primary" disabled={busy || !form.title.trim() || !orderOk}>
              {busy ? <Spinner size="sm" /> : "Save"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ConfirmModal
        isOpen={!!removing}
        busy={busy}
        danger
        title="Delete task group"
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      >
        <p>Delete the group {removing && removing.title}? A group that has tasks in a check list cannot be deleted.</p>
      </ConfirmModal>
    </div>
  );
};

export default ChecklistGroupsPane;
