import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import fileDownload from "js-file-download";
import { toast } from "react-toastify";
import { API } from "pages/Edge/apis";
import MasterFileBinderModal from "../Attachments/MasterFileBinderModal";
import TeamPrecedentPreview from "../../TeamPrecedents/TeamPrecedentPreview";
import TemplateErrorModal from "../../TemplateErrors/TemplateErrorModal";
import { templateErrorDetails } from "../../TemplateErrors/templateErrors";

const documentError = async (error) => {
  let body = error.response?.data;
  if (body instanceof Blob) { try { body = JSON.parse(await body.text()); } catch { body = null; } }
  return body?.message || body?.error?.message || "Workflow documents could not be prepared. Please try again.";
};
const documentKey = (link) => `${link.kind}:${link.documentId}`;
const canGenerate = (link) => link.available && ["PRECEDENT", "FORM"].includes(link.kind);

/** Decode every output before starting downloads so malformed responses cannot start a partial batch. */
const prepareDownloads = (documents) => documents.map((document) => {
  if (typeof document.filename !== "string" || !document.filename || typeof document.bytes !== "string" || !document.bytes)
    throw new Error("Incomplete document response");
  const binary = window.atob(document.bytes);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return { filename: document.filename, blob: new Blob([bytes], { type: "application/octet-stream" }) };
});

