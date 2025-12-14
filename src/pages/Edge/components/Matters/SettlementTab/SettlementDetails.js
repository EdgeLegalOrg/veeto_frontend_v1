import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "../../../stylesheets/Settlement.css";
import AddNewAdjustment from "./AddNewAdjustment";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";

const SettlementDetails = () => {
  const history = useNavigate();
  const [add, setAdd] = useState(false);

  const handleClose = () => {
    history({
      search: "",
    });
  };

  return (
    <div className="">
      <div className="d-flex align-items-center justify-content-between mx-2">
        <h5>Settlement Sheet</h5>
        <Button
          className="mx-1"
          onClick={handleClose}
          color="danger"
        >
          Close
        </Button>
      </div>
      <div className="mt-3 d-flex align-items-center mx-2">
        <p className="mb-0">Adjustments as at: </p>
        <TextInputField
          type="date"
          className="mx-2"
          style={{ width: "20em" }}
        />
        <Input type="checkbox" />
        <p className="mb-0 mx-1">Use Settlement date of 29/07/2023</p>
      </div>
      <div className="mt-3">
        <div className="mx-2">
          <div className="st-detail-div">
            <label>Vender</label>
            <p>Shikhar Rastogi</p>
          </div>
          <div className="st-detail-div">
            <label>Purchaser</label>
            <p>Abc Pqr</p>
            <p>Efg Xyz</p>
            <p>Klm Stu</p>
          </div>
          <div className="st-detail-div">
            <label>Property Address</label>
            <p>Abc edf tdfggg, aasdr rtert </p>
          </div>
          <Button onClick={() => setAdd(true)}>Add Adjustment</Button>
        </div>
        <div>
          <h5 className="bg-light mt-3 px-2 py-3">Statement of Settlement</h5>
        </div>
        <div className="mt-3 mx-2">
          <div className="row my-2">
            <div className="col-md-3">
              <label>Purchase Price</label>
            </div>
            <div className="col-md-6">
              <TextInputField type="text" />
            </div>
            <div className="col-md-3"></div>
          </div>
          <div className="row my-2">
            <div className="col-md-3">
              <label>Less Deposit Paid</label>
            </div>
            <div className="col-md-6">
              <TextInputField type="text" />
            </div>
            <div className="col-md-3"></div>
          </div>
          <div className="row my-2">
            <div className="col-md-3">
              <label>Balance of Purchase Price</label>
            </div>
            <div className="col-md-6">
              <TextInputField type="text" />
            </div>
            <div className="col-md-3"></div>
          </div>
          <div className="row my-2">
            <div className="col-md-3">
              <label>Plus Adjustments</label>
            </div>
            <div className="col-md-6">
              <TextInputField type="text" />
            </div>
            <div className="col-md-3"></div>
          </div>
          <div className="row my-2">
            <div className="col-md-3">
              <label>Plus GST</label>
            </div>
            <div className="col-md-6">
              <Input
                type="checkbox"
                className="form-check-input"
              />
            </div>
            <div className="col-md-3"></div>
          </div>
          <div className="row my-2">
            <div className="col-md-3">
              <label>Amount due on Settlement</label>
            </div>
            <div className="col-md-6">
              <TextInputField type="text" />
            </div>
            <div className="col-md-3"></div>
          </div>
        </div>
      </div>
      {add && (
        <Modal
          isOpen={add}
          toggle={() => setAdd(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setAdd(false)}
            className="bg-light p-3"
          >
            Add New Adjustment
          </ModalHeader>
          <ModalBody>
            <AddNewAdjustment close={() => setAdd(false)} />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default SettlementDetails;
