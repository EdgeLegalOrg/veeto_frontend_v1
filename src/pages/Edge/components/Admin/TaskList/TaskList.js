import React, { useState, useEffect } from "react";
import { deleteTask, getTaskList } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { AlertPopup } from "../../customComponents/CustomComponents";
import AddTaskList from "./AddTaskList";
import EditTask from "./EditTaskList";
import { toast } from "react-toastify";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Button,
  Table,
  Form,
  Row,
  Col,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";

const TaskList = (props) => {
  document.title = "Task List | EdgeLegal";
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedList, setSelectedList] = useState([]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const { data } = await getTaskList();
      if (data && data.success) {
        setList(data?.data?.taskList);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("error", error);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleClose = () => {
    setAdd(false);
    setSelectedTask(null);
    setSelectedList([]);
  };

  const isSelected = (id) => selectedList.indexOf(id) !== -1;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelectedId = [];
      list.forEach((a) => {
        newSelectedId.push(a.id);
      });
      setSelectedTask(null);
      setSelectedList(newSelectedId);
    } else {
      setSelectedList([]);
      setSelectedTask(null);
    }
  };

  const handleSelect = (id) => {
    const selectedIndex = selectedList.indexOf(id);
    let newSelectedId = [];
    if (selectedIndex === -1) {
      newSelectedId = newSelectedId.concat(selectedList, id);
    } else if (selectedIndex === 0) {
      newSelectedId = newSelectedId.concat(selectedList.slice(1));
    } else if (selectedIndex === selectedList?.length - 1) {
      newSelectedId = newSelectedId.concat(selectedList.slice(0, -1));
    } else {
      newSelectedId = newSelectedId.concat(
        selectedList.slice(0, selectedIndex),
        selectedList.slice(selectedIndex + 1)
      );
    }
    if (newSelectedId?.length === 1) {
      let data = list.filter((a) => a.id === newSelectedId[0]);
      if (data && data?.length > 0) {
        setSelectedTask(data[0]);
      }
    } else {
      setSelectedTask(null);
    }
    setSelectedList(newSelectedId);
  };

  const handleDelete = async () => {
    setLoading(true);
    const ids = selectedList.join(",");
    try {
      const { data } = await deleteTask(ids);
      if (data.success) {
        await fetchList();
        setTimeout(() => {
          setSelectedList([]);
        }, 10);
      } else {
        let msg = data?.error?.message
          ? data.error.message
          : "Something went wrong please try later.";
        toast.error(msg);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleClickRow = (id) => {
    setLoading(true);
    setSelectedList([id]);
    let data = list.filter((a) => a.id === id);
    setSelectedTask(data[0]);
    setTimeout(() => {
      setEdit(true);
      setLoading(false);
    }, 30);
  };

  const handleEdit = () => {
    if (selectedTask) {
      setEdit(true);
    } else {
      toast.error("Please select one task");
    }
  };

  const handleCheckDelete = () => {
    if (selectedList && selectedList?.length > 0) {
      setDeleteAlert(true);
    } else {
      toast.error("Please select atleast one record.");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Task List" pageTitle="Task List" />

        <Card>
          <CardHeader>
            <div className="d-flex align-items-center justify-content-between py-2 mx-2">
              <h5 className="mb-0">Task List</h5>
              <div className="d-flex">
                <Button
                  className="d-flex mx-1"
                  onClick={() => setAdd(true)}
                  color="success"
                >
                  <span className="plusdiv">+</span> Add
                </Button>
                <Button
                  className="d-flex mx-1"
                  onClick={handleEdit}
                  color="warning"
                >
                  Edit
                </Button>
                <Button
                  className="d-flex mx-1"
                  onClick={handleCheckDelete}
                  color="danger"
                >
                  <span className="plusdiv">-</span> Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Table responsive={true} striped={true} hover={true}>
              <thead className="mb-2 bg-light">
                <tr>
                  <th>
                    <Input
                      type="checkbox"
                      checked={
                        list?.length > 0 &&
                        selectedList?.length === list?.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>
                    <p className="mb-0">Task Title</p>
                  </th>
                  {/* <div className="mc-col xlg">
                    <p>Description</p>
                  </div> */}
                </tr>
              </thead>
              <tbody>
                {list?.map((task) => (
                  <tr
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickRow(task.id);
                    }}
                    className="pe-cursor"
                  >
                    <td>
                      <Input
                        type="checkbox"
                        checked={isSelected(task.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleSelect(task.id)}
                      />
                    </td>
                    <td>
                      <p className="mb-0">{task.title}</p>
                    </td>
                    {/* <div className="mc-col xlg">
                        <p>{task.description}</p>
                      </div> */}
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>

          {add && (
            <Modal
              isOpen={add}
              toggle={handleClose}
              backdrop="static"
              scrollable={true}
              size="lg"
              centered
            >
              <ModalHeader toggle={handleClose} className="bg-light p-3">
                Add new Task
              </ModalHeader>
              <ModalBody>
                <AddTaskList close={handleClose} refresh={fetchList} />
              </ModalBody>
            </Modal>
          )}

          {deleteAlert && (
            <Modal
              isOpen={deleteAlert}
              toggle={() => setDeleteAlert(false)}
              backdrop="static"
              scrollable={true}
              size="md"
              centered
            >
              <ModalHeader
                toggle={() => setDeleteAlert(false)}
                className="bg-light p-3"
              >
                Confirm Your Action
              </ModalHeader>
              <ModalBody>
                <AlertPopup
                  message="Are you sure you want to delete the record?"
                  heading="Confirm Your Action"
                  closeForm={() => setDeleteAlert(false)}
                  btn1={"No"}
                  btn2="Yes"
                  handleFunc={handleDelete}
                />
              </ModalBody>
            </Modal>
          )}

          {edit && (
            <Modal
              isOpen={edit}
              toggle={() => {
                setEdit(false);
                setSelectedTask(null);
                setSelectedList([]);
              }}
              backdrop="static"
              scrollable={true}
              size="lg"
              centered
            >
              <ModalHeader
                toggle={() => {
                  setEdit(false);
                  setSelectedTask(null);
                  setSelectedList([]);
                }}
                className="bg-light p-3"
              >
                Edit new Task
              </ModalHeader>
              <ModalBody>
                <EditTask
                  close={() => {
                    setEdit(false);
                    setSelectedTask(null);
                    setSelectedList([]);
                  }}
                  data={selectedTask}
                  refresh={fetchList}
                />
              </ModalBody>
            </Modal>
          )}

          {loading && <LoadingPage />}
        </Card>
      </Container>
    </div>
  );
};

export default TaskList;
