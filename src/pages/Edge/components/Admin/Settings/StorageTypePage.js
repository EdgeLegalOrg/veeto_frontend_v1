import BreadCrumb from "Components/Common/BreadCrumb";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";

import {
  selectStorageType,
  setStorageType,
} from "slices/storage/reducer";

import {
  STORAGE_TYPE_OPTIONS,
  STORAGE_OPTIONS,
} from "pages/Edge/utils/storageConfig";
import { saveStorageConfigApi } from "pages/Edge/apis";

import StorageConfigModal from "./StorageConfigModal";

const StorageTypePage = () => {
  const dispatch = useDispatch();
  const selected = useSelector(selectStorageType);
  const [localSelected, setLocalSelected] = useState(
    selected || STORAGE_TYPE_OPTIONS.ONEDRIVE,
  );

  // Config modal state
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configStorageType, setConfigStorageType] = useState(null);
  const [confirmServerModalOpen, setConfirmServerModalOpen] = useState(false);
  const [pendingServerSelection, setPendingServerSelection] = useState(null);

  useEffect(() => {
    setLocalSelected(selected || STORAGE_TYPE_OPTIONS.ONEDRIVE);
  }, [selected]);

  const openConfigModal = (storageTypeValue) => {
    setConfigStorageType(storageTypeValue);
    setConfigModalOpen(true);
  };

  const handleProviderSelect = async (storageTypeValue) => {
    if (storageTypeValue === STORAGE_TYPE_OPTIONS.SERVER) {
      setPendingServerSelection(storageTypeValue);
      setConfirmServerModalOpen(true);
      return;
    }

    openConfigModal(storageTypeValue);
  };

  const confirmServerSelection = async () => {
    if (!pendingServerSelection) return;

    try {
      const payload = {
        storageType: pendingServerSelection,
        category: "LOCAL",
      };

      const { data } = await saveStorageConfigApi(payload);

      if (data?.success) {
        dispatch(setStorageType(pendingServerSelection));
        setLocalSelected(pendingServerSelection);
        toast.success(data.message || "Storage provider updated successfully.");
      } else {
        toast.error(data?.error?.message || "Failed to save storage provider.");
      }
    } catch (err) {
      console.error("Failed to save server storage config:", err);
      toast.error("Something went wrong while saving the storage provider.");
    } finally {
      setConfirmServerModalOpen(false);
      setPendingServerSelection(null);
    }
  };

  // Called by the modal after a successful save
  const handleConfigSaved = (savedStorageType) => {
    dispatch(setStorageType(savedStorageType));
    setLocalSelected(savedStorageType);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Storage Type" pageTitle="Admin" />
        <Row>
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">File Storage Provider</h5>
              </CardHeader>
              <CardBody className="d-flex flex-column gap-3">
                {STORAGE_OPTIONS.map((opt) => {
                  const isActive = localSelected === opt.value;

                  return (
                    <div
                      key={opt.value}
                      className={`border rounded p-3 d-flex align-items-center gap-3 ${isActive ? "border-primary bg-soft-primary" : ""
                        }`}
                      onClick={() => handleProviderSelect(opt.value)}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        className="form-check-input mt-1"
                        checked={isActive}
                        readOnly
                      />
                      <div className="flex-grow-1">
                        <div className="fw-semibold d-flex align-items-center gap-2">
                          {opt.icon && <i className={opt.icon}></i>}
                          {opt.label}
                        </div>
                        <div className="text-muted small">
                          {opt.description}
                        </div>
                      </div>
                      {/* Settings gear button */}
                      {opt.value !== STORAGE_TYPE_OPTIONS.SERVER && (
                        <Button
                          type="button"
                          className="btn btn-icon btn-ghost-secondary rounded-circle flex-shrink-0 align-self-center text-muted"
                          title={`Configure ${opt.label} credentials`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProviderSelect(opt.value);
                          }}
                        >
                          <i className="ri-settings-3-line fs-16 text-muted"></i>
                        </Button>
                      )}
                    </div>
                  );
                })}

                <div className="alert alert-info mb-0 mt-2">
                  <strong>Note:</strong> Select a provider and configure its
                  credentials to start using it for file uploads.
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        isOpen={confirmServerModalOpen}
        toggle={() => setConfirmServerModalOpen(false)}
        centered
        size="md"
        backdrop="static"
      >
        <ModalHeader toggle={() => setConfirmServerModalOpen(false)} className="bg-light p-3">
          Confirm Action
        </ModalHeader>
        <ModalBody className="p-4">
          <p className="mb-3">
            Selecting Server Storage will switch file uploads to the server-based
            storage flow. Continue?
          </p>
          <div className="d-flex justify-content-end gap-2">
            <Button color="secondary" outline onClick={() => setConfirmServerModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onClick={confirmServerSelection}>
              Continue
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Storage Config Modal */}
      <StorageConfigModal
        isOpen={configModalOpen}
        toggle={() => setConfigModalOpen(false)}
        storageType={configStorageType}
        onSaveSuccess={handleConfigSaved}
      />
    </div>
  );
};

export default StorageTypePage;
