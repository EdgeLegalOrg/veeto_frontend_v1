import React, { useState, useEffect } from "react";
import Dropzone from "react-dropzone";
import closeBtn from "../../../images/close-white-btn.svg";
import { v1 as uuidv1 } from "uuid";
import { editBaseTemplate } from "../../../apis";
import "../../../stylesheets/DocumentPage.css";
import { ConfirmationCustodyPopup } from "../../customComponents/CustomComponents";
import LoadingPage from "../../../utils/LoadingPage";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import { TextInputField } from "pages/Edge/components/InputField";

const initialData = {
  name: "",
  documentType: "",
};

const EditTemplate = (props) => {
  const { closeForm, refreshList, file } = props;
  const [formData, setFormData] = useState(file);
  const [uploadedFile, setUploadedFile] = useState(undefined);
  const [isEnableButton, setIsEnableButton] = useState(true);
  const [confirmScreen, setConfirmScreen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(props.file);
  }, [props.file]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    setFormData({ ...formData, [name]: e.target.value });
  };

  const handleSelectOption = (val) => {
    setFormData({ ...formData, ...val });
  };

  const handleUploadFile = (acceptedFile) => {
    let filename = acceptedFile[0].name;
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
      const { data } = await editBaseTemplate(inputData);
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

  return (
    <div className="">
      <div className="mb-4">
        {/* <div className="tempForm-header">
          <h2 className="tempForm-heading">Update Letterhead</h2>
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
        <div className="form-group mx-4">
          <div className="mb-4">
            <TextInputField
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleFormChange}
            />
            {/* <SearchableDropDown
              width='100%'
              name='documentType'
              label='Document'
              optionArray={['NORMAL', 'LETTER', 'FORM']}
              setDetails={handleSelectOption}
              details={file}
              value={file.documentType}
              fieldVal={file.documentType}
            /> */}
            {/* <SearchableDropDown
              width='100%'
              name='type'
              label='Type'
              fieldVal={file.type}
              optionArray={['ACT_FOR_LESSEE']}
              setDetails={handleSelectOption}
              details={file}
              value={file.type}
            /> */}
          </div>
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button className="mx-1" color="danger" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          className="mx-1"
          color="success"
          onClick={handleSubmit}
          disabled={!isEnableButton}
        >
          Update
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
