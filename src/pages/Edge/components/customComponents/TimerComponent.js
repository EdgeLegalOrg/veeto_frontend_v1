import React, { useState, useEffect, useRef } from "react";
import { Button, Input } from "reactstrap";
import "./styles/TimerStyles.css";

const TimerComponent = (props) => {
  const [state, setState] = useState({
    timer: 0,
    isRunning: false,
  });

  // const timeout = useRef(null);

  useEffect(() => {
    let timeout = null;
    if (state.isRunning) {
      timeout = setInterval(() => tick(), 1000);
    } else {
      return;
    }
    return () => clearInterval(timeout);
  }, [state.isRunning]);

  const tick = () => {
    setState((prev) => ({ ...prev, timer: prev.timer + 1 }));
  };

  const start = (resume) => {
    setState({ ...state, isRunning: true });
    if (props.afterStart && resume) {
      props.afterStart();
    }
  };

  const stop = () => {
    setState({ ...state, isRunning: false });
    if (props.afterStop) {
      props.afterStop(state.timer);
    }
  };

  const reset = () => {
    setState({
      timer: 0,
      isRunning: false,
    });
    if (props.afterClear) {
      props.afterClear();
    }
  };

  const pad = (n) => {
    return n < 10 ? "0" + n : n;
  };

  const seconds = (n) => {
    return n > 1 ? "seconds" : "second";
  };

  const displaySeconds = () => {
    if (props.hideAfterStop) {
      if (state.isRunning) {
        return <p>{`${pad(state.timer)} ${seconds(state.timer)}`} </p>;
      } else {
        return <></>;
      }
    } else {
      return <p>{`${pad(state.timer)} ${seconds(state.timer)}`} </p>;
    }
  };

  return (
    <div className="my-2">
      <div className="d-flex mx-2">{displaySeconds()}</div>
      <div className="d-flex">
        <Button
          color="primary"
          className="mx-2"
          disabled={state.isRunning || state.timer > 0}
          onClick={start}
        >
          Start
        </Button>
        <Button
          color="primary"
          className="mx-2"
          disabled={!state.isRunning}
          onClick={stop}
        >
          Stop
        </Button>
        <Button
          color="primary"
          className="mx-2"
          disabled={state.isRunning || state.timer <= 0}
          onClick={() => start(true)}
        >
          Resume
        </Button>
        <Button
          color="primary"
          className="mx-2"
          disabled={!state.isRunning && state.timer <= 0}
          onClick={reset}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

TimerComponent.defaultProps = {
  hideAfterStop: false,
};

export default TimerComponent;
