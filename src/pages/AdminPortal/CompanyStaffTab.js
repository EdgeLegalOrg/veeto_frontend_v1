import React, { useEffect, useState } from "react";
import { Button, Col, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import { createStaff, listStaff, updateStaff } from "./adminPortalApi";
import { PAGE_SIZES, Pager, SearchBox } from "./paging";
import { ErrorAlert, Loading, StatusBadge, useLoad } from "./shared";

const EMPTY = {
  salutation: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  emailId1: "",
  emailId2: "",
  phoneNumber1: "",
  phoneNumber2: "",
  mobilePhoneNumber: "",
  occupation: "",
  practiceCertNumber: "",
  siteId: "",
  active: true,
};

const fromView = (s) => ({
  ...EMPTY,
  ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, s[k] ?? EMPTY[k]])),
  active: s.active,
});

const looksLikeEmail = (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** A company's staff: who they are, where they are based, and whether they are still active. */
const CompanyStaffTab = ({ data, companyId }) => {
  const [siteId, setSiteId] = useState("");
  const [active, setActive] = useState("all");
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(text.trim());
      setPageNo(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [text]);

  const filter = { siteId, q, active: active === "all" ? "" : active === "active" };
  const { data: page, error, loading, reload } = useLoad(
    () => listStaff(companyId, pageNo, pageSize, filter),
    [companyId, pageNo, pageSize, siteId, active, q]
  );
  const totalRecords = page && page.page ? page.page.totalRecords : 0;
  const totalPages = Math.max(1, page && page.page ? page.page.totalPages : 1);

  const open = (staff) => {
    setForm(staff ? fromView(staff) : { ...EMPTY, siteId: data.sites.find((s) => s.active)?.id ?? "" });
    setProblem(null);
    setEditing(staff || {});
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const save = async (event) => {
    event.preventDefault();
    if (!looksLikeEmail(form.emailId1) || !looksLikeEmail(form.emailId2)) {
      setProblem("An email address is not valid.");
      return;
    }
    const body = { ...form, siteId: form.siteId ? Number(form.siteId) : null };
    setBusy(true);
    setProblem(null);
    try {
      if (editing.id) await updateStaff(companyId, editing.id, body);
      else await createStaff(companyId, body);
      toast.success(editing.id ? "Staff member saved" : "Staff member added");
      setEditing(null);
      reload();
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (staff) => {
    setBusy(true);
    try {
      await updateStaff(companyId, staff.id, { active: !staff.active });
      toast.success(staff.active ? "Marked inactive" : "Marked active");
      reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const canSave = form.firstName.trim() && form.lastName.trim() && form.siteId;

  return (
    <div className="ap-card">
      <div className="ap-title" style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Staff</h2>
        <Button color="primary" size="sm" onClick={() => open(null)} disabled={data.sites.length === 0}>
          Add staff member
        </Button>
      </div>
      <ErrorAlert message={error} />
      <div className="ap-toolbar">
        <div className="ap-search" style={{ flexWrap: "wrap" }}>
          <Input
            bsSize="sm"
            type="select"
            style={{ width: 200 }}
            aria-label="Site"
            value={siteId}
            onChange={(e) => {
              setSiteId(e.target.value);
              setPageNo(0);
            }}
          >
            <option value="">All sites</option>
            {data.sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.siteName}
              </option>
            ))}
          </Input>
          <Input
            bsSize="sm"
            type="select"
            style={{ width: 150 }}
            aria-label="Status"
            value={active}
            onChange={(e) => {
              setActive(e.target.value);
              setPageNo(0);
            }}
          >
            <option value="all">Active and inactive</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </Input>
        </div>
        <SearchBox value={text} onChange={setText} placeholder="Search name, email, phone or login" />
      </div>

      {loading && !page ? (
        <Loading />
      ) : (
        <table className="ap-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Site</th>
              <th>Login</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {((page && page.rows) || []).map((s) => (
              <tr key={s.id}>
                <td>
                  {[s.salutation, s.firstName, s.lastName].filter(Boolean).join(" ")}
                  {s.occupation && <div className="ap-hint">{s.occupation}</div>}
                </td>
                <td>
                  {s.emailId1 || "—"}
                  {(s.phoneNumber1 || s.mobilePhoneNumber) && (
                    <div className="ap-hint">{[s.phoneNumber1, s.mobilePhoneNumber].filter(Boolean).join(" · ")}</div>
                  )}
                </td>
                <td>{s.siteName || "—"}</td>
                <td>
                  {s.userName ? (
                    <>
                      {s.userName} {s.userLocked && <span className="ap-badge ap-badge-bad">Locked</span>}
                    </>
                  ) : (
                    <span className="ap-hint">No login</span>
                  )}
                </td>
                <td>
                  <StatusBadge ok={s.active} okText="Active" badText="Inactive" />
                </td>
                <td className="ap-actions">
                  <Button size="sm" color="light" onClick={() => open(s)}>
                    Edit
                  </Button>
                  <Button size="sm" color="light" disabled={busy} onClick={() => toggleActive(s)}>
                    {s.active ? "Make inactive" : "Make active"}
                  </Button>
                </td>
              </tr>
            ))}
            {page && page.rows.length === 0 && (
              <tr>
                <td colSpan={6} className="ap-hint">
                  No staff match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {page && (
        <Pager
          pageNo={pageNo}
          pageSize={pageSize}
          totalRecords={totalRecords}
          totalPages={totalPages}
          onPage={setPageNo}
          onPageSize={(size) => {
            setPageSize(size);
            setPageNo(0);
          }}
        />
      )}
      <p className="ap-hint" style={{ marginTop: 12 }}>
        A person is billed at the site they are based at. Making someone inactive does not lock their login; lock the
        user on the Users tab. Logins are created on the Users tab.
      </p>

      <Modal isOpen={!!editing} size="lg" centered toggle={busy ? undefined : () => setEditing(null)}>
        <Form onSubmit={save}>
          <ModalHeader toggle={busy ? undefined : () => setEditing(null)}>
            {editing && editing.id ? `Edit ${editing.firstName} ${editing.lastName}` : "Add staff member"}
          </ModalHeader>
          <ModalBody>
            <ErrorAlert message={problem} onClose={() => setProblem(null)} />
            <Row>
              <Col md={2}>
                <FormGroup>
                  <Label>Title</Label>
                  <Input value={form.salutation} onChange={set("salutation")} maxLength={20} />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>First name *</Label>
                  <Input value={form.firstName} onChange={set("firstName")} maxLength={100} />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Middle name</Label>
                  <Input value={form.middleName} onChange={set("middleName")} maxLength={100} />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Last name *</Label>
                  <Input value={form.lastName} onChange={set("lastName")} maxLength={100} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Email</Label>
                  <Input type="email" value={form.emailId1} onChange={set("emailId1")} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Second email</Label>
                  <Input type="email" value={form.emailId2} onChange={set("emailId2")} />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Phone</Label>
                  <Input value={form.phoneNumber1} onChange={set("phoneNumber1")} maxLength={40} />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Second phone</Label>
                  <Input value={form.phoneNumber2} onChange={set("phoneNumber2")} maxLength={40} />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Mobile</Label>
                  <Input value={form.mobilePhoneNumber} onChange={set("mobilePhoneNumber")} maxLength={40} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Occupation</Label>
                  <Input value={form.occupation} onChange={set("occupation")} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Practising certificate number</Label>
                  <Input value={form.practiceCertNumber} onChange={set("practiceCertNumber")} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Based at *</Label>
                  <Input type="select" value={form.siteId} onChange={set("siteId")}>
                    {!form.siteId && <option value="">Choose a site</option>}
                    {data.sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.siteName}
                        {s.active ? "" : " (inactive)"}
                      </option>
                    ))}
                  </Input>
                  <div className="ap-hint">Their cost is billed under this site.</div>
                </FormGroup>
              </Col>
              <Col md={6} style={{ display: "flex", alignItems: "center" }}>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="staff-active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  <Label check for="staff-active">
                    Active
                  </Label>
                </FormGroup>
              </Col>
            </Row>
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
    </div>
  );
};

export default CompanyStaffTab;
