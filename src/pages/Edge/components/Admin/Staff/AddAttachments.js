import React, { useEffect, useRef, useState } from "react";
import { v1 as uuidv1 } from "uuid";
import Dropzone from "react-dropzone";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { useSelector } from "react-redux";
import { TextInputField } from "pages/Edge/components/InputField";
import { selectStorageType } from "slices/storage/reducer";
import { getUploadModeFromStorage } from "pages/Edge/utils/storageConfig";
import {
  DeviceUploadIcon,
  GoogleDriveColorIcon,
  OneDriveIcon,
} from "../../UploadIcons";

const AddAttachments = (props) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState("");
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

  const handleClose = () => {
    if (props.close) {
      props.close();
    }
  };

  const handleCloudFileSelect = (e, storageTypeValue) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const file = files[0];
    setUploadedFile(file);
    const flname = file.name.split(".").slice(0, -1).join(".");
    setFileName(flname);
    e.target.value = "";
  };

  const handleAdd = () => {
    if (!uploadedFile) {
      setSubmitted(true);
      return;
    }

    if (!fileName.trim()) {
      toast.warning("Give file some name.");
      return;
    }

    const inputData = new FormData();
    const storageTypeValue =
      uploadSource === "google"
        ? "GOOGLE_DRIVE"
        : uploadSource === "onedrive"
          ? "ONEDRIVE"
          : null;

    const newData = {
      requestId: uuidv1(),
      data: {
        name: fileName.trim(),
        staffId: props.staffId,
        ...(storageTypeValue ? { storageType: storageTypeValue } : {}),
      },
    };

    inputData.append("staffAttachment", JSON.stringify(newData));
    inputData.append("attachment", uploadedFile);

    if (props.add) {
      props.add(inputData);
    }
  };

  const handleUploadFile = (acceptedFile) => {
    const file = acceptedFile?.[0];
    if (!file) return;

    setUploadedFile(file);
    const flname = file.name.split(".").slice(0, -1).join(".");
    setFileName(flname);
  };

  return (
    <>
      <div className="">
        <div
          style={{
            display: "flex",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            overflow: "hidden",
            margin: "0 1.5rem 1rem",
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
          <div className="staff-attachDrop">
            <Dropzone onDrop={handleUploadFile}>
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps({ className: "staff-dropzone" })}>
                  <input {...getInputProps()} />
                  <p style={{ paddingTop: "10px", marginBottom: "8px" }}>
                    Drag and drop to upload or browse for files
                  </p>
                  <div style={{ color: "#555" }}>
                    {uploadedFile ? uploadedFile.name : "No file selected"}
                  </div>
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
              margin: "0 1.5rem 1rem",
              minHeight: "120px",
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
            <span style={{ color: "#555", fontSize: "12px" }}>
              {uploadedFile ? uploadedFile.name : "No file selected"}
            </span>
          </div>
        )}

        {submitted && !uploadedFile && (
          <p className="mx-4 input-error">Please upload file</p>
        )}
        <div className="mx-4">
          <TextInputField
            label="File name"
            name="fileName"
            placeholder="File name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            required={true}
            invalid={submitted && !fileName ? true : false}
            invalidMessage={"File name is required"}
          />
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button className="mx-1" color="danger" onClick={() => handleClose()}>
          Cancel
        </Button>
        <Button className="mx-1" color="success" onClick={() => handleAdd()}>
          Add
        </Button>
      </div>
    </>
  );
};

export default AddAttachments;
