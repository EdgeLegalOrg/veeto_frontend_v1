import React, { useState, useEffect, useRef } from "react";
import Dropzone from "react-dropzone";
import closeBtn from "../../images/close-white-btn.svg";
import { v1 as uuidv1 } from "uuid";
import "../../stylesheets/AddCustodyForm.css";
import { uploadCustodyAttachment } from "../../apis";
import { useSelector } from "react-redux";
import { selectStorageType } from "slices/storage/reducer";
import { getUploadModeFromStorage } from "pages/Edge/utils/storageConfig";
import { ConfirmationCustodyPopup } from "../customComponents/CustomComponents";
import LoadingPage from "../../utils/LoadingPage";
import { toast } from "react-toastify";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { formatDateFunc } from "../../utils/utilFunc";
import { TextInputField } from "pages/Edge/components/InputField";
import {
  DeviceUploadIcon,
  GoogleDriveColorIcon,
  OneDriveIcon,
} from "../UploadIcons";

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
  const globalStorageType = useSelector(selectStorageType);
  const [uploadSource, setUploadSource] = useState(
    getUploadModeFromStorage(globalStorageType)
  );
  const googleDriveInputRef = useRef(null);
  const oneDriveInputRef = useRef(null);

  useEffect(() => {
    setUploadSource(getUploadModeFromStorage(globalStorageType));
  }, [globalStorageType]);

  useEffect(() => {
    const isChanged = JSON.stringify(initialData) !== JSON.stringify(formData);
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [initialData, formData]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    setFormData({ ...formData, [name]: e.target.value });
  };

  const handleCloudFileSelect = (e, storageTypeValue) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const file = files[0];
    setUploadedFile(file);
    const flname = file.name.split(".").slice(0, -1).join(".");
    setFileName(flname);
    setFormData({
      ...formData,
      name: flname,
      dateReceived: formatDateFunc(new Date()),
    });
    e.target.value = "";
  };

  const handleUploadFile = (acceptedFile) => {
    if (acceptedFile?.length) {
      setUploadedFile(acceptedFile[0]);
      const flname = acceptedFile[0].name.split(".").slice(0, -1).join(".");
      setFileName(flname);
      setFormData({
        ...formData,
        name: flname,
        dateReceived: formatDateFunc(new Date()),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let inputData = new FormData();
    if (uploadedFile) {
      const storageTypeValue =
        uploadSource === "google"
          ? "GOOGLE_DRIVE"
          : uploadSource === "onedrive"
            ? "ONEDRIVE"
            : null;

      const data = {
        requestId: uuidv1(),
        data: {
          ...formData,
          safeCustodyPacketId,
          ...(storageTypeValue ? { storageType: storageTypeValue } : {}),
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
          style={{
            display: "flex",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            overflow: "hidden",
            marginBottom: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => setUploadSource("device")}
            disabled={getUploadModeFromStorage(globalStorageType) !== "device"}
            style={{
              flex: 1,
              padding: "12px 8px",
              border: "none",
              borderRight: "1px solid #dee2e6",
              background: uploadSource === "device" ? "#eef2ff" : "white",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: uploadSource === "device" ? "#4f46e5" : "#374151",
              fontWeight: uploadSource === "device" ? "600" : "400",
            }}
          >
            <DeviceUploadIcon />
            Device
          </button>
          <button
            type="button"
            onClick={() => setUploadSource("google")}
            disabled={getUploadModeFromStorage(globalStorageType) !== "google"}
            style={{
              flex: 1,
              padding: "12px 8px",
              border: "none",
              borderRight: "1px solid #dee2e6",
              background: uploadSource === "google" ? "#f0fdf4" : "white",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: uploadSource === "google" ? "#16a34a" : "#374151",
              fontWeight: uploadSource === "google" ? "600" : "400",
            }}
          >
            <GoogleDriveColorIcon size={20} />
            Google Drive
          </button>
          <button
            type="button"
            onClick={() => setUploadSource("onedrive")}
            disabled={getUploadModeFromStorage(globalStorageType) !== "onedrive"}
            style={{
              flex: 1,
              padding: "12px 8px",
              border: "none",
              background: uploadSource === "onedrive" ? "#eff6ff" : "white",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: uploadSource === "onedrive" ? "#0369a1" : "#374151",
              fontWeight: uploadSource === "onedrive" ? "600" : "400",
            }}
          >
            <OneDriveIcon />
            OneDrive
          </button>
        </div>

        <input
          ref={googleDriveInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={(e) => handleCloudFileSelect(e, "GOOGLE_DRIVE")}
        />
        <input
          ref={oneDriveInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={(e) => handleCloudFileSelect(e, "ONEDRIVE")}
        />

        {uploadSource === "device" ? (
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
        ) : (
          <div
            onClick={() =>
              uploadSource === "google"
                ? googleDriveInputRef.current?.click()
                : oneDriveInputRef.current?.click()
            }
            style={{
              border: "2px dashed #dee2e6",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              cursor: "pointer",
              background: "#f9fafb",
              margin: "0 10px 5px",
              minHeight: "100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {uploadSource === "google" ? (
              <GoogleDriveColorIcon size={32} />
            ) : (
              <OneDriveIcon />
            )}
            <p style={{ margin: 0, color: "#374151", fontSize: "14px", fontWeight: "500" }}>
              {uploadSource === "google"
                ? "Click here to upload to Google Drive"
                : "Click here to upload to OneDrive"}
            </p>
            {fileName && (
              <span style={{ color: "#555", fontSize: "12px" }}>
                {fileName}
              </span>
            )}
          </div>
        )}
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
