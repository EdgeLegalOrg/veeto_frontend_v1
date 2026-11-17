import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import fileDownload from "js-file-download";
import { toast } from "react-toastify";
import { API } from "pages/Edge/apis";
import MasterFileBinderModal from "../Attachments/MasterFileBinderModal";
import TeamPrecedentPreview from "../../TeamPrecedents/TeamPrecedentPreview";
import { downloadName } from "../../TeamPrecedents/api";
import TemplateErrorModal from "../../TemplateErrors/TemplateErrorModal";
import { templateErrorDetails } from "../../TemplateErrors/templateErrors";

const documentError = async (error) => {
  let body = error.response?.data;
  if (body instanceof Blob) { try { body = JSON.parse(await body.text()); } catch { body = null; } }
  return body?.message || body?.error?.message || "Workflow documents could not be prepared. Please try again.";
};

/** Ordered Precedents/Forms are generated as one atomic, download-only ZIP. */
const WorkflowDocumentsModal = ({ task, matter, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [templateErrors, setTemplateErrors] = useState([]);
  const endpoint = `/api/matter/checklist/workflow/matters/${matter.id}/tasks/${task.id}/documents`;
  const previewApi = useMemo(() => ({
    preview: (id, options = {}) => API.get(`${endpoint}/${sourcePreview?.kind}/${id}/original`, { ...options, responseType: "blob" }),
    download: (id) => API.get(`${endpoint}/${sourcePreview?.kind}/${id}/original`, { responseType: "blob" }),
  }), [endpoint, sourcePreview?.kind]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const response = await API.get(endpoint);
        if (active) setDocuments(response.data.documents || []);
      } catch (err) {
        if (active) setError(await documentError(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [endpoint]);
  const legacy = documents.some((link) => !["PRECEDENT", "FORM"].includes(link.kind));
  const generate = async () => {
    if (generating || loading || !documents.length || legacy || documents.some((link) => !link.available)) return;
    setGenerating(true);
    setError("");
    try {
      const response = await API.post(`${endpoint}/generate`, null, { responseType: "blob", timeout: 0 });
      fileDownload(response.data, downloadName(response, `Workflow_Documents_Matter_${matter.matterNumber}_Task_${task.id}.zip`));
      toast.success("Workflow documents downloaded. Review them before uploading through the Veeto plugin.");
    } catch (err) {
      const validation = await templateErrorDetails(err);
      if (validation) setTemplateErrors([validation]);
      else setError(await documentError(err));
    } finally { setGenerating(false); }
  };
  return <>
    <Modal isOpen toggle={generating ? undefined : onClose} size="lg" centered scrollable backdrop="static" keyboard={!generating} className="workflow-documents-modal">
      <ModalHeader toggle={generating ? undefined : onClose}>Documents — {task.taskTitle}</ModalHeader>
      <ModalBody>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {loading ? <div className="d-flex gap-2 align-items-center py-4" role="status"><Spinner size="sm" color="primary" />Loading task documents…</div> : <>
          {!documents.length ? <p className="text-muted">No Precedents or Forms are configured for this task.</p> : <p className="small text-muted">Download one ZIP containing separate documents numbered in this order. Each DOCX is generated independently; other formats remain unchanged. Review the files, then upload them through the Veeto plugin.</p>}
          {legacy && <div className="alert alert-warning" role="alert">This task has legacy document links. Ask an administrator to review its Precedent/Form configuration before generating the batch.</div>}
          {documents.map((link, index) => <div className="workflow-document-row" key={`${link.kind}-${link.documentId}`}>
            <span className="text-muted">{index + 1}.</span>
            <div className="flex-grow-1"><strong>{link.name}</strong><div className="small text-muted">
              {link.kind === "FORM" ? "Form" : link.kind === "PRECEDENT" ? "Precedent" : "Legacy document"}{link.type ? ` · ${link.type.toUpperCase()}` : ""}{!link.available ? " — deleted or unavailable" : ""}
            </div></div>
            {link.available && <Button size="sm" outline color="primary" disabled={generating} onClick={() => link.kind === "MATTER_ATTACHMENT" ? setPreview(link.documentId) : setSourcePreview(link)}>Preview original</Button>}
          </div>)}
        </>}
        {generating && <div className="d-flex align-items-center gap-2 mt-3" role="status" aria-live="polite"><Spinner color="primary" size="sm" /><span>Preparing all documents… Your ZIP will download when every document is ready.</span></div>}
      </ModalBody>
      <ModalFooter>
        <Button outline color="primary" disabled={generating} onClick={onClose}>Close</Button>
        <Button color="primary" disabled={loading || generating || !documents.length || legacy || documents.some((link) => !link.available)} onClick={generate}>
          {generating ? "Generating…" : "Generate all documents"}
        </Button>
      </ModalFooter>
    </Modal>
    <TemplateErrorModal errors={templateErrors} onClose={() => setTemplateErrors([])} />
    {preview != null && <MasterFileBinderModal isOpen toggle={() => setPreview(null)} matterId={matter.id} matterData={matter} initialAttachmentId={preview} initialSelectedIds={[preview]} />}
    {sourcePreview && <TeamPrecedentPreview contentApi={previewApi} file={{ id: sourcePreview.documentId, name: sourcePreview.name, type: sourcePreview.type }} onClose={() => setSourcePreview(null)} />}
  </>;
};
export default WorkflowDocumentsModal;
