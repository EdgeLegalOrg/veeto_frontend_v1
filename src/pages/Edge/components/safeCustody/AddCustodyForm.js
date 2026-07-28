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
  const [uploadedFiles, setUploadedFiles] = useState([]);
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

    setUploadedFiles((prev) => [...prev, ...files]);
    const fileNames = files.map((file) => file.name).join(", ");
    setFileName(fileNames);
    setFormData((prevForm) => ({
      ...prevForm,
      dateReceived: formatDateFunc(new Date()),
    }));
    e.target.value = "";
  };

  const handleUploadFile = (acceptedFile) => {
    if (acceptedFile?.length) {
      setUploadedFiles((prev) => [...prev, ...acceptedFile]);
      const fileNames = acceptedFile.map((file) => file.name).join(", ");
      setFileName(fileNames);
      setFormData((prevForm) => ({
        ...prevForm,
        dateReceived: formatDateFunc(new Date()),
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCloudDrop = (e, storageTypeValue) => {
    handleDragOver(e);
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;

    setUploadedFiles((prev) => [...prev, ...files]);
    const fileNames = files.map((file) => file.name).join(", ");
    setFileName(fileNames);
    setFormData((prevForm) => ({
      ...prevForm,
      dateReceived: formatDateFunc(new Date()),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFiles.length) {
      setSubmitted(true);
      return;
    }

    const storageTypeValue =
      uploadSource === "google"
        ? "GOOGLE_DRIVE"
        : uploadSource === "onedrive"
          ? "ONEDRIVE"
          : null;

    setLoading(true);
    setIsEnableButton(false);

    const uploadPromises = uploadedFiles.map((file) => {
      const inputData = new FormData();
      const data = {
        requestId: uuidv1(),
        data: {
          ...formData,
          safeCustodyPacketId,
          ...(storageTypeValue ? { storageType: storageTypeValue } : {}),
        },
      };
      inputData.append("custodyAttachment", JSON.stringify(data));
      inputData.append("attachment", file);
      return uploadCustodyAttachment(inputData)
        .then(({ data }) => ({
          fileName: file.name,
          success: data.success,
        }))
        .catch(() => ({
          fileName: file.name,
          success: false,
        }));
    });

    const results = await Promise.all(uploadPromises);
    const succeeded = results.filter((r) => r.success).map((r) => r.fileName);
    const failed = results.filter((r) => !r.success).map((r) => r.fileName);

    setLoading(false);
    setIsEnableButton(true);

    if (succeeded.length) {
      toast.success(`${succeeded.length} file(s) uploaded successfully`);
    }
    if (failed.length) {
      toast.error(
        `Failed to upload:\n${failed.map((f) => `• ${f}`).join("\n")}`,
        { autoClose: false },
      );
      setUploadedFiles((prev) => prev.filter((file) => failed.includes(file.name)));
      setFileName(failed.join(", "));
      return;
    }

    setUploadedFiles([]);
    setFileName("");
    setBoolVal(false);
    toast.success("All files uploaded successfully");
    closeForm(true);
  };

  const handleCheck = () => {
    if (uploadedFiles.length) {
      setConfirmScreen(true);
    } else {
      closeForm();
    }
  };

  return (
    <div className="">
      <div className="">

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

        {uploadSource === "device" ? (
          <div
            className="addCustody-dropzone-div"
            style={{ margin: "0 10px", marginBottom: "5px" }}
          >
            <Dropzone onDrop={handleUploadFile} multiple>
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps({ className: "addCustody-dropzone" })}>
                  <input {...getInputProps()} />
                  <p style={{ paddingTop: "10px" }}>
                    Drag and drop to upload or browse for files.
                  </p>
                  <span style={{ color: "#555", paddingTop: "10px" }}>
                    {fileName || "No files selected"}
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
            onDrop={(e) =>
              handleCloudDrop(
                e,
                uploadSource === "google" ? "GOOGLE_DRIVE" : "ONEDRIVE",
              )
            }
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
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
        {!uploadedFiles.length && submitted && (
          <span className="input-error" style={{ margin: "10px" }}>
            Please select at least one file
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
