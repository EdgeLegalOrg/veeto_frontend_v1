import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import fileDownload from "js-file-download";
import { toast } from "react-toastify";
import DocxAttachmentPreview from "../Matters/Attachments/DocxAttachmentPreview";
import BrowserAttachmentPreview from "../Matters/Attachments/BrowserAttachmentPreview";
import "../Matters/Attachments/MasterFileBinderModal.css";
import "./TeamPrecedentPreview.css";
import { downloadName, precedentError, teamPrecedentsApi } from "./api";

const imageTypes = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", bmp: "image/bmp", webp: "image/webp", avif: "image/avif" };
const previewLimit = 20 * 1024 * 1024;

/** Read-only master preview. Uses company-authorised bytes without generating or saving a document. */
const TeamPrecedentPreview = ({ companyId, file, onClose }) => {
  const api = useMemo(() => teamPrecedentsApi(companyId), [companyId]);
  const extension = (file.type || file.name?.split(".").pop() || "").toLowerCase().replace(/^\./, "");
  const kind = ["heic", "heif"].includes(extension) ? "heic" : ["xls", "xlsx"].includes(extension) ? "spreadsheet" : null;
  const nativeType = extension === "pdf" ? "application/pdf" : imageTypes[extension];
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(!!nativeType);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const imageCache = useRef(new Map());
  const item = useMemo(() => ({ attachmentId: file.id, fileExtension: file.type, name: file.name, checksum: String(file.version), uploadDate: file.uploadDate }), [file]);

  // A stable injected loader keeps reusable previews independent of the matter attachment endpoint.
  const loadPreview = useCallback(async (id, options = {}) => {
    const response = await api.preview(id, { timeout: 45000, ...options });
    if (!response.data.size || response.data.size > previewLimit) throw new Error("This file is empty or exceeds the 20 MB preview limit. Download it to view the original.");
    return response;
  }, [api]);
  const download = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await api.download(file.id);
      const fallback = extension && !file.name.toLowerCase().endsWith(`.${extension}`) ? `${file.name}.${extension}` : file.name;
      fileDownload(response.data, downloadName(response, fallback));
    } catch (err) { toast.error(await precedentError(err)); }
    finally { setDownloading(false); }
  };

  useEffect(() => {
    if (!nativeType) return;
    const controller = new AbortController();
    let active = true, objectUrl;
    setLoading(true); setError("");
    (async () => {
      try {
        const response = await loadPreview(file.id, { signal: controller.signal });
        if (!active) return;
        objectUrl = URL.createObjectURL(new Blob([response.data], { type: nativeType }));
        setUrl(objectUrl);
      } catch (err) { if (active) setError("This file could not be previewed. Download it to view the original."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [file.id, nativeType, loadPreview]);

  let content;
  if (error) content = <div className="alert alert-warning m-3" role="alert">{error}</div>;
  else if (extension === "docx") content = <DocxAttachmentPreview attachmentId={file.id} title={file.name} onDownload={download} loadPreview={loadPreview} />;
  else if (kind) content = <BrowserAttachmentPreview item={item} kind={kind} title={file.name} onDownload={download} imageCache={imageCache} loadPreview={loadPreview} />;
  else if (loading) content = <div className="m-auto text-center" role="status"><Spinner color="primary" /><p className="mt-2">Loading preview…</p></div>;
  else if (url && extension === "pdf") content = <iframe title={file.name} src={url} style={{ width: "100%", height: "100%", border: 0 }} />;
  else if (url && nativeType) content = <div className="overflow-auto w-100 text-center"><img src={url} alt={file.name} style={{ maxWidth: "100%", height: "auto" }} onError={() => setError("This image could not be displayed. Download it to view the original.")} /></div>;
  else content = <p className="m-auto p-4 text-muted">Preview is unavailable for this file type. Download the original to open it.</p>;

  return <Modal isOpen toggle={onClose} size="xl" centered className="matter-folder-modal team-precedent-preview" style={{ width: "94vw", maxWidth: 1400 }}>
    <ModalHeader toggle={onClose}>Preview — {file.name}</ModalHeader>
    <ModalBody style={{ display: "flex", height: "72vh", minHeight: 250, overflow: "hidden", padding: 0 }}>{content}</ModalBody>
    <ModalFooter><Button color="primary" outline onClick={onClose}>Close</Button><Button color="primary" disabled={downloading} onClick={download}>{downloading ? "Preparing download…" : "Download original"}</Button></ModalFooter>
  </Modal>;
};
export default TeamPrecedentPreview;
