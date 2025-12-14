import React, { useState, useEffect, Fragment } from "react";
import { Button, Input } from "reactstrap";
import { fetchAllContactsFromDb, linkMatterContact } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { toast } from "react-toastify";
import { CustomDropDown } from "../../InputField";

let initialData = {
  contactId: "",
  contactType: "",
  contactRole: "",
};

const AddBtns = (props) => {
  const onClick = (type) => {
    if (type === "person") {
      props.openPerson();
    } else {
      props.openOrg();
    }
  };
  return (
    <div className="d-flex">
      <Button
        className="d-flex mx-1"
        disabled={props.disabled}
        onClick={() => onClick("person")}
        color="primary"
      >
        <span className="plusdiv">+</span>Person
      </Button>
      <Button
        className="d-flex mx-1"
        disabled={props.disabled}
        onClick={() => onClick("org")}
        color="primary"
      >
        <span className="plusdiv">+</span>Organisation
      </Button>
    </div>
  );
};

const LinkContactPage = (props) => {
  const { refresh, isReload, setIsReload } = props;
  const [data, setData] = useState(props.data);
  const [formData, setFormData] = useState(initialData);
  const [contactList, setContactList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [submitted, setSubmitted] = useState(false);

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
      setIsReload(false);
      setTimeout(() => {
        setLoading(false);
      }, 10);
    } catch (error) {
      setLoading(false);
      setIsReload(false);
      toast.warning("Something went wrong, please try again later.");
      console.error(error);
    }
  };

  useEffect(() => {
    if (isReload) {
      fetchContactList();
    }
  }, [isReload]);

  useEffect(() => {
    fetchContactList();
  }, []);

  useEffect(() => {
    setData(props.data);
    fetchRoles(props.data);
  }, [props.data]);

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
    setSubmitted(true);
    if (formData && formData.contactId && formData.contactType) {
      if (selectedRoles.length > 0) {
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
        // toast.warning("Please select any role");
      }
    } else {
      // toast.warning("Please select any contact");
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

  const openContact = (type) => {
    let ele = document.querySelector(".customToast-popup-container");

    if (ele) {
      ele.classList.add("hide");
    }

    setTimeout(() => {
      if (type === "person") {
        props.openPerson();
      } else {
        props.openOrg();
      }
    }, 1);
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
        closeForm={() => {
          props.closeForm();
        }}
        btn1={'Cancel'}
        btn2='Add'
        heading='Link Contact'
        handleFunc={parseSubmitData}
        autoClose={false}
        extraElement={
          <AddBtns
            disabled={props.disabled}
            openOrg={() => openContact('org')}
            openPerson={() => openContact('person')}
          />
        }
        renderExtra={true}
      > */}

      <div className="row mt-4">
        <div className="d-flex align-items-center justify-content-end">
          <AddBtns
            disabled={props.disabled}
            openOrg={() => openContact("org")}
            openPerson={() => openContact("person")}
          />
        </div>
      </div>

      <div className="row mt-3">
        <CustomDropDown
          placeholder="Search Contacts"
          optionArray={contactList}
          onSelectFunc={(val) => handleSelectOption(val)}
          fieldVal={findDisplayname(contactList, formData)}
          selected={`${formData.contactType}-${formData.contactId}`}
          valueKey="valueKey"
          maxLength={null}
          invalid={submitted && !formData.contactId}
          invalidMessage="Please select any contact"
        />
      </div>
      <div className="row mt-3">
        {roleList?.map((role) => (
          <div className="mc-roleDiv">
            <Input
              type="checkbox"
              onChange={() => handleSelect(role.roleName)}
              checked={isSelected(role.roleName)}
              style={
                submitted && !selectedRoles?.length
                  ? { borderColor: "#f06548" }
                  : {}
              }
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

export default LinkContactPage;
