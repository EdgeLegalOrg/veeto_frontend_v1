import React, { useEffect, useState } from "react";
import { Button, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import fileDownload from "js-file-download";
import { toast } from "react-toastify";
import { checkHasPermission } from "../../utils/utilFunc";
import { documentFoldersApi } from "../Matters/Attachments/documentFoldersApi";
import { getStorageTypeApi } from "../../apis";
import TeamPrecedentBrowser from "./TeamPrecedentBrowser";
import { downloadName, precedentError, useTeamPrecedent } from "./api";

/** Matter-only generation/copy controls; library management has no matter actions. */
const TeamPrecedentPicker = ({ matter, onClose, onSaved }) => {
  const [chosen, setChosen] = useState(null);
  const [action, setAction] = useState("GENERATE");
  const [output, setOutput] = useState("DOWNLOAD");
  const [name, setName] = useState("");
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canSave = checkHasPermission("UpdateMatter") && (!matter?.flagArchived || checkHasPermission("EditArchivedMatter"));
  const saves = output !== "DOWNLOAD";
  const word = ["doc", "docx"].includes(chosen?.file.type?.toLowerCase());

  useEffect(() => {
    if (!saves || !chosen || !canSave) return;
    let active = true;
    setLoading(true); setError(""); setFolderId("");
    const api = documentFoldersApi("MATTER_ATTACHMENT", matter.id);
    (async () => {
      try {
        const [response, storage] = await Promise.all([api.list(), getStorageTypeApi({ siteId: matter.siteId })]);
        const provider = storage.data?.success ? storage.data.data : null;
        let next = response.data.folders || [];
        if (active && !next.some((folder) => folder.parentId == null && folder.provider === provider)
          && ["SERVER", "ONEDRIVE"].includes(provider)) {
          const root = await api.root(provider);
          next = [...next.filter((folder) => folder.id !== root.data.id), root.data];
        }
        if (!active) return;
        setFolders(next);
        setFolderId(String(next.find((folder) => folder.parentId == null && folder.provider === provider)?.id || next[0]?.id || ""));
      } catch (err) { if (active) setError(await precedentError(err)); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [saves, chosen, matter.id, matter.siteId, canSave]);

  const folderLabel = (folder) => {
    const parts = [], visited = new Set();
    let current = folder;
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      parts.unshift(current.parentId == null ? `Matter #${matter.matterNumber} (${current.provider === "ONEDRIVE" ? "OneDrive" : "Server"})` : current.name);
      current = folders.find((item) => item.id === current.parentId);
    }
    return parts.join(" / ");
  };
  const submit = async () => {
    if (!chosen || busy || loading || !name.trim() || (saves && (!canSave || !folderId))) return;
    setBusy(true); setError("");
    try {
      const response = await useTeamPrecedent(matter.id, chosen.file, {
        action, output, name: name.trim(), folderId: saves ? Number(folderId) : null,
      });
      if (output !== "SAVE") {
        const extension = chosen.file.type;
        const fallback = extension && !name.toLowerCase().endsWith(`.${extension.toLowerCase()}`) ? `${name}.${extension}` : name;
        fileDownload(response.data, downloadName(response, fallback));
      }
      if (saves) { toast.success("Document saved to Matter Attachments."); onSaved?.(); }
      else toast.success("Document download ready.");
      onClose();
    } catch (err) { setError(await precedentError(err)); }
    finally { setBusy(false); }
  };

  return <Modal isOpen toggle={busy ? undefined : onClose} size="xl" className="matter-folder-modal team-precedent-picker" centered style={{ maxWidth: chosen ? 760 : 1400, width: chosen ? "90vw" : "96vw" }}>
    <ModalHeader toggle={busy ? undefined : onClose}>Team Precedents — Matter #{matter.matterNumber}</ModalHeader>
    <ModalBody>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!chosen ? <>
        <p className="text-muted">Choose a master file from the company’s shared Team Precedents. Browse its folders or search by filename.</p>
        <TeamPrecedentBrowser siteId={matter.siteId} onChoose={(file, config) => {
          setChosen({ file, config }); setName(file.name || ""); setOutput("DOWNLOAD"); setError("");
          setAction(["doc", "docx"].includes(file.type?.toLowerCase()) ? "GENERATE" : "COPY");
        }} />
      </> : <div className="row g-3">
        <div className="col-12"><strong>{chosen.file.name}</strong></div>
        <div className="col-md-6"><label className="form-label" htmlFor="precedent-action">Action</label>
          <Input id="precedent-action" type="select" value={action} disabled={busy} onChange={(event) => setAction(event.target.value)}>
            <option value="GENERATE" disabled={!word}>Generate for this matter</option><option value="COPY">Copy unchanged</option>
          </Input><small className="text-muted">{word ? "Generate replaces supported template fields with matter details." : "Use Copy unchanged for this file type. Generation supports DOCX and DOC templates."}</small>
        </div>
        <div className="col-md-6"><label className="form-label" htmlFor="precedent-output">Output</label>
          <Input id="precedent-output" type="select" value={output} disabled={busy} onChange={(event) => setOutput(event.target.value)}>
            <option value="DOWNLOAD">Download</option><option value="SAVE" disabled={!canSave}>Save to Matter Attachments</option><option value="BOTH" disabled={!canSave}>Download and save</option>
          </Input></div>
        <div className="col-12"><label className="form-label" htmlFor="precedent-name">File name</label><Input id="precedent-name" maxLength={200} value={name} disabled={busy} onChange={(event) => setName(event.target.value)} /></div>
        {saves && <div className="col-12"><label className="form-label" htmlFor="precedent-folder">Destination folder</label>
          <Input id="precedent-folder" type="select" value={folderId} disabled={busy || loading} onChange={(event) => setFolderId(event.target.value)}>
            <option value="">{loading ? "Loading folders…" : "Choose a folder"}</option>
            {folders.map((folder) => <option key={folder.id} value={folder.id}>{folderLabel(folder)}</option>)}
          </Input></div>}
      </div>}
    </ModalBody>
    <ModalFooter>
      {chosen && <Button color="primary" outline disabled={busy} onClick={() => { setChosen(null); setError(""); setOutput("DOWNLOAD"); }}>Back to library</Button>}
      <Button color="primary" outline disabled={busy} onClick={onClose}>Cancel</Button>
      {chosen && <Button color="primary" disabled={busy || loading || !name.trim() || (saves && (!canSave || !folderId))} onClick={submit}>{busy ? "Preparing…" : "Continue"}</Button>}
    </ModalFooter>
  </Modal>;
};
export default TeamPrecedentPicker;
