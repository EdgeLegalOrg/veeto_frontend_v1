import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Badge,
  Table,
  Input,
  FormGroup,
  Label,
  Card,
  CardHeader,
  CardBody,
} from "reactstrap";
import { toast } from "react-toastify";
import {
  getMatterConflictReport,
  signOffMatterConflictReport,
} from "../../../apis";
import { formatDateTimeFunc } from "../../../utils/utilFunc";

const ConflictReportModal = ({ isOpen, toggle, matter, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionType, setActionType] = useState(null); // 'APPROVED' or 'DECLINED'
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");

  const loggedInUser = (() => {
    try {
      const u = JSON.parse(window.localStorage.getItem("userDetails"));
      if (u) {
        return `${u.firstName || ""} ${u.lastName || ""}`.trim();
      }
    } catch (e) {
      // ignore
    }
    return "Solicitor";
  })();

  const fetchReport = async () => {
    if (!matter?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getMatterConflictReport(matter.id);
      if (res?.data?.success && res.data.data) {
        setReportData(res.data.data);
      } else {
        setError(res?.data?.message || "Failed to generate conflict report.");
      }
    } catch (err) {
      console.error("Error fetching matter conflict report:", err);
      setError(
        err?.response?.data?.message ||
          "An error occurred while generating the conflict report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && matter?.id) {
      setNotes("");
      setActionType(null);
      fetchReport();
    } else {
      setReportData(null);
      setError(null);
    }
  }, [isOpen, matter?.id]);

  const handleSignOff = async (status) => {
    if (!matter?.id || submitting) return;
    setSubmitting(true);
    setActionType(status);
    try {
      const payload = {
        status,
        notes: notes.trim(),
      };
      const res = await signOffMatterConflictReport(matter.id, payload);
      if (res?.data?.success) {
        const actionLabel = status === "APPROVED" ? "approved" : "declined";
        toast.success(
          `Conflict report ${actionLabel} successfully and saved to matter attachments.`
        );
        if (onSuccess) {
          onSuccess(res.data.data);
        }
        toggle();
      } else {
        toast.error(
          res?.data?.message || `Failed to ${status.toLowerCase()} conflict report.`
        );
      }
    } catch (err) {
      console.error(`Error submitting conflict report sign-off (${status}):`, err);
      toast.error(
        err?.response?.data?.message ||
          `An error occurred while signing off the conflict report.`
      );
    } finally {
      setSubmitting(false);
      setActionType(null);
    }
  };

  const matterNumDisplay =
    reportData?.matterNumber || matter?.matterNumber || matter?.id;
  const matterTitleDisplay =
    reportData?.letterSubject || matter?.letterSubject || "";
  const solicitorName = reportData?.checkedBy || loggedInUser;
  const officeName = reportData?.siteName || "Firm Office";

  return (
    <Modal
      isOpen={isOpen}
      toggle={submitting ? undefined : toggle}
      size="xl"
      centered
      scrollable
      backdrop={submitting ? "static" : true}
    >
      <ModalHeader
        toggle={submitting ? undefined : toggle}
        className="bg-light py-3 border-bottom"
      >
        <div className="d-flex align-items-center gap-2">
          <i
            className="ri-shield-check-line text-primary"
            style={{ fontSize: "1.4rem" }}
          ></i>
          <div>
            <h5 className="mb-0 fw-semibold">
              Matter Conflict Report — Matter #{matterNumDisplay}
            </h5>
            {matterTitleDisplay && (
              <small className="text-muted">{matterTitleDisplay}</small>
            )}
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="p-4" style={{ backgroundColor: "#f9fafb" }}>
        {loading ? (
          <div className="text-center py-5 my-4">
            <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
            <h6 className="mt-3 text-muted fw-normal">
              Running cross-office conflict check for all matter contacts...
            </h6>
          </div>
        ) : error ? (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3">
            <div>
              <i className="ri-error-warning-line me-2 font-size-18 align-middle"></i>
              <span>{error}</span>
            </div>
            <Button
              color="danger"
              outline
              size="sm"
              onClick={fetchReport}
              disabled={loading}
            >
              Retry
            </Button>
          </div>
        ) : reportData ? (
          <div>
            {/* Executive Status Banner */}
            {reportData.hasAnyConflict ? (
              <div
                className="alert alert-warning border border-warning-subtle shadow-sm mb-4 d-flex align-items-start gap-3 p-3"
                style={{ borderRadius: "8px" }}
              >
                <div className="text-warning font-size-24">
                  <i className="ri-alert-line"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="alert-heading mb-1 text-dark fw-bold">
                    Potential Conflicts Detected ({reportData.totalConflictsCount})
                  </h6>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.88rem" }}>
                    The system identified {reportData.totalConflictsCount} cross-office
                    conflict match(es) across one or more contacts in this matter.
                    Please review each contact and prior matter details below before
                    proceeding with representation.
                  </p>
                </div>
                <Badge color="danger" className="px-2 py-1 font-size-12">
                  Action Required
                </Badge>
              </div>
            ) : (
              <div
                className="alert alert-success border border-success-subtle shadow-sm mb-4 d-flex align-items-start gap-3 p-3"
                style={{ borderRadius: "8px" }}
              >
                <div className="text-success font-size-24">
                  <i className="ri-checkbox-circle-line"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="alert-heading mb-1 text-dark fw-bold">
                    No Conflicts Detected
                  </h6>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.88rem" }}>
                    All {reportData.contacts?.length || 0} contact(s) associated with
                    this matter are clear of recorded adverse or opposing conflicts
                    across all firm offices.
                  </p>
                </div>
                <Badge color="success" className="px-2 py-1 font-size-12">
                  Clear
                </Badge>
              </div>
            )}

            {/* Matter Meta Information Strip */}
            <div className="bg-white rounded border p-3 mb-4 shadow-sm">
              <div className="row g-3 text-secondary" style={{ fontSize: "0.85rem" }}>
                <div className="col-sm-6 col-md-3">
                  <strong className="text-dark d-block">Office / Branch:</strong>
                  <span>{officeName}</span>
                </div>
                <div className="col-sm-6 col-md-3">
                  <strong className="text-dark d-block">Matter Type:</strong>
                  <span>{reportData.matterType || "—"}</span>
                </div>
                <div className="col-sm-6 col-md-3">
                  <strong className="text-dark d-block">Status:</strong>
                  <Badge color="info" className="font-size-11">
                    {reportData.matterStatus || "OPEN"}
                  </Badge>
                </div>
                <div className="col-sm-6 col-md-3">
                  <strong className="text-dark d-block">Generated At:</strong>
                  <span>
                    {formatDateTimeFunc(reportData.checkedAt) ||
                      new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Contacts & Conflicts Breakdown */}
            <h6 className="text-uppercase text-muted fw-bold mb-3 font-size-12 tracking-wide">
              Contact Analysis Breakdown ({reportData.contacts?.length || 0})
            </h6>

            {reportData.contacts && reportData.contacts.length > 0 ? (
              reportData.contacts.map((contact, idx) => (
                <Card
                  key={contact.contactId || idx}
                  className="mb-3 shadow-sm border"
                  style={{
                    borderColor: contact.hasConflict ? "#f8d7da" : "#e9ecef",
                  }}
                >
                  <CardHeader
                    className="d-flex justify-content-between align-items-center py-2 px-3"
                    style={{
                      backgroundColor: contact.hasConflict ? "#fff8f8" : "#ffffff",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <i
                        className={
                          contact.contactType === "ORGANISATION"
                            ? "ri-building-line text-primary font-size-18"
                            : "ri-user-line text-primary font-size-18"
                        }
                      ></i>
                      <span className="fw-bold text-dark font-size-14">
                        {contact.displayName || "Unnamed Contact"}
                      </span>
                      {contact.contactRole && (
                        <Badge color="primary" className="font-size-11">
                          {contact.contactRole}
                        </Badge>
                      )}
                      {contact.isPrimary && (
                        <Badge color="secondary" className="font-size-11">
                          Primary
                        </Badge>
                      )}
                      <Badge color="light" className="text-muted border font-size-11">
                        {contact.contactType || "INDIVIDUAL"}
                      </Badge>
                    </div>

                    <div>
                      {contact.hasConflict ? (
                        <Badge color="danger" className="px-2 py-1 font-size-12">
                          <i className="ri-error-warning-line me-1"></i>
                          Conflict Detected ({contact.conflictCount || contact.conflicts?.length || 0})
                        </Badge>
                      ) : (
                        <Badge color="success" className="px-2 py-1 font-size-12">
                          <i className="ri-check-line me-1"></i>
                          No conflict
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardBody className="p-3 bg-white">
                    {/* Contact contact information */}
                    {(contact.email || contact.phone) && (
                      <div
                        className="d-flex gap-3 text-muted mb-2"
                        style={{ fontSize: "0.82rem" }}
                      >
                        {contact.email && (
                          <span>
                            <i className="ri-mail-line me-1 align-middle"></i>
                            {contact.email}
                          </span>
                        )}
                        {contact.phone && (
                          <span>
                            <i className="ri-phone-line me-1 align-middle"></i>
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Conflict List */}
                    {contact.hasConflict &&
                    contact.conflicts &&
                    contact.conflicts.length > 0 ? (
                      <div className="mt-2">
                        <div
                          className="text-danger fw-semibold mb-2"
                          style={{ fontSize: "0.83rem" }}
                        >
                          <i className="ri-alert-line me-1 align-middle"></i>
                          Matching Matters / Conflict Records:
                        </div>
                        <div className="table-responsive">
                          <Table
                            bordered
                            hover
                            size="sm"
                            className="mb-0 align-middle"
                            style={{ fontSize: "0.82rem" }}
                          >
                            <thead className="table-light text-muted">
                              <tr>
                                <th style={{ width: "5%" }}>#</th>
                                <th style={{ width: "25%" }}>Office / Site</th>
                                <th style={{ width: "20%" }}>Matter #</th>
                                <th style={{ width: "20%" }}>Matter Type</th>
                                <th style={{ width: "15%" }}>Role in Matter</th>
                                <th style={{ width: "15%" }}>Matter Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {contact.conflicts.map((c, cIdx) => (
                                <tr key={cIdx}>
                                  <td className="text-center text-muted">
                                    {cIdx + 1}
                                  </td>
                                  <td>
                                    <span className="fw-medium">
                                      {c.siteName || "Firm Office"}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="fw-semibold text-primary">
                                      #{c.matterNumber || c.matterId}
                                    </span>
                                  </td>
                                  <td>{c.type || "—"}</td>
                                  <td>
                                    <Badge
                                      color="dark"
                                      className="font-size-11 px-2 py-1"
                                    >
                                      {c.role || "—"}
                                    </Badge>
                                    {c.isPrimaryContact && (
                                      <small className="ms-1 text-muted">
                                        (Primary)
                                      </small>
                                    )}
                                  </td>
                                  <td>
                                    <Badge
                                      color={
                                        c.matterStatus === "OPEN" ||
                                        c.matterStatus === "IN_PROGRESS"
                                          ? "warning"
                                          : "secondary"
                                      }
                                      className="font-size-11"
                                    >
                                      {c.matterStatus || "—"}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-success py-1 d-flex align-items-center gap-2"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <i className="ri-checkbox-circle-fill font-size-16"></i>
                        <span>No conflict.</span>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="alert alert-secondary text-center p-3">
                No contacts are currently linked to this matter.
              </div>
            )}

            {/* Digital Sign-off Details & Solicitor Notes */}
            <div className="bg-white border rounded p-3 mt-4 shadow-sm">
              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                <i className="ri-shield-user-line text-primary font-size-16"></i>
                Solicitor Digital Certification
              </h6>
              <div
                className="row g-2 mb-3 text-muted"
                style={{ fontSize: "0.84rem" }}
              >
                <div className="col-sm-6">
                  <strong className="text-dark">Certifying Solicitor:</strong>{" "}
                  <span>{solicitorName}</span>
                </div>
                <div className="col-sm-6">
                  <strong className="text-dark">Certifying Office:</strong>{" "}
                  <span>{officeName}</span>
                </div>
              </div>

              <FormGroup className="mb-1">
                <Label
                  for="solicitorNotes"
                  className="form-label fw-semibold text-dark font-size-13"
                >
                  Certification Notes / Rationale (Optional)
                </Label>
                <Input
                  type="textarea"
                  id="solicitorNotes"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter sign-off comments, client consent details, or conflict clearance notes..."
                  disabled={submitting}
                  style={{ fontSize: "0.85rem" }}
                />
              </FormGroup>
              <small className="text-muted d-block mt-2 font-size-12">
                <i className="ri-information-line me-1 align-middle"></i>
                Marking as <strong>Approve</strong> or <strong>Decline</strong> will
                digitally sign this report and automatically generate a formal PDF
                saved directly into this matter's <strong>Attachments</strong> section.
              </small>
            </div>
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter className="bg-light d-flex justify-content-between py-2 border-top">
        <div>
          <Button
            color="light"
            className="btn-outline-secondary"
            onClick={toggle}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            color="danger"
            onClick={() => handleSignOff("DECLINED")}
            disabled={loading || submitting || !!error || !reportData}
            className="d-flex align-items-center gap-1"
          >
            {submitting && actionType === "DECLINED" ? (
              <>
                <Spinner size="sm" className="me-1" />
                Declining & Saving...
              </>
            ) : (
              <>
                <i className="ri-close-circle-line font-size-15 align-middle"></i>
                Decline
              </>
            )}
          </Button>

          <Button
            color="success"
            onClick={() => handleSignOff("APPROVED")}
            disabled={loading || submitting || !!error || !reportData}
            className="d-flex align-items-center gap-1"
          >
            {submitting && actionType === "APPROVED" ? (
              <>
                <Spinner size="sm" className="me-1" />
                Approving & Saving...
              </>
            ) : (
              <>
                <i className="ri-checkbox-circle-line font-size-15 align-middle"></i>
                Approve
              </>
            )}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ConflictReportModal;
