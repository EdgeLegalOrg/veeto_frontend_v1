import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Progress,
  Row,
  Table,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { toast } from "react-toastify";
import {
  addTaskGroupComment,
  API_BASE_URL,
  fetchTaskGroupComments,
} from "pages/Edge/apis";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";
import {
  ACTION_ICON,
  ACTION_LABEL,
  actionsFor,
  progressColour,
  statusMeta,
  toDateInputValue,
} from "./taskStatus";

// Comments need the time as well as the date, unlike the task columns.
const formatDateTime = (value) =>
  formatDateFunc(value, "DD-MM-YYYY h:mm A") || "";

/**
 * Task group detail, laid out like the Velzon project overview: a summary header
 * with the group's icon, description and progress, then the tasks themselves,
 * then the group's comment history.
 */
const TaskGroupModal = (props) => {
  const {
    group,
    tasks,
    trackerId,
    isOpen,
    close,
    isArchived,
    onStatusAction,
    onDueDateChange,
  } = props;

  const [expanded, setExpanded] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  const groupId = group?.id ?? null;

  const loadComments = useCallback(async () => {
    // Ungrouped is synthetic and has no id to hang comments off.
    if (!trackerId || groupId == null) {
      setComments([]);
      return;
    }

    try {
      const { data } = await fetchTaskGroupComments(trackerId, groupId);

      if (data.success) {
        setComments(data.data?.commentList || []);
      }
    } catch (error) {
      console.error("error", error);
    }
  }, [trackerId, groupId]);

  useEffect(() => {
    if (isOpen) {
      setNewComment("");
      loadComments();
    }
  }, [isOpen, loadComments]);

  const toggleExpanded = (taskId) =>
    setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }));

  const handleAddComment = async () => {
    if (!newComment.trim() || groupId == null) {
      return;
    }

    setSavingComment(true);

    try {
      const { data } = await addTaskGroupComment({
        checklistTrackerId: trackerId,
        taskGroupId: groupId,
        comment: newComment,
      });

      if (data.success) {
        // The server returns the whole history, so there is one source of truth
        // rather than an optimistic local copy that can drift.
        setComments(data.data?.commentList || []);
        setNewComment("");
      } else {
        toast.error("Could not add the comment, please try later.");
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Could not add the comment, please try later.");
    } finally {
      setSavingComment(false);
    }
  };

  if (!group) {
    return null;
  }

  const renderRow = (task, label, isSubTask) => {
    const meta = statusMeta(task);
    const subTaskList = task.subTaskList || [];
    const hasSubTasks = subTaskList.length > 0;
    const isOpen = !!expanded[task.id];

    return (
      <tr
        key={`task-${task.id}`}
        className={isSubTask ? "workflow-subtask-row" : ""}
      >
        <td className="fw-medium">{label}</td>
        <td>
          <div
            className={`d-flex align-items-center ${isSubTask ? "ps-4" : ""}`}
          >
            {hasSubTasks ? (
              <button
                type="button"
                className="btn btn-sm btn-link p-0 me-2 text-body"
                onClick={() => toggleExpanded(task.id)}
                aria-label={isOpen ? "Collapse subtasks" : "Expand subtasks"}
              >
                <i
                  className={
                    isOpen ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"
                  }
                />
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
            onChange={(e) => onDueDateChange(task, e.target.value)}
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
                  onClick={() => onStatusAction(task, status)}
                >
                  <i
                    className={`${ACTION_ICON[status]} align-bottom me-2 text-muted`}
                  />
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

    tasks.forEach((task, i) => {
      rows.push(renderRow(task, `${i + 1}`, false));

      if (expanded[task.id] && task.subTaskList?.length) {
        task.subTaskList.forEach((subTask, j) => {
          rows.push(renderRow(subTask, `${i + 1}.${j + 1}`, true));
        });
      }
    });

    return rows;
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={close}
      size="xl"
      scrollable
      className="workflow-group-modal"
    >
      <ModalHeader toggle={close}>{group.title}</ModalHeader>
      <ModalBody>
        <Card className="mb-3">
          <CardBody>
            <div className="d-flex align-items-start">
              <div className="avatar-md me-3 flex-shrink-0">
                {group.iconUrl ? (
                  <img
                    src={`${API_BASE_URL}${group.iconUrl}`}
                    alt=""
                    className="img-fluid rounded-circle"
                  />
                ) : (
                  <div className="avatar-title bg-light rounded-circle fs-24 text-primary">
                    <i className="ri-list-check-2" />
                  </div>
                )}
              </div>
              <div className="flex-grow-1">
                <h5 className="mb-1">{group.title}</h5>
                <p className="text-muted mb-0">
                  {group.description || "No description."}
                </p>
              </div>
            </div>

            <Row className="mt-4 g-3">
              <Col sm={4}>
                <p className="text-muted mb-1 fs-13 text-uppercase">
                  Tasks Complete
                </p>
                <h5 className="mb-0">
                  {group.completedTasks}/{group.totalTasks}
                </h5>
              </Col>
              <Col sm={4}>
                <p className="text-muted mb-1 fs-13 text-uppercase">
                  Next Due Date
                </p>
                <h5 className="mb-0">
                  {formatDateFunc(group.nextDueDate) || "-"}
                </h5>
              </Col>
              <Col sm={4}>
                <p className="text-muted mb-1 fs-13 text-uppercase">
                  Not Applicable
                </p>
                <h5 className="mb-0">{group.notApplicableTasks}</h5>
              </Col>
            </Row>

            <div className="mt-4">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted fs-13">Progress</span>
                <span className="fw-semibold fs-13">
                  {group.progressPercent}%
                </span>
              </div>
              <Progress
                value={group.progressPercent}
                className="animated-progress custom-progress progress-label"
                barClassName={progressColour(group.progressPercent)}
              />
            </div>
          </CardBody>
        </Card>

        <div className="table-responsive table-card">
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
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No tasks in this group.
                  </td>
                </tr>
              )}
              {renderRows()}
            </tbody>
          </Table>
        </div>

        <Card className="mt-3 mb-0">
          <CardBody>
            <h5 className="fs-15 mb-3">Comments</h5>

            {groupId == null ? (
              <p className="text-muted mb-0 fs-13">
                Comments are not available for ungrouped tasks.
              </p>
            ) : (
              <>
                {comments.length === 0 && (
                  <p className="text-muted fs-13">No comments yet.</p>
                )}

                {comments.map((entry) => (
                  <div
                    key={`comment-${entry.id}`}
                    className="d-flex mb-3 workflow-comment"
                  >
                    <div className="avatar-xs me-3 flex-shrink-0">
                      <div className="avatar-title bg-light rounded-circle text-primary fs-14">
                        <i className="ri-user-3-line" />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center flex-wrap gap-2">
                        <span className="fw-semibold fs-13">
                          {entry.staffName || "Unknown user"}
                        </span>
                        <span className="text-muted fs-12">
                          {formatDateTime(entry.createdAt)}
                        </span>
                      </div>
                      {/* Preserve the author's line breaks. */}
                      <p className="text-muted mb-0 fs-13 workflow-comment-body">
                        {entry.comment}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="mt-3">
                  <Input
                    type="textarea"
                    rows={3}
                    maxLength={4000}
                    placeholder="Add a comment..."
                    value={newComment}
                    disabled={isArchived || savingComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="text-end mt-2">
                    <Button
                      color="success"
                      size="sm"
                      disabled={isArchived || savingComment || !newComment.trim()}
                      onClick={handleAddComment}
                    >
                      {savingComment ? "Adding..." : "Add Comment"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </ModalBody>
    </Modal>
  );
};

export default TaskGroupModal;
