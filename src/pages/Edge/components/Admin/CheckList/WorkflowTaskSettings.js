import React, { useEffect, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { API } from "../../../apis";
import { listWorkflowDocuments } from "../../../../AdminPortal/adminPortalApi";
import "../../../stylesheets/CheckListTab.css";
import FileDirectoryModal from "../../FileDirectory";
import WorkflowSortableList, { WorkflowDragHandle, reorderWorkflowItems } from "./WorkflowSortableList";

export const MATTER_DATE_OPTIONS = [
  ["INSTRUCTION_DATE", "Instruction Date"],
  ["EXCHANGE_DATE", "Exchange Date"],
  ["COOLING_OFF_DATE", "Cooling Off Date"],
  ["SETTLEMENT_DATE", "Settlement Date"],
  ["ADJUSTMENT_DATE", "Adjustment Date"],
];
const DELIVERY = [
  ["IN_SYSTEM", "In System"],
  ["EMAIL", "Email"],
  ["BOTH", "Both"],
];
const RECIPIENTS = [
  ["FEE_EARNER", "Fee Earner"],
  ["RESPONSIBLE_PERSON", "Responsible Person"],
  ["ACTING_PERSON", "Acting Person"],
  ["ASSISTING_PERSON", "Assisting Person"],
  ["CUSTOM", "Custom Email"],
];
const empty = {
  matterDateField: "",
  dayOffset: 0,
  reminderEnabled: false,
  reminderDaysPrior: 0,
  reminderDelivery: "IN_SYSTEM",
  reminderRecipients: [],
  reminderCustomEmail: "",
};

const initialRecipients = (configuration) => {
  if (Array.isArray(configuration?.reminderRecipients) && configuration.reminderRecipients.length) {
    return configuration.reminderRecipients;
  }
  return configuration?.reminderRecipient ? [configuration.reminderRecipient] : [];
};

const parseCustomEmails = (raw) =>
  (raw || "")
    .split(/[,;\s]+/)
    .map((email) => email.trim())
    .filter(Boolean);

/** Task-specific settings stay in the checklist draft until the checklist itself is saved. */
const WorkflowTaskSettings = ({ task, companyId, onSave, onClose }) => {
  const [config, setConfig] = useState({
    ...empty,
    ...task.configuration,
    reminderEnabled: !!task.configuration?.reminderEnabled,
    reminderDaysPrior: task.configuration?.reminderDaysPrior ?? 0,
    reminderDelivery: task.configuration?.reminderDelivery || "IN_SYSTEM",
    reminderRecipients: initialRecipients(task.configuration),
    reminderCustomEmail: task.configuration?.reminderCustomEmail || "",
  });
  const [direction, setDirection] = useState((task.configuration?.dayOffset || 0) > 0 ? "AFTER" : "BEFORE");
  const [days, setDays] = useState(String(Math.abs(task.configuration?.dayOffset || 0)));
  const [links, setLinks] = useState(task.documentLinks || []);
  const [files, setFiles] = useState([]);
  const [documentWindow, setDocumentWindow] = useState(null);
  const [error, setError] = useState("");
  const [libraryError, setLibraryError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const documents = companyId ? await listWorkflowDocuments(companyId) : (await API.get("/api/checklist/workflow-documents")).data;
        if (active) setFiles(documents || []);
      } catch {
        if (active) setLibraryError("Precedents and Forms could not be loaded. Existing selections are retained.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [companyId]);
  // Array order is the generation order. Reordering stays local until Apply,
  // then becomes part of the parent checklist draft until that checklist is saved.
  const moveLink = (from, to) => setLinks((previous) => reorderWorkflowItems(previous, from, to));
  const change = (field, value) => {
    setConfig((previous) => {
      const next = { ...previous, [field]: value };
      if (field === "reminderDelivery" && value === "IN_SYSTEM") {
        next.reminderRecipients = (previous.reminderRecipients || []).filter((item) => item !== "CUSTOM");
      }
      return next;
    });
  };
  const toggleRecipient = (recipient) => {
    setConfig((previous) => {
      const current = previous.reminderRecipients || [];
      const exists = current.includes(recipient);
      const nextRecipients = exists ? current.filter((item) => item !== recipient) : [...current, recipient];
      return { ...previous, reminderRecipients: nextRecipients };
    });
  };
  const save = () => {
    const recipients = config.reminderRecipients || [];
    const hasCustom = recipients.includes("CUSTOM");
    const customEmails = parseCustomEmails(config.reminderCustomEmail);
    if (config.matterDateField && (!/^\d+$/.test(days) || Number(days) > 36500))
      return setError("Enter a whole-number offset between 0 and 36,500.");
    if (
      config.reminderEnabled &&
      (!/^-?\d+$/.test(String(config.reminderDaysPrior)) || Math.abs(Number(config.reminderDaysPrior)) > 36500 || !recipients.length)
    )
      return setError("Choose at least one recipient and a valid whole-number reminder offset.");
    if (
      config.reminderEnabled &&
      hasCustom &&
      (config.reminderDelivery === "IN_SYSTEM" ||
        !customEmails.length ||
        customEmails.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    )
      return setError("Custom Email requires Email or Both delivery and valid email address(es).");
    if (links.some((link) => !["PRECEDENT", "FORM"].includes(link.kind)))
      return setError("Remove legacy links and choose documents from Precedents and Forms before saving.");
    const next = {
      ...config,
      matterDateField: config.matterDateField || null,
      dayOffset: config.matterDateField ? Number(days) * (direction === "BEFORE" ? -1 : 1) : null,
      reminderDaysPrior: config.reminderEnabled ? Number(config.reminderDaysPrior) : null,
      reminderRecipients: recipients.length ? recipients : null,
      reminderRecipient: recipients[0] || null,
      reminderCustomEmail: hasCustom ? customEmails.join(", ") : null,
    };
    onSave({ configuration: next, documentLinks: links });
  };
  return (
    <Modal
      isOpen
      toggle={documentWindow ? undefined : onClose}
      keyboard={!documentWindow}
      size="lg"
      centered
      scrollable
      className="workflow-settings-modal"
    >
      <ModalHeader toggle={onClose}>Task settings — {task.taskTitle || "Task"}</ModalHeader>
      <ModalBody>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Due date based on</label>
            <Input type="select" value={config.matterDateField || ""} onChange={(e) => change("matterDateField", e.target.value)}>
              <option value="">Manual due date</option>
              {MATTER_DATE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Input>
          </div>
          {config.matterDateField && (
            <>
              <div className="col-md-6">
                <label className="form-label">Calendar days</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={days}
                  onChange={(e) => {
                    if (/^\d{0,5}$/.test(e.target.value)) setDays(e.target.value);
                  }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Relative to Matter date</label>
                <Input type="select" value={direction} onChange={(e) => setDirection(e.target.value)}>
                  <option value="BEFORE">Before</option>
                  <option value="AFTER">After</option>
                </Input>
              </div>
              <div className="col-12 small text-muted">
                Unfinished tasks follow changes to this Matter date. A missing date shows “Awaiting matter date”.
              </div>
            </>
          )}
          <div className="col-12">
            <label className="form-check-label d-flex gap-2">
              <Input type="checkbox" checked={!!config.reminderEnabled} onChange={(e) => change("reminderEnabled", e.target.checked)} />
              Enable task reminder
            </label>
          </div>
          {config.reminderEnabled && (
            <>
              <div className="col-md-6">
                <label className="form-label">Reminder days prior to task due date</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={config.reminderDaysPrior ?? ""}
                  onChange={(e) => {
                    if (/^-?\d{0,5}$/.test(e.target.value)) change("reminderDaysPrior", e.target.value);
                  }}
                />
                <small className="text-muted">Zero: on the due date. Positive: before. Negative: after.</small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Issue alert</label>
                <Input type="select" value={config.reminderDelivery} onChange={(e) => change("reminderDelivery", e.target.value)}>
                  {DELIVERY.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Input>
              </div>
              <div className="col-12">
                <label className="form-label d-block">Send to</label>
                <div className="d-flex flex-wrap gap-3">
                  {RECIPIENTS.map(([value, label]) => {
                    const disabled = value === "CUSTOM" && config.reminderDelivery === "IN_SYSTEM";
                    return (
                      <label key={value} className={`form-check-label d-flex align-items-center gap-2 ${disabled ? "text-muted" : ""}`}>
                        <Input
                          type="checkbox"
                          disabled={disabled}
                          checked={(config.reminderRecipients || []).includes(value)}
                          onChange={() => toggleRecipient(value)}
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              {(config.reminderRecipients || []).includes("CUSTOM") && (
                <div className="col-12">
                  <label className="form-label">Custom email(s)</label>
                  <Input
                    type="text"
                    maxLength={1000}
                    placeholder="name@example.com, other@example.com"
                    value={config.reminderCustomEmail || ""}
                    onChange={(e) => change("reminderCustomEmail", e.target.value)}
                  />
                  <small className="text-muted">
                    Separate multiple email addresses with commas. In-system alerts go only to the selected Matter staff roles;
                    custom addresses receive email only.
                  </small>
                </div>
              )}
              <div className="col-12 small text-muted">
                One reminder per due date. A revised due date can issue one new reminder. Completed and Not Applicable tasks are excluded.
              </div>
            </>
          )}
          <div className="col-12">
            <h6>Precedents and Forms</h6>
            <p className="small text-muted">
              Drag the handles to arrange documents in the required order. The solicitor selects which documents to generate and downloads
              them as separate, numbered files in this order. Each DOCX is generated independently; other formats remain unchanged.
              Nothing is saved to Matter Attachments automatically.
            </p>
            {libraryError && (
              <div className="alert alert-warning" role="alert">
                {libraryError}
              </div>
            )}
            <WorkflowSortableList as="ol" className="ps-3" onMove={moveLink}>
              {links.map((link, index) => {
                const file = files.find((item) => item.id === link.documentId && item.kind === link.kind);
                const legacy = !["PRECEDENT", "FORM"].includes(link.kind);
                return (
                  <li key={`${link.kind}-${link.documentId}`} className="workflow-sortable-row mb-2">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <WorkflowDragHandle index={index} count={links.length} label={file?.name || "document"} onMove={moveLink} />
                      <span className="flex-grow-1">
                        {file?.name ||
                          (legacy
                            ? "Legacy document — reselect from Precedents/Forms"
                            : loading
                              ? "Loading document…"
                              : `Unavailable document #${link.documentId}`)}
                        <small className="d-block text-muted">
                          {link.kind === "FORM" ? "Form" : link.kind === "PRECEDENT" ? "Precedent" : link.kind}
                          {file?.type ? ` · ${file.type.toUpperCase()}` : ""}
                        </small>
                      </span>
                      <Button size="sm" color="danger" outline onClick={() => setLinks(links.filter((_, i) => i !== index))}>
                        Remove
                      </Button>
                    </div>
                  </li>
                );
              })}
            </WorkflowSortableList>
            <div className="workflow-document-picker-actions">
              <Button
                size="sm"
                color="primary"
                disabled={loading || !!libraryError}
                onClick={() => setDocumentWindow({ name: "Select Precedents", type: "NORMAL" })}
              >
                {loading ? "Loading documents…" : "Select Precedents"}
              </Button>
              <Button
                size="sm"
                color="primary"
                disabled={loading || !!libraryError}
                onClick={() => setDocumentWindow({ name: "Select Forms", type: "FORM" })}
              >
                Select Forms
              </Button>
            </div>
            {documentWindow && (
              <FileDirectoryModal
                isOpen
                selectionMode
                modal={documentWindow}
                setModal={setDocumentWindow}
                selectionFiles={files}
                initialSelectedDocuments={links.filter((link) => ["PRECEDENT", "FORM"].includes(link.kind))}
                maxSelections={50 - links.filter((link) => !["PRECEDENT", "FORM"].includes(link.kind)).length}
                onClose={() => setDocumentWindow(null)}
                onSelectDocuments={(selected) => {
                  setLinks([...links.filter((link) => !["PRECEDENT", "FORM"].includes(link.kind)), ...selected]);
                  setDocumentWindow(null);
                }}
              />
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button outline color="primary" onClick={onClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={save}>
          Apply to checklist draft
        </Button>
      </ModalFooter>
    </Modal>
  );
};
export default WorkflowTaskSettings;
