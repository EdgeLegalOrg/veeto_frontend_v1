import React, { useEffect, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { documentFoldersApi } from "../../Matters/Attachments/documentFoldersApi";
import "../../../stylesheets/CheckListTab.css";
import { teamPrecedentsConfiguration } from "../../TeamPrecedents/api";

export const MATTER_DATE_OPTIONS = [
  ["INSTRUCTION_DATE", "Instruction Date"], ["EXCHANGE_DATE", "Exchange Date"],
  ["COOLING_OFF_DATE", "Cooling Off Date"], ["SETTLEMENT_DATE", "Settlement Date"], ["ADJUSTMENT_DATE", "Adjustment Date"],
];
const DELIVERY = [["IN_SYSTEM", "In System"], ["EMAIL", "Email"], ["BOTH", "Both"]];
const RECIPIENTS = [["FEE_EARNER", "Fee Earner"], ["RESPONSIBLE_PERSON", "Responsible Person"], ["ACTING_PERSON", "Acting Person"], ["ASSISTING_PERSON", "Assisting Person"], ["CUSTOM", "Custom Email"]];
const empty = { matterDateField: "", dayOffset: 0, reminderEnabled: false, reminderDaysPrior: 0, reminderDelivery: "IN_SYSTEM", reminderRecipient: "", reminderCustomEmail: "" };

/** Task-specific settings stay in the checklist draft until the checklist itself is saved. */
const WorkflowTaskSettings = ({ task, companyId, onSave, onClose }) => {
  const [config, setConfig] = useState({ ...empty, ...task.configuration,
    reminderEnabled: !!task.configuration?.reminderEnabled,
    reminderDaysPrior: task.configuration?.reminderDaysPrior ?? 0,
    reminderDelivery: task.configuration?.reminderDelivery || "IN_SYSTEM",
    reminderRecipient: task.configuration?.reminderRecipient || "",
    reminderCustomEmail: task.configuration?.reminderCustomEmail || "" });
  const [direction, setDirection] = useState((task.configuration?.dayOffset || 0) > 0 ? "AFTER" : "BEFORE");
  const [days, setDays] = useState(String(Math.abs(task.configuration?.dayOffset || 0)));
  const [links, setLinks] = useState(task.documentLinks || []);
  const [files, setFiles] = useState([]);
  const [chosen, setChosen] = useState("");
  const [error, setError] = useState("");
  const [libraryError, setLibraryError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const owner = companyId || (await teamPrecedentsConfiguration()).data.companyId;
        const response = await documentFoldersApi("TEAM_PRECEDENT", owner).list();
        if (active) setFiles(response.data.files || []);
      } catch { if (active) setLibraryError("Team Precedents could not be loaded. Existing links are retained."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [companyId]);
  const change = (field, value) => setConfig((previous) => ({ ...previous, [field]: value }));
  const save = () => {
    if (config.matterDateField && (!/^\d+$/.test(days) || Number(days) > 36500)) return setError("Enter a whole-number offset between 0 and 36,500.");
    if (config.reminderEnabled && (!/^-?\d+$/.test(String(config.reminderDaysPrior)) || Math.abs(Number(config.reminderDaysPrior)) > 36500 || !config.reminderRecipient))
      return setError("Choose a recipient and a valid whole-number reminder offset.");
    if (config.reminderEnabled && config.reminderRecipient === "CUSTOM" && (config.reminderDelivery === "IN_SYSTEM" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.reminderCustomEmail || "")))
      return setError("Custom Email requires Email or Both delivery and a valid email address.");
    const next = { ...config, matterDateField: config.matterDateField || null,
      dayOffset: config.matterDateField ? Number(days) * (direction === "BEFORE" ? -1 : 1) : null,
      reminderDaysPrior: config.reminderEnabled ? Number(config.reminderDaysPrior) : null,
      reminderRecipient: config.reminderRecipient || null,
      reminderCustomEmail: config.reminderRecipient === "CUSTOM" ? (config.reminderCustomEmail || "").trim() : null };
    onSave({ configuration: next, documentLinks: links });
  };
  return <Modal isOpen toggle={onClose} size="lg" centered scrollable className="workflow-settings-modal">
    <ModalHeader toggle={onClose}>Task settings — {task.taskTitle || "Task"}</ModalHeader>
    <ModalBody>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="row g-3">
        <div className="col-12"><label className="form-label">Due date based on</label>
          <Input type="select" value={config.matterDateField || ""} onChange={(e) => change("matterDateField", e.target.value)}>
            <option value="">Manual due date</option>{MATTER_DATE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Input></div>
        {config.matterDateField && <>
          <div className="col-md-6"><label className="form-label">Calendar days</label><Input type="text" inputMode="numeric" value={days} onChange={(e) => { if (/^\d{0,5}$/.test(e.target.value)) setDays(e.target.value); }} /></div>
          <div className="col-md-6"><label className="form-label">Relative to Matter date</label><Input type="select" value={direction} onChange={(e) => setDirection(e.target.value)}><option value="BEFORE">Before</option><option value="AFTER">After</option></Input></div>
          <div className="col-12 small text-muted">Unfinished tasks follow changes to this Matter date. A missing date shows “Awaiting matter date”.</div>
        </>}
        <div className="col-12"><label className="form-check-label d-flex gap-2"><Input type="checkbox" checked={!!config.reminderEnabled} onChange={(e) => change("reminderEnabled", e.target.checked)} />Enable task reminder</label></div>
        {config.reminderEnabled && <>
          <div className="col-md-6"><label className="form-label">Reminder days prior to task due date</label><Input type="text" inputMode="numeric" value={config.reminderDaysPrior ?? ""} onChange={(e) => { if (/^-?\d{0,5}$/.test(e.target.value)) change("reminderDaysPrior", e.target.value); }} /><small className="text-muted">Zero: on the due date. Positive: before. Negative: after.</small></div>
          <div className="col-md-6"><label className="form-label">Issue alert</label><Input type="select" value={config.reminderDelivery} onChange={(e) => change("reminderDelivery", e.target.value)}>{DELIVERY.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Input></div>
          <div className="col-md-6"><label className="form-label">Send to</label><Input type="select" value={config.reminderRecipient || ""} onChange={(e) => change("reminderRecipient", e.target.value)}><option value="">Choose recipient</option>{RECIPIENTS.map(([value, label]) => <option key={value} value={value} disabled={value === "CUSTOM" && config.reminderDelivery === "IN_SYSTEM"}>{label}</option>)}</Input></div>
          {config.reminderRecipient === "CUSTOM" && <div className="col-md-6"><label className="form-label">Custom email</label><Input type="email" maxLength={255} value={config.reminderCustomEmail || ""} onChange={(e) => change("reminderCustomEmail", e.target.value)} /><small className="text-muted">With Both delivery, the in-system alert follows the existing company-wide custom-email behaviour.</small></div>}
          <div className="col-12 small text-muted">One reminder per due date. A revised due date can issue one new reminder. Completed and Not Applicable tasks are excluded.</div>
        </>}
        <div className="col-12"><h6>Linked Team Precedents</h6><p className="small text-muted">Multiple master links can be shared through the template. Private matter attachments are linked on the individual matter task.</p>
          {libraryError && <div className="alert alert-warning" role="alert">{libraryError}</div>}
          {links.map((link) => <div key={`${link.kind}-${link.documentId}`} className="d-flex align-items-center justify-content-between mb-2"><span>{files.find((file) => file.id === link.documentId)?.name || `Linked precedent #${link.documentId}`}</span><Button size="sm" outline color="danger" onClick={() => setLinks(links.filter((item) => item !== link))}>Remove link</Button></div>)}
          <div className="d-flex gap-2"><Input type="select" value={chosen} disabled={loading || !!libraryError || links.length >= 50} onChange={(e) => setChosen(e.target.value)}><option value="">{loading ? "Loading Team Precedents…" : "Choose a Team Precedent"}</option>{files.filter((file) => !links.some((link) => link.documentId === file.id)).map((file) => <option key={file.id} value={file.id}>{file.name}</option>)}</Input><Button color="primary" disabled={!chosen || links.length >= 50} onClick={() => { setLinks([...links, { kind: "TEAM_PRECEDENT", documentId: Number(chosen) }]); setChosen(""); }}>Add link</Button></div>
        </div>
      </div>
    </ModalBody>
    <ModalFooter><Button outline color="primary" onClick={onClose}>Cancel</Button><Button color="primary" onClick={save}>Apply to checklist draft</Button></ModalFooter>
  </Modal>;
};
export default WorkflowTaskSettings;
