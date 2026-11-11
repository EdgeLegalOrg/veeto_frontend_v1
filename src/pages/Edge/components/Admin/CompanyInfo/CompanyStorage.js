import React, { useEffect, useState } from "react";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import { API } from "../../../apis";
import { checkHasPermission } from "../../../utils/utilFunc";
import { precedentError } from "../../TeamPrecedents/api";

/** Select one existing Microsoft connection and one company folder without exposing credentials. */
const CompanyStorage = () => {
  const [data, setData] = useState(null);
  const [connection, setConnection] = useState("");
  const [folder, setFolder] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const admin = checkHasPermission("ViewAdminTab");
  const apply = (next) => { setData(next); setConnection(String(next.storageConfigId || "")); setFolder(next.organizationFolder || ""); };
  const load = async () => {
    setBusy(true); setError("");
    try { const response = await API.get("/api/company-storage"); apply(response.data); }
    catch (err) { setError(await precedentError(err)); }
    finally { setBusy(false); }
  };
  useEffect(() => { if (admin) load(); }, [admin]);
  const save = async () => {
    setBusy(true); setError("");
    try {
      const response = await API.put("/api/company-storage", { storageConfigId: Number(connection), organizationFolder: folder.trim(), version: data.version });
      apply(response.data); toast.success("Company storage saved.");
    } catch (err) { setError(await precedentError(err)); }
    finally { setBusy(false); }
  };
  if (!admin) return null;
  return <section className="border rounded p-3 my-3">
    <h5>Company Storage — Team Precedents</h5>
    <p className="text-muted small">All offices share this library. Reuse an existing OneDrive connection and choose the company folder that will contain TEAM_PRECEDENTS. Site storage settings and existing Documents stay unchanged.</p>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <div className="row g-3">
      <div className="col-md-6"><label className="form-label" htmlFor="company-storage-connection">OneDrive connection</label>
        <Input type="select" id="company-storage-connection" value={connection} disabled={busy || !data || data.locked} onChange={(event) => setConnection(event.target.value)}>
          <option value="">Select a connection</option>
          {(data?.connections || []).map((item) => <option key={item.id} value={item.id}>Office {item.siteId} · {item.category} · {item.organizationFolder || "OneDrive"} · Connection #{item.id}</option>)}
        </Input></div>
      <div className="col-md-6"><label className="form-label" htmlFor="company-storage-folder">Company folder</label>
        <Input id="company-storage-folder" maxLength={200} value={folder} disabled={busy || !data || data.locked} onChange={(event) => setFolder(event.target.value)} />
      </div>
    </div>
    {data && !data.connections?.length && <p className="text-muted small mt-2">Configure an office OneDrive connection first; it can then be reused here.</p>}
    {data?.locked && <p className="text-muted small mt-2">The library location is in use. Changing it requires a storage migration.</p>}
    <div className="d-flex gap-2 mt-3">
      <Button color="primary" disabled={busy || !data || data.locked || !connection || !folder.trim()} onClick={save}>{busy ? "Processing…" : "Save company storage"}</Button>
      <Button color="primary" outline disabled={busy} onClick={load}>Refresh</Button>
    </div>
  </section>;
};
export default CompanyStorage;
