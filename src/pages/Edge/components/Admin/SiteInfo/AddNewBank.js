import React, { useState } from "react";
import { Button } from "reactstrap";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";

const initialData = {
  bankName: "",
  bankAccountName: "",
  bankBSB: "",
  codeNumber: "",
  accountNumber: "",
  abn: "",
  accountType: "",
};

const AddNewBank = (props) => {
  const { setShowForm, handleAddBank, accTypeList } = props;
  const [formData, setFormData] = useState(initialData);
  const [submitted, setSubmitted] = useState(false)

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectOption = (name, val) => {
    setFormData({ ...formData, [name]: val.value });
  };

  const findDisplayname = (val = "") => {
    if (val) {
      let data = accTypeList.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  return (
    <>
      {/*  <CustomToastWindow
       closeForm={() => setShowForm(false)}
       btn1={"Cancel"}
       btn2="Add"
       heading="Add new Account"
       handleFunc={() => handleAddBank(formData)}
     > */}
      <div className="mb-4">
        <div className="row">
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Bank Name"
              name="bankName"
              placeholder="Bank Name"
              value={formData.bankName}
              onChange={handleFormChange}
              // required={
              //   requiredFields.indexOf('companyName') >= 0 ? true : false
              // }
              // maxLength={fieldLength['companyName'.toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Account Name"
              name="bankAccountName"
              placeholder="Account Name"
              value={formData.bankAccountName}
              onChange={handleFormChange}
              // required={
              //   requiredFields.indexOf('companyName') >= 0 ? true : false
              // }
              // maxLength={fieldLength['companyName'.toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="BSB"
              name="bankBSB"
              placeholder="BSB"
              value={formData.bankBSB}
              onChange={handleFormChange}
              // required={
              //   requiredFields.indexOf('companyName') >= 0 ? true : false
              // }
              // maxLength={fieldLength['companyName'.toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Code Number"
              name="accountNumber"
              placeholder="Account Number"
              value={formData.accountNumber}
              onChange={handleFormChange}
              // required={
              //   requiredFields.indexOf('companyName') >= 0 ? true : false
              // }
              // maxLength={fieldLength['companyName'.toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <SelectInputField
              label="Account Type"
              name="accountType"
              placeholder="Account Type"
              optionArray={accTypeList}
              value={formData.accountType}
              selected={formData.accountType}
              onSelectFunc={(val) => handleSelectOption("accountType", val)}
              fieldVal={findDisplayname(formData.accountType)}
              maxLength={null}
            />
          </div>
          <div className="col-md-4 mt-3"></div>
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
          onClick={() => handleAddBank(formData)}
        >
          Add
        </Button>
      </div>
    </>
  );
};

export default AddNewBank;
