import React, { useEffect, useState } from "react";
import { Input } from "reactstrap";
import { fetchChecklistTaskGroups } from "pages/Edge/apis";

/**
 * Loads the company's workflow task groups once for a checklist template screen.
 *
 * Shared by Add and Edit so the picker behaves the same on both.
 */
export const useTaskGroups = () => {
  const [taskGroups, setTaskGroups] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await fetchChecklistTaskGroups();

        if (!cancelled && data.success) {
          setTaskGroups(data.data?.taskGroupList || []);
        }
      } catch (error) {
        // The picker degrades to "Default group" rather than blocking the screen.
        console.error("error", error);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return taskGroups;
};

/**
 * Picks the group a template task lands in on a new matter.
 *
 * An empty value is meaningful: the task falls back to the company's first
 * group at matter creation, so it is labelled rather than left blank.
 */
export const TaskGroupSelect = (props) => {
  const { taskGroups, value, onChange, disabled } = props;

  return (
    <Input
      type="select"
      bsSize="sm"
      value={value ?? ""}
      disabled={disabled}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        onChange(e.target.value ? Number(e.target.value) : null);
      }}
    >
      <option value="">Default group</option>
      {taskGroups.map((group) => (
        <option key={group.id} value={group.id}>
          {group.title}
        </option>
      ))}
    </Input>
  );
};

export default TaskGroupSelect;