/** Selection is local to the dialog; the server preserves Admin's saved order and prepares the entire batch. */
const WorkflowDocumentsModal = ({ task, matter, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [checksum, setChecksum] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [templateErrors, setTemplateErrors] = useState([]);
  const revision = useRef(0);
  const endpoint = `/api/matter/checklist/workflow/matters/${matter.id}/tasks/${task.id}/documents`;
  const previewApi = useMemo(() => ({
    preview: (id, options = {}) => API.get(`${endpoint}/${sourcePreview?.kind}/${id}/original`, { ...options, responseType: "blob" }),
    download: (id) => API.get(`${endpoint}/${sourcePreview?.kind}/${id}/original`, { responseType: "blob" }),
  }), [endpoint, sourcePreview?.kind]);
  useEffect(() => {
    const current = ++revision.current;
    setLoading(true);
    setGenerating(false);
    setDocuments([]);
    setChecksum(null);
    setSelected(new Set());
    setError("");
    setTemplateErrors([]);
    (async () => {
      try {
        const response = await API.get(endpoint);
        if (revision.current === current) {
          setDocuments(response.data.documents || []);
          setChecksum(response.data.checksum);
        }
      } catch (err) {
        const message = await documentError(err);
        if (revision.current === current) setError(message);
      } finally {
        if (revision.current === current) setLoading(false);
      }
    })();
    return () => { revision.current++; };
  }, [endpoint]);
  const eligible = documents.filter(canGenerate);
  // Filtering the configured list, rather than iterating the Set, keeps Admin's order.
  const chosen = eligible.filter((link) => selected.has(documentKey(link)));
  const legacy = documents.some((link) => !["PRECEDENT", "FORM"].includes(link.kind));
  const toggleSelected = (link) => setSelected((previous) => {
    const next = new Set(previous), key = documentKey(link);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
  const generate = async () => {
    if (generating || loading || !chosen.length) return;
    const current = revision.current;
    setGenerating(true);
    setError("");
    try {
      const response = await API.post(`${endpoint}/generate`, {
        checksum,
        documents: chosen.map(({ kind, documentId }) => ({ kind, documentId })),
      }, { timeout: 0 });
      if (revision.current !== current) return;
      const outputs = response.data?.documents;
      if (!Array.isArray(outputs) || outputs.length !== chosen.length) throw new Error("Incomplete document batch");
      const downloads = prepareDownloads(outputs);
      // Browser downloads cannot be rolled back; all generation/decoding finishes before the first starts.
      downloads.forEach(({ blob, filename }) => fileDownload(blob, filename));
      toast.success("Document downloads started. Review them before uploading through the Veeto plugin.");
    } catch (err) {
      const validation = await templateErrorDetails(err);
      if (revision.current !== current) return;
      if (validation) setTemplateErrors([validation]);
      else {
        const message = await documentError(err);
        if (revision.current === current) setError(message);
      }
    } finally { if (revision.current === current) setGenerating(false); }
  };
  return <>
    <Modal isOpen toggle={generating ? undefined : onClose} size="lg" centered scrollable backdrop="static" keyboard={!generating} className="workflow-documents-modal">
      <ModalHeader toggle={generating ? undefined : onClose}>Documents — {task.taskTitle}</ModalHeader>
      <ModalBody>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {loading ? <div className="d-flex gap-2 align-items-center py-4" role="status"><Spinner size="sm" color="primary" />Loading task documents…</div> : <>
          {!documents.length ? <p className="text-muted">No Precedents or Forms are configured for this task.</p> : <p className="small text-muted">Select the documents you need. They generate in the configured order and download as separate, numbered files. Allow multiple downloads in your browser if prompted. Review the files, then upload them through the Veeto plugin.</p>}
          {legacy && <div className="alert alert-warning" role="alert">Legacy links cannot be selected. Ask an administrator to review their Precedent/Form configuration.</div>}
          {!!documents.length && <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
            <Button size="sm" outline color="primary" disabled={generating || !eligible.length || chosen.length === eligible.length} onClick={() => setSelected(new Set(eligible.map(documentKey)))}>Select all</Button>
            <Button size="sm" outline color="primary" disabled={generating || !chosen.length} onClick={() => setSelected(new Set())}>Clear selection</Button>
            <span className="small text-muted" role="status">{chosen.length} selected</span>
          </div>}
          {documents.map((link, index) => <div className="workflow-document-row" key={documentKey(link)}>
            <input type="checkbox" aria-label={`Select ${link.name}`} disabled={generating || !canGenerate(link)} checked={selected.has(documentKey(link))} onChange={() => toggleSelected(link)} />
            <span className="text-muted">{index + 1}.</span>
            <div className="flex-grow-1"><strong>{link.name}</strong><div className="small text-muted">
              {link.kind === "FORM" ? "Form" : link.kind === "PRECEDENT" ? "Precedent" : "Legacy document"}{link.type ? ` · ${link.type.toUpperCase()}` : ""}{!link.available ? " — deleted or unavailable" : ""}
            </div></div>
            {link.available && <Button size="sm" outline color="primary" disabled={generating} onClick={() => link.kind === "MATTER_ATTACHMENT" ? setPreview(link.documentId) : setSourcePreview(link)}>Preview original</Button>}
          </div>)}
        </>}
        {generating && <div className="d-flex align-items-center gap-2 mt-3" role="status" aria-live="polite"><Spinner color="primary" size="sm" /><span>Preparing selected documents… Downloads start only when every selected document is ready.</span></div>}
      </ModalBody>
      <ModalFooter>
        <Button outline color="primary" disabled={generating} onClick={onClose}>Close</Button>
        <Button color="primary" disabled={loading || generating || !chosen.length} onClick={generate}>
          {generating ? "Generating…" : `Generate & Download Selected (${chosen.length})`}
        </Button>
      </ModalFooter>
    </Modal>
    <TemplateErrorModal errors={templateErrors} onClose={() => setTemplateErrors([])} />
    {preview != null && <MasterFileBinderModal isOpen toggle={() => setPreview(null)} matterId={matter.id} matterData={matter} initialAttachmentId={preview} initialSelectedIds={[preview]} />}
    {sourcePreview && <TeamPrecedentPreview contentApi={previewApi} file={{ id: sourcePreview.documentId, name: sourcePreview.name, type: sourcePreview.type }} onClose={() => setSourcePreview(null)} />}
  </>;
};
export default WorkflowDocumentsModal;
