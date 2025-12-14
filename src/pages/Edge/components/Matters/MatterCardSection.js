import React, { useState } from "react";
import { Card, CardBody } from "reactstrap";
// import { CustomCard } from "../customComponents/CustomComp";

const MatterCardSection = () => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div className="my-2">
      <div className="d-flex">
        <h5 className="mx-2">Billing Metrics</h5>
        <span
          className="a-link"
          onClick={handleClick}
        >
          {open ? "(Hide)" : "(Show)"}
        </span>
      </div>
      {open && (
        <div className="d-flex">
          <Card
            style={{ width: "25%", marginBottom: 0 }}
            className="m-2 p-2 border"
          >
            <CardBody>
              <h6>Draft Bills</h6>
              <div className="d-flex">
                <strong>0</strong>
                <p className="a-link mb-0 mx-1">(Create new bill)</p>
              </div>
            </CardBody>
          </Card>
          <Card
            style={{ width: "25%", marginBottom: 0 }}
            className="m-2 p-2 border"
          >
            <CardBody>
              <h6>Unpaid Bills</h6>
              <div className="d-flex">
                <strong>0</strong>
                <p className="a-link mb-0 mx-1">(Create new bill)</p>
              </div>
            </CardBody>
          </Card>
          <Card
            style={{ width: "25%", marginBottom: 0 }}
            className="m-2 p-2 border"
          >
            <CardBody>
              <h6>Overdue Bills</h6>
              <div className="d-flex">
                <strong>0</strong>
                <p className="a-link mb-0 mx-1">(Create new bill)</p>
              </div>
            </CardBody>
          </Card>
          {/* <CustomCard
            num={"0"}
            heading={"Draft Bills"}
          ></CustomCard> */}

          {/* 
          <CustomCard
            num={"0"}
            heading={"Unpaid Bills"}
          >
            <span className="a-link">(Create new bill)</span>
          </CustomCard> */}

          {/* <CustomCard
            num={"0"}
            heading={"Overdue Bills"}
          >
            <span className="a-link">(Create new bill)</span>
          </CustomCard> */}
        </div>
      )}
    </div>
  );
};

export default MatterCardSection;
