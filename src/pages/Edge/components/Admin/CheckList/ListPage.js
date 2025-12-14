import React, { useState, useEffect } from "react";
import { deleteCheckList, getCheckList, getTaskList } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import AddCheckList from "./AddCheckList";
import "../../../stylesheets/CheckList.css";
import EditCheckList from "./EditCheckList";
import { AlertPopup } from "../../customComponents/CustomComponents";
import { toast } from "react-toastify";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Button,
  Table,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";

const ListPage = () => {
  document.title = "Check List | EdgeLegal";
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [task, setTask] = useState([]);
  const [checkList, setCheckList] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedList, setSelectedList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllTask = async () => {
    try {
      setLoading(true);
      const { data } = await getTaskList();
      if (data.success) {
        return data.data.taskList;
      } else {
        toast.error("Something went wrong please try later.");
        return false;
      }
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong please try later.");
      console.error(error);
    }
  };

  const openAddForm = async () => {
    if (task?.length <= 0) {
      let list = await fetchAllTask();

      if (list && list?.length > 0) {
        setTask(list);
        setAdd(true);
      }
      setLoading(false);
    } else {
      setAdd(true);
    }
  };

  const openEditForm = async () => {
    if (task?.length <= 0) {
      let list = await fetchAllTask();

      if (list && list?.length > 0) {
        setTask(list);
        setEdit(true);
      }
      setLoading(false);
    } else {
      setEdit(true);
      setLoading(false);
    }
  };

  const fetchList = async () => {
    try {
      const { data } = await getCheckList();
      if (data.success) {
        setCheckList(data.data.templateList);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, please try later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleClickRow = (id) => {
    setLoading(true);
    setSelectedList([id]);
    let data = checkList.filter((a) => a.id === id);
    setSelectedTemplate(data[0]);
    setTimeout(() => {
      openEditForm();
    }, 30);
  };

  const handleEdit = () => {
    if (selectedTemplate) {
      setEdit(true);
    } else {
      toast.warning("Please select one task");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelectedId = [];
      checkList.forEach((a) => {
        newSelectedId.push(a.id);
      });
      setSelectedTemplate(null);
      setSelectedList(newSelectedId);
    } else {
      setSelectedList([]);
      setSelectedTemplate(null);
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
      let data = checkList.filter((a) => a.id === newSelectedId[0]);
      if (data && data?.length > 0) {
        setSelectedTemplate(data[0]);
      }
    } else {
      setSelectedTemplate(null);
    }
    setSelectedList(newSelectedId);
  };

  const isSelected = (id) => selectedList.indexOf(id) !== -1;

  const handleDelete = async () => {
    setLoading(true);
    const ids = selectedList.join(",");
    try {
      const { data } = await deleteCheckList(ids);
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

  const handleCheckDelete = () => {
    if (selectedList && selectedList?.length > 0) {
      setDeleteAlert(true);
    } else {
      toast.warning("Please select atleast one record.");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Check List" pageTitle="Check List" />
        <Card>
          <CardHeader>
            <div className="d-flex align-items-center justify-content-between mx-2">
              <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                Check List
              </h5>
              <div className="d-flex align-items-center">
                <Button
                  className="d-flex mx-1"
                  onClick={openAddForm}
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
                        checkList?.length > 0 &&
                        selectedList?.length === checkList?.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>
                    <p className="mb-0">Checklist Title</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {checkList?.map((template) => (
                  <tr
                    key={template.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickRow(template.id);
                    }}
                    className="pe-cursor"
                  >
                    <td>
                      <Input
                        type="checkbox"
                        checked={isSelected(template.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleSelect(template.id)}
                      />
                    </td>
                    <td>
                      <p className="mb-0">{template.name}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
          {add && (
            <Modal
              isOpen={add}
              toggle={() => setAdd(false)}
              backdrop="static"
              scrollable={true}
              size="lg"
              centered
            >
              <ModalHeader
                toggle={() => setAdd(false)}
                className="bg-light p-3"
              >
                Add New Check List
              </ModalHeader>
              <ModalBody>
                <AddCheckList
                  data={task}
                  close={() => setAdd(false)}
                  refresh={fetchList}
                />
              </ModalBody>
            </Modal>
          )}
          {edit && (
            <Modal
              isOpen={edit}
              toggle={() => {
                setEdit(false);
                setSelectedTemplate(null);
                setSelectedList([]);
              }}
              backdrop="static"
              size="lg"
              centered
              scrollable={true}
            >
              <ModalHeader
                toggle={() => {
                  setEdit(false);
                  setSelectedTemplate(null);
                  setSelectedList([]);
                }}
                className="bg-light p-3"
              >
                Edit Check List
              </ModalHeader>
              <ModalBody>
                <EditCheckList
                  data={{ data: selectedTemplate, task: task }}
                  close={() => {
                    setEdit(false);
                    setSelectedTemplate(null);
                    setSelectedList([]);
                  }}
                  refresh={fetchList}
                />
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
          {loading && <LoadingPage />}
        </Card>
      </Container>
    </div>
  );
};

export default ListPage;
