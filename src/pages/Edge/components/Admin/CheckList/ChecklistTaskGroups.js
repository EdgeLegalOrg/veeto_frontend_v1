import React, { useMemo, useState } from "react";
import { Button, Input } from "reactstrap";
import TaskGroupForm from "../TaskGroups/TaskGroupForm";
import { useTaskGroups } from "./TaskGroupSelect";

// Bucket for tasks whose group has been removed, so they stay visible and can
// be moved rather than quietly disappearing from the checklist.
const UNGROUPED = "__ungrouped__";

let localKeySeed = 0;

/**
 * The task section of the checklist screen: tasks typed as free text, grouped
 * by task group.
 *
 * Tasks are held as template rows of {taskId?, taskTitle, taskGroupId}. A row
 * with a title and no taskId is created by the server when the checklist is
 * saved, which is what allows a task to be typed here rather than pre-created
 * in the task library.
 *
 * Shared by the add and edit screens, which are otherwise near-duplicates and
 * had already drifted apart.
 */
const ChecklistTaskGroups = (props) => {
  const { tasks, onChange } = props;

  const taskGroups = useTaskGroups();
  const [refreshKey, setRefreshKey] = useState(0);
  const [draft, setDraft] = useState({});
  const [addGroupId, setAddGroupId] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupFormOpen, setGroupFormOpen] = useState(false);

  // Groups shown are the ones the checklist actually uses, in the order the
  // task group admin defines, plus any the user has just added.
  const usedGroupIds = useMemo(() => {
    const ids = [];

    tasks.forEach((task) => {
      const key = task.taskGroupId ?? UNGROUPED;

      if (!ids.includes(key)) {
        ids.push(key);
      }
    });

    return ids;
  }, [tasks]);

  const [extraGroupIds, setExtraGroupIds] = useState([]);

  const visibleGroupIds = useMemo(() => {
    const combined = [...usedGroupIds];

    extraGroupIds.forEach((id) => {
      if (!combined.includes(id)) {
        combined.push(id);
      }
    });

    // Ungrouped last: it is a fallback, not a real group.
    return combined.sort((a, b) => {
      if (a === UNGROUPED) return 1;
      if (b === UNGROUPED) return -1;

      const ga = taskGroups.find((g) => g.id === a);
      const gb = taskGroups.find((g) => g.id === b);

      return (ga?.displayOrder ?? 0) - (gb?.displayOrder ?? 0);
    });
  }, [usedGroupIds, extraGroupIds, taskGroups]);

  const groupLabel = (groupId) => {
    if (groupId === UNGROUPED) {
      return "Ungrouped";
    }

    return (
      taskGroups.find((g) => g.id === groupId)?.title || `Group ${groupId}`
    );
  };

  const tasksIn = (groupId) =>
    tasks.filter((task) => (task.taskGroupId ?? UNGROUPED) === groupId);

  const handleAddTask = (groupId) => {
    const title = (draft[groupId] || "").trim();

    if (!title) {
      return;
    }

    onChange([
      ...tasks,
      {
        // Local only, so React has a stable key before the server assigns ids.
        localKey: `new-${++localKeySeed}`,
        taskTitle: title,
        taskGroupId: groupId === UNGROUPED ? null : groupId,
        mandatory: false,
      },
    ]);

    setDraft({ ...draft, [groupId]: "" });
  };

  const handleRemoveTask = (task) => {
    onChange(
      tasks.filter((t) =>
        task.localKey
          ? t.localKey !== task.localKey
          : !(t.taskId === task.taskId && t.taskGroupId === task.taskGroupId)
      )
    );
  };

  const handleMoveTask = (task, nextGroupId) => {
    onChange(
      tasks.map((t) => {
        const same = task.localKey
          ? t.localKey === task.localKey
          : t.taskId === task.taskId && t.taskGroupId === task.taskGroupId;

        return same
          ? {
              ...t,
              taskGroupId:
                nextGroupId === UNGROUPED ? null : Number(nextGroupId),
            }
          : t;
      })
    );
  };

  const handleAddGroup = () => {
    if (!addGroupId) {
      return;
    }

    const id = Number(addGroupId);

    if (!extraGroupIds.includes(id) && !usedGroupIds.includes(id)) {
      setExtraGroupIds([...extraGroupIds, id]);
    }

    setAddGroupId("");
  };

  const handleEditGroup = (groupId) => {
    setEditingGroup(taskGroups.find((g) => g.id === groupId) || null);
    setGroupFormOpen(true);
  };

  // useTaskGroups loads once, so bump a key to re-mount it after an edit.
  const handleGroupSaved = () => setRefreshKey(refreshKey + 1);

  const unusedGroups = taskGroups.filter(
    (g) => !visibleGroupIds.includes(g.id)
  );

  return (
    <div key={refreshKey}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">Tasks</h5>
        <div className="d-flex align-items-center gap-2">
          <Input
            type="select"
            bsSize="sm"
            value={addGroupId}
            onChange={(e) => setAddGroupId(e.target.value)}
            style={{ minWidth: "200px" }}
          >
            <option value="">Add a task group...</option>
            {unusedGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </Input>
          <Button
            color="light"
            size="sm"
            onClick={handleAddGroup}
            disabled={!addGroupId}
          >
            Add Group
          </Button>
        </div>
      </div>

      {visibleGroupIds.length === 0 && (
        <div className="alert alert-info" role="alert">
          Add a task group, then type the tasks that belong in it.
        </div>
      )}

      {visibleGroupIds.map((groupId) => (
        <div className="card border mb-3" key={`group-${groupId}`}>
          <div className="card-header d-flex align-items-center justify-content-between py-2">
            <h6 className="mb-0">
              {groupLabel(groupId)}
              <span className="text-muted fw-normal fs-12">
                {" "}
                ({tasksIn(groupId).length})
              </span>
            </h6>
            {groupId !== UNGROUPED && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={() => handleEditGroup(groupId)}
              >
                Edit group
              </button>
            )}
          </div>
          <div className="card-body py-2">
            {tasksIn(groupId).length === 0 && (
              <p className="text-muted fs-13 mb-2">No tasks in this group.</p>
            )}

            {tasksIn(groupId).map((task, i) => (
              <div
                className="d-flex align-items-center gap-2 mb-2"
                key={task.localKey || `task-${task.taskId}-${i}`}
              >
                <span className="text-muted fs-13" style={{ width: "24px" }}>
                  {i + 1}.
                </span>
                <span className="flex-grow-1">{task.taskTitle}</span>

                {/* Moving a task between groups is the one edit that also
                    applies to matters already underway, where a task cannot be
                    deleted once started. */}
                <Input
                  type="select"
                  bsSize="sm"
                  value={groupId === UNGROUPED ? UNGROUPED : groupId}
                  onChange={(e) => handleMoveTask(task, e.target.value)}
                  style={{ maxWidth: "180px" }}
                >
                  {taskGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                  {groupId === UNGROUPED && (
                    <option value={UNGROUPED}>Ungrouped</option>
                  )}
                </Input>

                <Button
                  color="soft-danger"
                  size="sm"
                  onClick={() => handleRemoveTask(task)}
                  title="Remove from this checklist"
                >
                  <i className="ri-close-line" />
                </Button>
              </div>
            ))}

            <div className="d-flex align-items-center gap-2 mt-2">
              <Input
                type="text"
                bsSize="sm"
                placeholder="Type a task title and press Enter"
                value={draft[groupId] || ""}
                onChange={(e) =>
                  setDraft({ ...draft, [groupId]: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask(groupId);
                  }
                }}
              />
              <Button
                color="success"
                size="sm"
                onClick={() => handleAddTask(groupId)}
                disabled={!(draft[groupId] || "").trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      ))}

      <TaskGroupForm
        isOpen={groupFormOpen}
        close={() => setGroupFormOpen(false)}
        refresh={handleGroupSaved}
        editing={editingGroup}
      />
    </div>
  );
};

export default ChecklistTaskGroups;
