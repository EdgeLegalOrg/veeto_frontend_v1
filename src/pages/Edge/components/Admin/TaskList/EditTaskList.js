import React, { useState, Fragment, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import LoadingPage from "../../../utils/LoadingPage";
import { editTask } from "../../../apis";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";

const initialState = {
  title: "",
  subTaskList: [],
};

const EditTask = (props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [sub, setSub] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (props.data) {
      setFormData(props.data);
      setSub(props?.data?.subTaskList);
    }
  }, [props.data]);

  const handleClose = () => {
    if (props.close) {
      props.close();
      setSub([]);
      setFormData(initialState);
    }
  };

  const addSubTask = () => {
    setSub([
      ...sub,
      { title: "", isGrouped: false, mandatory: false, error: false },
    ]);
  };

  const removeSubtask = (index) => {
    let newArr = [];

    if (index === 0) {
      newArr = newArr.concat(sub.slice(1));
    } else if (index === sub?.length - 1) {
      newArr = newArr.concat(sub.slice(0, -1));
    } else {
      newArr = newArr.concat(sub.slice(0, index), sub.slice(index + 1));
    }

    setSub(newArr);
  };

  const handleSubTitleChange = (e, i) => {
    let arr = [...sub];
    let obj = arr[i];
    const { value } = e.target;

    obj = { ...obj, title: value };
    arr[i] = obj;
    setSub(arr);
  };

  const handleTaskTitle = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, title: value });
  };

  const checkSubtaskTitle = () => {
    let valid = true;
    const newSub = sub.map((s) => {
      if (!s.title) {
        valid = false;
        return { ...s, error: true };
      } else {
        return s;
      }
    });

    setSub(newSub);
    return valid;
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      return setSubmitted(true);
    }

    const isAllSubtaskTitle = checkSubtaskTitle();

    if (!isAllSubtaskTitle) {
      return setSubmitted(true);
    }

    const subtaskList = [...sub];

    subtaskList.forEach((s) => {
      delete s.error;
    });

    let inputData = {
      ...formData,
      subTaskList: subtaskList,
    };

    try {
      setLoading(true);
      const { data } = await editTask(inputData);
      if (data.success) {
        if (props.refresh) {
          await props.refresh();
        }
        handleClose();
      } else {
        toast.error("Something went wrong, please try later");
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCheckRequired = (e, i) => {
    const { checked } = e.target;
    const newSub = sub.map((s, index) => {
      if (index === i) {
        return { ...s, mandatory: checked };
      } else {
        return s;
      }
    });

    setSub(newSub);
  };

  return (
    <Fragment>
      <div className="col-md-8 mt-3 px-2">
        <TextInputField
          name="title"
          label="Task Title"
          value={formData.title}
          onChange={handleTaskTitle}
          required={true}
          invalid={submitted && !formData.title?.trim()}
          invalidMessage={"Task Title is required"}
        />
      </div>

      <div className="d-flex align-items-center justify-content-between bg-light mt-3 p-2">
        <h5 className="mb-0">Sub Task</h5>
        <Button color="primary" onClick={addSubTask} className="d-flex">
          <span className="plusdiv">+</span> Add
        </Button>
      </div>

      <div className="mt-3">
        {sub.map((s, i) => (
          <div className="d-flex align-items-center row pe-cursor" key={i}>
            <div
              className="col-md-2 d-flex flex-column"
              style={{ marginBottom: "20px" }}
            >
              <label>Required</label>
              <TextInputField
                type="checkbox"
                checked={s.mandatory}
                className="form-check-input"
                name="mandatory"
                value={s.mandatory}
                onChange={(e) => handleCheckRequired(e, i)}
              />
            </div>
            <div className="d-flex align-items-center justify-content-between col-md-10">
              <TextInputField
                name="title"
                label={`Sub Task - ${i + 1}`}
                value={s?.title}
                containerClassName="col-8"
                onChange={(e) => handleSubTitleChange(e, i)}
                invalid={submitted && s.error}
                invalidMessage={"Subtask Title is required"}
              />
              <div className="col-md-2" onClick={() => removeSubtask(i)}>
                <AiOutlineClose size={30} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex align-items-center justify-content-end p-2 border-top mt-3">
        <Button className="mx-1" color="danger" onClick={handleClose}>
          Cancel
        </Button>
        <Button className="mx-1" color="success" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default EditTask;
