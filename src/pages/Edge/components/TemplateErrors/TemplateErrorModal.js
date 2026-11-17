import React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "./TemplateErrorModal.css";

/** Actionable template feedback; React renders all server-provided text as plain text. */
const TemplateErrorModal = ({ errors = [], onClose }) => (
  <Modal isOpen={errors.length > 0} toggle={onClose} centered scrollable size="lg" zIndex={11000} className="template-error-modal">
    <ModalHeader toggle={onClose}>Template needs a correction</ModalHeader>
    <ModalBody>
      <p>We couldn’t process these merge fields. Please ask an administrator to correct the template and try again.</p>
      {errors.map((error, index) => (
        <section key={index} className="mb-3">
          <h6>{error.templateName || "Selected template"}</h6>
          <ul className="mb-2 ps-3">
            {(error.issues || []).map((issue, i) => (
              <li key={i} className="mb-3">
                <div className="fw-semibold">{issue.reason}</div>
                <div className="small text-muted">{issue.location}</div>
                {issue.field && <code className="d-block my-1">{issue.field}</code>}
                <div>{issue.correction}</div>
                {issue.context && (
                  <details className="small mt-1">
                    <summary>Nearby text</summary>
                    <p className="mt-1 mb-0">{issue.context}</p>
                  </details>
                )}
              </li>
            ))}
          </ul>
          {error.reference && <small className="text-muted">Reference: {error.reference}</small>}
        </section>
      ))}
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={onClose}>
        Close
      </Button>
    </ModalFooter>
  </Modal>
);
export default TemplateErrorModal;
