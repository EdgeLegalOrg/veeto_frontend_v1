import React, { useEffect, useState } from "react";
import { updateMatterChecklistTaskAction } from "pages/Edge/apis";
import { toast } from "react-toastify";
import {
  Table,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import "../../../stylesheets/CheckListTab.css";
import LoadingPage from "pages/Edge/utils/LoadingPage";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";

const STATUS = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETE: "COMPLETE",
  NOT_APPLICABLE: "NOT_APPLICABLE",
};

// Velzon tickets-list uses subtle badges keyed off the row status.
const STATUS_META = {
  [STATUS.NEW]: { label: "New", badge: "bg-secondary-subtle text-secondary" },
  [STATUS.IN_PROGRESS]: {
    label: "In Progress",
    badge: "bg-warning-subtle text-warning",
  },
  [STATUS.COMPLETE]: {
    label: "Complete",
    badge: "bg-success-subtle text-success",
  },
  [STATUS.NOT_APPLICABLE]: {
    label: "Not Applicable",
    badge: "bg-light text-muted",
  },
};

const statusOf = (task) => task?.status || STATUS.NEW;

const statusMeta = (task) => STATUS_META[statusOf(task)] || STATUS_META[STATUS.NEW];

// Actions offered for a row, matched to where it currently sits.
const actionsFor = (task) => {
  switch (statusOf(task)) {
    case STATUS.NEW:
      return [STATUS.IN_PROGRESS, STATUS.COMPLETE, STATUS.NOT_APPLICABLE];
    case STATUS.IN_PROGRESS:
      return [STATUS.COMPLETE, STATUS.NOT_APPLICABLE, STATUS.NEW];
    case STATUS.COMPLETE:
      return [STATUS.IN_PROGRESS, STATUS.NOT_APPLICABLE, STATUS.NEW];
    case STATUS.NOT_APPLICABLE:
      return [STATUS.IN_PROGRESS, STATUS.COMPLETE, STATUS.NEW];
    default:
      return [STATUS.IN_PROGRESS, STATUS.COMPLETE, STATUS.NOT_APPLICABLE];
  }
};

const ACTION_LABEL = {
  [STATUS.IN_PROGRESS]: "Start",
  [STATUS.COMPLETE]: "Complete",
  [STATUS.NOT_APPLICABLE]: "Mark Not Applicable",
  [STATUS.NEW]: "Reset to New",
};

const ACTION_ICON = {
  [STATUS.IN_PROGRESS]: "ri-play-circle-line",
  [STATUS.COMPLETE]: "ri-check-double-line",
  [STATUS.NOT_APPLICABLE]: "ri-forbid-line",
  [STATUS.NEW]: "ri-restart-line",
};

