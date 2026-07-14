import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  Input,
  Spinner,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { toast } from "react-toastify";
import { fetchStorageConfigApi, saveStorageConfigApi } from "pages/Edge/apis";
import {
  STORAGE_CONFIG_FIELDS,
  STORAGE_CATEGORY_OPTIONS,
  STORAGE_OPTIONS,
} from "pages/Edge/utils/storageConfig";

const StorageConfigModal = ({ isOpen, toggle, storageType }) => {
  const [formData, setFormData] = useState({});
  const [category, setCategory] = useState("SPECIFIC");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});
  const [existingConfig, setExistingConfig] = useState(null);
  const [allConfigs, setAllConfigs] = useState([]);

  const fields = STORAGE_CONFIG_FIELDS[storageType] || [];
  const providerInfo = STORAGE_OPTIONS.find((o) => o.value === storageType);

  // Build blank form from field definitions
  const buildBlankForm = useCallback(() => {
    const blank = {};
    fields.forEach((f) => {
      blank[f.name] = "";
    });
    return blank;
  }, [storageType]);

  // Fetch existing config on open
  useEffect(() => {
    if (!isOpen || !storageType) return;

    const fetchConfig = async () => {
      setLoading(true);
      try {
        const { data } = await fetchStorageConfigApi();
        if (data.success && data.data) {
          const configs = Array.isArray(data.data) ? data.data : [];
          setAllConfigs(configs);
        } else {
          setAllConfigs([]);
        }
      } catch (err) {
        console.error("Failed to fetch storage config:", err);
        setAllConfigs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [isOpen, storageType]);

  // Update form when configs, category, or storageType changes
  useEffect(() => {
    if (!isOpen || !storageType) return;

    const match = allConfigs.find(
      (c) =>
        (c.storageType === storageType ||
          c.storageType?.toUpperCase() === storageType) &&
        c.category?.toUpperCase() === category.toUpperCase()
    );

    if (match) {
      setExistingConfig(match);
      const prefilled = {};
      fields.forEach((f) => {
        prefilled[f.name] = match[f.name] || "";
      });
      setFormData(prefilled);
    } else {
      setExistingConfig(null);
      setFormData(buildBlankForm());
    }
  }, [allConfigs, category, storageType, buildBlankForm, fields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSecret = (fieldName) => {
    setShowSecrets((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleSave = async () => {
    // Basic validation — check required fields
    for (const field of fields) {
      if (field.required && !formData[field.name]?.trim()) {
        toast.warning(`${field.label} is required.`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        storageType,
        category: category.toLowerCase(),
      };
      const { data } = await saveStorageConfigApi(payload);
      if (data.success) {
        toast.success(data.message || "Storage config saved successfully.");
        toggle();
      } else {
        toast.error(
          data?.error?.message || "Failed to save config. Please try again."
        );
      }
    } catch (err) {
      console.error("Save storage config error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setShowSecrets({});
    toggle();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      backdrop="static"
      centered
      size="lg"
      contentClassName="border-0 shadow-lg"
    >
      <ModalHeader toggle={handleClose} className="bg-light px-4 py-3 border-bottom">
        <i className={`${providerInfo?.icon || "ri-settings-3-line"} me-2`}></i>
        {providerInfo?.label || "Storage"} Configuration
        {existingConfig && (
          <span className="badge bg-soft-success text-success ms-2 fs-12">
            Configured
          </span>
        )}
      </ModalHeader>

      <ModalBody className="px-4 py-4">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner color="primary" />
            <span className="ms-2 text-muted">Loading configuration...</span>
          </div>
        ) : (
          <>
            {/* Category selector */}
            <div className="mb-3">
              <Label className="form-label fw-semibold">Category</Label>
              <Input
                type="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {STORAGE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Input>
              <small className="text-muted">
                Choose whether this config applies generally or to a specific
                context.
              </small>
            </div>

            <hr />

            {/* Dynamic provider fields */}
            {fields.map((field) => {
              const isPassword =
                field.type === "password" && !showSecrets[field.name];
              return (
                <div className="mb-3" key={field.name}>
                  <Label className="form-label fw-semibold">
                    {field.label}
                    {field.required && (
                      <span className="text-danger ms-1">*</span>
                    )}
                  </Label>
                  {field.type === "password" ? (
                    <InputGroup>
                      <Input
                        type={isPassword ? "password" : "text"}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        autoComplete="new-password"
                      />
                      <InputGroupText
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSecret(field.name)}
                        title={isPassword ? "Show" : "Hide"}
                      >
                        <i
                          className={
                            isPassword ? "ri-eye-off-line" : "ri-eye-line"
                          }
                        ></i>
                      </InputGroupText>
                    </InputGroup>
                  ) : (
                    <Input
                      type="text"
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      autoComplete="off"
                      data-lpignore="true"
                    />
                  )}
                </div>
              );
            })}

            {fields.length === 0 && (
              <div className="alert alert-warning mb-0">
                No configuration fields defined for this provider yet.
              </div>
            )}
          </>
        )}
      </ModalBody>

      <ModalFooter className="px-4 py-3 border-top bg-light">
        <Button color="danger" outline onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          color="success"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            <>
              <Spinner size="sm" className="me-1" /> Saving...
            </>
          ) : existingConfig ? (
            "Update"
          ) : (
            "Save"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default StorageConfigModal;
