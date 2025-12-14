import React, { Fragment, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { returnFileIcon } from "../../utils/Icons";
import { AlertPopup } from "../customComponents/CustomComponents";
import { AiOutlineClose } from "react-icons/ai";
import LoadingPage from "../../utils/LoadingPage";
import { deleteDocAttach, updateDocDetail } from "../../apis";
import { v1 as uuidv1 } from "uuid";
import DocumentVersions from "./DocumentVersions";
import { toast } from "react-toastify";
import { Button, CardHeader, Modal, ModalBody, ModalHeader } from "reactstrap";
import { formatDateFunc } from "../../utils/utilFunc";
import { TextInputField } from "pages/Edge/components/InputField";

const DocumentDetail = (props) => {
  const {
    docDetails,
    setDocId,
    handleOpenDoc,
    fetchDocDetails,
    fetchDocumentList,
    handleDownloadWithLink,
  } = props;
  const navigate = useNavigate();
  const { navigationEditForm } = useSelector((state) => state.Layout);
  const [updatedData, setUpdatedData] = useState(docDetails);
  const [file, setFile] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [deletePop, setDeletePop] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInput = useRef(null);

  const handleOpenSelector = () => {
    fileInput.current.click();
  };

  const handleImageChange = (event) => {
    const fileUploaded = event.target.files[0];
    let fl = "";
    if (fileUploaded && fileUploaded.name) {
      fl = fileUploaded.name.split(".").slice(0, -1).join(".");
    }
    setFile(fileUploaded);
    setUpdatedData({ ...updatedData, name: fl });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData({ ...updatedData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.target.disabled = true;
    setLoading(true);
    const data = {
      requestId: uuidv1(),
      data: updatedData,
    };

    var inputData = new FormData();
    inputData.append("documentFile", file);
    inputData.append("documentJson", JSON.stringify(data));
    try {
      const { data } = await updateDocDetail(inputData);
      if (data?.success) {
        if (navigationEditForm.isEditMode) {
          return navigate(-1);
        }
        setFile(null);
        fetchDocumentList();
        fetchDocDetails(docDetails.id);
      } else {
        setShowAlert(true);
        setAlertMsg(
          data?.error?.message
            ? data?.error?.message
            : "Oops! Something went wrong."
        );
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
    e.target.disabled = false;
  };

  const handleClearFile = () => {
    setFile(null);
    setUpdatedData({ ...updatedData, name: docDetails.name });
  };

  const handleCheckAlert = () => {
    setDeletePop(true);
  };

  const handleDeleteDoc = async () => {
    setLoading(true);
    try {
      const { data } = await deleteDocAttach(docDetails.id);
      if (data.success) {
        if (navigationEditForm.isEditMode) {
          return navigate(-1);
        }
        setDocId("");
        fetchDocumentList();
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <CardHeader className="border-0">
        <div className="d-md-flex align-items-center">
          <h5 className="card-title mb-3 mb-md-0 flex-grow-1">Document</h5>

          <div className="flex-shrink-0">
            <div className="d-flex gap-2 flex-wrap">
              <Button color="success" onClick={handleSubmit}>
                Update
              </Button>
              <Button color="danger" onClick={handleCheckAlert}>
                Delete
              </Button>
              <Button
                color="info"
                onClick={() => {
                  if (navigationEditForm.isEditMode) {
                    return navigate(-1);
                  }
                  setDocId("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="docDetail-sectionDiv">
        <div className="docDetail-iconDiv">
          <img
            src={returnFileIcon(docDetails?.type)}
            alt="file-icon"
            className="docDetail-icon"
          />
        </div>
        <div className="docDetail-contentDiv">
          <div className="docDetail-inputDiv">
            <div
              className="docDetail-uploadDiv d-grid"
              style={{ marginBottom: "1rem" }}
            >
              <label>Choose File</label>
              <Button
                type="button"
                color="success"
                className="w-lg"
                onClick={handleOpenSelector}
              >
                Choose
              </Button>
              <input
                type="file"
                ref={fileInput}
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
            <div className="docDetail-fileName">
              <TextInputField
                name="name"
                label="File name"
                width={file ? "95%" : "100%"}
                value={updatedData.name}
                onChange={handleChange}
                placeholder="file Name"
              />
            </div>
            {file && (
              <button className="docDetail-clearFile" onClick={handleClearFile}>
                <AiOutlineClose className="docDetail-closeIcon" />
              </button>
            )}
          </div>
          <div className="docDetail-inputDiv">
            <div className="docDetail-input-sm">
              <TextInputField
                type="date"
                name="createdDate"
                label="Created at"
                value={updatedData.createdDate}
                onChange={handleChange}
                placeholder="Created Date"
              />
            </div>
            <div className="docDetail-input-md">
              <TextInputField
                name="createdBy"
                label="Created by"
                value={updatedData.createdBy}
                onChange={handleChange}
                disabled={true}
                placeholder="Created By"
              />
            </div>
          </div>
          <div className="docDetail-inputDiv">
            <div className="docDetail-input-sm">
              <TextInputField
                name="status"
                label="Status"
                width="80%"
                value={updatedData.status}
                onChange={handleChange}
                placeholder="Status"
              />
            </div>
            <div className="docDetail-input-md">
              <TextInputField
                name="comments"
                label="Comment"
                value={updatedData.comments}
                onChange={handleChange}
                placeholder="Comment"
              />
            </div>
          </div>
          <div className="docDetail-inputDiv">
            <div className="docDetail-input-lg">
              <TextInputField
                name="description"
                label="Description"
                value={updatedData.description}
                onChange={handleChange}
                placeholder="Description"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="m-2">
        <div className="bg-light px-2 py-3 mb-2">
          <p className="mb-0">Document Version</p>
        </div>
        <DocumentVersions
          docDetails={docDetails}
          handleDownloadWithLink={handleDownloadWithLink}
        />
      </div>
      {showAlert && (
        <Modal
          isOpen={showAlert}
          toggle={() => setShowAlert(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setShowAlert(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              message={alertMsg}
              btn1={"Close"}
              btn2={"Refresh"}
              handleFunc={() => {
                handleClearFile();
                handleOpenDoc(docDetails.id);
              }}
              closeForm={() => setShowAlert(false)}
            />
          </ModalBody>
        </Modal>
      )}

      {deletePop && (
        <Modal
          isOpen={deletePop}
          toggle={() => setDeletePop(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setDeletePop(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              heading="Confirm Your Action"
              message="Are you sure you want to delete the record?"
              btn1="No"
              btn2="Yes"
              closeForm={() => setDeletePop(false)}
              handleFunc={handleDeleteDoc}
            />
          </ModalBody>
        </Modal>
      )}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default DocumentDetail;
