import React, { useState, useRef } from "react";
import Dropzone from "react-dropzone";
import closeBtn from "../../../images/close-white-btn.svg";
import { IoMdClose } from "react-icons/io";
import { v1 as uuidv1 } from "uuid";
import { uploadBaseTemplate } from "../../../apis";
import "../../../stylesheets/AddNewTemplate.css";
import { ConfirmationCustodyPopup } from "../../customComponents/CustomComponents";
import LoadingPage from "../../../utils/LoadingPage";
import { toast } from "react-toastify";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";

import { OneDriveIcon, DeviceUploadIcon, GoogleDriveColorIcon } from "../../UploadIcons";

const initialData = {
  name: "",
  documentType: "",
  subTypes: [],
  storageType: null,
};

const AddNewTemplate = (props) => {
  const [formData, setFormData] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isEnableButton, setIsEnableButton] = useState(true);
  const [confirmScreen, setConfirmScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadSource, setUploadSource] = useState("device");
  const googleDriveInputRef = useRef(null);

  const { closeFormToast, refreshList, matterList } = props;

  const handleUploadFile = (acceptedFile) => {
    setLoading(true);
    if (acceptedFile?.length) {
      setUploadedFiles([...uploadedFiles, ...acceptedFile]);
      let arr = [...formData];
      acceptedFile.forEach((file) => {
        let filename = file.name;
        arr.push({
          ...initialData,
          name: filename.split(".").slice(0, -1).join("."),
        });
      });
      setFormData(arr);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (uploadedFiles?.length > 0) {
      setConfirmScreen(true);
    } else {
      closeFormToast();
    }
  };

  const handleSelectOption = (name, val, i) => {
    let data = [...formData];
    data[i] = {
      ...formData[i],
      [name]: Array.isArray(val) ? val : val.value,
    };
    setFormData(data);
  };

  const findDisplayname = (from, val = "") => {
    if (val) {
      let data = from.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  const handleFormChange = (e, ind) => {
    const { name, value } = e.target;
    let data = [...formData];
    data[ind] = {
      ...formData[ind],
      [name]: value,
    };
    setFormData(data);
  };

  const handleDelete = (ind) => {
    let data = formData.filter((file, i) => i !== ind);
    setFormData(data);
  };

  const handleGoogleDriveFileSelect = (e) => {
    const acceptedFiles = Array.from(e.target.files);
    if (!acceptedFiles.length) return;
    setUploadedFiles([...uploadedFiles, ...acceptedFiles]);
    let arr = [...formData];
    acceptedFiles.forEach((file) => {
      arr.push({
        ...initialData,
        name: file.name.split(".").slice(0, -1).join("."),
        storageType: "GOOGLE_DRIVE",
      });
    });
    setFormData(arr);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (uploadedFiles && uploadedFiles?.length > 0) {
      setLoading(true);

      let count = 0;
      let size = uploadedFiles?.length;

      for (let i = 0; i < size; i++) {
        count += 1;
        try {
          let inputData = new FormData();
          let dataInput = {
            requestId: uuidv1(),
            data: {
              ...formData[i],
            },
          };
          inputData.append("templateJSON", JSON.stringify(dataInput));
          inputData.append("templateFile", uploadedFiles[i]);
          const { data } = await uploadBaseTemplate(inputData);

          const temp = uploadedFiles[i];
          if (!data.success) {
            let arr1 = uploadedFiles.slice(i + 1, uploadedFiles?.length);
            let arr2 = formData.slice(i + 1, formData?.length);
            toast.warning(
              `${temp.name} could be uploaded, please try again later.`
            );
            setUploadedFiles(arr1);
            setFormData(arr2);
          } else {
            let arr1 = uploadedFiles.slice(i + 1, uploadedFiles?.length);
            let arr2 = formData.slice(i + 1, formData?.length);
            setUploadedFiles(arr1);
            setFormData(arr2);
          }
        } catch (error) {
          toast.warning(`File could be uploaded, please try again later.`);
          console.error(error);
          let arr1 = uploadedFiles.slice(i + 1, uploadedFiles?.length);
          let arr2 = formData.slice(i + 1, formData?.length);
          setUploadedFiles(arr1);
          setFormData(arr2);
        }
        if (count === size) {
          setLoading(false);
          closeFormToast();
          refreshList();
          return;
        }
      }
    } else {
      setSubmitted(true);
      // toast.warning("Please add document");
    }
  };

  const displayInputs = () => {
    if (formData && formData?.length > 0) {
      return (
        <div className="tempForm-inputSection">
          {formData.map((file, i) => (
            <div
              className="tempForm-inputContainer tempForm-w80 pe-cursor"
              key={i}
            >
              <span>{`${i + 1})`}</span>
              <TextInputField
                width="60%"
                name="name"
                label="Name"
                value={file.name}
                onChange={(e) => handleFormChange(e, i)}
              />

              <div className="mb-3 position-relative">
                <SelectInputField
                  label="Matter Sub-type"
                  name="subTypes"
                  multi
                  allOption
                  // optionStyles={{ maxHeight: "365px", width: "400px", backgroundColor:"white" }}
                  value={file.subTypes}
                  optionArray={matterList}
                  onSelectFunc={(val) => handleSelectOption("subTypes", val, i)}
                  selected={file.subTypes}
                  fieldVal={
                    Array.isArray(file.subTypes) && file.subTypes.length > 0
                      ? file.subTypes
                          .map((v) => findDisplayname(matterList, v))
                          .join(", ")
                      : ""
                  }
                  maxLength={null}
                  optionClassName="bg-white hover:bg-gray-100 text-black"

                />
              </div>
              <button
                className="tempForm-btnClose"
                onClick={() => handleDelete(i)}
              >
                <IoMdClose />
              </button>
            </div>
          ))}
        </div>
      );
    } else {
      return <></>;
    }
  };

  return (
    <div className="">
      <div className="mb-4">
        {/* <div className="tempForm-header">
          <h2 className="tempForm-heading">Add New Letterhead</h2>
          <button
            onClick={handleClose}
            className="close-form-btn"
          >
            <img
              src={closeBtn}
              alt="close-btn"
            />
          </button>
        </div> */}

        <div className="tempForm-gridContent">
          <input
            ref={googleDriveInputRef}
            type="file"
            accept=".doc,.docx"
            multiple
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
                    <div>
                      {uploadedFiles.length > 1 ? (
                        <>
                          {uploadedFiles.slice(0, 1).map((file, i) => (
                            <span style={{ color: "#555", padding: "2px", margin: "0" }} key={i}>
                              {file.name}
                            </span>
                          ))}
                          <span style={{ color: "#555", padding: "2px", margin: "0" }}>
                            +{uploadedFiles.length - 1} more
                          </span>
                        </>
                      ) : (
                        uploadedFiles.map((file, i) => (
                          <span style={{ color: "#555", padding: "2px", margin: "0" }} key={i}>
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
          {uploadSource === "google" && (
            <div
              onClick={() => googleDriveInputRef.current.click()}
              style={{ border: "2px dashed #dee2e6", borderRadius: "8px", padding: "24px", textAlign: "center", cursor: "pointer", background: "#f9fafb", marginBottom: "8px", minHeight: "100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <GoogleDriveColorIcon size={32} />
              <p style={{ margin: 0, color: "#374151", fontSize: "14px", fontWeight: "500" }}>
                Click here to upload to Google Drive
              </p>
              {uploadedFiles.length > 0 && (
                <span style={{ color: "#555", fontSize: "12px" }}>
                  {uploadedFiles.length === 1 ? uploadedFiles[0].name : `${uploadedFiles[0].name} +${uploadedFiles.length - 1} more`}
                </span>
              )}
            </div>
          )}
          {!uploadedFiles?.length && submitted && (
            <span className="input-error" style={{ margin: "1rem" }}>
              Please select a file
            </span>
          )}
          {displayInputs()}
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button className="mx-1" color="danger" onClick={handleClose}>
          Cancel
        </Button>
        <Button className="mx-1" color="success" onClick={handleSubmit}>
          Add
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
              handleFunc={closeFormToast}
            />
          </ModalBody>
        </Modal>
      )}
      {loading && <LoadingPage />}
    </div>
  );
};

export default AddNewTemplate;
