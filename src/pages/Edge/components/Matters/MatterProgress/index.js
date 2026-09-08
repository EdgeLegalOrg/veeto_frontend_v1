import React, { useEffect, useState } from 'react';

const STATUS_COMPLETE = 'COMPLETE';
const STATUS_NOT_APPLICABLE = 'NOT_APPLICABLE';

/**
 * Overall completion across the matter's workflow tasks.
 *
 * Counts top level tasks, matching how each task group card counts its own, so
 * the matter figure and the group figures describe the same thing. Not
 * Applicable tasks are left out of both sides of the fraction - treating them as
 * outstanding would hold a finished matter below 100% forever.
 */
const MatterProgressbar = (props) => {
  const [progress, setProgress] = useState(0);
  const [hasCountableTasks, setHasCountableTasks] = useState(false);
  const { checklistTracker } = props?.data || {};

  useEffect(() => {
    calculateProgress(props?.data?.checklistTracker);
  }, [props.data]);

  const calculateProgress = (tracker) => {
    const taskList = tracker?.taskList || [];

    let complete = 0;
    let countable = 0;

    taskList.forEach((task) => {
      // Fall back to the legacy boolean for rows written before status existed.
      const status =
        task.status || (task.taskCompleted ? STATUS_COMPLETE : null);

      if (status === STATUS_NOT_APPLICABLE) {
        return;
      }

      countable++;

      if (status === STATUS_COMPLETE) {
        complete++;
      }
    });

    setHasCountableTasks(countable > 0);
    // Whole numbers: two decimals on a progress bar read as noise.
    setProgress(countable > 0 ? Math.round((complete / countable) * 100) : 0);
  };

  // Rendered from state rather than written into the DOM, so the figure is
  // present on first paint instead of appearing only once something changes.
  const barStyles = () => {
    const styles = {
      width: `${progress}%`,
      color: '#353f43',
      fontWeight: '600',
      textAlign: 'center',
    };

    if (progress >= 100) {
      styles.background = '#d1f1b8';
    } else {
      styles.background = '#e1f6cf';
      styles.borderRight = '5px solid #0d9540';
      styles.borderRadius = 0;
    }

    return styles;
  };

  if (!checklistTracker || !hasCountableTasks) {
    return <></>;
  }

  return (
    <div className='full'>
      <div className='pg-container'>
        <div className='pg-label'>
          <p className='mb-0'>Matter Progress</p>
        </div>
        <div className='pg-bars'>
          <div className='pg-tab' style={barStyles()}>
            {/* Sits outside the filled bar at low percentages, where there is
                no room for it inside. */}
            {progress > 0 && (
              <p className='mb-0 text-dark' id={'progress-percent'}>
                {progress}%
              </p>
            )}
          </div>
          {progress === 0 && (
            <p className='mb-0 text-dark pg-zero-label'>0%</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatterProgressbar;
