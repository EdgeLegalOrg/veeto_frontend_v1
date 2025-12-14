import React, { useState, useEffect, Fragment } from "react";
import { editDisclaimer } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { AlertPopup } from "../../customComponents/CustomComponents";
import { toast } from "react-toastify";
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

const EditTaxDisclaimer = (props) => {
  const {
    setSelectedList,
    selectedDisclaimer,
    setSelectedDisclaimer,
    setShowEdit,
    refresh,
  } = props;

  const [formData, setFormData] = useState(
    selectedDisclaimer ? selectedDisclaimer : initialData
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    selectedDisclaimer && setFormData(selectedDisclaimer);
  }, [props.selectedDisclaimer]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditSubmit = async () => {
    try {
      const { data } = await editDisclaimer(formData);
      if (data.success) {
        refresh();
        setShowEdit(false);
        setTimeout(() => {
          setSelectedList([]);
          setSelectedDisclaimer(null);
        }, 10);
      } else {
        setShowAlert(true);
        setAlertMsg(
          data?.error?.message
            ? data.error.message
            : "Something went wrong please try later."
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong please check console.");
      console.error(error);
    }
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
        closeForm={() => setShowEdit(false)}
        btn1={"Cancel"}
        btn2="Save"
        heading="Edit Tax Disclaimer"
        handleFunc={handleEditSubmit}
        bodyStyle={{ minHeight: "30vh" }}
      > */}
      <div className="mb-4">
        <div className="row">
          <div className="col-md-12 mt-3">
            <TextInputField
              type="textarea"
              label="Preferred Tax Disclaimer"
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
      {/* </CustomToastWindow> */}
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
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default EditTaxDisclaimer;
