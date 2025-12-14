import React, { useState, useEffect, Fragment } from "react";
import {
  CustomDropDown,
  CustomToastWindow,
} from "../../customComponents/CustomComponents";
import CustomSideDrawer from "../../customComponents/CustomSideDrawer";
import LoadingPage from "../../../utils/LoadingPage";
import { findDisplayname } from "../../../utils/utilFunc";
import { getCheckList } from "../../../apis";
import { toast } from "react-toastify";
import { Input } from "reactstrap";

const initialState = {
  matterType: "",
  matterSubType: "",
  checkListId: "",
};

const LinkToMatterForm = (props) => {
  const [formData, setFormData] = useState(initialState);
  const [drawer, setDrawer] = useState(false);
  const [types, setTypes] = useState([]);
  const [subTypes, setSubTypes] = useState([]);

  const [checkList, setCheckList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEnums();
    fetchCheckList();
  }, []);

  const fetchCheckList = async () => {
    setLoading(true);
    try {
      const { data } = await getCheckList();
      if (data.success) {
        setCheckList(data.data.templateList);
      } else {
        toast.warning("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.warning("Something went wrong, please try later.");
      setLoading(false);
    }
  };

  const fetchEnums = () => {
    let typeList = JSON.parse(window.localStorage.getItem("matterTypeList"));

    if (typeList && typeList?.length > 0) {
      setTypes(typeList);
    }
  };

  const handleSelect = (name, val) => {
    let obj = { ...formData };

    if (name === "matterType") {
      setSubTypes(val.subType);
      obj = { ...obj, subType: "" };
    }

    setFormData({ ...obj, [name]: val.value });
  };

  const handleCloseDrawer = () => {
    setDrawer(false);
  };

  const handleSelectCheckList = (arg) => {
    if (selected) {
      if (arg.id !== selected.id) {
        setSelected(selected);
      } else {
        setSelected(null);
      }
    } else {
      setSelected(arg);
    }
  };

  const isSelected = (id) => (selected && selected.id === id ? true : false);

  const drawerBody = () => {
    return checkList.map((check) => (
      <div className="task-list-row pe-cursor" key={check.id}>
        <div
          className="task-detail"
          onClick={() => handleSelectCheckList(check)}
        >
          <Input
            type="checkbox"
            className="cp"
            checked={isSelected(check.id)}
            onClick={() => {}}
            onChange={() => {}}
          />
          <label className="cp">{check.name}</label>
        </div>
      </div>
    ));
  };

  // const parseTasks = () => {
  //   if(selected && selected.templateTaskList && selected.templateTaskList.length > 0){
  //     let rv = [];

  //     for(let a in selected.templateTaskList){

  //     }
  //   } else{
  //     return '';
  //   }
  // }

  const showSelectedCheckList = () => {
    if (selected) {
      return (
        <Fragment>
          <div className="task-list-tableHeader">
            <div className="table-colDiv md">
              <label className="task-label-text">
                Selected Checklist title
              </label>
            </div>
            {/* <div className='table-colDiv lg'>
              <label className='task-label-text'>Tasks</label>
            </div> */}
          </div>
          <div className="task-list-row" key={`selected-${selected.id}`}>
            <div className="task-detail">
              <label>{selected.name}</label>
            </div>
            {/* <div className='table-detail lg'>
              <label className='full three-dot'>Tasks</label>
            </div> */}
          </div>
        </Fragment>
      );
    } else {
      return (
        <div className="task-list-row" key={`no-task-selected`}>
          <p className="full ac">No Checklist Selected</p>
        </div>
      );
    }
  };

  return (
    <div>
      <CustomToastWindow
        closeForm={props.close}
        btn1={"Cancel"}
        btn2="Link"
        heading="Link Checklist to Matter"
        handleFunc={() => toast.warning("WIP")}
        autoClose={false}
      >
        <div className="customToast-inputDiv">
          <div className="mt-bd">
            <CustomDropDown
              name="matterType"
              label="Matter Type"
              value={findDisplayname(types, formData.matterType)}
              optionArray={types}
              onSelectFunc={(val) => handleSelect("matterType", val)}
              selected={formData.matterType}
              fieldVal={findDisplayname(types, formData.matterType)}
              maxLength={null}
            />

            <CustomDropDown
              name="matterSubType"
              label="Matter Sub-type"
              disabled={subTypes?.length <= 0 ? true : false}
              value={findDisplayname(subTypes, formData.matterSubType)}
              optionArray={subTypes}
              onSelectFunc={(val) => handleSelect("matterSubType", val)}
              selected={formData.matterSubType}
              fieldVal={findDisplayname(subTypes, formData.matterSubType)}
              maxLength={null}
            />
          </div>
        </div>
        <div className="mc-header-btns mr-tb20">
          <p className="mc-heading"> Checklist</p>
          <button className="custodyAddbtn" onClick={() => setDrawer(true)}>
            <span className="plusdiv">+</span>Add
          </button>
        </div>

        {showSelectedCheckList()}

        <div>
          <CustomSideDrawer
            active={drawer}
            onClose={handleCloseDrawer}
            heading={"Select Any Checklist"}
            body={drawerBody}
            doneBtn={true}
          />
        </div>
      </CustomToastWindow>
      {loading && <LoadingPage />}
    </div>
  );
};

export default LinkToMatterForm;
