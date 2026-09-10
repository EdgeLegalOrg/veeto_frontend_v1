import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Table,
} from "reactstrap";
import classnames from "classnames";
import { toast } from "react-toastify";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import LoadingPage from "../../../utils/LoadingPage";
import {
  fetchActiveSessions,
  fetchSessionHistory,
  forceLogoutAllUsers,
} from "../../../apis";
import { checkHasPermission, formatDateFunc } from "../../../utils/utilFunc";
import { LOGOFFALLUSERS } from "../../../utils/RightConstants";

// Long enough to be current without hammering the server.
const REFRESH_MS = 60 * 1000;

const END_REASON = {
  LOGOUT: { label: "Logged out", badge: "bg-secondary-subtle text-secondary" },
  TIMEOUT: { label: "Timed out", badge: "bg-warning-subtle text-warning" },
  EXPIRED: { label: "Expired", badge: "bg-light text-muted" },
  FORCED: { label: "Forced off", badge: "bg-danger-subtle text-danger" },
};

const formatDateTime = (value) =>
  formatDateFunc(value, "DD-MM-YYYY h:mm A") || "-";

const formatDuration = (minutes) => {
  if (minutes == null) {
    return "-";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const LoggedInUsers = () => {
  document.title = "Logged In Users | Veeto";

  const [tab, setTab] = useState("active");
  const [sessions, setSessions] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [forcing, setForcing] = useState(false);

  // Hiding the button keeps it from being pressed by accident. The server
  // checks the same right, because a hidden button is not a permission.
  const canForceLogout = checkHasPermission(LOGOFFALLUSERS);

  const load = useCallback(
    async (which, quiet) => {
      if (!quiet) {
        setLoading(true);
      }

      try {
        const { data } =
          which === "active"
            ? await fetchActiveSessions()
            : await fetchSessionHistory();

        if (data.success) {
          setSessions(data.data?.sessionList || []);
          setActiveCount(data.data?.activeCount || 0);
        } else {
          toast.warning("Something went wrong, please try later.");
        }
      } catch (error) {
        console.error("error", error);
        toast.warning("Something went wrong, please try later.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  // Only the active list is worth polling; history does not move on its own.
  useEffect(() => {
    if (tab !== "active") {
      return undefined;
    }

    const timer = setInterval(() => load("active", true), REFRESH_MS);

    return () => clearInterval(timer);
  }, [tab, load]);

  const handleForceLogout = async () => {
    setForcing(true);

    try {
      const { data } = await forceLogoutAllUsers();

      if (data.success) {
        const closed = data.data || 0;

        toast.success(
          closed === 0
            ? "Nobody else was logged in."
            : `Logged ${closed} ${closed === 1 ? "user" : "users"} off.`
        );

        setConfirmOpen(false);
        load("active");
      } else {
        toast.error(
          data.error?.message || "You do not have permission to do that."
        );
      }
    } catch (error) {
      console.error("error", error);
      toast.warning("Something went wrong, please try later.");
    } finally {
      setForcing(false);
    }
  };

  const filtered = sessions.filter((s) => {
    if (!filter) {
      return true;
    }

    const needle = filter.toLowerCase();

    return (
      s.username?.toLowerCase().includes(needle) ||
      s.staffName?.toLowerCase().includes(needle) ||
      s.siteName?.toLowerCase().includes(needle) ||
      s.ipAddress?.toLowerCase().includes(needle)
    );
  });

  const showingHistory = tab === "history";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Logged In Users" pageTitle="Logged In Users" />
        <Card>
          <CardHeader>
            <div className="d-flex align-items-center justify-content-between mx-2">
              <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                {showingHistory ? "Session History" : "Logged In Now"}
                {!showingHistory && (
                  <span className="badge bg-success-subtle text-success ms-2">
                    {activeCount}
                  </span>
                )}
              </h5>
              <div className="d-flex align-items-center gap-2">
                <Input
                  type="text"
                  bsSize="sm"
                  placeholder="Search user, site or IP"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                {canForceLogout && (
                  <Button
                    color="danger"
                    size="sm"
                    className="text-nowrap"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <i className="ri-logout-box-r-line align-bottom me-1" />
                    Log All Users Off
                  </Button>
                )}
                <Button
                  color="light"
                  size="sm"
                  onClick={() => load(tab)}
                  title="Refresh"
                >
                  <i className="ri-refresh-line" />
                </Button>
              </div>
            </div>

            <Nav tabs className="nav-tabs-custom mt-3 mb-0">
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: tab === "active" })}
                  onClick={() => setTab("active")}
                >
                  Logged In Now
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({ active: tab === "history" })}
                  onClick={() => setTab("history")}
                >
                  History
                </NavLink>
              </NavItem>
            </Nav>
          </CardHeader>
          <CardBody>
            {!showingHistory && (
              <div className="alert alert-info" role="alert">
                A session stays listed until the user logs out, their session
                times out, or their token lapses and the periodic sweep closes
                it. Someone who simply closed their browser will show here until
                that happens.
              </div>
            )}

            <div className="table-responsive table-card">
              <Table className="align-middle table-nowrap mb-0" hover>
                <thead className="table-light">
                  <tr>
                    <th scope="col">User</th>
                    <th scope="col">Staff Member</th>
                    <th scope="col">Site</th>
                    <th scope="col" style={{ width: "140px" }}>
                      IP Address
                    </th>
                    <th scope="col" style={{ width: "180px" }}>
                      Logged In
                    </th>
                    {showingHistory && (
                      <th scope="col" style={{ width: "180px" }}>
                        Ended
                      </th>
                    )}
                    <th scope="col" style={{ width: "120px" }}>
                      Duration
                    </th>
                    <th scope="col" style={{ width: "130px" }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={showingHistory ? 8 : 7} className="text-center py-4">
                        {showingHistory
                          ? "No sessions recorded yet."
                          : "Nobody is logged in."}
                      </td>
                    </tr>
                  )}
                  {filtered.map((session) => {
                    const reason = END_REASON[session.endReason];

                    return (
                      <tr key={session.id}>
                        <td className="fw-medium">{session.username || "-"}</td>
                        <td>{session.staffName || "-"}</td>
                        <td>{session.siteName || "-"}</td>
                        <td className="font-monospace fs-13">
                          {session.ipAddress || "-"}
                        </td>
                        <td>{formatDateTime(session.loginAt)}</td>
                        {showingHistory && (
                          <td>{formatDateTime(session.endedAt)}</td>
                        )}
                        <td>{formatDuration(session.durationMinutes)}</td>
                        <td>
                          {session.active ? (
                            <span className="badge bg-success-subtle text-success">
                              Logged in
                            </span>
                          ) : (
                            <span
                              className={`badge ${reason?.badge || "bg-light text-muted"}`}
                            >
                              {reason?.label || session.endReason || "Ended"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>

        <Modal isOpen={confirmOpen} toggle={() => setConfirmOpen(!confirmOpen)} centered>
          <ModalHeader toggle={() => setConfirmOpen(false)}>
            Log all users off
          </ModalHeader>
          <ModalBody>
            <p className="mb-2">
              This ends every open session in your company except your own.
            </p>
            <p className="text-muted fs-13 mb-2">
              Anyone working at the time is returned to the login page and loses
              anything they had not saved. They can sign back in straight away —
              this does not disable any account.
            </p>
            <p className="text-muted fs-13 mb-0">
              It takes up to 15 seconds to take effect, because the check is
              cached rather than run against the database on every request.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="light"
              onClick={() => setConfirmOpen(false)}
              disabled={forcing}
            >
              Cancel
            </Button>
            <Button color="danger" onClick={handleForceLogout} disabled={forcing}>
              {forcing ? "Logging off..." : "Log All Users Off"}
            </Button>
          </ModalFooter>
        </Modal>

        {loading && <LoadingPage />}
      </Container>
    </div>
  );
};

export default LoggedInUsers;
