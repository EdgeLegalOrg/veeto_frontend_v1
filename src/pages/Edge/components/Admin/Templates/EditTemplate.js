import React, { useState, useEffect } from "react";
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
    // let filename = acceptedFile[0].name;
    setUploadedFile(acceptedFile[0]);
    // setFormData({
    //   ...formData,
    //   name: filename.split('.').slice(0, -1).join('.'),
    // });
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