// Native date inputs need YYYY-MM-DD regardless of how dates are displayed.
const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (isNaN(parsed.getTime())) {
    return "";
  }

  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getDate()}`.padStart(2, "0");

  return `${parsed.getFullYear()}-${month}-${day}`;
};

const ChecklistTab = (props) => {
  const { setExtraButtons, isArchived } = props;
  const [loading, setLoading] = useState(false);
  const [tracker, setTracker] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (props.data?.checklistTracker) {
      applyTracker(props.data.checklistTracker);
    } else {
      setTracker(null);
      setTaskList([]);
    }
  }, [props.data]);

  // Every action persists on click, so the tab has nothing left to Save.
  useEffect(() => {
    if (setExtraButtons) {
      setExtraButtons(null);
    }
  }, [setExtraButtons]);

  const applyTracker = (arg) => {
    setTracker(arg);
    setTaskList(arg?.taskList?.length ? [...arg.taskList] : []);
  };

  const toggleExpanded = (taskId) => {
    setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  /**
   * Sends one task action and swaps in the tracker returned by the server, so
   * the refreshed checksum, roll-up status and staff names all land together.
   */
  const sendTaskAction = async (payload) => {
    if (isArchived) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await updateMatterChecklistTaskAction({
        trackerId: tracker?.id,
        ...payload,
      });

      if (data.success) {
        // Apply locally for immediate feedback, then let the parent refetch so
        // its copy of the matter does not go stale and overwrite this on the
        // next render.
        applyTracker(data.data);

        if (props.refresh) {
          props.refresh();
        }
      } else {
        toast.error("There is some error occured. Please try later.");
      }
    } catch (error) {
      console.error("error", error);
      toast.error("There is some error occured. Please try later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = (task, status) =>
    sendTaskAction({ taskId: task.id, status });

  const handleDueDateChange = (task, value) =>
    sendTaskAction(
      value
        ? { taskId: task.id, dueDate: new Date(value).toISOString() }
        : { taskId: task.id, clearDueDate: true }
    );

  const renderRow = (task, label, isSubTask) => {
    const meta = statusMeta(task);
    const subTaskList = task.subTaskList || [];
    const hasSubTasks = subTaskList.length > 0;
    const isOpen = !!expanded[task.id];

    return (
      <tr key={`task-${task.id}`} className={isSubTask ? "workflow-subtask-row" : ""}>
        <td className="fw-medium">{label}</td>
        <td>
          <div className={`d-flex align-items-center ${isSubTask ? "ps-4" : ""}`}>
            {hasSubTasks ? (
              <button
                type="button"
                className="btn btn-sm btn-link p-0 me-2 text-body"
                onClick={() => toggleExpanded(task.id)}
                aria-label={isOpen ? "Collapse subtasks" : "Expand subtasks"}
              >
                <i className={isOpen ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"} />
              </button>
            ) : (
              <span className="d-inline-block me-2 workflow-toggle-spacer" />
            )}
            <span>{task.taskTitle}</span>
            {!task.mandatory && (
              <span className="fs-12 ms-2 text-muted">(optional)</span>
            )}
          </div>
        </td>
        <td>
          <span className={`badge ${meta.badge}`}>{meta.label}</span>
        </td>
        <td>
          <input
            type="date"
            className="form-control form-control-sm workflow-due-date"
            value={toDateInputValue(task.dueDate)}
            disabled={isArchived}
            onChange={(e) => handleDueDateChange(task, e.target.value)}
          />
        </td>
        <td>{formatDateFunc(task.completionDate) || "-"}</td>
        <td>{task.startedByName || "-"}</td>
        <td>{task.completedByName || "-"}</td>
        <td className="text-end">
          <UncontrolledDropdown>
            <DropdownToggle
              tag="button"
              type="button"
              className="btn btn-soft-secondary btn-sm"
              disabled={isArchived}
            >
              <i className="ri-more-fill align-middle" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              {actionsFor(task).map((status) => (
                <DropdownItem
                  key={`${task.id}-${status}`}
                  onClick={() => handleStatusAction(task, status)}
                >
                  <i className={`${ACTION_ICON[status]} align-bottom me-2 text-muted`} />
                  {ACTION_LABEL[status]}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
      </tr>
    );
  };

  const renderRows = () => {
    const rows = [];

    taskList.forEach((task, i) => {
      rows.push(renderRow(task, `${i + 1}`, false));

      if (expanded[task.id] && task.subTaskList?.length) {
        task.subTaskList.forEach((subTask, j) => {
          rows.push(renderRow(subTask, `${i + 1}.${j + 1}`, true));
        });
      }
    });

    return rows;
  };

  if (!tracker) {
    return (
      <div className="row mt-4 text-center pb-4">
        <h5 className="mb-0">No checklist available!</h5>
      </div>
    );
  }

  return (
    <>
      <div className="mx-4 mt-2 pb-4">
        <div className="table-responsive table-card workflow-table-container">
          <Table className="align-middle table-nowrap mb-0" hover>
            <thead className="table-light">
              <tr>
                <th scope="col" style={{ width: "60px" }}>
                  #
                </th>
                <th scope="col">Task</th>
                <th scope="col" style={{ width: "140px" }}>
                  Status
                </th>
                <th scope="col" style={{ width: "170px" }}>
                  Due Date
                </th>
                <th scope="col" style={{ width: "140px" }}>
                  Date Completed
                </th>
                <th scope="col" style={{ width: "160px" }}>
                  Started By
                </th>
                <th scope="col" style={{ width: "160px" }}>
                  Completed By
                </th>
                <th scope="col" style={{ width: "80px" }} className="text-end">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </Table>
        </div>
      </div>
      {loading && <LoadingPage />}
    </>
  );
};

export default ChecklistTab;
