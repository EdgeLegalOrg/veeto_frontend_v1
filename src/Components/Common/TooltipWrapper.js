import React, { useState } from "react";
import { Tooltip } from "reactstrap";

function TooltipWrapper(props) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);

  return (
    <>
      <span id={`Tooltip-${props.id}`}>
        {props?.icon ? props?.icon : props.content}
      </span>
      <Tooltip
        isOpen={tooltipOpen}
        target={`Tooltip-${props.id}`}
        toggle={toggle}
        placement={props.placement}
        autohide={true}
        flip={true}
      >
        {props.text}
      </Tooltip>
    </>
  );
}

export default TooltipWrapper;
