import React, { useEffect, useRef, useState } from 'react';

const MatterProgressbar = (props) => {
  const [show, setShow] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const { checklistTracker } = props?.data;

  useEffect(() => {
    if (props?.data?.checklistTracker) {
      calculateProgress(props?.data?.checklistTracker);
    }
  }, [props.data]);

  const calculateProgress = (arg) => {
    const { taskList } = arg;
    let totalSubTasks = taskList?.length || 0;
    let subTaskCompleted = 0;
    let progress = 0;

    for (let a in taskList) {
      const item = taskList[a];
      const subList = taskList[a].subTaskList;
      let mandatorySubtasks = 0;
      if (subList.length) {
        for (let b in subList) {
          if (subList[b].mandatory && subList[b].taskCompleted) {
            subTaskCompleted++;
          }

          if (subList[b].mandatory) {
            mandatorySubtasks++;
          }
        }
      }

      if (item.taskCompleted) {
        subTaskCompleted++;
      }
      totalSubTasks += mandatorySubtasks;
    }

    if (totalSubTasks == 0) {
      setShow(false);
    } else if (totalSubTasks > 0 && subTaskCompleted) {
      setShow(true);
      progress = ((subTaskCompleted / totalSubTasks) * 100).toFixed(2);
    }

    setProgressWidth(progress);
  };

  const getStyles = () => {
    // const { taskList } = checklistTracker;
    // let totalSubTasks = 0;
    // let subTaskCompleted = 0;
    let progress = progressWidth;
    let rval = {};

    // for (let a in taskList) {
    //   const item = taskList[a];
    //   if (item?.mandatory) {
    //     const subList = taskList[a].subTaskList;
    //     if (subList.length) {
    //       for (let b in subList) {
    //         if (subList[b].taskCompleted) {
    //           subTaskCompleted++;
    //         }
    //       }
    //     } else if (item.taskCompleted) {
    //       subTaskCompleted++;
    //     }
    //     totalSubTasks += item?.subTaskList?.length || 1;
    //   }
    // }

    if (progress == 0) {
      rval.display = 'none';
      // setShow(false);
      return rval;
    }
    // else if (totalSubTasks > 0 && subTaskCompleted) {
    //   setShow(true);
    //   progress = ((subTaskCompleted / totalSubTasks) * 100).toFixed(2);
    // }

    rval.width = `${progress}%`;
    rval.color = '#353f43';
    rval.fontWeight = '600';
    rval.textAlign = 'center';

    const ele = document.getElementById('progress-percent');

    if (parseInt(progress) == 100) {
      rval.background = '#d1f1b8';
      if (ele) {
        ele.innerText = `${parseInt(progress)}%`;
      }
    } else {
      if (progress > 0) {
        rval.background = '#e1f6cf';
        rval.borderRight = '5px solid #0d9540';
        rval.borderRadius = 0;

        if (ele) {
          ele.innerText = `${progress}%`;
        }
      } else {
        if (ele) {
          ele.innerText = ``;
        }
      }
    }

    return rval;
  };

  if (checklistTracker && show) {
    return (
      <div className='full'>
        <div className='pg-container'>
          <div className='pg-label'>
            <p className='mb-0'>Matter Progress</p>
          </div>
          <div className='pg-bars'>
            <div className='pg-tab' style={getStyles()}>
              <p className='mb-0 text-dark' id={'progress-percent'}></p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default MatterProgressbar;
