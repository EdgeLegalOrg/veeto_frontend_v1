import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import fileDownload from "js-file-download";
import "./style.css";

const ImageViewer = ({ showModal, setShowModal, fileName, image }) => {
  const handleDownload = () => {
    fileDownload(image, fileName);
  };
  return (
    <div>
      <Modal
        isOpen={showModal}
        toggle={() => setShowModal()}
        backdrop="static"
        scrollable={true}
        size="md"
        centered
      >
        <ModalHeader
          toggle={() => setShowModal()}
          className="bg-light p-3"
        >
          {/* Image */}
        </ModalHeader>
        <ModalBody>
          <div className="d-flex align-items-center justify-content-center">
            <img
              src={URL.createObjectURL(image)}
              className="modal-image"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={handleDownload}
          >
            Download
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ImageViewer;
