import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
} from "reactstrap";
import closeBtn from "../../images/close-white-btn.svg";
import AttachIDForm from "./AttachIDForm";
import { returnFileIcon } from "../../utils/Icons";
import { FiDownload } from "react-icons/fi";
import fileDownload from "js-file-download";
import ContactPreviewScreen from "./ContactPreviewScreen";
import { downloadContactAttachment, deleteContactAttachment } from "../../apis";
import "../../stylesheets/attach.css";
import { convertSubstring, formatDateFunc } from "../../utils/utilFunc";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";

const ConfirmationPopup = (props) => {
  const { selectedAttach, clearSelected, fetchAttachments, closeForm } = props;

  const [enableButton, setEnableButton] = useState(true);

  const handleDeleteAttachment = () => {
    setEnableButton(false);
    const ids = selectedAttach.join(",");
    deleteContactAttachment(ids)
      .then((res) => {
        setEnableButton(true);
        clearSelected();
        fetchAttachments();
        closeForm();
      })
      .catch((e) => {
        console.error(e);
        setEnableButton(true);
      });
  };

  return (
    <div className="">
      <div>
        {/* <div
          className="confirmation-header"
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
            className="close-form-btn"
            onClick={closeForm}
            disabled={!enableButton}
          >
            {" "}
            <img
              src={closeBtn}
              alt="close-btn"
            />
          </button>
        </div> */}
        <div className="p-4">
          <p>Are you sure you want to delete the record?</p>
        </div>
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            color="danger"
            className="mx-1"
            onClick={closeForm}
            disabled={!enableButton}
          >
            No
          </Button>
          <Button
            color="success"
            className="mx-1"
            onClick={handleDeleteAttachment}
            disabled={!enableButton}
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

const Attachid = (props) => {
  const { details, attach, handleContactAttachments, fetchAttachments } = props;
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedAttach, setSelectedAttach] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewScreen, setPreviewScreen] = useState(false);

  const handleDownload = (id, fileName) => {
    downloadContactAttachment(id)
      .then((res) => {
        fileDownload(res.data, fileName);
      })
      .catch((err) => {
        console.error("error", err);
        toast.error("Something went wrong, please try later.");
      });
  };

  const handleLinkDownload = (id, fileName, type) => {
    downloadContactAttachment(id).then((res) => {
      // fileDownload(res.data, fileName);
      if (
        type === "image" ||
        type === "jpeg" ||
        type === "jpg" ||
        type === "png" ||
        type === "tif"
      ) {
        setPreviewImage(URL.createObjectURL(res.data));
        setPreviewScreen(true);
      } else {
        fileDownload(res.data, fileName);
      }
    });
  };

  const handleDeleteAttach = () => {
    if (selectedAttach?.length !== 0) {
      setConfirmDelete(true);
    } else {
      toast.warning("Select document");
    }
  };

  const handleAttachSelect = (id, fileName) => {
    const selectedIndex = selectedAttach.indexOf(id);
    let newSelected = [];
    let newSelectedFilename = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedAttach, id);
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename,
        fileName
      );
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedAttach.slice(1));
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename.slice(1)
      );
    } else if (selectedIndex === selectedAttach?.length - 1) {
      newSelected = newSelected.concat(selectedAttach.slice(0, -1));
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename.slice(0, -1)
      );
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedAttach.slice(0, selectedIndex),
        selectedAttach.slice(selectedIndex + 1)
      );
      newSelectedFilename = newSelectedFilename.concat(
        selectedFilename.slice(0, selectedIndex),
        selectedFilename.slice(selectedIndex + 1)
      );
    }
    setSelectedAttach(newSelected);
    setSelectedFilename(newSelectedFilename);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelecteds = attach?.map((row) => row.id);
      setSelectedAttach(newSelecteds);
      return;
    }
    setSelectedAttach([]);
  };

  const isSelected = (id) => selectedAttach.indexOf(id) !== -1;

  const handleDownloadMulti = () => {
    if (selectedAttach?.length !== 0) {
      const ids = selectedAttach.join(",");
      if (selectedAttach?.length > 1) {
        downloadContactAttachment(ids).then((res) => {
          fileDownload(res.data, "attachments.zip");
        });
      } else {
        downloadContactAttachment(ids).then((res) => {
          fileDownload(res.data, selectedFilename[0]);
        });
      }
    } else {
      toast.warning("select document");
    }
  };

  return (
    <div className="attach-id-main">
      <div className="d-flex justify-content-end">
        <Button
          color="success"
          onClick={() => setShowForm(true)}
          className="d-flex mx-1"
        >
          + Add Attachment
        </Button>
        <Button
          color="success"
          onClick={handleDownloadMulti}
          className="d-flex mx-1"
        >
          Download
        </Button>
        <Button
          color="danger"
          onClick={handleDeleteAttach}
          className="d-flex mx-1"
        >
          Delete
        </Button>
      </div>
      <div className="my-2">
        <Table responsive={true} striped={true} hover={true}>
          <thead className="table-light">
            <tr>
              <th>
                <Input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    attach?.length > 0 &&
                    selectedAttach?.length === attach?.length
                  }
                />
              </th>
              <th>Name</th>
              <th>Creation Date</th>
              <th>Uploaded By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attach?.map((data, index) => {
              return (
                <tr key={index} className="pe-cursor">
                  <td>
                    <Input
                      type="checkbox"
                      onChange={() => handleAttachSelect(data.id, data.name)}
                      checked={isSelected(data.id)}
                    />
                  </td>
                  <td>
                    <div
                      className="makeAsLink pe-cursor underline"
                      onClick={() =>
                        handleLinkDownload(data.id, data.name, data.type)
                      }
                    >
                      <img
                        src={returnFileIcon(data.type)}
                        alt={data.type}
                        width="30px"
                        height="30px"
                        className="mx-1"
                      />
                      <OverlayTrigger
                        key="bottom"
                        placement="bottom-start"
                        overlay={
                          <Tooltip id={`tooltip-bottom`}>
                            {data.name ? data.name : ""}
                          </Tooltip>
                        }
                      >
                        <span>{convertSubstring(data.name)}</span>
                      </OverlayTrigger>
                    </div>
                  </td>
                  <td>{formatDateFunc(data.uploadDate)}</td>
                  <td>{data.uploadedBy ? data.uploadedBy : ""}</td>
                  <td>
                    <div className="download-icon-div">
                      <FiDownload
                        onClick={() => handleDownload(data.id, data.name)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      {showForm && (
        <Modal
          isOpen={showForm}
          toggle={() => setShowForm(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setShowForm(false)}
            className="bg-light p-3"
          >
            Add Attachment
          </ModalHeader>
          <ModalBody>
            <AttachIDForm
              closeForm={() => setShowForm(false)}
              details={details}
              handleContactAttachments={handleContactAttachments}
            />
          </ModalBody>
        </Modal>
      )}
      {confirmDelete && (
        <Modal
          isOpen={confirmDelete}
          toggle={() => setConfirmDelete(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setConfirmDelete(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <ConfirmationPopup
              selectedAttach={selectedAttach}
              fetchAttachments={fetchAttachments}
              closeForm={() => setConfirmDelete(false)}
              clearSelected={() => {
                setSelectedAttach([]);
                setSelectedFilename([]);
              }}
            />
          </ModalBody>
        </Modal>
      )}
      {previewScreen &&
        createPortal(
          <ContactPreviewScreen
            previewImage={previewImage}
            setPreviewScreen={setPreviewScreen}
            previewScreen={previewScreen}
          />,
          document.body
        )}
    </div>
  );
};

export default Attachid;
