import React, { useEffect, useRef, useState } from "react";
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
import { API_BASE_URL, saveChecklistTaskGroup } from "pages/Edge/apis";

const initialState = {
  title: "",
  description: "",
  displayOrder: 0,
};

const MAX_ICON_BYTES = 1024 * 1024;

const ACCEPTED_ICON_TYPES = ["image/png", "image/jpeg", "image/gif", "image/svg+xml"];

const TaskGroupForm = (props) => {
  const { isOpen, close, refresh, editing } = props;
  const [formData, setFormData] = useState(initialState);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(editing ? { ...initialState, ...editing } : initialState);
      setIconFile(null);
      setIconPreview("");
      setSubmitted(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, editing]);

  // Object URLs for the local preview have to be released or they leak.
  useEffect(() => {
    return () => {
      if (iconPreview) {
        URL.revokeObjectURL(iconPreview);
      }
    };
  }, [iconPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setIconFile(null);
      setIconPreview("");
      return;
    }

    if (!ACCEPTED_ICON_TYPES.includes(file.type)) {
      toast.error("Icon must be a PNG, JPEG, GIF or SVG image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_ICON_BYTES) {
      toast.error("Icon must be 1MB or smaller.");
      e.target.value = "";
      return;
    }

    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const isValid = () =>
    !!formData.title.trim() &&
    formData.displayOrder !== "" &&
    !isNaN(Number(formData.displayOrder));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isValid()) {
      return;
    }

    setSaving(true);

    try {
      const { data } = await saveChecklistTaskGroup(
        {
          id: editing?.id,
          title: formData.title,
          description: formData.description,
          displayOrder: Number(formData.displayOrder),
        },
        iconFile
      );

      if (data.success) {
        toast.success(editing?.id ? "Task group updated" : "Task group added");

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

  // Show the newly chosen file if there is one, otherwise whatever is stored.
  const currentIcon =
    iconPreview || (editing?.iconUrl ? `${API_BASE_URL}${editing.iconUrl}` : "");

  return (
    <Modal isOpen={isOpen} toggle={close} centered>
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={close}>
          {editing?.id ? "Edit Task Group" : "Add Task Group"}
        </ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col md={12}>
              <Label className="form-label">
                Title <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={255}
                invalid={submitted && !formData.title.trim()}
              />
              <FormFeedback>Title is required.</FormFeedback>
            </Col>

            <Col md={12}>
              <Label className="form-label">Description</Label>
              <Input
                type="textarea"
                name="description"
                rows={3}
                maxLength={2000}
                value={formData.description || ""}
                onChange={handleChange}
              />
              <div className="form-text">
                Shown under the group title on the Workflow tab.
              </div>
            </Col>

            <Col md={4}>
              <Label className="form-label">Display Order</Label>
              <Input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
              />
              <div className="form-text">Lowest first.</div>
            </Col>

            <Col md={8}>
              <Label className="form-label">Icon</Label>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-sm flex-shrink-0">
                  {currentIcon ? (
                    <img
                      src={currentIcon}
                      alt=""
                      className="img-fluid rounded-circle"
                    />
                  ) : (
                    <div className="avatar-title bg-light rounded-circle fs-20 text-primary">
                      <i className="ri-list-check-2" />
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  innerRef={fileInputRef}
                  accept={ACCEPTED_ICON_TYPES.join(",")}
                  onChange={handleIconChange}
                />
              </div>
              <div className="form-text">
                PNG, JPEG, GIF or SVG, up to 1MB.
                {editing?.id ? " Leave empty to keep the current icon." : ""}
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

export default TaskGroupForm;
