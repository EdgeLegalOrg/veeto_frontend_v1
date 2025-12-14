import React, { useEffect, useState } from "react";
import { GrClose } from "react-icons/gr";
import { getStaffNotLinked, linkNewUser, linkRoleToUser } from "../../../apis";
import "../../../stylesheets/ManageUserPage.css";
import { BiShow, BiHide } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { Button, Input } from "reactstrap";
import {
  CustomDropDown,
  CustomSearchInput,
  TextInputField,
} from "../../InputField";

const initialData = {
  userName: "",
  password: "",
  defaultTemplateId: "",
  staffId: "",
  staffName: "",
};

const AddNewUser = (props) => {
  const { handleCloseRight, fetchUsers, siteList, roleList, templateList } =
    props;
  const [dataList, setDataList] = useState([]);
  const [dummyList, setDummyList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState(initialData);
  const [showPass, setShowPass] = useState(false);
  const [tempState, setTempState] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [defaultTemplateId, setDefaultTemplateId] = useState("");

  const parseData = (data) => {
    let arr = [];
    data.forEach((d) => {
      arr.push({
        display: `${d.firstName} ${d.lastName}`?.trim(),
        value: d.id,
      });
    });
    setStaffList(arr);
  };
  const fetchStaffList = async () => {
    try {
      const { data } = await getStaffNotLinked();
      if (data.success) {
        parseData(
          data?.data?.staffMemberList ? data?.data?.staffMemberList : []
        );
      } else {
        toast.error("Something went wrong please try later.");
      }
    } catch (error) {
      toast.error("Something went wrong please check console.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  function handleSelect(val) {
    setFormData({
      ...formData,
      staffId: val.value,
      staffName: val.display,
    });
  }

  const handleSelectRole = (val, i) => {
    if (val.display === "None") {
      let arr1 = [...dummyList];
      arr1[i] = "";
      setDummyList(arr1);
      let arr2 = [];
      if (i === 0 && dataList?.length === 0) {
        return;
      } else if (i === 0) {
        arr2 = arr2.concat(dataList.slice(1));
      } else if (i === dataList?.length - 1) {
        arr2 = arr2.concat(dataList.slice(0, -1));
      } else {
        arr2 = arr2.concat(dataList.slice(0, i), dataList.slice(i + 1));
      }
      setDataList(arr2);
    } else {
      let obj = { siteId: siteList[i].value, roleId: val.value };
      let arr1 = dummyList;
      arr1[i] = val.display;
      setDummyList(arr1);
      let arr2 = [...dataList];
      if (arr2?.length - 1 < i) {
        arr2.push(obj);
      } else {
        arr2[i] = obj;
      }
      setDataList(arr2);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleReset = () => {
    if (formData.staffId) {
      return;
    } else {
      setFormData({
        ...formData,
        staffId: "",
        staffName: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    const { userName, password, staffId, staffName } = formData;
    if (userName && password && staffId && dataList?.length > 0) {
      try {
        const newData = {
          userName: formData.userName,
          password: formData.password,
          staffId: formData.staffId,
        };
        const { data } = await linkNewUser(newData);
        if (data.success) {
          fetchUsers();
          setTimeout(() => {
            handleUpdate(data.data);
            handleCloseRight();
          }, 10);
        } else {
          toast.error("Something went wrong please try later.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong please check console.");
      }
    } else {
      setSubmitted(true);
      // if (dataList?.length === 0) {
      //   toast.warning("Please assign some role to user");
      // } else {
      //   if (!userName && !password && !staffId) {
      //     toast.warning("* Fields are required");
      //   } else {
      //     if (!userName) {
      //       toast.warning("Username is required");
      //     } else if (!password) {
      //       toast.warning("Password is required");
      //     } else if (!staffId) {
      //       toast.warning("Person is required. Please select from list.");
      //     }
      //   }
      // }
    }
  };

  const handleUpdate = async (userDetail) => {
    try {
      const newDataList = dataList.filter((role) => role.roleId);

      const newData = {
        defaultTemplateId: defaultTemplateId || 0,
        userId: userDetail.id,
        siteRoleList: newDataList,
      };

      const { data } = await linkRoleToUser(newData);
      if (data.success) {
        fetchUsers();
      } else {
        toast.error("Something went wrong, please try again later.");
      }
    } catch (error) {
      toast.error("Something went wrong please check console.");
      console.error(error);
    }
  };

  return (
    <div className="addUser-container">
      <div className="bg-light d-flex align-items-center justify-content-between p-3 mt-4 border">
        <h5 className="mb-0">Add User</h5>
        <Button color="danger" size="sm" onClick={handleCloseRight}>
          <AiOutlineClose size={18} />
        </Button>
      </div>
      <div className="addUser-bodyDiv">
        <div className="addUser-personDiv">
          {/* <input type='text' className='addUser-searchPerson' /> */}
          <div className="addUser-searchDiv mx-1">
            <label className="addUser-label">
              Add Person <span>*</span>
            </label>
            <CustomSearchInput
              name="staffId"
              placeholder="Staff Id"
              optionArray={staffList}
              setDetails={setFormData}
              details={formData}
              // fieldVal={formData}
              onSelectFunc={handleSelect}
              fieldVal={formData.staffName}
              resetFunc={handleReset}
              tempState={setTempState}
              invalid={submitted && !formData.staffId}
              invalidMessage="Person is required. Please select from list."
            />
          </div>
        </div>
        <div className="addUser-form">
          <div className="addUser-inputDiv">
            <label className="addUser-label">
              Username <span>*</span>
            </label>
            <Input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              invalid={submitted && !formData.userName?.trim()}
              invalidMessage="Username is required"
              autoComplete="off"
            />
          </div>
          <div className="addUser-inputDiv">
            <label className="addUser-label">
              Password <span>*</span>
            </label>
            <div className="input-group">
              <Input
                type={`${showPass ? "text" : "password"}`}
                name="password"
                value={formData.password}
                onChange={handleChange}
                invalid={submitted && !formData.password?.trim()}
                invalidMessage="Password is required"
                autoComplete="off"
              />
              <div className="input-group-append">
                <span
                  className="input-group-text px-1"
                  style={{ height: "2.344rem" }}
                >
                  {showPass ? (
                    <BiHide
                      className="addUser-passIcon"
                      onClick={() => setShowPass(false)}
                    />
                  ) : (
                    <BiShow
                      className="addUser-passIcon"
                      onClick={() => setShowPass(true)}
                    />
                  )}
                </span>
              </div>
            </div>
            <div className="w-100 mt-3">
              <TextInputField
                type="select"
                name="defaultTemplateId"
                label="Default Letter Head"
                placeholder="Default Letter Head"
                value={defaultTemplateId}
                selected={defaultTemplateId}
                optionArray={[
                  {
                    label: "Select",
                    value: "",
                    disabled: true,
                    selected: true,
                  },
                  ...templateList.map((d) => ({
                    label: d.display,
                    value: d.value,
                    selected: d.value === defaultTemplateId,
                  })),
                ]}
                onChange={({ target }) => {
                  setDefaultTemplateId(target.value);
                }}
                // required={
                //   requiredFields.indexOf('defaultTemplateId') >= 0
                // }
                // invalid={
                //   submitted &&
                //   requiredFields.indexOf('defaultTemplateId') >= 0
                //     ? true
                //     : false
                // }
                // invalidMessage='Please enter a valid Default Letter Head'
              />
            </div>
          </div>
        </div>
        <div className="addUser-roleDiv">
          <p className="mb-0">Add Role</p>
          <div className="addUser-roleContainer">
            <div className="bg-light d-flex align-items-center justify-content-between p-3 mt-4 border">
              <input type="checkbox" className="addUser-roleHeadCheck hide" />
              <p className="addUser-siteHeadPara mb-0">Site</p>
              <p className="addUser-roleHeadPara mb-0">Roles</p>
            </div>
            <div className="addUser-roleList border">
              {siteList?.map((site, i) => (
                <div className="addUser-role pe-cursor" key={site.value}>
                  {/* <input type='checkbox' className='addUser-check' /> */}
                  <p className="addUser-roleName">{site.display}</p>
                  <div className="addUser-option position-relative">
                    <CustomDropDown
                      name="role"
                      label="Role"
                      value={dummyList[i]}
                      optionArray={
                        roleList
                          ? [{ display: "None", value: null }, ...roleList]
                          : []
                      }
                      fieldVal={dummyList[i]}
                      selected={
                        dataList && dataList?.[i] && dataList[i].roleId
                          ? dataList[i].roleId
                          : ""
                      }
                      onSelectFunc={(val) => handleSelectRole(val, i)}
                      width="85%"
                      small={true}
                      maxLength={null}
                      invalid={submitted && !dataList?.length === 0}
                      invalidMessage="Please select role"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex m-3">
        <Button className="mx-1" color="success" onClick={handleSubmit}>
          Add User
        </Button>
        <Button
          className="mx-1"
          color="danger"
          onClick={() => {
            setTimeout(() => {
              setFormData(initialData);
            }, 10);
            handleCloseRight();
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddNewUser;
