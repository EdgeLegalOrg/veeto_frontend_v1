import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
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
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setScope(SCOPES[0].value);
      setResult(null);
      setProgress(null);
    }
  }, [isOpen]);

  // Summed across batches, since each response reports only its own slice.
  const addCounts = (into, batch) => ({
    checklistsCreated: into.checklistsCreated + (batch.checklistsCreated || 0),
    mattersUpdated: into.mattersUpdated + (batch.mattersUpdated || 0),
    tasksAdded: into.tasksAdded + (batch.tasksAdded || 0),
    tasksRemoved: into.tasksRemoved + (batch.tasksRemoved || 0),
    tasksMoved: into.tasksMoved + (batch.tasksMoved || 0),
    tasksRenamed: into.tasksRenamed + (batch.tasksRenamed || 0),
    tasksRetainedInProgress:
      into.tasksRetainedInProgress + (batch.tasksRetainedInProgress || 0),
    tasksAdopted: into.tasksAdopted + (batch.tasksAdopted || 0),
    mattersConsidered: batch.nextOffset ?? into.mattersConsidered,
    totalMatters: batch.totalMatters ?? into.totalMatters,
  });

  const handleSync = async () => {
    setSyncing(true);
    setProgress({ processed: 0, total: 0, percent: 0 });

    let totals = {
      checklistsCreated: 0,
      mattersUpdated: 0,
      tasksAdded: 0,
      tasksRemoved: 0,
      tasksMoved: 0,
      tasksRenamed: 0,
      tasksRetainedInProgress: 0,
      tasksAdopted: 0,
      mattersConsidered: 0,
      totalMatters: 0,
    };

    let offset = 0;

    try {
      // Keeps going until the server says it is done. Each batch is its own
      // request, so the bar reflects matters actually processed rather than a
      // guess.
      for (;;) {
        const { data } = await syncCheckList(template.id, scope, offset);

        if (!data.success) {
          toast.error(
            data?.error?.message || "Something went wrong, please try later."
          );
          setProgress(null);
          return;
        }

        const batch = data.data || {};
        totals = addCounts(totals, batch);

        const total = batch.totalMatters || 0;
        const processed = Math.min(batch.nextOffset || 0, total || Infinity);

        setProgress({
          processed,
          total,
          percent: total > 0 ? Math.round((processed / total) * 100) : 100,
        });

        if (batch.complete) {
          break;
        }

        // Guard against a server that never reports complete, so this cannot
        // spin forever.
        if ((batch.nextOffset || 0) <= offset) {
          break;
        }

        offset = batch.nextOffset;
      }

      setResult(totals);
      toast.success("Sync complete");
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong, please try later.");
      setProgress(null);
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
    // Not dismissable mid-run: the batches keep going regardless, and closing
    // would leave the sync running with nothing reporting the outcome.
    <Modal isOpen={isOpen} toggle={syncing ? undefined : close} centered>
      <ModalHeader toggle={syncing ? undefined : close}>
        Sync Changes
      </ModalHeader>
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

            <div className="alert alert-warning" role="alert">
              A task that has been started is never removed from a matter, even
              if it has been taken out of the checklist. It can move to another
              group, but the work already recorded against it stays.
            </div>

            {progress && (
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted fs-13">
                    {progress.total > 0
                      ? `Syncing matter ${progress.processed} of ${progress.total}`
                      : "Counting matters..."}
                  </span>
                  <span className="fw-semibold fs-13">{progress.percent}%</span>
                </div>
                <Progress
                  value={progress.percent}
                  className="sync-progress"
                  barClassName={
                    progress.percent >= 100 ? "bg-success" : "bg-info"
                  }
                >
                  {progress.percent}%
                </Progress>
              </div>
            )}
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
        <Button color="light" onClick={close} disabled={syncing}>
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
