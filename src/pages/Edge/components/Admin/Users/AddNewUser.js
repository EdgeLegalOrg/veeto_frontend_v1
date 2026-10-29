import React, { useEffect, useState } from "react";
import { getStaffNotLinked, linkNewUser } from "../../../apis";
import "../../../stylesheets/ManageUserPage.css";
import { BiShow, BiHide } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { Button, Input } from "reactstrap";
import {
  CustomSearchInput,
  TextInputField,
} from "../../InputField";

import UserAccessFields from "./UserAccessFields";

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
  const [siteIds, setSiteIds] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [saving, setSaving] = useState(false);
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
        email: d.emailId1 || d.emailId2 || d.email || "",
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
    const email = val?.email || "";
    setFormData((prev) => ({
      ...prev,
      staffId: val.value,
      staffName: val.display,
      userName: !prev.userName?.trim() || prev.userName === prev._autoEmail ? email : prev.userName,
      _autoEmail: email,
    }));
  }

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

  /** Creates the user and initial role/site assignment in one backend transaction. */
  const handleSubmit = async () => {
    if (saving) return;
    setSubmitted(true);
    const selectedRole = roleList.find((role) => Number(role.value) === Number(roleId));
    const hasActiveSite = siteList.some((site) => siteIds.includes(Number(site.value)));
    if (!formData.userName?.trim() || !formData.password?.trim() || !formData.staffId
      || !selectedRole || (!selectedRole.accessAllSites && !hasActiveSite)) return;
    setSaving(true);
    try {
      const { data } = await linkNewUser({
        userName: formData.userName.trim(), password: formData.password, staffId: formData.staffId,
        defaultTemplateId: defaultTemplateId ? Number(defaultTemplateId) : null,
        roleId: Number(roleId), siteIds,
      });
      if (data.success) {
        toast.success("User created successfully.");
        await fetchUsers();
        handleCloseRight();
      } else {
        toast.error(data.message || data.error?.message || "Unable to create user. Check the role and site selections.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to create user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="addUser-container">
      <div className="bg-light d-flex align-items-center justify-content-between p-3 mt-4 border">
        <h5 className="mb-0">Add User</h5>
        <Button color="danger" size="sm" onClick={handleCloseRight} disabled={saving}>
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
                    label: "Use Site Default",
                    value: "",
                    selected: !defaultTemplateId,
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
        <UserAccessFields siteList={siteList} roleList={roleList} siteIds={siteIds} roleId={roleId}
          onSitesChange={setSiteIds} onRoleChange={setRoleId} submitted={submitted} disabled={saving} />
      </div>
      <div className="d-flex m-3">
        <Button className="mx-1" color="success" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Add User"}
        </Button>
        <Button
          className="mx-1"
          color="danger"
          disabled={saving}
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
