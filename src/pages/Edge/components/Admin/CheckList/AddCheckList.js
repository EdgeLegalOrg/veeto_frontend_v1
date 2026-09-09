import React, { useState } from "react";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import { addNewChecklist } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { TextInputField } from "pages/Edge/components/InputField";
import ChecklistTaskGroups from "./ChecklistTaskGroups";

const initialState = {
  name: "",
  templateTaskList: [],
};

/**
 * New checklist: name it, then type its tasks into task groups.
 *
 * Tasks are free text. A task with a title and no id has its library entry
 * created server side when the checklist is saved, so nothing has to be
 * pre-created in Task List first.
 */
const AddCheckList = (props) => {
  const [selected, setSelected] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      return setSubmitted(true);
    }

    if (!selected.length) {
      toast.warning("Please add at least one task.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await addNewChecklist({
        ...formData,
        // localKey only exists to give React a key before the server assigns
        // ids, so it does not belong in the payload.
        templateTaskList: selected.map(({ localKey, ...task }) => task),
      });

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
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong please try later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
          />
        </div>
      </div>

      <div className="row mt-3 px-2">
        <ChecklistTaskGroups tasks={selected} onChange={setSelected} />
      </div>

      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button className="mx-1" color="danger" onClick={props.close}>
          Cancel
        </Button>
        <Button
          className="mx-1"
          color="success"
          onClick={handleSubmit}
          disabled={!selected.length}
        >
          Submit
        </Button>
      </div>

      {loading && <LoadingPage />}
    </div>
  );
};

export default AddCheckList;
