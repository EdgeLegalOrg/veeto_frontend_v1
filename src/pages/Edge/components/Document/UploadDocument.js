import React, { useState } from "react";
import Dropzone from "react-dropzone";
import closeBtn from "../../images/close-white-btn.svg";
import { v1 as uuidv1 } from "uuid";
import { uploadDocumentAttach } from "../../apis";
import "../../stylesheets/DocumentPage.css";
import { ConfirmationCustodyPopup } from "../customComponents/CustomComponents";
import LoadingPage from "../../utils/LoadingPage";
import { toast } from "react-toastify";
import { Button, Col, Row, Modal, ModalHeader, ModalBody } from "reactstrap";
import { TextInputField } from "pages/Edge/components/InputField";

const initialData = {
  name: "",
  status: "DRAFT",
  description: "",
  comments: "",
};

const UploadDocument = (props) => {
  const [formData, setFormData] = useState(initialData);
  const [uploadedFile, setUploadedFile] = useState(undefined);
  const [fileName, setFileName] = useState("");
  const [isEnableButton, setIsEnableButton] = useState(true);
  const [confirmScreen, setConfirmScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { closeForm, refreshList } = props;

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
        data: formData,
      };
      inputData.append("documentJson", JSON.stringify(data));
      inputData.append("documentFile", uploadedFile);
      try {
        setLoading(true);
        setIsEnableButton(false);
        const resp = await uploadDocumentAttach(inputData);
        setIsEnableButton(true);
        setLoading(false);
        refreshList();
        closeForm();
        // window.location.reload();
      } catch (err) {
        console.error(err);
        setIsEnableButton(true);
        setLoading(false);
      }
    } else {
      setSubmitted(true);
      // toast.warning(
      //   "Please select a file to be uploaded using the Browse File button or Drag and Drop the a file on this form."
      // );
    }
  };

  const handleClose = () => {
    if (uploadedFile) {
      setConfirmScreen(true);
    } else {
      closeForm();
    }
  };

  return (
    <div className="">
      <div className="">
        {/* <div className="uploadDoc-header">
          <h2 className="uploadDoc-heading">Upload Document</h2>
          <button onClick={handleClose} className="close-form-btn">
            {" "}
            <img src={closeBtn} alt="close-btn" />
          </button>
        </div> */}
        <div
          className="uploadDoc-dropzone-div"
          style={{ margin: "0 10px", marginBottom: "5px" }}
        >
          <Dropzone onDrop={handleUploadFile}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({ className: "uploadDoc-dropzone" })}>
                <input {...getInputProps()} />
                <p className="mb-0">
                  Drag and drop to upload or browse for files
                </p>
                <p className="mb-0" style={{ color: "#555" }}>
                  {fileName}
                </p>
              </div>
            )}
          </Dropzone>
        </div>
        {!uploadedFile && submitted && (
          <span className="input-error" style={{ margin: "10px" }}>
            Please select a file
          </span>
        )}
        <Row className="mt-2">
          <Col className="uploadDoc-nameDiv">
            <TextInputField
              label="Status"
              type="select"
              value={formData.status}
              onChange={handleFormChange}
              optionArray={[{ value: "DRAFT", label: "Draft" }]}
            ></TextInputField>
          </Col>
          <Col className="uploadDoc-filename-div">
            <TextInputField
              label="Document name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Document name"
            />
          </Col>
        </Row>
        <Row>
          <Col className="uploadDoc-comment-div">
            <TextInputField
              label="Description"
              type="textarea"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Description"
            />
          </Col>
        </Row>
        <Row>
          <Col className="uploadDoc-comment-div">
            <TextInputField
              label="Comments"
              type="textarea"
              name="comments"
              value={formData.comments}
              onChange={handleFormChange}
            />
          </Col>
        </Row>
        <div className="d-flex align-items-center justify-content-end p-2 border-top mt-2">
          <Button
            color="danger"
            onClick={handleClose}
            disabled={!isEnableButton}
            className="mx-1"
          >
            Cancel
          </Button>
          <Button
            color="success"
            disabled={!isEnableButton}
            onClick={handleSubmit}
            className="mx-1"
          >
            Upload
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

export default UploadDocument;
