import React, { useState } from "react";
import Dropzone from "react-dropzone";
import closeBtn from "../../../images/close-white-btn.svg";
import { IoMdClose } from "react-icons/io";
import { v1 as uuidv1 } from "uuid";
import { uploadTemplate } from "../../../apis";
import "../../../stylesheets/AddNewTemplate.css";
import {
  ConfirmationCustodyPopup,
  CustomDropDown,
} from "../../customComponents/CustomComponents";
import LoadingPage from "../../../utils/LoadingPage";
import { toast } from "react-toastify";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import { SelectInputField, TextInputField } from "../../InputField";
import { createPortal } from "react-dom";

const initialData = {
  name: "",
  type: "",
  documentType: "",
};

const AddNewTemplate = (props) => {
  const [formData, setFormData] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [confirmScreen, setConfirmScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { closeFormToast, refreshList, matterList, docList } = props;

  const handleUploadFile = (acceptedFile) => {
    setLoading(true);
    if (acceptedFile?.length) {
      let filesUploaded = [...uploadedFiles, ...acceptedFile];

      filesUploaded.sort((a, b) => a.name.localeCompare(b.name));

      setUploadedFiles(filesUploaded);

      let arr = [...formData];
      acceptedFile.forEach((file) => {
        let filename = file.name;
        arr.push({
          ...initialData,
          name: filename.split(".").slice(0, -1).join("."),
        });
      });
      arr.sort((a, b) => a.name.localeCompare(b.name));
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
      [name]: val.value,
    };
    setFormData(data);
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
    let data1 = formData.filter((file, i) => i !== ind);
    let data2 = uploadedFiles.filter((file, i) => i !== ind);

    setTimeout(() => {
      setFormData(data1);
      setUploadedFiles(data2);
    }, 10);
  };

  const handleSubmit = async () => {
    if (uploadedFiles && uploadedFiles?.length > 0) {
      setLoading(true);

      let count = 0;
      let size = uploadedFiles?.length;

      for (let i = 0; i < size; i++) {
        count += 1;
        const temp = { ...formData[i] };
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
          const { data } = await uploadTemplate(inputData);

          if (!data.success) {
            let arr1 = uploadedFiles.slice(i + 1, uploadedFiles?.length);
            let arr2 = formData.slice(i + 1, formData?.length);
            toast.error(
              `${temp.name} could not be uploaded, please try again later.`
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
          toast.error(`File could not be uploaded, please try again later.`);
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
      // toast.error("Please add document");
    }
  };

  const findDisplayname = (from, val = "") => {
    if (val) {
      let data = from.find((d) => d.value === val);
      return data ? data.display : "";
    }
    return "";
  };

  const displayInputs = () => {
    if (formData && formData?.length > 0) {
      return (
        <div className="tempForm-inputSection">
          {formData.map((file, i) => (
            <div className="tempForm-inputContainer pe-cursor" key={i}>
              <span>{`${i + 1})`}</span>
              <TextInputField
                name="name"
                width="35%"
                label="Name"
                value={file.name}
                onChange={(e) => handleFormChange(e, i)}
              />

              <div className="mb-3 position-relative">
                <SelectInputField
                  label="Document Type"
                  name="documentType"
                  optionStyles={{ maxHeight: "365px", minWidth: "200px" }}
                  value={file.documentType}
                  optionArray={docList}
                  onSelectFunc={(val) =>
                    handleSelectOption("documentType", val, i)
                  }
                  selected={file.documentType}
                  fieldVal={findDisplayname(docList, file.documentType)}
                  maxLength={null}
                />
              </div>

              <div className="mb-3 position-relative">
                <SelectInputField
                  label="Matter Sub-type"
                  name="type"
                  optionStyles={{ maxHeight: "365px" }}
                  value={file.type}
                  optionArray={matterList}
                  onSelectFunc={(val) => handleSelectOption("type", val, i)}
                  selected={file.type}
                  fieldVal={findDisplayname(matterList, file.type)}
                  maxLength={null}
                />
              </div>
              <button
                className="tempForm-btnClose mt-2"
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
          <h2 className="tempForm-heading">Add New Precedent</h2>
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
        <div className="tempForm-gridContent">
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
                          <span
                            style={{
                              color: "#555",
                              padding: "2px",
                              margin: "0",
                            }}
                            key={i}
                          >
                            {file.name}
                          </span>
                        ))}
                        <span
                          style={{ color: "#555", padding: "2px", margin: "0" }}
                        >
                          +{uploadedFiles.length - 1} more
                        </span>
                      </>
                    ) : (
                      uploadedFiles.map((file, i) => (
                        <span
                          style={{ color: "#555", padding: "2px", margin: "0" }}
                          key={i}
                        >
                          {file.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
            </Dropzone>
          </div>
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
      {confirmScreen &&
        createPortal(
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
          </Modal>,
          document.body
        )}
      {loading && <LoadingPage />}
    </div>
  );
};

export default AddNewTemplate;
