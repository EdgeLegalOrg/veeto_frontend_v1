import React, { Fragment, useState, useEffect } from "react";
import { editServiceDetails } from "../../../apis";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";

const UpdateServiceDetails = (props) => {
  const {
    setShowUpdate,
    refresh,
    details,
    billingList,
    typeList,
    taxTypeList,
  } = props;
  const [formData, setFormData] = useState(details);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setFormData(props.details);
  }, [props.details]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount" && parseFloat(value) < 0) {
      return;
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async () => {
    try {
      const { data } = await editServiceDetails(formData);
      setShowUpdate(false);
      if (data.success) {
        refresh();
      } else {
        toast.error("Something went wrong please try later.");
      }
    } catch (error) {
      toast.error("Something went wrong please try later.");
      console.error(error);
    }
  };

  const handleSelectOption = (name, val) => {
    setFormData({ ...formData, [name]: val.value });
  };

  const findDisplayname = (from, val = "") => {
    if (val) {
      let data = from.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
        closeForm={() => setShowAdd(false)}
        btn1={"Cancel"}
        btn2="Add"
        heading="Add New Service Line"
        handleFunc={handleAddNew}
      > */}
      <div className="row">
        <div className="col-md-4 mt-4">
          <TextInputField
            label="Title"
            name="serviceLineTitle"
            value={formData.serviceLineTitle}
            onChange={handleFormChange}
            placeholder="Title"
            // required={
            //   requiredFields.indexOf('companyName') >= 0 ? true : false
            // }
            // maxLength={fieldLength['companyName'.toLowerCase()]}
          />
        </div>
        <div className="col-md-4 mt-4">
          <SelectInputField
            name="type"
            label="Type"
            placeholder="Type"
            optionArray={typeList}
            value={formData.type}
            selected={formData.type}
            onSelectFunc={(val) => handleSelectOption("type", val)}
            fieldVal={findDisplayname(typeList, formData.type)}
            maxLength={null}
          />
        </div>
        <div className="col-md-4 mt-4">
          <SelectInputField
            name="taxType"
            label="Tax Type"
            placeholder="Tax Type"
            optionArray={taxTypeList}
            value={formData.taxType}
            selected={formData.taxType}
            onSelectFunc={(val) => handleSelectOption("taxType", val)}
            fieldVal={findDisplayname(taxTypeList, formData.taxType)}
            maxLength={null}
          />
        </div>
        <div className="col-md-4 mt-4">
          <SelectInputField
            name="billingFrequency"
            label="Billing Frequency"
            placeholder="Billing Frequency"
            optionArray={billingList}
            value={formData.billingFrequency}
            selected={formData.billingFrequency}
            onSelectFunc={(val) => handleSelectOption("billingFrequency", val)}
            fieldVal={findDisplayname(billingList, formData.billingFrequency)}
            maxLength={null}
          />
        </div>
        <div className="col-md-4 mt-4">
          <TextInputField
            label="Amount"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleFormChange}
            type="number"
            // required={
            //   requiredFields.indexOf('companyName') >= 0 ? true : false
            // }
            // maxLength={fieldLength['companyName'.toLowerCase()]}
          />
        </div>
        <div className="col-md-4"></div>
      </div>
      <div className="row">
        <div className="col-md-12 mt-4">
          <TextInputField
            type="textarea"
            rows={3}
            width="90%"
            name="serviceLineDesc"
            label="Service Line Description"
            placeholder="Service Line Description"
            value={formData.serviceLineDesc}
            onChange={handleFormChange}
            // required={
            //   requiredFields.indexOf('companyName') >= 0 ? true : false
            // }
            // maxLength={fieldLength['companyName'.toLowerCase()]}
          />
        </div>
        <div className="col-md-4"></div>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top mt-4">
        <Button
          color="danger"
          className="mx-1"
          onClick={() => setShowUpdate(false)}
        >
          Cancel
        </Button>
        <Button color="success" className="mx-1" onClick={() => handleUpdate()}>
          Save
        </Button>
      </div>
      {/* </CustomToastWindow> */}
    </Fragment>
  );
};

export default UpdateServiceDetails;
