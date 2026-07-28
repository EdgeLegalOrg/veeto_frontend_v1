import React, { Fragment, useState, useEffect, useRef } from "react";
import { Button } from "reactstrap";
import { v1 as uuidv1 } from "uuid";
import Dropzone from "react-dropzone";
import { editMatterAttach, uploadMatterAttach } from "../../../apis"; // ← remove uploadGoogleDriveFile
import LoadingPage from "../../../utils/LoadingPage";
import { toast } from "react-toastify";
import { TextInputField } from "pages/Edge/components/InputField";
import {
  OneDriveIcon,
  DeviceUploadIcon,
  GoogleDriveColorIcon,
} from "../../UploadIcons";
import { useSelector } from "react-redux";
import { selectStorageType } from "slices/storage/reducer";
import { getUploadModeFromStorage } from "pages/Edge/utils/storageConfig";

const AddAttachment = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const globalStorageType = useSelector(selectStorageType);
  const [uploadSource, setUploadSource] = useState(
    getUploadModeFromStorage(globalStorageType),
  );
  const googleDriveInputRef = useRef(null);
  const oneDriveInputRef = useRef(null); // ← add this

  const isEditing = props.mode === "edit";

  useEffect(() => {
    if (props.mode === "edit") {
      setFormData([{ ...props.editState }]);
      setUploadedFiles([{ name: props.editState.name }]);
    }
  }, [props.editState]);

  useEffect(() => {
    setUploadSource(getUploadModeFromStorage(globalStorageType));
  }, [globalStorageType]);

  const handleClose = () => {
    if (props.closeForm) props.closeForm();
  };

  const handleCloudFileSelect = (e, storageType) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadedFiles((prev) => [...prev, ...files]);
    setFormData((prev) => [
      ...prev,
      ...files.map((file) => ({
        name: file.name.split(".").slice(0, -1).join("."),
        storageType,
      })),
    ]);

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
    if (!files.length) return;

    setUploadedFiles((prev) => [...prev, ...files]);
    setFormData((prev) => [
      ...prev,
      ...files.map((file) => ({
        name: file.name.split(".").slice(0, -1).join("."),
        storageType,
      })),
    ]);
  };

  const handleSubmit = async () => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      setSubmitted(true);
      return;
    }

    const hasEmptyName = formData.some((f) => !f?.name);
    if (hasEmptyName) {
      toast.warning("Filename is required!");
      return;
    }

    setLoading(true);

    const uploadPromises = uploadedFiles.map((file, i) => {
      const inputData = new FormData();
      const dataInput = {
        requestId: uuidv1(),
        data: {
          ...(isEditing
            ? { id: formData[i].id, name: formData[i].name }
            : { name: formData[i].name }),
          matterId: props.matterId,
          storageType: formData[i].storageType || null, // ← "GOOGLE_DRIVE", "ONEDRIVE", or null for local
        },
      };
      inputData.append("matterAttachment", JSON.stringify(dataInput));

      // Only append actual file for device uploads
      if (file.path) {
        inputData.append("attachment", file);
      } else {
        inputData.append("attachment", file); // cloud files also have the bytes
      }

      return (
        isEditing ? editMatterAttach(inputData) : uploadMatterAttach(inputData)
      )
        .then(({ data }) => ({
          fileName: file.name,
          success: data.success,
          index: i,
        }))
        .catch(() => ({
          fileName: file.name,
          success: false,
          index: i,
        }));
    });

    const results = await Promise.allSettled(uploadPromises);

    const failed = [];
    const succeeded = [];

    results.forEach((result) => {
      const { fileName, success } = result.value;
      if (success) succeeded.push(fileName);
      else failed.push(fileName);
    });

    if (succeeded.length > 0) {
      toast.success(`${succeeded.length} file(s) uploaded successfully`);
    }
    if (failed.length > 0) {
      toast.error(
        `Failed to upload:\n${failed.map((f) => `• ${f}`).join("\n")}`,
        { autoClose: false },
      );
    }

    setLoading(false);

    if (failed.length > 0) {
      const failedIndexes = results
        .map((r, i) => (!r.value.success ? i : null))
        .filter((i) => i !== null);
      setUploadedFiles(failedIndexes.map((i) => uploadedFiles[i]));
      setFormData(failedIndexes.map((i) => formData[i]));
    } else {
      setUploadedFiles([]);
      setFormData([]);
      props.refresh();
      setTimeout(() => {
        handleClose();
      }, 10);
    }
  };

  const handleUploadFile = (acceptedFile) => {
    setLoading(true);
    if (acceptedFile.length) {
      if (isEditing) {
        setUploadedFiles(acceptedFile);
      } else {
        setUploadedFiles((prev) => [...prev, ...acceptedFile]);
        setFormData((prev) => [
          ...prev,
          ...acceptedFile.map((file) => ({
            name: file.name.split(".").slice(0, -1).join("."),
            storageType: null, // ← local device, no storageType
          })),
        ]);
      }
    }
    setLoading(false);
  };

  const handleFormChange = (e, ind) => {
    const { name, value } = e.target;
    let data = [...formData];
    data[ind] = { ...formData[ind], [name]: value };
    setFormData(data);
  };

  return (
    <Fragment>
      <div>
        {/* Hidden file inputs */}
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

        {/* Device dropzone */}
        {(props.mode === "edit" || uploadSource === "device") && (
          <div
            className="staff-attachDrop"
            style={{ margin: "0 10px", marginBottom: "5px" }}
          >
            
            <Dropzone
              onDrop={handleUploadFile}
              multiple={props.mode !== "edit"}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps({ className: "staff-dropzone" })}>
                  <input {...getInputProps()} style={{ display: "none" }} />
                  <p style={{ paddingTop: "10px" }}>
                    Drag and drop to upload or browse for files
                  </p>
                  <div>
                    {uploadedFiles.length > 1 ? (
                      <>
                        <span style={{ color: "#555" }}>
                          {uploadedFiles[0].name}
                        </span>
                        <span style={{ color: "#555" }}>
                          {" "}
                          +{uploadedFiles.length - 1} more
                        </span>
                      </>
                    ) : (
                      uploadedFiles.map((file, i) => (
                        <span style={{ color: "#555" }} key={i}>
                          {file.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
            </Dropzone>
          </div>
        )}

        {/* Google Drive picker */}
        {props.mode !== "edit" && uploadSource === "google" && (
          <div
            onClick={() => googleDriveInputRef.current.click()}
            onDrop={(e) => handleCloudDrop(e, "GOOGLE_DRIVE")}
            onDragOver={handleDragOver}
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
                {uploadedFiles.length === 1
                  ? uploadedFiles[0].name
                  : `${uploadedFiles[0].name} +${uploadedFiles.length - 1} more`}
              </span>
            )}
          </div>
        )}

        {/* OneDrive picker */}
        {props.mode !== "edit" && uploadSource === "onedrive" && (
          <div
            onClick={() => oneDriveInputRef.current.click()}
            onDrop={(e) => handleCloudDrop(e, "ONEDRIVE")}
            onDragOver={handleDragOver}
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
                {uploadedFiles.length === 1
                  ? uploadedFiles[0].name
                  : `${uploadedFiles[0].name} +${uploadedFiles.length - 1} more`}
              </span>
            )}
          </div>
        )}

        {!uploadedFiles?.length && submitted && (
          <span className="input-error" style={{ margin: "10px" }}>
            Please select a file
          </span>
        )}

        <div className="staff-attachName">
          {formData.map((file, i) => (
            <div className="d-flex align-items-center" key={i}>
              <span className="mx-1">{`${i + 1}.`}</span>
              <TextInputField
                name="name"
                label="File name"
                value={file.name}
                onChange={(e) => handleFormChange(e, i)}
                required={true}
                invalid={submitted && !file.name}
                invalidMessage={"File name is required"}
              />
              {/* Show storage badge */}
              {file.storageType && (
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    marginLeft: "8px",
                    background:
                      file.storageType === "GOOGLE_DRIVE"
                        ? "#f0fdf4"
                        : "#eff6ff",
                    color:
                      file.storageType === "GOOGLE_DRIVE"
                        ? "#16a34a"
                        : "#0369a1",
                  }}
                >
                  {file.storageType === "GOOGLE_DRIVE" ? "GDrive" : "OneDrive"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="row mt-3">
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            type="button"
            color="light"
            onClick={handleClose}
            className="mx-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="success"
            onClick={handleSubmit}
            className="mx-1"
          >
            {props.mode === "edit" ? "Edit" : "Save"}
          </Button>
        </div>
      </div>
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default AddAttachment;
