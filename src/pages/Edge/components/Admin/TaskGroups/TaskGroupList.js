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
  API_BASE_URL,
  deleteChecklistTaskGroup,
  fetchChecklistTaskGroups,
} from "../../../apis";
import TaskGroupForm from "./TaskGroupForm";

const TaskGroupList = () => {
  document.title = "Task Groups | Veeto";

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);

    try {
      const { data } = await fetchChecklistTaskGroups();

      if (data.success) {
        setGroups(data.data?.taskGroupList || []);
        setLoadError("");
      } else {
        setLoadError(
          data?.error?.message || "Could not load the task groups."
        );
      }
    } catch (error) {
      console.error("error", error);
      setLoadError(
        error?.response?.status === 404
          ? "The task group API is not available. The backend may be running an older build."
          : "Could not load the task groups."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (group) => {
    setEditing(group);
    setFormOpen(true);
  };

  const handleDelete = async (group) => {
    // Tasks pointing at a deleted group fall back to the Ungrouped card rather
    // than disappearing, so this is recoverable by reassigning them.
    if (
      !window.confirm(
        `Delete the task group "${group.title}"? Its tasks will show as Ungrouped.`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await deleteChecklistTaskGroup(group.id);

      if (data.success) {
        toast.success("Task group deleted");
        await loadGroups();
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

  const filtered = groups.filter((g) => {
    if (!filter) {
      return true;
    }

    const needle = filter.toLowerCase();

    return (
      g.title?.toLowerCase().includes(needle) ||
      g.description?.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Task Groups" pageTitle="Task Groups" />
        <Card>
          <CardHeader>
            <div className="d-flex align-items-center justify-content-between mx-2">
              <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                Workflow Task Groups
              </h5>
              <div className="d-flex align-items-center gap-2">
                <Input
                  type="text"
                  bsSize="sm"
                  placeholder="Search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <Button color="success" onClick={handleAdd}>
                  Add
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {loadError && (
              <div className="alert alert-warning" role="alert">
                {loadError}
              </div>
            )}

            <div className="alert alert-info" role="alert">
              Groups are shared across all matters. The tasks completed and next
              due date shown on a group card are worked out per matter.
            </div>

            <div className="table-responsive table-card">
              <Table className="align-middle table-nowrap mb-0" hover>
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: "70px" }}>
                      Icon
                    </th>
                    <th scope="col">Title</th>
                    <th scope="col">Description</th>
                    <th scope="col" style={{ width: "120px" }}>
                      Order
                    </th>
                    <th scope="col" style={{ width: "110px" }} className="text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        No task groups defined yet.
                      </td>
                    </tr>
                  )}
                  {filtered.map((group) => (
                    <tr key={group.id}>
                      <td>
                        <div className="avatar-xs">
                          {group.iconUrl ? (
                            <img
                              src={`${API_BASE_URL}${group.iconUrl}`}
                              alt=""
                              className="img-fluid rounded-circle"
                            />
                          ) : (
                            <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                              <i className="ri-list-check-2" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="fw-medium">{group.title}</td>
                      <td className="text-wrap text-muted">
                        {group.description || "-"}
                      </td>
                      <td>{group.displayOrder ?? 0}</td>
                      <td className="text-end">
                        <Button
                          color="soft-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(group)}
                        >
                          <i className="ri-pencil-line" />
                        </Button>
                        <Button
                          color="soft-danger"
                          size="sm"
                          onClick={() => handleDelete(group)}
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

        <TaskGroupForm
          isOpen={formOpen}
          close={() => setFormOpen(false)}
          refresh={loadGroups}
          editing={editing}
        />

        {loading && <LoadingPage />}
      </Container>
    </div>
  );
};

export default TaskGroupList;
