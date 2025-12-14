import React, { useState } from "react";
import { Button } from "reactstrap";
import WaterUsage from "./WaterUsage";

const AddNewAdjustment = (props) => {
  const [adjustmentType, setAdjustmentType] = useState("time");

  const checkAdjustmentSelected = (type) => {
    if (adjustmentType === type) {
      return true;
    } else {
      return false;
    }
  };

  const changeAdjustmentType = (type) => {
    setAdjustmentType(type);
  };

  return (
    <div>
      <div className="mt-2">
        <div className="mx-2" onClick={() => changeAdjustmentType("time")}>
          <input
            type="radio"
            checked={checkAdjustmentSelected("time")}
            onClick={() => {}}
            onChange={() => {}}
          />
          <label className="mx-2">Time Based</label>
        </div>
        <div className="mx-2" onClick={() => changeAdjustmentType("water")}>
          <input
            type="radio"
            checked={checkAdjustmentSelected("water")}
            onClick={() => {}}
            onChange={() => {}}
          />
          <label className="mx-2">Water Usage</label>
        </div>
        <div className="mx-2" onClick={() => changeAdjustmentType("penalty")}>
          <input
            type="radio"
            checked={checkAdjustmentSelected("penalty")}
            onClick={() => {}}
            onChange={() => {}}
          />
          <label className="mx-2">Penalty Interest</label>
        </div>
        <div
          className="mx-2"
          onClick={() => changeAdjustmentType("timeByUnit")}
        >
          <input
            type="radio"
            checked={checkAdjustmentSelected("timeByUnit")}
            onClick={() => {}}
            onChange={() => {}}
          />
          <label className="mx-2">Time by Unit</label>
        </div>
        <div className="mx-2" onClick={() => changeAdjustmentType("other")}>
          <input
            type="radio"
            checked={checkAdjustmentSelected("other")}
            onClick={() => {}}
            onChange={() => {}}
          />
          <label className="mx-2">Other Fixed Costs</label>
        </div>
      </div>
      <div>{<WaterUsage />}</div>

      <div className="row mt-4">
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            type="button"
            color="light"
            onClick={props.close}
            className="mx-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="success"
            onClick={() => {}}
            className="mx-1"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddNewAdjustment;
