import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Input,
  Nav,
  NavItem,
  NavLink,
  Table,
} from "reactstrap";
import classnames from "classnames";
import { toast } from "react-toastify";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import LoadingPage from "../../../utils/LoadingPage";
import { fetchActiveSessions, fetchSessionHistory } from "../../../apis";
import { formatDateFunc } from "../../../utils/utilFunc";

// Long enough to be current without hammering the server.
const REFRESH_MS = 60 * 1000;

const END_REASON = {
  LOGOUT: { label: "Logged out", badge: "bg-secondary-subtle text-secondary" },
  TIMEOUT: { label: "Timed out", badge: "bg-warning-subtle text-warning" },
  EXPIRED: { label: "Expired", badge: "bg-light text-muted" },
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

  const filtered = sessions.filter((s) => {
    if (!filter) {
      return true;
    }

    const needle = filter.toLowerCase();

    return (
      s.username?.toLowerCase().includes(needle) ||
      s.staffName?.toLowerCase().includes(needle) ||
      s.siteName?.toLowerCase().includes(needle)
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
                  placeholder="Search user or site"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
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
                      <td colSpan={showingHistory ? 7 : 6} className="text-center py-4">
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

        {loading && <LoadingPage />}
      </Container>
    </div>
  );
};

export default LoggedInUsers;
