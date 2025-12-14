import React, { useState, useEffect, Fragment } from "react";
import { Button, Input } from "reactstrap";
import {
  fetchAllContactsFromDb,
  linkMatterContact,
  unlinkMatterContact,
} from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { toast } from "react-toastify";
import { CustomDropDown } from "pages/Edge/components/InputField";

let initialData = {
  contactId: "",
  contactType: "",
  contactRole: "",
};

const EditLinkedContact = (props) => {
  const { refresh } = props;
  const [data, setData] = useState(props.data);
  const [formData, setFormData] = useState(initialData);
  const [contactList, setContactList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [loading, setLoading] = useState(false);

  const fetchRoles = (arg) => {
    let list = JSON.parse(window.localStorage.getItem("matterContactRole"));
    let roles = list.filter(
      (d) => d.type === arg.type && d.subType === arg.subType
    );
    if (roles && roles[0]?.contactRoleList?.length > 0) {
      setRoleList(roles[0]?.contactRoleList);
    }
  };

  const parseList = async (list) => {
    let arr = [];
    list.forEach((d) => {
      if (d.contactType === "ORGANISATION") {
        if (d.organisation) {
          arr.push({
            display: `${d.organisation}`,
            value: d.contactId,
            type: d.contactType,
            valueKey: `${d.contactType}-${d.contactId}`,
          });
        }
      } else {
        if (d.firstName || d.lastName) {
          arr.push({
            display: `${d.firstName ?? ""} ${d.lastName ?? ""}`,
            value: d.contactId,
            type: d.contactType,
            valueKey: `${d.contactType}-${d.contactId}`,
          });
        }
      }
    });
    setContactList(arr);
  };

  const fetchContactList = async () => {
    try {
      setLoading(true);
      const { data } = await fetchAllContactsFromDb();
      if (data.success) {
        parseList(data?.data?.contactLists ?? []);
      } else {
        toast.warning("Something went wrong, please try later.");
      }
      setTimeout(() => {
        setLoading(false);
      }, 10);
    } catch (error) {
      setLoading(false);
      toast.warning("Something went wrong, please try again later.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchContactList();
  }, []);

  useEffect(() => {
    setData(props.data);
    fetchRoles(props.data);
  }, [props.data]);

  useEffect(() => {
    parseContactData(props.selectedContact);
  }, [props.selectedContact]);

  const parseContactData = (arg) => {
    setFormData(arg);
    setSelectedRoles(arg.contactRoleList);
  };

  const findDisplayname = (from, val = "") => {
    if (val) {
      let data = from.find(
        (d) => d.value === val?.contactId && d.type === val?.contactType
      );
      return data ? data.display : "";
    }
    return "";
  };

  const handleSelectOption = (val) => {
    setFormData({ ...formData, contactId: val.value, contactType: val.type });
  };

  const handleSelect = (id) => {
    const selectedIndex = selectedRoles.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRoles, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRoles.slice(1));
    } else if (selectedIndex === selectedRoles.length - 1) {
      newSelected = newSelected.concat(selectedRoles.slice(0, -1));
    } else {
      newSelected = newSelected.concat(
        selectedRoles.slice(0, selectedIndex),
        selectedRoles.slice(selectedIndex + 1)
      );
    }
    setSelectedRoles(newSelected);
  };

  const isSelected = (id) => selectedRoles.indexOf(id) !== -1;

  const parseSubmitData = () => {
    if (formData && formData.contactId && formData.contactType) {
      if (selectedRoles && selectedRoles.length > 0) {
        let req = {
          matterId: data.id,
          contactId: formData.contactId,
          contactType: formData.contactType,
          contactRoleList: selectedRoles,
        };

        setTimeout(() => {
          handleSubmit(req);
        }, 10);
      } else {
        let req = {
          matterId: data.id,
          contactId: formData.contactId,
          contactType: formData.contactType,
        };

        setTimeout(() => {
          handleUnlink(req);
        }, 10);
      }
    } else {
      toast.warning("Please select any contact");
    }
  };

  const handleUnlink = async (arg) => {
    try {
      setLoading(true);
      const { data } = await unlinkMatterContact(arg);
      if (data.success) {
        refresh();
        props.closeForm();
      } else {
        toast.warning("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.warning("Something went wrong, please try again later.");
    }
  };

  const handleSubmit = async (listData) => {
    try {
      setLoading(true);
      const { data } = await linkMatterContact(listData);
      if (data.success) {
        refresh();
        props.closeForm();
      } else {
        toast.warning("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.warning("Something went wrong, please try again later.");
      console.error(error);
    }
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
        closeForm={() => {
          props.closeForm();
        }}
        btn1={"Cancel"}
        btn2="Save"
        heading="Edit Link Contact"
        handleFunc={parseSubmitData}
        autoClose={false}
      > */}
      <div className="row mt-3">
        <CustomDropDown
          placeholder="Search Contacts"
          optionArray={contactList}
          onSelectFunc={(val) => handleSelectOption(val)}
          fieldVal={findDisplayname(contactList, formData)}
          selected={`${formData.contactType}-${formData.contactId}`}
          valueKey="valueKey"
          maxLength={null}
          required={true}
        />
      </div>

      <div className="row mt-3">
        {roleList?.map((role) => (
          <div className="mc-roleDiv">
            <Input
              type="checkbox"
              onChange={() => handleSelect(role.roleName)}
              checked={isSelected(role.roleName)}
            />
            <p className="mb-0">{role.roleName}</p>
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            type="button"
            color="light"
            onClick={props.closeForm}
            className="mx-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="success"
            onClick={parseSubmitData}
            className="mx-1"
          >
            Save
          </Button>
        </div>
      </div>

      {/* </CustomToastWindow> */}
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default EditLinkedContact;
