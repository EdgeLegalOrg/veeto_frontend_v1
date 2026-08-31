import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Form,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { toast } from "react-toastify";
import {
  addNotificationDefinition,
  updateNotificationDefinition,
} from "pages/Edge/apis";

export const DELIVERY_OPTIONS = [
  { value: "IN_SYSTEM", display: "In System" },
  { value: "EMAIL", display: "Email" },
  { value: "BOTH", display: "Both" },
];

export const RECIPIENT_OPTIONS = [
  { value: "FEE_EARNER", display: "Fee Earner" },
  { value: "RESPONSIBLE_PERSON", display: "Responsible Person" },
  { value: "ACTING_PERSON", display: "Acting Person" },
  { value: "ASSISTING_PERSON", display: "Assisting Person" },
  { value: "CUSTOM", display: "Custom Email" },
];

const initialState = {
  tableSchema: "",
  tableName: "",
  dateColumn: "",
  matterIdColumn: "",
  alertName: "",
  alertNote: "",
  daysPrior: 0,
  deliveryMethod: "IN_SYSTEM",
  recipientType: "",
  customEmail: "",
  isActive: true,
};

// Value used to key the table/column picker, since a definition needs all three.
const fieldKey = (field) =>
  field ? `${field.tableSchema}.${field.tableName}.${field.columnName}` : "";

const NotificationForm = (props) => {
  const { isOpen, close, refresh, dateFields, editing } = props;
  const [formData, setFormData] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(editing ? { ...initialState, ...editing } : initialState);
      setSubmitted(false);
    }
  }, [isOpen, editing]);

  const selectedField = useMemo(
    () =>
      dateFields.find(
        (f) =>
          f.tableSchema === formData.tableSchema &&
          f.tableName === formData.tableName &&
          f.columnName === formData.dateColumn
      ),
    [dateFields, formData.tableSchema, formData.tableName, formData.dateColumn]
  );

  const emailSelected =
    formData.deliveryMethod === "EMAIL" || formData.deliveryMethod === "BOTH";
  const customEmailSelected = formData.recipientType === "CUSTOM";
  const roleSelected = emailSelected && formData.recipientType && !customEmailSelected;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFieldChange = (e) => {
    const field = dateFields.find((f) => fieldKey(f) === e.target.value);

    setFormData((prev) => ({
      ...prev,
      tableSchema: field ? field.tableSchema : "",
      tableName: field ? field.tableName : "",
      dateColumn: field ? field.columnName : "",
      // Only matter scoped tables can resolve the role recipients.
      matterIdColumn: field && field.matterScoped ? "matterId" : "",
    }));
  };

  const isValid = () => {
    if (!formData.dateColumn || !formData.alertName.trim()) {
      return false;
    }

    if (formData.daysPrior === "" || isNaN(Number(formData.daysPrior))) {
      return false;
    }

    if (emailSelected) {
      if (!formData.recipientType) {
        return false;
      }

      if (customEmailSelected && !formData.customEmail.trim()) {
        return false;
      }

      if (roleSelected && !formData.matterIdColumn) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isValid()) {
      return;
    }

    setSaving(true);

    const payload = {
      ...formData,
      daysPrior: Number(formData.daysPrior),
      recipientType: emailSelected ? formData.recipientType : null,
      customEmail: customEmailSelected ? formData.customEmail : null,
    };

    try {
      const { data } = editing?.id
        ? await updateNotificationDefinition(payload)
        : await addNotificationDefinition(payload);

      if (data.success) {
        toast.success(
          editing?.id ? "Notification updated" : "Notification added"
        );
        if (refresh) {
          refresh();
        }
        close();
      } else {
        toast.error(
          data?.error?.message || "Something went wrong, please try later."
        );
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong, please try later.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={close} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={close}>
          {editing?.id ? "Edit Notification" : "Add Notification"}
        </ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col md={12}>
              <Label className="form-label">
                Table and Date Field <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                name="dateField"
                value={fieldKey(selectedField)}
                onChange={handleFieldChange}
                invalid={submitted && !formData.dateColumn}
              >
                <option value="">Select a date field</option>
                {dateFields.map((f) => (
                  <option key={fieldKey(f)} value={fieldKey(f)}>
                    {`${f.tableName}.${f.columnName}`}
                    {f.matterScoped ? "  (matter)" : ""}
                  </option>
                ))}
              </Input>
              <FormFeedback>Select the date field to alert on.</FormFeedback>
            </Col>

            <Col md={8}>
              <Label className="form-label">
                Alert Name <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                name="alertName"
                value={formData.alertName}
                onChange={handleChange}
                maxLength={255}
                invalid={submitted && !formData.alertName.trim()}
              />
              <FormFeedback>Alert name is required.</FormFeedback>
            </Col>

            <Col md={4}>
              <Label className="form-label">
                Days Prior <span className="text-danger">*</span>
              </Label>
              <Input
                type="number"
                name="daysPrior"
                value={formData.daysPrior}
                onChange={handleChange}
              />
              <div className="form-text">
                Positive alerts before the date, negative after.
              </div>
            </Col>

            <Col md={12}>
              <Label className="form-label">Alert Note</Label>
              <Input
                type="textarea"
                name="alertNote"
                rows={3}
                maxLength={2000}
                value={formData.alertNote || ""}
                onChange={handleChange}
              />
              <div className="form-text">Shown as the alert body text.</div>
            </Col>

            <Col md={6}>
              <Label className="form-label">Issue Alert</Label>
              <Input
                type="select"
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
              >
                {DELIVERY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.display}
                  </option>
                ))}
              </Input>
            </Col>

            {emailSelected && (
              <Col md={6}>
                <Label className="form-label">
                  Send To <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  name="recipientType"
                  value={formData.recipientType || ""}
                  onChange={handleChange}
                  invalid={submitted && !formData.recipientType}
                >
                  <option value="">Select a recipient</option>
                  {RECIPIENT_OPTIONS.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      // Matter roles need a matter to resolve against.
                      disabled={
                        o.value !== "CUSTOM" && !formData.matterIdColumn
                      }
                    >
                      {o.display}
                    </option>
                  ))}
                </Input>
                <FormFeedback>Select who the email goes to.</FormFeedback>
                {!formData.matterIdColumn && formData.dateColumn && (
                  <div className="form-text text-warning">
                    This table is not matter scoped, so only a custom email can
                    be used.
                  </div>
                )}
              </Col>
            )}

            {emailSelected && customEmailSelected && (
              <Col md={12}>
                <Label className="form-label">
                  Custom Email <span className="text-danger">*</span>
                </Label>
                <Input
                  type="email"
                  name="customEmail"
                  value={formData.customEmail || ""}
                  onChange={handleChange}
                  invalid={submitted && !formData.customEmail?.trim()}
                />
                <FormFeedback>Email address is required.</FormFeedback>
              </Col>
            )}

            <Col md={12}>
              <div className="form-check">
                <Input
                  type="checkbox"
                  className="form-check-input"
                  id="notification-active"
                  name="isActive"
                  checked={!!formData.isActive}
                  onChange={handleChange}
                />
                <Label className="form-check-label" for="notification-active">
                  Active
                </Label>
              </div>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="light" type="button" onClick={close}>
            Cancel
          </Button>
          <Button color="success" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default NotificationForm;
