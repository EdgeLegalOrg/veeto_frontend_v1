import React from "react";
import { Button } from "reactstrap";
import "../../stylesheets/stripes.css";

function SafeStripe(props) {
  const { selected, addCustody, handleDeleteCustody } = props;
  return (
    <div className="d-flex align-items-center justify-content-between">
      <h5 className="card-title mb-3 mb-md-0 flex-grow-1">Safe Custody</h5>
      <div className="flex-shrink-0">
        <div className="d-flex gap-1 flex-wrap">
          <Button
            className="d-flex"
            onClick={addCustody}
            color="success"
          >
            <span className="plusdiv">+</span>
            Add
          </Button>
          {selected?.length > 0 && (
            <Button
              className="d-flex"
              color="danger"
              onClick={handleDeleteCustody}
            >
              <span className="plusdiv">-</span>
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SafeStripe;
