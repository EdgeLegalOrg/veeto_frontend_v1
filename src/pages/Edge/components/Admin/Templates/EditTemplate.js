import React, { useState, useEffect, useRef } from "react";
import Dropzone from "react-dropzone";
import closeBtn from "../../../images/close-white-btn.svg";
import { v1 as uuidv1 } from "uuid";
import { editTemplate } from "../../../apis";
import "../../../stylesheets/DocumentPage.css";
import { ConfirmationCustodyPopup } from "../../customComponents/CustomComponents";
import LoadingPage from "../../../utils/LoadingPage";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import {
  TextInputField,
  CustomDropDown,
  SelectInputField,
} from "pages/Edge/components/InputField";

import { OneDriveIcon, DeviceUploadIcon, GoogleDriveColorIcon } from "../../UploadIcons";

const initialData = {
  name: "",
  type: "",
  documentType: "",
};

const EditTemplate = (props) => {
  const { closeForm, refreshList, file, matterList, docList } = props;
  const [formData, setFormData] = useState(file);
  const [uploadedFile, setUploadedFile] = useState(undefined);
  const [isEnableButton, setIsEnableButton] = useState(true);
  const [confirmScreen, setConfirmScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadSource, setUploadSource] = useState("device");
  const googleDriveInputRef = useRef(null);

  useEffect(() => {
    setFormData(props.file);
  }, [props.file]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    setFormData({ ...formData, [name]: e.target.value });
  };

  const handleSelectOption = (name, val) => {
    setFormData({ ...formData, [name]: val.value });
  };

  const handleUploadFile = (acceptedFile) => {
    setUploadedFile(acceptedFile[0]);
  };

  const handleGoogleDriveFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setFormData({ ...formData, storageType: "GOOGLE_DRIVE" });
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    var inputData = new FormData();
    const data = {
      requestId: uuidv1(),
      data: formData,
    };
    inputData.append("templateJSON", JSON.stringify(data));
    inputData.append("templateFile", uploadedFile);
    try {
      setLoading(true);
      setIsEnableButton(false);
      const { data } = await editTemplate(inputData);
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
  };

  const handleClose = () => {
    if (uploadedFile) {
      setConfirmScreen(true);
    } else {
      closeForm();
    }
  };

  const findDisplayname = (from, val) => {
    if (val) {
      let data = from.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  return (
    <div className="">
      <div className="mb-4">
        {/* <div className="tempForm-header">
          <h2 className="tempForm-heading">Update Precedent</h2>
          <button
            onClick={handleClose}
            className="close-form-btn"
          >
            {" "}
            <img
              src={closeBtn}
              alt="close-btn"
            />
          </button>
        </div> */}
        <input
          ref={googleDriveInputRef}
          type="file"
          accept=".doc,.docx"
          style={{ display: "none" }}
          onChange={handleGoogleDriveFileSelect}
        />
        <div style={{ display: "flex", border: "1px solid #dee2e6", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
          <button
            type="button"
            onClick={() => setUploadSource("device")}
            style={{ flex: 1, padding: "12px 8px", border: "none", borderRight: "1px solid #dee2e6", background: uploadSource === "device" ? "#eef2ff" : "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "12px", color: uploadSource === "device" ? "#4f46e5" : "#374151", fontWeight: uploadSource === "device" ? "600" : "400" }}
          >
            <DeviceUploadIcon />
            Device
          </button>
          <button
            type="button"
            onClick={() => setUploadSource("google")}
            style={{ flex: 1, padding: "12px 8px", border: "none", borderRight: "1px solid #dee2e6", background: uploadSource === "google" ? "#f0fdf4" : "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "12px", color: "#374151", fontWeight: uploadSource === "google" ? "600" : "400" }}
          >
            <GoogleDriveColorIcon size={20} />
            Google Drive
          </button>
          <button
            type="button"
            disabled
            title="OneDrive integration coming soon"
            style={{ flex: 1, padding: "12px 8px", border: "none", background: "#f8f9fa", cursor: "not-allowed", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "12px", opacity: 0.5 }}
          >
            <OneDriveIcon />
            OneDrive
          </button>
        </div>
        {uploadSource === "device" && (
          <div className="tempForm-dropzone-div">
            <Dropzone accept=".doc, .docx" onDrop={handleUploadFile}>
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps({ className: "tempForm-dropzone" })}>
                  <input {...getInputProps()} />
                  <p style={{ paddingTop: "10px" }}>
                    Drag and drop to upload or browse for files
                  </p>
                  <span style={{ color: "#555", paddingTop: "10px" }}>
                    {uploadedFile?.name}
                  </span>
                </div>
              )}
            </Dropzone>
          </div>
        )}
        {uploadSource === "google" && (
          <div
            onClick={() => googleDriveInputRef.current.click()}
            style={{ border: "2px dashed #dee2e6", borderRadius: "8px", padding: "24px", textAlign: "center", cursor: "pointer", background: "#f9fafb", marginBottom: "8px", minHeight: "100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <GoogleDriveColorIcon size={32} />
            <p style={{ margin: 0, color: "#374151", fontSize: "14px", fontWeight: "500" }}>
              Click here to upload to Google Drive
            </p>
            {uploadedFile?.name && (
              <span style={{ color: "#555", fontSize: "12px" }}>{uploadedFile.name}</span>
            )}
          </div>
        )}
        <div className="form-group tempForm-gridContent my-3">
          <div className="row px-3">
            <div className="col-md-4">
              <TextInputField
                label="Name"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </div>
            <div className="col-md-4 position-relative">
              <SelectInputField
                label="Document Type"
                name="documentType"
                optionStyles={{ maxHeight: "365px", minWidth: "200px" }}
                value={formData.documentType}
                optionArray={docList}
                onSelectFunc={(val) => handleSelectOption("documentType", val)}
                selected={formData.documentType}
                fieldVal={findDisplayname(docList, formData.documentType)}
                maxLength={null}
              />
            </div>
            <div className="col-md-4 position-relative">
              <SelectInputField
                label="Matter Sub-type"
                name="type"
                optionStyles={{ maxHeight: "365px", maxWidth: "85%" }}
                value={formData.type}
                optionArray={matterList}
                onSelectFunc={(val) => handleSelectOption("type", val)}
                selected={formData.type}
                fieldVal={findDisplayname(matterList, formData.type)}
                maxLength={null}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button className="mx-1" color="danger" onClick={handleClose}>
          Cancel
        </Button>
        <Button className="mx-1" color="success" onClick={handleSubmit}>
          Save
        </Button>
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

export default EditTemplate;
