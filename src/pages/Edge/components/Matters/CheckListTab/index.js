import React, { useEffect, useState } from "react";
import { updateMatterChecklist } from "pages/Edge/apis";
import { toast } from "react-toastify";
import "../../../stylesheets/CheckListTab.css";
import LoadingPage from "pages/Edge/utils/LoadingPage";

const ChecklistTab = (props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [taskList, setTaskList] = useState([]);

  useEffect(() => {
    if (props.data) {
      getTaskList(props.data);
      setData(props.data);
    }
  }, [props.data]);

  const getTaskList = (arg) => {
    if (arg?.checklistTracker?.taskList?.length) {
      setTaskList([...arg?.checklistTracker?.taskList]);
    }
  };

  const handleSelectTask = (id) => {
    let tl = [...taskList];

    for (let a in tl) {
      if (tl[a].id === id) {
        const flag = !tl[a].taskCompleted;

        let sl = tl[a].subTaskList;
        for (let b in sl) {
          sl[b].taskCompleted = flag;
        }

        tl[a].taskCompleted = flag;
        tl[a].subTaskList = sl;

        break;
      }
    }

    setTaskList(tl);
  };

  const handleSelectSubTask = (taskId, subId) => {
    let tl = [...taskList];
    for (let a in tl) {
      if (tl[a].id === taskId) {
        let sl = [...tl[a].subTaskList];
        let allCompleted = true;
        for (let b in sl) {
          if (sl[b].id === subId) {
            sl[b].taskCompleted = !sl[b].taskCompleted;
            break;
          }
        }

        tl[a].subTaskList = sl;

        for (let b in sl) {
          if (!sl[b].taskCompleted) {
            allCompleted = false;
            break;
          }
        }

        tl[a].taskCompleted = allCompleted;

        break;
      }
    }

    setTaskList(tl);
  };

  const isTaskSelected = (id) => {
    for (let a in taskList) {
      if (taskList[a].id === id) {
        return taskList[a].taskCompleted;
      }
    }

    return false;
  };

  const isSubTaskSelected = (taskId, subId) => {
    for (let a in taskList) {
      if (taskList[a].id === taskId) {
        const sl = taskList[a].subTaskList;
        for (let b in sl) {
          if (sl[b].id === subId) {
            return sl[b].taskCompleted;
          }
        }
      }
    }

    return false;
  };

  const handleUpdateTask = async () => {
    setLoading(true);
    try {
      let inputData = {
        id: props?.data?.checklistTracker?.id,
        checksum: props?.data?.checklistTracker?.checksum,
        matterId: props?.data?.checklistTracker?.matterId,
        taskList: taskList,
      };
      const { data } = await updateMatterChecklist(inputData);
      if (data.success) {
        toast.success("Checklist updated successfully");
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

  const subtaskList = (arg) => {
    if (arg?.subTaskList?.length) {
      return arg.subTaskList.map((sub) => (
        <div
          className="d-flex align-items-center px-3 py-2 ms-2 sub-task-item"
          key={`subtask-${sub.id}`}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectSubTask(arg.id, sub.id);
          }}
        >
          <input
            type="checkbox"
            className="me-3 mt-0 form-check-input"
            checked={isSubTaskSelected(arg.id, sub.id)}
          />
          <span className="fs-6 fw-normal">{sub.taskTitle}</span>
          <span className="fs-12 ms-2">
            {!sub.mandatory ? "(optional)" : ""}
          </span>
        </div>
      ));
    } else {
      return <></>;
    }
  };

  const calculateHalf = () => {
    if (taskList.length <= 5) {
      return taskList?.length || 0;
    } else if (taskList?.length > 5 && taskList?.length < 10) {
      return 5;
    } else {
      return Math.ceil(taskList?.length / 2);
    }
  };

  const displayTaskTitle = (task) => {
    return <p className="fs-16">{task.taskTitle} </p>;
  };

  const ui = () => {
    if (data.checklistTracker) {
      const findHalf = calculateHalf();
      return (
        <div className="d-flex justify-content-start row mt-2 pb-4 pe-4 task-container">
          <div className={`task-list two`}>
            {taskList?.slice(0, findHalf)?.map((task, i) => (
              <div className="d-flex align-item-start" key={`task-${task.id}`}>
                <span className="mt-2 me-2 fs-16">{i + 1}.</span>
                <div className="d-flex flex-column flex-grow-1">
                  <div
                    className="d-flex align-items-center  px-3 py-2 task-item"
                    key={`task-${task.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTask(task.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      className="me-3 mt-0 form-check-input"
                      checked={isTaskSelected(task.id)}
                      onChange={() => {}}
                    />
                    {displayTaskTitle(task)}
                  </div>
                  <div className="sub-task-container">{subtaskList(task)}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              width: "1px",
              padding: 0,
              background: "#f3f6f9",
              margin: "0px 20px",
            }}
          ></div>
          {taskList?.slice(findHalf, taskList?.length)?.length > 0 && (
            <div className={`task-list ${taskList.length > 5 ? "two" : ""}`}>
              {taskList?.slice(findHalf, taskList?.length)?.map((task, i) => (
                <>
                  <div
                    className="d-flex align-items-start"
                    key={`task-${task.id}`}
                  >
                    <span className="mt-2 me-2 fs-16">{findHalf + i + 1}.</span>
                    <div className="d-flex flex-column flex-grow-1">
                      <div
                        className="d-flex align-items-center px-3 py-2 task-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTask(task.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          className="me-3 mt-0 form-check-input"
                          checked={isTaskSelected(task.id)}
                          onChange={() => {}}
                        />
                        <p className="fs-5 fw-normal">
                          {displayTaskTitle(task)}
                        </p>
                      </div>
                      <div className="sub-task-container">
                        {subtaskList(task)}
                      </div>
                    </div>
                  </div>
                </>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="row mt-4 text-center pb-4">
          <h5 className="mb-0">No checklist available!</h5>
        </div>
      );
    }
  };

  const updateBtn = () => {
    if (data.checklistTracker) {
      return (
        <button
          type="button"
          className="mx-4 btn btn-success"
          onClick={handleUpdateTask}
        >
          Save
        </button>
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      <div className="mx-4">
        <div className="row mt-1">
          <div className="d-flex align-items-center justify-content-end p-2">
            {updateBtn()}
          </div>
        </div>
        {ui()}
      </div>
      {loading && <LoadingPage />}
    </>
  );
};

export default ChecklistTab;
