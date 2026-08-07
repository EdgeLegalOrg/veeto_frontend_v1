import React, { useState, useRef, useEffect } from "react";
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
import { useSelector } from "react-redux";
import { selectStorageType } from "slices/storage/reducer";
import { getUploadModeFromStorage } from "pages/Edge/utils/storageConfig";
import { OneDriveIcon, GoogleDriveColorIcon } from "../UploadIcons";
import LoadingPage from "../../utils/LoadingPage";

const initialData = {
  name: "",
  contactId: "",
  contactType: "",
  storageType: null, // "GOOGLE_DRIVE" | "ONEDRIVE" | null (local device)
};

const AttachIDForm = (props) => {
  const { closeForm, details, handleContactAttachments } = props;
  // const [cookies, setCookie, removeCookie] = useCookies(['token']);
  // const loggedInToken = cookies.token;
  const [formData, setFormData] = useState(initialData);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const globalStorageType = useSelector(selectStorageType);
  const [uploadSource, setUploadSource] = useState(
    getUploadModeFromStorage(globalStorageType),
  );
  const googleDriveInputRef = useRef(null);
  const oneDriveInputRef = useRef(null);

  useEffect(() => {
    setUploadSource(getUploadModeFromStorage(globalStorageType));
  }, [globalStorageType]);

  const handleUploadFile = (acceptedFiles) => {
    const files = Array.from(acceptedFiles || []);
    console.debug("AttachIDForm.handleUploadFile: received files", files.map(f=>f.name), "count", files.length);
    if (!files.length) return;
    setUploadedFiles((prev) => [...prev, ...files]);
    setFileNames((prev) => [
      ...prev,
      ...files.map((f) => f.name.split(".").slice(0, -1).join(".") || f.name),
    ]);
    setFormData((prev) => ({ ...prev, storageType: null }));
  };

  const handleCloudFileSelect = (e, storageType) => {
    const files = Array.from(e.target.files || []);
    console.debug("AttachIDForm.handleCloudFileSelect:", files.map(f=>f.name), "count", files.length, "storage", storageType);
    if (!files.length) return;
    setUploadedFiles((prev) => [...prev, ...files]);
    setFileNames((prev) => [
      ...prev,
      ...files.map((f) => f.name.split(".").slice(0, -1).join(".") || f.name),
    ]);
    setFormData((prev) => ({ ...prev, storageType }));
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCloudDrop = (e, storageType) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files || []);
    console.debug("AttachIDForm.handleCloudDrop:", files.map(f=>f.name), "count", files.length, "storage", storageType);
    if (!files.length) return;
    setUploadedFiles((prev) => [...prev, ...files]);
    setFileNames((prev) => [
      ...prev,
      ...files.map((f) => f.name.split(".").slice(0, -1).join(".") || f.name),
    ]);
    setFormData((prev) => ({ ...prev, storageType }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setLoading(true);
    const storageTypeValue = formData.storageType || null;

    const uploadPromises = uploadedFiles.map((file, i) => {
      const name = (fileNames[i] && fileNames[i].trim()) || file.name.split(".").slice(0, -1).join(".") || file.name;
      const newData = {
        requestId: uuidv1(),
        data: {
          ...formData,
          name,
          contactId: details.contactId,
          contactType: details.contactType,
          ...(storageTypeValue ? { storageType: storageTypeValue } : {}),
        },
      };
      const inputData = new FormData();
      inputData.append("contactAttachment", JSON.stringify(newData));
      inputData.append("attachment", file);

      return uploadContactAttachment(inputData)
        .then((res) => ({ success: res?.data?.success, file: file.name }))
        .catch(() => ({ success: false, file: file.name }));
    });

    const results = await Promise.all(uploadPromises);
    const succeeded = results.filter((r) => r.success).map((r) => r.file);
    const failed = results.filter((r) => !r.success).map((r) => r.file);

    if (succeeded.length > 0) {
      toast.success(`${succeeded.length} file(s) uploaded successfully`);
      try {
        if (handleContactAttachments) handleContactAttachments();
      } catch (e) {}
    }
    if (failed.length > 0) {
      toast.error(`Failed to upload:\n${failed.map((f) => `• ${f}`).join("\n")}`, { autoClose: false });
    }

    // close only when all succeeded
    if (failed.length === 0) {
      closeForm();
    }

    setLoading(false);
  };

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

        {/* Hidden inputs backing the Google Drive / OneDrive pickers below */}
        <input
          ref={googleDriveInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleCloudFileSelect(e, "GOOGLE_DRIVE")}
        />
        <input
          ref={oneDriveInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleCloudFileSelect(e, "ONEDRIVE")}
        />

        {uploadSource === "device" && (
          <div className="addCustody-dropzone-div m-3">
            <Dropzone onDrop={handleUploadFile} multiple>
              {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps({ className: "addCustody-dropzone" })}>
                    <input {...getInputProps({ multiple: true })} />
                  <p style={{ paddingTop: "10px" }}>
                    Drag and drop to upload or browse for files
                  </p>
                  <div style={{ color: "#555", paddingTop: "10px" }}>
                    {uploadedFiles.length > 1 ? (
                      <>
                        <span>{uploadedFiles[0].name}</span>
                        <span> +{uploadedFiles.length - 1} more</span>
                      </>
                    ) : (
                      uploadedFiles.map((f, idx) => <span key={idx}>{f.name}</span>)
                    )}
                  </div>
                </div>
              )}
            </Dropzone>
          </div>
        )}

        {uploadSource === "google" && (
          <div
            onClick={() => googleDriveInputRef.current.click()}
            onDrop={(e) => handleCloudDrop(e, "GOOGLE_DRIVE")}
            onDragOver={handleDragOver}
            className="m-3"
            style={{
              border: "2px dashed #dee2e6",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              cursor: "pointer",
              background: "#f9fafb",
              minHeight: "100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <GoogleDriveColorIcon size={32} />
            <p
              style={{
                margin: 0,
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Click here to upload to Google Drive
            </p>
            {uploadedFiles.length > 0 && (
              <span style={{ color: "#555", fontSize: "12px" }}>
                {uploadedFiles[0].name}
              </span>
            )}
          </div>
        )}

        {uploadSource === "onedrive" && (
          <div
            onClick={() => oneDriveInputRef.current.click()}
            onDrop={(e) => handleCloudDrop(e, "ONEDRIVE")}
            onDragOver={handleDragOver}
            className="m-3"
            style={{
              border: "2px dashed #dee2e6",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              cursor: "pointer",
              background: "#f9fafb",
              minHeight: "100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <OneDriveIcon />
            <p
              style={{
                margin: 0,
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Click here to upload to OneDrive
            </p>
            {uploadedFiles.length > 0 && (
              <span style={{ color: "#555", fontSize: "12px" }}>
                {uploadedFiles[0].name}
              </span>
            )}
          </div>
        )}

        {!uploadedFiles.length && submitted && (
          <span className="input-error" style={{ margin: "10px" }}>
            Please select a file
          </span>
        )}
        {uploadedFiles.length > 0 && (
          <div className="px-3 mt-3">
            {uploadedFiles.map((f, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <TextInputField
                  name={`fileName-${i}`}
                  label={`File name ${i + 1}`}
                  value={fileNames[i] || ""}
                  onChange={(e) => {
                    const next = [...fileNames];
                    next[i] = e.target.value;
                    setFileNames(next);
                  }}
                  required={true}
                />
                {formData.storageType && (
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      marginTop: "6px",
                      background:
                        formData.storageType === "GOOGLE_DRIVE"
                          ? "#f0fdf4"
                          : "#eff6ff",
                      color:
                        formData.storageType === "GOOGLE_DRIVE"
                          ? "#16a34a"
                          : "#0369a1",
                      marginLeft: 8,
                    }}
                  >
                    {formData.storageType === "GOOGLE_DRIVE" ? "GDrive" : "OneDrive"}
                  </span>
                )}
              </div>
            ))}
            {fileNames.some((n) => !n) && submitted && (
              <span className="input-error" style={{ margin: "10px" }}>
                Please enter filename for all files
              </span>
            )}
          </div>
        )}
        {uploadedFiles.length > 0 && fileNames.some((n) => !n) && submitted && (
          <span className="input-error" style={{ margin: "10px" }}>
            Please enter filename
          </span>
        )}
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button color="danger" className="mx-1" onClick={closeForm}>
            Cancel
          </Button>
          <Button
            color="success"
            className="mx-1"
            onClick={handleSubmit}
            disabled={loading}
          >
            Add
          </Button>
        </div>
      </div>
      {loading && <LoadingPage />}
    </div>
  );
};

export default AttachIDForm;