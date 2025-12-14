import React, { useState } from "react";
import closeBtn from "../../../images/close-white-btn.svg";
import Dropzone from "react-dropzone";
import "../../../stylesheets/AddNewSafeCustodyForm.css";
import { uploadContactAttachment } from "../../../apis";
import { v1 as uuidv1 } from "uuid";
import { toast } from "react-toastify";

const AddAttachment = (props) => {
  const { closeForm, details } = props;
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleUploadFile = (acceptedFile) => {
    setUploadedFile(acceptedFile[0]);
    setFileName(acceptedFile[0].name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    var inputData = new FormData();
    if (uploadedFile) {
      const newData = {
        requestId: uuidv1(),
        data: {
          name: fileName,
          contactId: details.contactId ? details.contactId : "",
          contactType: details.contactType ? details.contactType : "",
        },
      };
      inputData.append("contactAttachment", JSON.stringify(newData));
      inputData.append("attachment", uploadedFile);
      try {
        const { data } = await uploadContactAttachment(inputData);
        if (!data.success) {
          toast.warning("Something went wrong, please try later.");
        }
        closeForm();
      } catch (err) {
        toast.warning("Something went wrong, please try again later.");
        console.error(err);
      }
    } else {
      toast.warning("Please upload file");
    }
  };

  return (
    <div className="addNewCustody-popup-container">
      <div className="addNewCustody-popup-grid">
        <div className="addNewCustody-header">
          <h2 className="addNewCustody-heading">Attach ID</h2>
          <button onClick={closeForm} className="close-form-btn">
            {" "}
            <img src={closeBtn} alt="close-btn" />
          </button>
        </div>
        <div
          className="addCustody-dropzone-div"
          style={{ textAlign: "center" }}
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
        <div className="addNewCustody-buttonDiv">
          <button className="cancelButton" onClick={closeForm}>
            Cancel
          </button>
          <button className="addButton" onClick={handleSubmit}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAttachment;
