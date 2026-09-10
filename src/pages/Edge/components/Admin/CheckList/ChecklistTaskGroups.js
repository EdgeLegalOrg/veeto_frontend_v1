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

  /**
   * Renumbers every group from zero and hands the result to the parent.
   *
   * sortOrder is only meaningful within a group, and the server stores exactly
   * what arrives, so it is normalised here on every change rather than only
   * when the order is edited. That way a task typed into a group gets a
   * position immediately, and a group can never end up with two tasks claiming
   * the same one.
   */
  const commit = (nextTasks) => {
    const nextPosition = {};

    onChange(
      nextTasks.map((task) => {
        const key = task.taskGroupId ?? UNGROUPED;

        nextPosition[key] = (nextPosition[key] ?? -1) + 1;

        return { ...task, sortOrder: nextPosition[key] };
      })
    );
  };

  /**
   * Moves a task one place up or down within its own group.
   *
   * Positions are swapped in the underlying array rather than by editing
   * sortOrder directly, because the array is what the display order is read
   * from - editing the numbers alone would leave the list looking unchanged
   * until it was reloaded. commit then renumbers from the new arrangement.
   */
  const handleReorderTask = (task, direction) => {
    const groupId = task.taskGroupId ?? UNGROUPED;
    const siblings = tasksIn(groupId);
    const at = siblings.findIndex((t) => sameTask(task, t));
    const to = at + direction;

    if (at < 0 || to < 0 || to >= siblings.length) {
      return;
    }

    // The two rows to exchange, located in the full list.
    const fromIndex = tasks.findIndex((t) => sameTask(siblings[at], t));
    const toIndex = tasks.findIndex((t) => sameTask(siblings[to], t));

    const next = [...tasks];
    next[fromIndex] = tasks[toIndex];
    next[toIndex] = tasks[fromIndex];

    commit(next);
  };

  const handleAddTask = (groupId) => {
    const title = (draft[groupId] || "").trim();

    if (!title) {
      return;
    }

    commit([
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

  const sameTask = (a, b) =>
    a.localKey ? a.localKey === b.localKey : a.taskId === b.taskId;

  /**
   * Renames a task in place.
   *
   * For a task that already exists in the library this renames the shared
   * entry, so every checklist using that task shows the new title. That is
   * what editing a task means here - there is one task, used in several
   * places - but it is worth knowing before renaming something long-standing.
   */
  const handleRenameTask = (task, title) => {
    onChange(
      tasks.map((t) => (sameTask(task, t) ? { ...t, taskTitle: title } : t))
    );
  };

  const handleRemoveTask = (task) => {
    commit(tasks.filter((t) => !sameTask(task, t)));
  };

  const handleMoveTask = (task, nextGroupId) => {
    const moved = {
      ...task,
      taskGroupId: nextGroupId === UNGROUPED ? null : Number(nextGroupId),
    };

    // Appended rather than left where it was, so it lands at the bottom of the
    // group it moves into. commit renumbers from array order, and dropping a
    // task into the middle of a group nobody asked to reorder would be a
    // surprise.
    commit([...tasks.filter((t) => !sameTask(task, t)), moved]);
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

            {tasksIn(groupId).map((task, i, siblings) => (
              <div
                className="d-flex align-items-center gap-2 mb-2"
                key={task.localKey || `task-${task.taskId}-${i}`}
              >
                {/* Reordering within the group. Buttons rather than drag and
                    drop: the list is short, and a keyboard-reachable control
                    beats a drag target that needs a library. */}
                <div className="btn-group-vertical" role="group">
                  <Button
                    color="light"
                    size="sm"
                    className="py-0 px-1"
                    onClick={() => handleReorderTask(task, -1)}
                    disabled={i === 0}
                    title="Move up"
                  >
                    <i className="ri-arrow-up-s-line" />
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    className="py-0 px-1"
                    onClick={() => handleReorderTask(task, 1)}
                    disabled={i === siblings.length - 1}
                    title="Move down"
                  >
                    <i className="ri-arrow-down-s-line" />
                  </Button>
                </div>
                <span className="text-muted fs-13" style={{ width: "24px" }}>
                  {i + 1}.
                </span>
                <Input
                  type="text"
                  bsSize="sm"
                  className="flex-grow-1"
                  value={task.taskTitle || ""}
                  placeholder="Task title"
                  onChange={(e) => handleRenameTask(task, e.target.value)}
                />

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
