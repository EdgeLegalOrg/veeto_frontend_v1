import React, { useState, useEffect, Fragment } from "react";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { editCheckList } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import CustomSideDrawer from "../../customComponents/CustomSideDrawer";
import { toast } from "react-toastify";
import { Input, Button, Table } from "reactstrap";
import { TextInputField } from "pages/Edge/components/InputField";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

const initialState = {
  name: "",
  templateTaskList: [],
};

const EditCheckList = (props) => {
  const [taskList, setTaskList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSelectedSubtask, setShowSelectedSubtask] = useState([]);

  const setAllData = (arg) => {
    setTaskList(arg?.task);
    setTimeout(() => {
      setFormData(arg?.data);
      setSelected(arg?.data?.templateTaskList);
    }, 10);
  };

  useEffect(() => {
    if (props.data) {
      setAllData(props.data);
    }
  }, [props.data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelect = (arg) => {
    let index = -1;
    let newArr = [];
    for (let a in selected) {
      if (selected[a].taskId === arg.id) {
        index = a;
        break;
      }
    }

    if (index >= 0) {
      newArr = newArr.concat(
        selected.slice(0, index),
        selected.slice(index + 1)
      );
    } else {
      newArr = [...selected];
      newArr.push({ taskId: arg.id, mandatory: false });
    }

    setSelected(newArr);
  };

  const isSelected = (id) => {
    for (let i in selected) {
      if (selected[i].taskId === id) {
        return true;
      }
    }

    return false;
  };

  const handleRequired = (arg) => {
    let index = -1;
    let newArr = [...selected];
    for (let a in selected) {
      if (selected[a].taskId === arg.id) {
        index = a;
        break;
      }
    }

    if (index >= 0) {
      newArr[index].mandatory = !newArr[index].mandatory;
    } else {
      newArr.push({ taskId: arg.id, mandatory: true });
    }

    setSelected(newArr);
  };

  const isRequired = (id) => {
    for (let i in selected) {
      if (selected[i].taskId === id && selected[i].mandatory) {
        return true;
      }
    }

    return false;
  };

  const handleSubmit = async () => {
    if (!selected.length) {
      return;
    }

    let newData = {
      ...formData,
      templateTaskList: selected,
    };

    if (!newData.name) {
      return setSubmitted(true);
      // toast.warning("Checklist Name is Required!");
    } else if (newData?.templateTaskList?.length <= 0) {
      toast.warning("Please add any task.");
    } else {
      setLoading(true);
      try {
        const { data } = await editCheckList(newData);
        if (data.success) {
          if (props.refresh) {
            props.refresh();
          }

          setTimeout(() => {
            if (props.close) {
              props.close();
            }
          });
        } else {
          toast.error("Something went wrong please try later.");
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        toast.error("Something went wrong please try later.");
      }
    }
  };

  const expandOrCollapse = (task) => {
    if (task.subTaskList && task.subTaskList.length > 0) {
      return showSelectedSubtask.includes(task.id) ? (
        <MdExpandLess size={26} />
      ) : (
        <MdExpandMore size={26} />
      );
    } else {
      return "";
    }
  };

  const handleShowSubtask = (task) => {
    const { id, subTaskList } = task;
    if (!subTaskList.length) {
      return;
    }

    let alreadySelected = showSelectedSubtask.includes(id);

    if (alreadySelected) {
      let newSelected = showSelectedSubtask.filter((s) => s !== id);
      setShowSelectedSubtask(newSelected);
    } else {
      setShowSelectedSubtask([...showSelectedSubtask, id]);
    }
  };

  const findTask = (id) => {
    if (taskList && taskList?.length > 0) {
      let task = taskList?.find((a) => a.id === id);
      return task;
    } else {
      return {};
    }
  };

  const handleCloseDrawer = () => {
    setDrawer(false);
  };

  const drawerBody = () => {
    return taskList.map((task) => (
      <div className="task-list-row pe-cursor" key={task.id}>
        <div className="task-detail" onClick={() => handleSelect(task)}>
          <Input
            type="checkbox"
            className="cp"
            checked={isSelected(task.id)}
            onClick={() => {}}
            onChange={() => {}}
          />
          <label className="cp">{task.title}</label>
        </div>
      </div>
    ));
  };

  const swap = (index, type) => {
    let arr = [...selected];

    if (type === "up") {
      let temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
    } else {
      let temp = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = temp;
    }

    setSelected(arr);
  };

  const sequence = (index) => {
    return (
      <div className="ac">
        {index > 0 && (
          <AiOutlineArrowUp
            size={25}
            className="cp"
            onClick={() => swap(index, "up")}
          />
        )}
        <p className="sls-label mr-tb10">{index + 1}</p>
        {index >= 0 && index < selected?.length - 1 && (
          <AiOutlineArrowDown
            size={25}
            className="cp"
            onClick={() => swap(index, "down")}
          />
        )}
      </div>
    );
  };

  const showSelectedTask = () => {
    if (selected && selected?.length > 0) {
      return selected.map((task, i) => {
        let t = findTask(task.taskId);
        if (t) {
          return (
            <Fragment key={`selected-${t.id}`}>
              <tr className="pe-cursor">
                <td>{sequence(i)}</td>
                {/* <td>
              <Input
                type='checkbox'
                checked={isRequired(t.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequired(t);
                }}
                onChange={() => {}}
              />
            </td> */}
                <td>{t.title}</td>
                {/* <td
                  onClick={(e) => {
                    e.preventDefault();
                    handleShowSubtask(t);
                  }}
                >
                  {expandOrCollapse(t)}
                </td> */}
              </tr>
              {/* {t.subTaskList?.length && showSelectedSubtask.includes(t.id) ? (
                <>
                  <tr className='bg-light' style={{ pointerEvents: 'none' }}>
                    <th></th>
                    <th className='font-bold fs-13'>Subtasks</th>
                    <th></th>
                  </tr>
                  {t.subTaskList?.map((sub) => (
                    <tr class='fs-12'>
                      <td></td>
                      <td>
                        {sub.description
                          ? `${sub.description} (${
                              sub.mandatory ? 'required' : 'optional'
                            })`
                          : 'NA'}
                      </td>
                      <td></td>
                    </tr>
                  ))}
                </>
              ) : null} */}
            </Fragment>
          );
        } else {
          return null;
        }
      });
    } else {
      return <></>;
    }
  };

  return (
    <div>
      {/* <CustomToastWindow
        closeForm={props.close}
        btn1={"Cancel"}
        btn2="Update"
        heading="Edit Check List"
        handleFunc={handleSubmit}
        autoClose={false}
      > */}

      <div className="row p-2">
        <div className="col-md-8">
          <TextInputField
            name="name"
            autoComplete="off"
            label="Checklist Title"
            value={formData.name}
            onChange={handleChange}
            required={true}
            invalid={!formData.name && submitted}
            invalidMessage={"Checklist Title is required"}
            // maxLength={fieldLength['companyName'.toLowerCase()]}
          />
        </div>
        <div className="col-md-4"></div>
      </div>

      <div className="row mt-3 px-2">
        <div className="d-flex align-items-center justify-content-between">
          <h5> Tasks</h5>
          <Button className="d-flex" onClick={() => setDrawer(true)}>
            <span className="plusdiv">+</span>Add
          </Button>
        </div>
      </div>

      <div className="row mt-3">
        <Table responsive={true} striped={true} hover={true}>
          <thead>
            {selected && selected?.length > 0 ? (
              <tr>
                <th>
                  <p className="m-0">#</p>
                </th>
                {/* <th>
                  <p className='m-0'>Required</p>
                </th> */}
                <th>
                  <p className="m-0">Task title</p>
                </th>
              </tr>
            ) : (
              <tr className="text-center">No Task Selected</tr>
            )}
          </thead>
          <tbody>{showSelectedTask()}</tbody>
        </Table>
      </div>

      {drawer && (
        <CustomSideDrawer
          active={drawer}
          onClose={handleCloseDrawer}
          heading={"Select Tasks"}
          body={drawerBody}
        />
      )}

      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button className="mx-1" color="danger" onClick={props.close}>
          Cancel
        </Button>
        <Button className="mx-1" color="success" onClick={handleSubmit}>
          Submit
        </Button>
      </div>

      {/* </CustomToastWindow> */}

      {loading && <LoadingPage />}
    </div>
  );
};

export default EditCheckList;
