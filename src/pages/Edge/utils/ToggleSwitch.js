import React, { Fragment, useState, useEffect } from "react";
import "./ToggleSwitchStyles.css";

const ToggleSwitch = (props) => {
  const [active, setActive] = useState(props.checked);
  const { handleFunc, labelClick = true } = props;

  useEffect(() => {
    setActive(props.checked);
  }, [props.checked]);

  const handleClick = (e) => {
    if (labelClick) {
      e.stopPropagation();
      if (handleFunc) {
        handleFunc();
      }
    }
  };

  const inputClick = (e) => {
    if (!labelClick) {
      e.stopPropagation();
      if (handleFunc) {
        handleFunc();
      }
    }
  };

  return (
    <Fragment>
      <label
        className="switch mb-0"
        onClick={handleClick}
      >
        <input
          type="checkbox"
          checked={active}
          onClick={inputClick}
          onChange={() => {}}
        />
        <span className="slider round"></span>
        <span
          className="labels"
          data-on="&#x2713;"
          data-off="&#x2716;"
        ></span>
      </label>
    </Fragment>
  );
};

export default ToggleSwitch;
