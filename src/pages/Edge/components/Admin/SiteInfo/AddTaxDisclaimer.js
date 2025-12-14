import React, { useState } from "react";

import {
  Container,
  Card,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";

const initialData = {
  disclaimer: "",
};

const AddTaxDisclaimer = (props) => {
  const { setShowForm, handleTaxDisclaimer } = props;
  const [formData, setFormData] = useState(initialData);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      {/* <CustomToastWindow
      closeForm={() => setShowForm(false)}
      btn1={"Cancel"}
      btn2="Add"
      heading="Add Tax Disclaimer"
      handleFunc={() => handleTaxDisclaimer(formData)}
      bodyStyle={{ minHeight: "30vh" }}
    > */}
      <div className="mb-4">
        <div className="row">
          <div className="col-md-12 mt-3">
            <TextInputField
              label="Preferred Tax Disclaimer"
              type="textarea"
              cols={3}
              name="disclaimer"
              placeholder="Preferred Tax Disclaimer"
              value={formData.disclaimer}
              onChange={handleFormChange}
              // required={requiredFields.indexOf('email1') >= 0 ? true : false}
              // maxLength={fieldLength['email1'.toLowerCase()]}
            />
          </div>
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button
          className="mx-1"
          color="danger"
          onClick={() => setShowForm(false)}
        >
          Cancel
        </Button>
        <Button
          className="mx-1"
          color="success"
          onClick={() => handleTaxDisclaimer(formData)}
        >
          Add
        </Button>
      </div>
    </>
  );
};

export default AddTaxDisclaimer;
