import React, { useState } from "react";
import { Button, Col, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import { getStorage, saveStorage } from "./adminPortalApi";
import SitePicker from "./SitePicker";
import { ConfirmModal, ErrorAlert, Loading, StatusBadge, useLoad } from "./shared";

const TYPE_LABEL = { SERVER: "Server", ONEDRIVE: "OneDrive", GOOGLE_DRIVE: "Google Drive" };
const CATEGORY_LABEL = { LOCAL: "Local", GENERAL: "General", SPECIFIC: "Specific" };

const EMPTY = {
  storageType: "SERVER",
  category: "SPECIFIC",
  tenantId: "",
  clientId: "",
  clientSecret: "",
  sharePointSiteId: "",
  organizationFolder: "",
};

/** Where one site of the company keeps its documents. */
const CompanyStorageTab = ({ data, companyId }) => {
  const [siteId, setSiteId] = useState(null);
  const loaded = useLoad(() => (siteId ? getStorage(companyId, siteId) : Promise.resolve(null)), [companyId, siteId]);
  const [form, setForm] = useState(EMPTY);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);

  const configs = loaded.data || [];
  const active = configs.find((c) => c.active);
  const isOneDrive = form.storageType === "ONEDRIVE";
  const held = configs.find((c) => c.storageType === "ONEDRIVE" && c.category === form.category);

  const edit = (config) =>
    setForm({
      ...EMPTY,
      storageType: config.storageType === "ONEDRIVE" ? "ONEDRIVE" : "SERVER",
      category: config.category === "GENERAL" ? "GENERAL" : "SPECIFIC",
      tenantId: config.tenantId || "",
      clientId: config.clientId || "",
      sharePointSiteId: config.sharePointSiteId || "",
      organizationFolder: config.organizationFolder || "",
    });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const canSave =
    !isOneDrive ||
    (form.tenantId.trim() && form.clientId.trim() && form.sharePointSiteId.trim() && (form.clientSecret.trim() || (held && held.hasSecret)));

  const save = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await saveStorage(companyId, siteId, form);
      toast.success("Storage type saved");
      setConfirming(false);
      setForm({ ...form, clientSecret: "" });
      loaded.reload();
    } catch (e) {
      setConfirming(false);
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ap-card">
      <h2>Storage type</h2>
      <p className="ap-hint">Where one site keeps its documents. Choosing a setup makes it the site's active one.</p>
      <SitePicker sites={data.sites} siteId={siteId} onChange={setSiteId} />
      <ErrorAlert message={problem || loaded.error} onClose={() => setProblem(null)} />

      {loaded.loading && !loaded.data ? (
        <Loading />
      ) : (
        <>
          <table className="ap-table">
            <thead>
              <tr>
                <th>Storage</th>
                <th>Category</th>
                <th>Details</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {configs.map((c) => (
                <tr key={c.id}>
                  <td>{TYPE_LABEL[c.storageType] || c.storageType}</td>
                  <td>{CATEGORY_LABEL[c.category] || c.category}</td>
                  <td>
                    {c.storageType === "ONEDRIVE" ? (
                      <>
                        <div className="ap-hint">Tenant {c.tenantId || "—"}</div>
                        <div className="ap-hint">Client {c.clientId || "—"}</div>
                        <div className="ap-hint">
                          Secret: {c.hasSecret ? "held (never shown)" : <strong>not set</strong>}
                        </div>
                        <div className="ap-hint">Folder {c.organizationFolder || "—"}</div>
                      </>
                    ) : (
                      <span className="ap-hint">—</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge ok={c.active} okText="In use" badText="Not in use" />
                  </td>
                  <td className="ap-actions">
                    {(c.storageType === "ONEDRIVE" || c.storageType === "SERVER") && (
                      <Button size="sm" color="light" onClick={() => edit(c)}>
                        Use this setup
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {configs.length === 0 && (
                <tr>
                  <td colSpan={5} className="ap-hint">
                    Nothing is set up for this site.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <h3 style={{ marginTop: 20 }}>Set the storage</h3>
          <Row>
            <Col md={4}>
              <FormGroup>
                <Label>Store documents on</Label>
                <Input type="select" value={form.storageType} onChange={set("storageType")}>
                  <option value="SERVER">The server</option>
                  <option value="ONEDRIVE">OneDrive</option>
                </Input>
                <div className="ap-hint">Google Drive uses one platform account, so it has no setup here.</div>
              </FormGroup>
            </Col>
            {isOneDrive && (
              <>
                <Col md={4}>
                  <FormGroup>
                    <Label>Category</Label>
                    <Input type="select" value={form.category} onChange={set("category")}>
                      <option value="SPECIFIC">Specific</option>
                      <option value="GENERAL">General</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label>Organisation folder</Label>
                    <Input value={form.organizationFolder} onChange={set("organizationFolder")} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Tenant ID *</Label>
                    <Input value={form.tenantId} onChange={set("tenantId")} autoComplete="off" />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Client ID *</Label>
                    <Input value={form.clientId} onChange={set("clientId")} autoComplete="off" />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Client secret {held && held.hasSecret ? "" : "*"}</Label>
                    <Input
                      type="password"
                      value={form.clientSecret}
                      autoComplete="new-password"
                      placeholder={held && held.hasSecret ? "Leave blank to keep the current one" : ""}
                      onChange={set("clientSecret")}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>SharePoint site ID *</Label>
                    <Input value={form.sharePointSiteId} onChange={set("sharePointSiteId")} autoComplete="off" />
                  </FormGroup>
                </Col>
              </>
            )}
          </Row>
          <Button color="primary" disabled={busy || !siteId || !canSave} onClick={() => setConfirming(true)}>
            {busy ? <Spinner size="sm" /> : "Save storage type"}
          </Button>
        </>
      )}

      <ConfirmModal
        isOpen={confirming}
        busy={busy}
        title="Change where documents are stored"
        confirmLabel="Change"
        onConfirm={save}
        onCancel={() => setConfirming(false)}
      >
        <p>
          Make {isOneDrive ? `OneDrive (${CATEGORY_LABEL[form.category]})` : "server storage"} the active storage for
          this site{active ? `, replacing ${TYPE_LABEL[active.storageType]}` : ""}? This only changes the setting: it does
          not move any document that is already stored.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default CompanyStorageTab;
