import React, { useState } from "react";
import { Button } from "reactstrap";
import closeBtn from "../../images/close-white-btn.svg";
// import url from '../../config.js';
// import axios from 'axios';
// import { useCookies } from 'react-cookie';
import Dropzone from "react-dropzone";
import "../../stylesheets/AddNewSafeCustodyForm.css";
import { uploadContactAttachment } from "../../apis";
import { v1 as uuidv1 } from "uuid";
import { toast } from "react-toastify";
import { TextInputField } from "../InputField";

const initialData = {
  name: "",
  contactId: "",
  contactType: "",
};

const AttachIDForm = (props) => {
  const { closeForm, details, handleContactAttachments } = props;
  // const [cookies, setCookie, removeCookie] = useCookies(['token']);
  // const loggedInToken = cookies.token;
  const [formData, setFormData] = useState(initialData);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleUploadFile = (acceptedFile) => {
    setUploadedFile(acceptedFile[0]);
    setFileName(acceptedFile[0].name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let inputData = new FormData();
    if (uploadedFile && fileName) {
      const newData = {
        requestId: uuidv1(),
        data: {
          ...formData,
          name: fileName,
          contactId: details.contactId,
          contactType: details.contactType,
        },
      };
      inputData.append("contactAttachment", JSON.stringify(newData));
      inputData.append("attachment", uploadedFile);
      try {
        const { data } = await uploadContactAttachment(inputData);
        handleContactAttachments();
        closeForm();
      } catch (err) {
        console.error(err);
      }
    } else {
      setSubmitted(true);
      // toast.warning("Please upload file");
    }
  };

  console.error("uploaded", uploadedFile);

  return (
    <div className="">
      <div className="">
        {/* <div
          className="addNewCustody-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
          }}
        >
          <h2
            className="confirmation-heading mb-0"
            style={{ color: "#fff" }}
          >
            Confirm Your Action
          </h2>
          <button
            onClick={closeForm}
            className="close-form-btn"
          >
            {" "}
            <img
              src={closeBtn}
              alt="close-btn"
            />
          </button>
        </div> */}
        <div className="addCustody-dropzone-div m-3">
          <Dropzone onDrop={handleUploadFile}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({ className: "addCustody-dropzone" })}>
                <input {...getInputProps()} />
                <p style={{ paddingTop: "10px" }}>
                  Drag and drop to upload or browse for files
                </p>
                <span style={{ color: "#555", paddingTop: "10px" }}>
                  {uploadedFile?.name || ""}
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
        {uploadedFile && (
          <div className="px-3 mt-3">
            <TextInputField
              name="fileName"
              label="File name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required={true}
            />
          </div>
        )}
        {uploadedFile && !fileName && submitted && (
          <span className="input-error" style={{ margin: "10px" }}>
            Please enter filename
          </span>
        )}
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button color="danger" className="mx-1" onClick={closeForm}>
            Cancel
          </Button>
          <Button color="success" className="mx-1" onClick={handleSubmit}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttachIDForm;
