import React, { useEffect, useState } from "react";
import { linkRoleToUser } from "../../../apis";
import "../../../stylesheets/ManageUserPage.css";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { AiOutlineClose } from "react-icons/ai";
import {
  CustomDropDown,
  TextInputField,
} from "pages/Edge/components/InputField";

const UpdateUser = (props) => {
  const {
    handleCloseRight,
    userDetail,
    siteList,
    roleList,
    setLoading,
    fetchUsers,
    linkedRoles,
    handleUpdateRole,
    templateList,
    updatedUserDetails,
  } = props;

  const [dataList, setDataList] = useState([]);
  const [dummyList, setDummyList] = useState([]);
  const [defaultTemplateId, setDefaultTemplateId] = useState("");

  useEffect(() => {
    if (updatedUserDetails) {
      setDefaultTemplateId(updatedUserDetails.defaultTemplateId || "");
    }
  }, [updatedUserDetails]);

  const handleSelect = (val, i) => {
    // if (val.display === 'None') {
    //   let arr1 = [...dummyList];
    //   arr1[i] = '';
    //   setDummyList(arr1);
    //   let arr2 = [];
    //   if (i === 0 && dataList?.length === 0) {
    //     return;
    //   } else if (i === 0) {
    //     arr2 = arr2.concat(dataList.slice(1));
    //   } else if (i === dataList?.length - 1) {
    //     arr2 = arr2.concat(dataList.slice(0, -1));
    //   } else {
    //     arr2 = arr2.concat(dataList.slice(0, i), dataList.slice(i + 1));
    //   }
    //   setDataList(arr2);
    // } else {
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
    // }
  };

  const handleUpdate = async () => {
    setLoading(true);

    const newDataList = dataList.map((role) => {
      if (!role.roleId) {
        return { ...role, roleId: null };
      } else {
        return role;
      }
    });

    try {
      let newData = {
        defaultTemplateId,
        userId: userDetail.id,
        siteRoleList: newDataList,
      };
      const { data } = await linkRoleToUser(newData);
      if (data.success) {
        handleUpdateRole(userDetail.id, true);
      } else {
        toast.error("Something went wrong, please try again later.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong please check console.");
      console.error(error);
    }
  };

  const correspondingRole = (siteId, mapVal = "") => {
    let data = linkedRoles.filter((d) => d.siteId === siteId);
    if (data && data?.length > 0) {
      let roleId = data[0].roleId;
      let val = roleList.filter((r) => r.value === roleId);

      if (mapVal) {
        return val && val?.length > 0 ? val[0][mapVal] : "";
      }
      return val && val?.length > 0 ? val[0].display : "";
    }

    return "";
  };

  return (
    <div className="addUser-container">
      <div className="bg-light p-2 d-flex border align-items-center justify-content-between">
        <h5 className="mb-0">{`${userDetail.firstName} ${userDetail.lastName}`}</h5>
        <Button
          color="danger"
          className="mx-2 d-flex"
          onClick={handleCloseRight}
        >
          <AiOutlineClose size={18} />
        </Button>
      </div>
      <div className="addUser-bodyDiv">
        {/* <div className='addUser-personDiv'>
          <p className='addUser-person'>
            Add Person <span>*</span>
          </p>
          <input type='text' className='addUser-searchPerson' />
        </div> */}

        <div className="addUser-details">
          <label className="mb-0">Username : </label>
          <p className="mb-0">{userDetail.login}</p>
        </div>

        <div className="mt-3">
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
        <div className="addUser-roleDiv">
          <p className="">Update User Role</p>
          <div className="addUser-roleContainer">
            <div className="addUser-roleHead border">
              {/* <input
                type="checkbox"
                className="addUser-roleHeadCheck hide"
              /> */}
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
                      fieldVal={
                        dummyList[i]
                          ? dummyList[i]
                          : correspondingRole(site.value)
                      }
                      selected={
                        dataList?.[i]?.roleId
                          ? dataList[i].roleId
                          : correspondingRole(site.value, "value")
                      }
                      optionArray={
                        roleList
                          ? [{ display: "None", value: "" }, ...roleList]
                          : []
                      }
                      onSelectFunc={(val) => handleSelect(val, i)}
                      width="85%"
                      small={true}
                      maxLength={null}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex my-2 mx-3">
        <Button className="mx-1" color="success" onClick={handleUpdate}>
          Update User
        </Button>
        <Button className="mx-1" color="danger" onClick={handleCloseRight}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default UpdateUser;
