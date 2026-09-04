import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Input,
  Table,
} from "reactstrap";
import { toast } from "react-toastify";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import LoadingPage from "../../../utils/LoadingPage";
import {
  deleteNotificationDefinition,
  fetchNotificationDateFields,
  fetchNotificationDefinitions,
  generateNotifications,
} from "../../../apis";
import NotificationForm, {
  DELIVERY_OPTIONS,
  RECIPIENT_OPTIONS,
} from "./NotificationForm";

const displayOf = (options, value) =>
  options.find((o) => o.value === value)?.display || "-";

const NotificationList = () => {
  document.title = "Notifications | EdgeLegal";

  const [loading, setLoading] = useState(false);
  const [definitions, setDefinitions] = useState([]);
  const [dateFields, setDateFields] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("");
  const [fieldsError, setFieldsError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadDefinitions(), loadDateFields()]);
    setLoading(false);
  };

  const loadDefinitions = async () => {
    try {
      const { data } = await fetchNotificationDefinitions();

      if (data.success) {
        setDefinitions(data.data?.notificationDefinitionList || []);
      } else {
        toast.warning("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error("error", error);
      toast.warning("Something went wrong, please try later.");
    }
  };

  const loadDateFields = async () => {
    try {
      const { data } = await fetchNotificationDateFields();

      if (data.success) {
        setDateFields(data.data?.dateFieldList || []);
        setFieldsError("");
      } else {
        setFieldsError(
          data?.error?.message || "Could not load the list of date fields."
        );
      }
    } catch (error) {
      console.error("error", error);
      // Surface this: without it the picker is simply empty with no
      // explanation of why.
      setFieldsError(
        error?.response?.status === 404
          ? "The notifications API is not available. The backend may be running an older build."
          : "Could not load the list of date fields."
      );
    }
  };

  /**
   * Runs the generator now rather than waiting for the daily job. Safe to press
   * repeatedly - raising is deduplicated on (definition, source record, day).
   */
  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const { data } = await generateNotifications();

      if (data.success) {
        const raised = data.data || 0;

        if (raised > 0) {
          toast.success(
            `${raised} notification${raised === 1 ? "" : "s"} raised.`
          );
        } else {
          toast.info("No notifications were due today.");
        }
      } else {
        toast.error("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong, please try later.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (definition) => {
    setEditing(definition);
    setFormOpen(true);
  };

  const handleDelete = async (definition) => {
    if (
      !window.confirm(`Delete the alert "${definition.alertName}"?`)
    ) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await deleteNotificationDefinition(definition.id);

      if (data.success) {
        toast.success("Notification deleted");
        await loadDefinitions();
      } else {
        toast.error("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong, please try later.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = definitions.filter((d) => {
    if (!filter) {
      return true;
    }

    const needle = filter.toLowerCase();

    return (
      d.alertName?.toLowerCase().includes(needle) ||
      d.tableName?.toLowerCase().includes(needle) ||
      d.dateColumn?.toLowerCase().includes(needle)
    );
  });

  const recipientLabel = (definition) => {
    if (!definition.recipientType) {
      return "-";
    }

    if (definition.recipientType === "CUSTOM") {
      return definition.customEmail || "Custom Email";
    }

    return displayOf(RECIPIENT_OPTIONS, definition.recipientType);
  };

  // Positive is before the date, negative after.
  const daysPriorLabel = (days) => {
    if (days === 0) {
      return "On the day";
    }

    return days > 0 ? `${days} day(s) before` : `${Math.abs(days)} day(s) after`;
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Notifications" pageTitle="Notifications" />
        <Card>
          <CardHeader>
            <div className="d-flex align-items-center justify-content-between mx-2">
              <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                Notification Definitions
              </h5>
              <div className="d-flex align-items-center gap-2">
                <Input
                  type="text"
                  bsSize="sm"
                  placeholder="Search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <Button
                  color="soft-primary"
                  onClick={handleGenerate}
                  disabled={generating}
                  title="Raise any alerts due today without waiting for the daily job"
                >
                  {generating ? "Generating..." : "Generate Now"}
                </Button>
                <Button color="success" onClick={handleAdd}>
                  Add
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {fieldsError && (
              <div className="alert alert-warning" role="alert">
                {fieldsError}
              </div>
            )}
            <div className="table-responsive table-card">
              <Table className="align-middle table-nowrap mb-0" hover>
                <thead className="table-light">
                  <tr>
                    <th scope="col">Alert Name</th>
                    <th scope="col">Table</th>
                    <th scope="col">Date Field</th>
                    <th scope="col">When</th>
                    <th scope="col">Issued</th>
                    <th scope="col">Send To</th>
                    <th scope="col">Active</th>
                    <th scope="col" className="text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        No notifications defined yet.
                      </td>
                    </tr>
                  )}
                  {filtered.map((definition) => (
                    <tr key={definition.id}>
                      <td>
                        <span className="fw-medium">
                          {definition.alertName}
                        </span>
                        {definition.alertNote && (
                          <div className="text-muted fs-12 text-wrap">
                            {definition.alertNote}
                          </div>
                        )}
                      </td>
                      <td>{definition.tableName}</td>
                      <td>{definition.dateColumn}</td>
                      <td>{daysPriorLabel(definition.daysPrior)}</td>
                      <td>
                        {displayOf(
                          DELIVERY_OPTIONS,
                          definition.deliveryMethod
                        )}
                      </td>
                      <td>{recipientLabel(definition)}</td>
                      <td>
                        <span
                          className={`badge ${
                            definition.isActive
                              ? "bg-success-subtle text-success"
                              : "bg-light text-muted"
                          }`}
                        >
                          {definition.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-end">
                        <Button
                          color="soft-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(definition)}
                        >
                          <i className="ri-pencil-line" />
                        </Button>
                        <Button
                          color="soft-danger"
                          size="sm"
                          onClick={() => handleDelete(definition)}
                        >
                          <i className="ri-delete-bin-line" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>

        <NotificationForm
          isOpen={formOpen}
          close={() => setFormOpen(false)}
          refresh={loadDefinitions}
          dateFields={dateFields}
          editing={editing}
        />

        {loading && <LoadingPage />}
      </Container>
    </div>
  );
};

export default NotificationList;
