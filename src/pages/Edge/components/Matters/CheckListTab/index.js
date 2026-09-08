import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Progress, Row } from "reactstrap";
import { API_BASE_URL, updateMatterChecklistTaskAction } from "pages/Edge/apis";
import { toast } from "react-toastify";
import "../../../stylesheets/CheckListTab.css";
import LoadingPage from "pages/Edge/utils/LoadingPage";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";
import { progressColour } from "./taskStatus";
import TaskGroupModal from "./TaskGroupModal";

const ChecklistTab = (props) => {
  const { setExtraButtons, isArchived } = props;
  const [loading, setLoading] = useState(false);
  const [tracker, setTracker] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [taskGroups, setTaskGroups] = useState([]);
  const [openGroupId, setOpenGroupId] = useState(undefined);

  useEffect(() => {
    if (props.data?.checklistTracker) {
      applyTracker(props.data.checklistTracker);
    } else {
      setTracker(null);
      setTaskList([]);
      setTaskGroups([]);
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
    setTaskGroups(arg?.taskGroupList?.length ? [...arg.taskGroupList] : []);
  };

  /**
   * Sends one task action and swaps in the tracker returned by the server, so
   * the refreshed checksum, roll-up status, staff names and recalculated group
   * progress all land together.
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

  // Ungrouped tasks come back with a null group id, so match on that rather
  // than on truthiness.
  const tasksInGroup = (groupId) =>
    taskList.filter((task) => (task.taskGroupId ?? null) === (groupId ?? null));

  const openGroup = useMemo(
    () =>
      openGroupId === undefined
        ? null
        : taskGroups.find((g) => (g.id ?? null) === (openGroupId ?? null)) ||
          null,
    [openGroupId, taskGroups]
  );

  const renderGroupCard = (group) => {
    const percent = group.progressPercent || 0;

    // md={6} puts two per row at any width above mobile, so the pair fills the
    // tab.
    return (
      <Col md={6} key={`group-${group.id ?? "ungrouped"}`}>
        <Card
          className="workflow-group-card h-100"
          onClick={() => setOpenGroupId(group.id ?? null)}
        >
          <CardBody>
            <div className="d-flex mb-3">
              <div className="avatar-sm me-3 flex-shrink-0">
                {group.iconUrl ? (
                  <img
                    src={`${API_BASE_URL}${group.iconUrl}`}
                    alt=""
                    className="img-fluid rounded-circle"
                  />
                ) : (
                  <div className="avatar-title bg-light rounded-circle fs-20 text-primary">
                    <i className="ri-list-check-2" />
                  </div>
                )}
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <h5 className="fs-15 mb-1 text-truncate">{group.title}</h5>
                <p className="text-muted text-truncate mb-0 fs-12">
                  {group.description || "No description."}
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted fs-12">Tasks</span>
              <span className="fw-semibold fs-12">
                {group.completedTasks}/{group.totalTasks}
                {group.notApplicableTasks > 0 && (
                  <span className="text-muted fw-normal">
                    {" "}
                    ({group.notApplicableTasks} N/A)
                  </span>
                )}
              </span>
            </div>
            {/* The figure is printed on the bar itself, which is why it is tall
                enough to hold text. */}
            <Progress
              value={percent}
              className="workflow-group-progress mb-3"
              barClassName={progressColour(percent)}
            >
              {percent}%
            </Progress>

            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted fs-12">
                <i className="ri-calendar-event-line align-bottom me-1" />
                {group.nextDueDate
                  ? `Next due ${formatDateFunc(group.nextDueDate)}`
                  : "Nothing due"}
              </span>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
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
      <div className="mx-4 mt-3 pb-4">
        {taskGroups.length === 0 ? (
          <div className="text-center py-4">
            <h5 className="mb-0">No task groups available!</h5>
          </div>
        ) : (
          <Row className="g-3">{taskGroups.map(renderGroupCard)}</Row>
        )}
      </div>

      <TaskGroupModal
        group={openGroup}
        tasks={openGroup ? tasksInGroup(openGroup.id) : []}
        trackerId={tracker?.id}
        isOpen={!!openGroup}
        close={() => setOpenGroupId(undefined)}
        isArchived={isArchived}
        onStatusAction={handleStatusAction}
        onDueDateChange={handleDueDateChange}
      />

      {loading && <LoadingPage />}
    </>
  );
};

export default ChecklistTab;
