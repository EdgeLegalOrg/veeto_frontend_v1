import React, { useState, useEffect, Fragment } from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { updateXeroSetting } from "../../../apis";
import { AlertPopup } from "../../customComponents/CustomComponents";
import { TextInputField } from "pages/Edge/components/InputField";
import LoadingPage from "pages/Edge/utils/LoadingPage";
import { toast } from "react-toastify";

const initialData = {
  xeroSolicitorId: "",
  xeroAccountId: "",
  xeroOfficeId: "",
};

const XeroSetting = (props) => {
  const { setShowDetail, refresh } = props;
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [formData, setFormData] = useState(initialData);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.data) {
      setFormData(props.data);
    }
  }, [props.data]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data } = await updateXeroSetting(formData);
      if (data.success) {
        refresh();
      } else {
        setShowAlert(true);
        setAlertMsg(
          data?.error?.message
            ? data?.error?.message
            : "Something went wrong, do you want to refresh?"
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, please try later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
        gridSize='55%'
        autoClose={false}
        closeForm={() => setShowDetail(false)}
        btn1='Cancel'
        btn2='Update'
        heading='Edit Xero Settings'
        handleFunc={() => handleUpdate()}
      > */}
      <div className="xeroSetting-container">
        <div className="xero-input">
          <TextInputField
            name="xeroSolicitorId"
            label="Xero Solicitor Id"
            value={formData.xeroSolicitorId}
            onChange={handleFormChange}
          />
        </div>

        <div className="xero-input">
          <TextInputField
            name="xeroAccountId"
            label="Xero Account Id"
            value={formData.xeroAccountId}
            onChange={handleFormChange}
          />
        </div>

        <div className="xero-input">
          <TextInputField
            name="xeroOfficeId"
            label="Xero Office Id"
            value={formData.xeroOfficeId}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button
          color="danger"
          className="mx-1"
          onClick={() => setShowDetail(false)}
        >
          Cancel
        </Button>
        <Button color="success" className="mx-1" onClick={() => handleUpdate()}>
          Save
        </Button>
      </div>

      {/* </CustomToastWindow> */}
      {showAlert && (
        <Modal
          isOpen={showAlert}
          toggle={() => setOpenAlert(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setOpenAlert(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              closeForm={() => setShowAlert(false)}
              message={alertMsg}
              btn1={"Close"}
              btn2={"Reload"}
              handleFunc={refresh}
            />
          </ModalBody>
        </Modal>
      )}
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default XeroSetting;
