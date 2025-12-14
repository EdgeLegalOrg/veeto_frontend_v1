import React, { useState, useEffect } from "react";
import Dropzone from "react-dropzone";
import { v1 as uuidv1 } from "uuid";
import "../../stylesheets/AddCustodyForm.css";
import { editContentAttachment } from "../../apis";
import { Button } from "reactstrap";
import { TextInputField } from "pages/Edge/components/InputField";

const EditContentAttachment = (props) => {
  const {
    closeForm,
    safeCustodyPacketId,
    contentToEdit,
    fetchCustodyDetails,
    setFormStatusNew,
  } = props;
  const [formData, setFormData] = useState(contentToEdit);
  const [uploadedFile, setUploadedFile] = useState(contentToEdit?.path ?? "");
  const [fileName, setFileName] = useState(contentToEdit?.name ?? "");
  const [isEnableButton, setIsEnableButton] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const isChanged =
      JSON.stringify(contentToEdit) !== JSON.stringify(formData);
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [contentToEdit, formData]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    setFormData({ ...formData, [name]: e.target.value });
  };

  const handleUploadFile = (acceptedFile) => {
    setUploadedFile(acceptedFile[0]);
    setFileName(acceptedFile[0].name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      return setSubmitted(true);
    }
    let inputData = new FormData();
    const contentDetails = {
      requestId: uuidv1(),
      data: {
        ...formData,
        id: contentToEdit.id,
        safeCustodyPacketId,
      },
    };
    inputData.append("attachment", uploadedFile);
    inputData.append("custodyAttachment", JSON.stringify(contentDetails));

    setIsEnableButton(false);
    editContentAttachment(inputData)
      .then(() => {
        fetchCustodyDetails();
        setIsEnableButton(true);
        closeForm(true);
      })
      .catch((err) => {
        console.error(err);
        setIsEnableButton(true);
      });
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
                  Drag and drop to upload or browse for files
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
            rows="4"
            cols="50"
            name="comments"
            value={formData.comments}
            onChange={handleFormChange}
          />
        </div>
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            className="mx-1"
            onClick={closeForm}
            disabled={!isEnableButton}
            color="danger"
          >
            Cancel
          </Button>
          <Button
            className="mx-1"
            disabled={!isEnableButton}
            onClick={handleSubmit}
            color="success"
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditContentAttachment;
