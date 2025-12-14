import React from "react";
import { Button } from "reactstrap";

const SettingStripe = (props) => {
  const { update, disable } = props;
  return (
    <div className="bg-light d-flex align-items-center justify-content-between p-2">
      <h5 className="mb-0">System Numerals</h5>
      <Button
        color="success"
        onClick={update}
        disabled={disable}
      >
        Update
      </Button>
    </div>
  );
};

export default SettingStripe;
