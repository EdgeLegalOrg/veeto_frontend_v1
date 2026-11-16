import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { API } from "pages/Edge/apis";
import MasterFileBinderModal from "../Attachments/MasterFileBinderModal";
import TeamPrecedentPicker from "../../TeamPrecedents/TeamPrecedentPicker";
import TeamPrecedentPreview from "../../TeamPrecedents/TeamPrecedentPreview";
import { teamPrecedentsConfiguration } from "../../TeamPrecedents/api";

/** Task-specific references; previews/generation use the existing permission-checked document flows. */
const WorkflowDocumentsModal = ({ task, matter, onClose, onChanged }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [precedent, setPrecedent] = useState(null);
  const [masterPreview, setMasterPreview] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const endpoint = `/api/matter/checklist/workflow/matters/${matter.id}/tasks/${task.id}/documents`;
  const message = (err) =>
    err.response?.data?.message || err.response?.data?.error?.message || "Task documents could not be loaded. Please retry.";
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await API.get(endpoint);
        if (active) {
          setDocuments(response.data.documents || []);
        }
      } catch (err) {
        if (active) setError(message(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [endpoint]);
  const previewDocument = async (link) => {
    if (previewing) return;
    if (link.kind === "MATTER_ATTACHMENT") {
      setPreview(link.documentId);
      return;
    }
    setPreviewing(`${link.kind}-${link.documentId}`);
    setError("");
    try {
      const { data: configuration } = await teamPrecedentsConfiguration(matter.siteId);
      if (!configuration?.companyId) throw new Error("Team Precedents configuration is unavailable.");
      setMasterPreview({
        companyId: configuration.companyId,
        file: { id: link.documentId, name: link.name, type: link.type, version: link.version },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to prepare this document preview. Please retry.");
    } finally {
      setPreviewing(null);
    }
  };

  return (
    <>
      <Modal isOpen toggle={onClose} size="lg" centered scrollable className="workflow-documents-modal">
        <ModalHeader toggle={onClose}>Documents — {task.taskTitle}</ModalHeader>
        <ModalBody>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              {!documents.length && <p className="text-muted">No documents linked to this task.</p>}
              {documents.map((link) => (
                <div className="workflow-document-row" key={`${link.kind}-${link.documentId}`}>
                  <div className="flex-grow-1">
                    <strong>{link.name}</strong>
                    <div className="small text-muted">
                      {link.kind === "TEAM_PRECEDENT" ? "Team Precedent" : "Matter attachment"}
                      {!link.available ? " — deleted or unavailable" : ""}
                    </div>
                  </div>
                  {link.available && (
                    <>
                      <Button size="sm" outline color="primary" disabled={previewing != null} onClick={() => previewDocument(link)}>
                        {previewing === `${link.kind}-${link.documentId}` ? "Opening…" : "Preview"}
                      </Button>
                      {link.kind === "TEAM_PRECEDENT" && (
                        <Button
                          size="sm"
                          outline
                          color="primary"
                          disabled={previewing != null}
                          onClick={() => setPrecedent({ id: link.documentId, name: link.name, type: link.type, version: link.version })}
                        >
                          Use precedent
                        </Button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button outline color="primary" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
      {preview != null && (
        <MasterFileBinderModal
          isOpen
          toggle={() => setPreview(null)}
          matterId={matter.id}
          matterData={matter}
          initialAttachmentId={preview}
          initialSelectedIds={[preview]}
        />
      )}
      {masterPreview && (
        <TeamPrecedentPreview companyId={masterPreview.companyId} file={masterPreview.file} onClose={() => setMasterPreview(null)} />
      )}
      {precedent && <TeamPrecedentPicker matter={matter} initialFile={precedent} onClose={() => setPrecedent(null)} onSaved={onChanged} />}
    </>
  );
};
export default WorkflowDocumentsModal;
