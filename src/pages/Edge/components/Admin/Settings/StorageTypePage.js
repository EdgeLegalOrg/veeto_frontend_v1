import BreadCrumb from "Components/Common/BreadCrumb";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardHeader, Container, Row, Col } from "reactstrap";

import {
  selectStorageType,
  selectStorageSaving,
  saveStorageType,
} from "slices/storage/reducer";
import { toast } from "react-toastify";

import {
  STORAGE_TYPE_OPTIONS,
  STORAGE_OPTIONS,
} from "pages/Edge/utils/storageConfig";

const StorageTypePage = () => {
  const dispatch = useDispatch();
  const selected = useSelector(selectStorageType);
  const saving = useSelector(selectStorageSaving); // ← for button loading state
  const [localSelected, setLocalSelected] = useState(
    selected || STORAGE_TYPE_OPTIONS.ONEDRIVE,
  );

  useEffect(() => {
    setLocalSelected(selected || STORAGE_TYPE_OPTIONS.ONEDRIVE);
  }, [selected]);

  const handleSave = async () => {
    const result = await dispatch(saveStorageType(localSelected));
    if (saveStorageType.fulfilled.match(result)) {
      toast.success("Storage type updated.");
    } else {
      toast.error("Failed to save storage type.");
    }
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
                      className={`border rounded p-3 d-flex align-items-start gap-3 ${
                        isActive ? "border-primary bg-soft-primary" : ""
                      }`}
                      onClick={() => setLocalSelected(opt.value)}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        className="form-check-input mt-1"
                        checked={isActive}
                        onChange={() => setLocalSelected(opt.value)}
                      />
                      <div>
                        <div className="fw-semibold">{opt.label}</div>
                        <div className="text-muted small">
                          {opt.description}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>

                <div className="alert alert-info mb-0 mt-2">
                  <strong>Current behavior:</strong> the selected provider is
                  saved globally, and uploads will follow that provider.
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StorageTypePage;
