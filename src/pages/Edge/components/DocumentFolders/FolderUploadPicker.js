import React, { useRef, useState } from "react";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import "./FolderUploadPicker.css";

/** Shared local-file drop zone and editable queue; parents own destination and upload requests. */
const FolderUploadPicker = ({ entries, onFiles, onChange, disabled, idPrefix }) => {
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);
  return (
    <>
      <div
        className={`folder-upload-dropzone ${dragging ? "is-dragging" : ""}`}
        role="group"
        aria-label="Choose files to upload"
        aria-disabled={disabled}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.stopPropagation();
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragging(false);
          if (disabled) return;
          if (Array.from(event.dataTransfer.items || []).some((item) => item.webkitGetAsEntry?.()?.isDirectory)) {
            toast.info("Choose files only; folder uploads are not supported.");
            return;
          }
          onFiles(event.dataTransfer.files);
        }}
      >
        <i className="ri-upload-cloud-2-line fs-2 text-primary" aria-hidden="true" />
        <p className="mb-2">Drag and drop files here, or browse to select them.</p>
        <Button color="primary" outline size="sm" disabled={disabled} onClick={() => input.current?.click()}>
          Browse files
        </Button>
        <input
          ref={input}
          type="file"
          multiple
          hidden
          disabled={disabled}
          onChange={(event) => {
            onFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      <div className="small text-muted my-2" role="status">
        {entries.length ? `${entries.length} file(s) selected` : "No files selected."}
      </div>
      <div className="matter-folder-upload-list">
        {entries.map((entry) => (
          <div key={entry.id} className="matter-folder-upload-item">
            <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
              <div className="matter-folder-upload-filename" title={entry.file.name}>
                {entry.file.name}
              </div>
              <Button
                color="primary"
                outline
                size="sm"
                disabled={disabled}
                onClick={() => onChange((previous) => previous.filter((item) => item.id !== entry.id))}
                aria-label={`Remove ${entry.file.name}`}
              >
                Remove
              </Button>
            </div>
            <label htmlFor={`${idPrefix}-upload-${entry.id}`} className="form-label">
              Display name
            </label>
            <Input
              id={`${idPrefix}-upload-${entry.id}`}
              value={entry.name}
              maxLength={200}
              disabled={disabled}
              onChange={(event) =>
                onChange((previous) => previous.map((item) => (item.id === entry.id ? { ...item, name: event.target.value } : item)))
              }
            />
            {entry.status && (
              <div className="small text-muted mt-2" role="status">
                {entry.status === "UPLOADING"
                  ? entry.progress === 100
                    ? "Upload sent; processing…"
                    : `Uploading${entry.progress != null ? `… ${entry.progress}%` : "…"}`
                  : entry.status === "DONE"
                    ? "Uploaded"
                    : "Upload failed"}
              </div>
            )}
            {entry.status === "UPLOADING" && entry.progress != null && (
              <progress
                className="folder-upload-progress"
                max={100}
                value={entry.progress}
                aria-label={`Upload progress for ${entry.file.name}`}
              />
            )}
            {entry.error && (
              <div role="alert" className="small text-danger mt-2">
                {entry.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
export default FolderUploadPicker;
