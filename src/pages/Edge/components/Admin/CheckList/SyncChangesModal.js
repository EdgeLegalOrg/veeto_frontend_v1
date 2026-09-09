import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { toast } from "react-toastify";
import { syncCheckList } from "../../../apis";

const SCOPES = [
  {
    value: "EXISTING_WORKFLOWS",
    label: "Only matters with this workflow already assigned",
    hint: "Updates the matters that already have this checklist. Nothing is assigned to a matter that does not have one.",
  },
  {
    value: "ALL_LINKED_MATTERS",
    label: "All matters linked to this checklist",
    hint: "Also assigns the checklist to every linked matter that has none, as well as updating those that do.",
  },
];

/**
 * Confirms how far a Sync Changes run should reach, then reports what it did.
 *
 * The result is worth showing rather than a bare "done": a sync can touch a lot
 * of live matters, and retained-in-progress in particular is something the user
 * needs to know about.
 */
const SyncChangesModal = (props) => {
  const { isOpen, close, template } = props;

  const [scope, setScope] = useState(SCOPES[0].value);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setScope(SCOPES[0].value);
      setResult(null);
    }
  }, [isOpen]);

  const handleSync = async () => {
    setSyncing(true);

    try {
      const { data } = await syncCheckList(template.id, scope);

      if (data.success) {
        setResult(data.data || {});
        toast.success("Sync complete");
      } else {
        toast.error(
          data?.error?.message || "Something went wrong, please try later."
        );
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong, please try later.");
    } finally {
      setSyncing(false);
    }
  };

  if (!template) {
    return null;
  }

  const rows = result
    ? [
        ["Matters considered", result.mattersConsidered],
        ["Checklists newly assigned", result.checklistsCreated],
        ["Matters updated", result.mattersUpdated],
        ["Tasks added", result.tasksAdded],
        ["Tasks removed", result.tasksRemoved],
        ["Tasks moved between groups", result.tasksMoved],
        ["Tasks renamed", result.tasksRenamed],
        ["Tasks kept because already underway", result.tasksRetainedInProgress],
        ["Tasks linked to the checklist by title", result.tasksAdopted],
      ]
    : [];

  return (
    <Modal isOpen={isOpen} toggle={close} centered>
      <ModalHeader toggle={close}>Sync Changes</ModalHeader>
      <ModalBody>
        {!result ? (
          <>
            <p className="text-muted fs-13">
              Push the current tasks of <strong>{template.name}</strong> out to
              the matters using it.
            </p>

            {SCOPES.map((option) => (
              <div className="form-check mb-3" key={option.value}>
                <Input
                  type="radio"
                  className="form-check-input"
                  id={`scope-${option.value}`}
                  name="syncScope"
                  checked={scope === option.value}
                  onChange={() => setScope(option.value)}
                />
                <Label
                  className="form-check-label"
                  for={`scope-${option.value}`}
                >
                  {option.label}
                </Label>
                <div className="form-text">{option.hint}</div>
              </div>
            ))}

            <div className="alert alert-warning mb-0" role="alert">
              A task that has been started is never removed from a matter, even
              if it has been taken out of the checklist. It can move to another
              group, but the work already recorded against it stays.
            </div>
          </>
        ) : (
          <>
            <p className="text-muted fs-13">
              Synced <strong>{template.name}</strong>.
            </p>

            <ul className="list-group list-group-flush">
              {rows.map(([label, value]) => (
                <li
                  className="list-group-item d-flex justify-content-between px-0 py-1"
                  key={label}
                >
                  <span className="fs-13">{label}</span>
                  <span className="fw-semibold fs-13">{value ?? 0}</span>
                </li>
              ))}
            </ul>

            {result.tasksRetainedInProgress > 0 && (
              <div className="alert alert-info mt-3 mb-0" role="alert">
                {result.tasksRetainedInProgress} task
                {result.tasksRetainedInProgress === 1 ? " was" : "s were"} kept
                on their matter despite no longer being in the checklist,
                because work had already started. Those matters now differ from
                the checklist.
              </div>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={close}>
          {result ? "Close" : "Cancel"}
        </Button>
        {!result && (
          <Button color="success" onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync"}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default SyncChangesModal;
