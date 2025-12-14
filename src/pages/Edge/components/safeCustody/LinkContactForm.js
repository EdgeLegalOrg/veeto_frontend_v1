import React, { useState, useEffect, Fragment } from "react";

import { v1 as uuidv1 } from "uuid";
import closeBtn from "../../images/close-white-btn.svg";
import upArrow from "../../images/upArrow.svg";
import downArrow from "../../images/downArrow.svg";
import downArrowColoured from "../../images/downArrowColoured.svg";
import upArrowColoured from "../../images/upArrowColoured.svg";
import "../../stylesheets/LinkContactForm.css";
import { linkContactToSafecustody } from "../../apis";
import { toast } from "react-toastify";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
} from "reactstrap";

const filterFields = {
  contactCode: "",
  firstName: "",
  lastName: "",
  organisation: "",
};

const LinkContactForm = (props) => {
  const {
    closeForm,
    contactLists,
    safeCustodyPacketId,
    setBoolVal,
    linkedContacts,
  } = props;
  const [selected, setSelected] = useState([]);
  const [filteredData, setFilteredData] = useState(contactLists);
  const [newContactList, setNewContactList] = useState([]);
  const [filterInput, setFilterInput] = useState(filterFields);
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [labelSort, setLabelSort] = useState("");
  const [isBool, setIsBool] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isBool) {
      setLoading(true);
      let unLinkedContacts = [];
      contactLists.forEach((contact) => {
        let matched = false;
        linkedContacts.forEach((lc) => {
          if (
            lc.contactId === contact.contactId &&
            lc.contactType === contact.contactType
          ) {
            matched = true;
          }
        });
        if (!matched) {
          unLinkedContacts.push(contact);
        }
      });
      setFilteredData(unLinkedContacts);
      setNewContactList(unLinkedContacts);
      setLoading(false);
    }
  }, [isBool, contactLists, linkedContacts]);

  const filterData = (obj) => {
    const newData = newContactList.filter(
      (data) =>
        (obj["firstName"] !== ""
          ? data["firstName"]
              ?.toLowerCase()
              ?.includes(obj["firstName"]?.toLowerCase())
          : true) &&
        (obj["lastName"] !== ""
          ? data["lastName"]
              ?.toLowerCase()
              ?.includes(obj["lastName"]?.toLowerCase())
          : true) &&
        (obj["organisation"] !== ""
          ? data["organisation"]
              ?.toLowerCase()
              ?.includes(obj["organisation"]?.toLowerCase())
          : true)
    );
    setFilteredData(newData);
  };

  const handleFilter = (e) => {
    const { name } = e.target;
    setFilterInput({ ...filterInput, [name]: e.target.value });
    filterData({ ...filterInput, [name]: e.target.value });
  };

  const handleLabelClick = (field) => {
    let sortedData = filteredData.sort((a, b) => {
      if (labelSort !== field) {
        setLabelSort(field);
        setSortOrder("asc");
        setSortField(field);
        return (a[field] ? a[field].toLowerCase() : "") <
          (b[field] ? b[field].toLowerCase() : "")
          ? -1
          : 1;
      } else {
        setLabelSort("");
        setSortOrder("desc");
        setSortField(field);
        return (a[field] ? a[field].toLowerCase() : "") <
          (b[field] ? b[field].toLowerCase() : "")
          ? 1
          : -1;
      }
    });
    setFilteredData(sortedData);
  };

  const handleClick = (data, ind) => {
    let exist = false;

    let newSelected = selected.filter((d) => {
      if (
        d.contactId === data.contactId &&
        d.contactType === data.contactType
      ) {
        exist = true;
      } else {
        return d;
      }
    });

    if (!exist) {
      newSelected.push({
        contactId: data.contactId,
        contactType: data.contactType,
        contactRole: data.contactRole,
      });
    }

    setSelected(newSelected);
  };

  const isSelected = (data) => {
    selected.map((d) => {
      if (
        d.contactId === data.contactId &&
        d.contactType === data.contactType
      ) {
        return true;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formData = {
      id: parseInt(safeCustodyPacketId),
      custodyPacketContacts: selected,
    };

    linkContactToSafecustody({
      requestId: uuidv1(),
      data: formData,
    })
      .then((res) => {
        if (res.data.success) {
          setBoolVal(false);
          closeForm();
        } else {
          toast.error(
            "There is some problem from server side, please try later."
          );
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error("Something went wrong, please check the console");
      });
  };

  return (
    <>
      <div style={{ height: "50vh", overflow: "scroll" }}>
        <Table size="sm" responsive={true} striped={true} hover={true}>
          <thead>
            <tr>
              <th></th>

              <th>
                <label
                  className="associatedContacts-label"
                  onClick={() => handleLabelClick("firstName")}
                >
                  F. Name
                  <div className="associatedContacts-label-btn">
                    {sortOrder === "asc" && sortField === "firstName" ? (
                      <img
                        src={upArrowColoured}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    ) : (
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    )}
                    {sortOrder === "desc" && sortField === "firstName" ? (
                      <img
                        src={downArrowColoured}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    ) : (
                      <img
                        src={downArrow}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    )}
                  </div>
                </label>
                <Input type="text" name="firstName" onChange={handleFilter} />
              </th>
              <th>
                <label
                  className="associatedContacts-label"
                  onClick={() => handleLabelClick("lastName")}
                >
                  L. Name
                  <div className="associatedContacts-label-btn">
                    {sortOrder === "asc" && sortField === "lastName" ? (
                      <img
                        src={upArrowColoured}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    ) : (
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    )}
                    {sortOrder === "desc" && sortField === "lastName" ? (
                      <img
                        src={downArrowColoured}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    ) : (
                      <img
                        src={downArrow}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    )}
                  </div>
                </label>
                <Input type="text" name="lastName" onChange={handleFilter} />
              </th>
              <th>
                <label
                  className="associatedContacts-label"
                  onClick={() => handleLabelClick("organisation")}
                >
                  Company
                  <div className="associatedContacts-label-btn">
                    {sortOrder === "asc" && sortField === "organisation" ? (
                      <img
                        src={upArrowColoured}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    ) : (
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    )}
                    {sortOrder === "desc" && sortField === "organisation" ? (
                      <img
                        src={downArrowColoured}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    ) : (
                      <img
                        src={downArrow}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    )}
                  </div>
                </label>
                <Input
                  type="text"
                  name="organisation"
                  onChange={handleFilter}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="py-2">
                <td colSpan={4} style={{ textAlign: "center" }}>
                  <p>Loading...</p>
                </td>
              </tr>
            ) : filteredData?.length === 0 ? (
              <tr className="py-2">
                <td colSpan={4} style={{ textAlign: "center" }}>
                  <p>No records to display</p>
                </td>
              </tr>
            ) : (
              <Fragment>
                {filteredData?.map((contact, ind) => (
                  <tr key={ind}>
                    <td>
                      <Input
                        type="checkbox"
                        checked={isSelected(contact)}
                        onClick={() => handleClick(contact, ind)}
                      />
                    </td>

                    <td>
                      <span className="mb-0">
                        {contact.contactType === "PERSON"
                          ? contact.firstName
                          : ""}
                      </span>
                    </td>
                    <td>
                      <span className="mb-0">
                        {contact.contactType === "PERSON"
                          ? contact.lastName
                          : ""}
                      </span>
                    </td>
                    <td>
                      <span className="mb-0">
                        {contact.organisation ? contact.organisation : ""}
                      </span>
                    </td>
                  </tr>
                ))}
              </Fragment>
            )}
          </tbody>
        </Table>
      </div>
      <div className="d-flex justify-content-end p-2">
        <Button onClick={handleSubmit} color="success">
          Add
        </Button>
      </div>
    </>
  );
};

export default LinkContactForm;
