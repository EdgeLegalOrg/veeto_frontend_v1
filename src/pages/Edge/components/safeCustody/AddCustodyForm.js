import React, { useState, useEffect } from "react";
import Dropzone from "react-dropzone";
import closeBtn from "../../images/close-white-btn.svg";
import { v1 as uuidv1 } from "uuid";
import "../../stylesheets/AddCustodyForm.css";
import { uploadCustodyAttachment } from "../../apis";
import { ConfirmationCustodyPopup } from "../customComponents/CustomComponents";
import LoadingPage from "../../utils/LoadingPage";
import { toast } from "react-toastify";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { formatDateFunc } from "../../utils/utilFunc";
import { TextInputField } from "pages/Edge/components/InputField";

const initialData = {
  name: "",
  safeCustodyPacketId: "",
  dateOfDocument: "",
  dateReceived: "",
  comments: "",
};

const AddCustodyForm = (props) => {
  const { closeForm, safeCustodyPacketId, setBoolVal, setFormStatusNew } =
    props;
  const [formData, setFormData] = useState(initialData);
  const [uploadedFile, setUploadedFile] = useState(undefined);
  const [fileName, setFileName] = useState("");
  const [isEnableButton, setIsEnableButton] = useState(true);
  const [confirmScreen, setConfirmScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const isChanged = JSON.stringify(initialData) !== JSON.stringify(formData);
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [initialData, formData]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    setFormData({ ...formData, [name]: e.target.value });
  };

  const handleUploadFile = (acceptedFile) => {
    setLoading(true);
    if (acceptedFile?.length) {
      setUploadedFile(acceptedFile[0]);
      setFileName(acceptedFile[0].name);
      setFormData({
        ...formData,
        name: acceptedFile[0].name,
        dateReceived: formatDateFunc(new Date()),
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let inputData = new FormData();
    if (uploadedFile) {
      const data = {
        requestId: uuidv1(),
        data: {
          ...formData,
          safeCustodyPacketId,
        },
      };
      inputData.append("custodyAttachment", JSON.stringify(data));
      inputData.append("attachment", uploadedFile);
      try {
        setLoading(true);
        setIsEnableButton(false);
        const { data } = await uploadCustodyAttachment(inputData);
        setLoading(false);
        setBoolVal(false);
        setIsEnableButton(true);
        setLoading(false);
        if (!data.success) {
          return toast.error("Failed to upload file");
        }
        toast.success("File uploaded successfully");
        closeForm(true);
      } catch (err) {
        console.error(err);
        setIsEnableButton(true);
        setLoading(false);
        toast.error("Failed to upload file");
      }
    } else {
      setSubmitted(true);
    }
  };

  const handleCheck = () => {
    if (uploadedFile) {
      setConfirmScreen(true);
    } else {
      closeForm();
    }
  };

  return (
    <div className="">
      <div className="">
        <div
          className="addCustody-dropzone-div"
          style={{ margin: "0 10px", marginBottom: "5px" }}
        >
          <Dropzone onDrop={handleUploadFile}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({ className: "addCustody-dropzone" })}>
                <input {...getInputProps()} />
                <p style={{ paddingTop: "10px" }}>
                  Drag and drop to upload or browse for files.
                </p>
                <span style={{ color: "#555", paddingTop: "10px" }}>
                  {fileName}
                </span>
              </div>
            )}
          </Dropzone>
        </div>
        {!uploadedFile && submitted && (
          <span className="input-error" style={{ margin: "10px" }}>
            Please select a file
          </span>
        )}

        <div className="row mt-3">
          <div className="col-md-6">
            <TextInputField
              label="Date Received"
              type="date"
              name="dateReceived"
              value={formData.dateReceived}
              onChange={handleFormChange}
            />
          </div>
          <div className="col-md-6">
            <TextInputField
              label="Date of document"
              type="date"
              name="dateOfDocument"
              value={formData.dateOfDocument}
              onChange={handleFormChange}
            />
          </div>
        </div>
        <div className="row mt-1">
          <TextInputField
            label="Document name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
          />
        </div>
        <div className="row mt-1">
          <TextInputField
            label="Comments"
            type="textarea"
            rows="3"
            cols="50"
            name="comments"
            value={formData.comments}
            onChange={handleFormChange}
          />
        </div>
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            className="mx-1"
            onClick={handleCheck}
            disabled={!isEnableButton}
            color="danger"
          >
            Cancel
          </Button>
          <Button
            className="mx-1"
            onClick={handleSubmit}
            disabled={!isEnableButton}
            color="success"
          >
            Add
          </Button>
        </div>
      </div>
      {confirmScreen && (
        <Modal
          isOpen={confirmScreen}
          toggle={() => setConfirmScreen(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setConfirmScreen(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <ConfirmationCustodyPopup
              closeForm={() => setConfirmScreen(false)}
              message={`You have not saved the selected file. Are you sure you want to cancel the upload?`}
              handleFunc={closeForm}
            />
          </ModalBody>
        </Modal>
      )}
      {loading && <LoadingPage />}
    </div>
  );
};

export default AddCustodyForm;
