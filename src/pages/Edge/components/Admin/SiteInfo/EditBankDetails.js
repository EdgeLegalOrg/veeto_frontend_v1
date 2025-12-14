import React, { Fragment, useEffect, useState } from "react";
import { AlertPopup } from "../../customComponents/CustomComponents";
import { editbankInfo } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { toast } from "react-toastify";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
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

const EditBankDetails = (props) => {
  const {
    setSelectedList,
    selectedBank,
    setSelectedBank,
    refresh,
    setShowEdit,
    accTypeList,
  } = props;
  const [formData, setFormData] = useState(
    selectedBank ? selectedBank : initialData
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(selectedBank);
  }, [props.selectedBank]);

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

  const handleEditSubmit = async () => {
    try {
      const { data } = await editbankInfo(formData);
      if (data.success) {
        refresh();
        setTimeout(() => {
          setSelectedList([]);
          setSelectedBank(null);
        }, 10);
      } else {
        setShowAlert(true);
        setAlertMsg(
          data?.error?.message
            ? data.error.message
            : "Something went wrong please try later."
        );
      }
      setShowEdit(false);
    } catch (error) {
      setLoading(false);
      setShowEdit(false);
      toast.error("Something went wrong please check console.");
      console.error(error);
    }
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
        closeForm={() => setShowEdit(false)}
        btn1={"Cancel"}
        btn2="Update"
        heading="Edit Account Details"
        handleFunc={handleEditSubmit}
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
              name="accountType"
              label="Account Type"
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
          onClick={() => setShowEdit(false)}
        >
          Cancel
        </Button>
        <Button
          className="mx-1"
          color="success"
          onClick={() => handleEditSubmit()}
        >
          Update
        </Button>
      </div>
      {loading && <LoadingPage />}
      {showAlert && (
        <Modal
          isOpen={showAlert}
          toggle={() => setShowAlert(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setShowAlert(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              closeForm={() => setShowAlert(false)}
              message={alertMsg}
              btn1={"Close"}
              btn2={"Refresh"}
              handleFunc={() => window.location.reload()}
            />
          </ModalBody>
        </Modal>
      )}
    </Fragment>
  );
};

export default EditBankDetails;
