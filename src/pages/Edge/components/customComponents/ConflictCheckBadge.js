import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Table, Badge, Spinner } from "react-bootstrap";
import {
  MdWarning,
  MdCheckCircle,
  MdVisibility,
  MdBusiness,
  MdPerson,
  MdWork
} from "react-icons/md";
import { checkContactConflict } from "../../apis";

const ConflictCheckBadge = ({ name, style = {} }) => {
  const [loading, setLoading] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    const trimmedName = (name || "").trim();

    if (!trimmedName || trimmedName.length < 2) {
      setConflictData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await checkContactConflict(trimmedName);
        if (res?.data?.data) {
          setConflictData(res.data.data);
        } else if (res?.data) {
          setConflictData(res.data);
        } else {
          setConflictData(null);
        }
      } catch (err) {
        console.error("Conflict check error:", err);
        setConflictData(null);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [name]);

  if (!name || name.trim().length < 2) {
    return null;
  }

  const hasConflict = conflictData?.hasConflict && (conflictData?.matches?.length || 0) > 0;
  const totalMatches = conflictData?.matches?.length || 0;

  return (
    <div className="conflict-check-container mt-1 mb-2" style={style}>
      {loading ? (
        <span className="text-muted d-inline-flex align-items-center" style={{ fontSize: "0.82rem" }}>
          <Spinner animation="border" size="sm" className="me-1" style={{ width: "0.85rem", height: "0.85rem" }} />
          Checking for cross-office conflicts...
        </span>
      ) : hasConflict ? (
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Badge
            bg="warning"
            text="dark"
            className="d-inline-flex align-items-center px-2 py-1"
            style={{ fontSize: "0.82rem", cursor: "pointer", fontWeight: "600", borderRadius: "4px" }}
            onClick={() => setShowModal(true)}
            title="Click to view full conflict details"
          >
            <MdWarning className="me-1 text-danger" size={15} />
            Potential Conflict: {totalMatches} match{totalMatches > 1 ? "es" : ""} found across offices
          </Badge>
          <Button
            variant="link"
            size="sm"
            className="p-0 text-decoration-none"
            style={{ fontSize: "0.82rem", fontWeight: "500" }}
            onClick={() => setShowModal(true)}
          >
            <MdVisibility className="me-1" size={15} /> View Details
          </Button>
        </div>
      ) : conflictData && !loading ? (
        <span className="text-success d-inline-flex align-items-center" style={{ fontSize: "0.80rem" }}>
          <MdCheckCircle className="me-1" size={15} />
          No cross-office conflicts detected
        </span>
      ) : null}

      {/* Conflict Breakdown Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title className="h5 d-flex align-items-center text-danger mb-0">
            <MdWarning className="me-2 text-danger" size={20} />
            Conflict of Interest Check: &ldquo;{name}&rdquo;
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto", backgroundColor: "#f8f9fa" }}>
          <div className="alert alert-warning py-2 mb-3" style={{ fontSize: "0.85rem" }}>
            The following existing contacts and associated matters were identified across firm offices for your company. Please review prior matters and roles before proceeding.
          </div>

          {conflictData?.matches?.map((match, idx) => (
            <div key={idx} className="card mb-3 shadow-sm border-0">
              <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  {match.contactType === "ORGANISATION" ? (
                    <MdBusiness className="text-primary" size={18} />
                  ) : (
                    <MdPerson className="text-primary" size={18} />
                  )}
                  <strong style={{ fontSize: "0.92rem" }}>{match.displayName}</strong>
                  <Badge bg="secondary" style={{ fontSize: "0.72rem" }}>
                    {match.contactType}
                  </Badge>
                </div>
                <div>
                  {match.isCurrentSite ? (
                    <Badge bg="info" text="dark" style={{ fontSize: "0.75rem" }}>
                      Current Office ({match.siteName})
                    </Badge>
                  ) : (
                    <Badge bg="warning" text="dark" style={{ fontSize: "0.75rem" }}>
                      Other Office: {match.siteName}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="card-body py-2">
                <div className="row mb-2 text-muted" style={{ fontSize: "0.82rem" }}>
                  <div className="col-md-6">
                    <strong className="text-dark">Email:</strong> {match.email || "—"}
                  </div>
                  <div className="col-md-6">
                    <strong className="text-dark">Phone:</strong> {match.phone || "—"}
                  </div>
                </div>

                <div className="mt-2">
                  <span className="d-flex align-items-center gap-1 mb-1 font-weight-bold" style={{ fontSize: "0.82rem", fontWeight: "600" }}>
                    <MdWork className="text-secondary" size={15} /> Linked Matters ({match.linkedMatters?.length || 0}):
                  </span>
                  {match.linkedMatters && match.linkedMatters.length > 0 ? (
                    <Table striped bordered hover size="sm" className="mb-1" style={{ fontSize: "0.80rem" }}>
                      <thead className="table-light">
                        <tr>
                          <th>Matter #</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Role</th>
                          <th>Office</th>
                        </tr>
                      </thead>
                      <tbody>
                        {match.linkedMatters.map((m, mIdx) => (
                          <tr key={mIdx}>
                            <td><strong>{m.matterNumber || `ID: ${m.matterId}`}</strong></td>
                            <td>{m.type || "—"}</td>
                            <td>
                              <Badge bg={m.matterStatus === "OPEN" ? "success" : "secondary"}>
                                {m.matterStatus || "—"}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={m.role === "CLIENT" ? "primary" : "dark"}>
                                {m.role || "—"}
                              </Badge>
                              {m.isPrimaryContact && (
                                <span className="ms-1 text-primary" style={{ fontSize: "0.75rem" }}>(Primary)</span>
                              )}
                            </td>
                            <td>{m.siteName || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <span className="text-muted" style={{ fontSize: "0.80rem" }}>
                      No active or past matters currently linked to this contact.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer className="bg-light py-2">
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ConflictCheckBadge;
