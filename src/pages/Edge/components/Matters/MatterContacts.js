import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { MdOutlineEdit } from "react-icons/md";
import {
  Button,
  Table,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import AddNewPerson from "./ContactRelated/AddNewPerson";
import { fetchAllContactsFromDb, unlinkMatterContact } from "../../apis";
import LoadingPage from "../../utils/LoadingPage";
import { AlertPopup } from "../customComponents/CustomComponents";
import AddNewOrg from "./ContactRelated/AddNewOrg";
import LinkContactPage from "./ContactRelated/LinkContactPage";
import AddAttachment from "./ContactRelated/AddAttachment";
import upArrow from "../../images/upArrow.svg";
import downArrow from "../../images/downArrow.svg";
import downArrowColoured from "../../images/downArrowColoured.svg";
import upArrowColoured from "../../images/upArrowColoured.svg";
import { get } from "../../utils/Json";
import EditLinkedContact from "./ContactRelated/EditLinkedContact";
import { toast } from "react-toastify";
import TooltipWrapper from "Components/Common/TooltipWrapper";
import { navigationEditFormAction } from "slices/layouts/reducer";

const initFilter = {
  contactCode: "",
  firstName: "",
  lastName: "",
  contactRole: "",
  contactType: "",
  companyName: "",
};

const MatterContacts = (props) => {
  const { refresh, setExtraButtons } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState(props.data);
  const [filteredList, setFilteredList] = useState([]);
  const [filterInput, setFilterInput] = useState(initFilter);
  const [contactList, setContactList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [personList, setPersonList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [newPerson, setNewPerson] = useState(false);
  const [newOrg, setNewOrg] = useState(false);
  const [unLinkAlert, setUnLinkAlert] = useState(false);
  const [linkContact, setLinkContact] = useState(false);
  const [addAttach, setAddAttach] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [labelSort, setLabelSort] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isReload, setIsReload] = useState(false);

  useEffect(() => {
    if (setExtraButtons) {
      setExtraButtons(
        <div className="d-flex align-items-center">
          <Button
            color="success"
            disabled={disabled || props.isArchived}
            onClick={() => setLinkContact(true)}
            className="d-flex mx-2"
          >
            <span className="plusdiv">+</span>Link
          </Button>
        </div>,
      );
    }
  }, [disabled, setExtraButtons]);

  useEffect(() => {
    if (props.data) {
      setData(props.data);
      setContactList(
        props?.data?.matterContacts ? props?.data?.matterContacts : []
      );
      setFilteredList(
        props?.data?.matterContacts ? props?.data?.matterContacts : []
      );
    }
  }, [props.data]);

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
    filterData({ ...filterInput, [name]: value });
  };

  const filterData = (obj) => {
    const newData = contactList?.filter((data) => {
      return (
        (obj["contactCode"] !== ""
          ? data?.contactDetails["contactCode"]
              ?.toLowerCase()
              ?.includes(obj["contactCode"]?.toLowerCase())
          : true) &&
        (obj["contactType"] !== ""
          ? data["contactType"]
              ?.toLowerCase()
              ?.includes(obj["contactType"]?.toLowerCase())
          : true) &&
        (obj["firstName"] !== ""
          ? data?.contactDetails["firstName"]
              ?.toLowerCase()
              ?.includes(obj["firstName"]?.toLowerCase())
          : true) &&
        (obj["lastName"] !== ""
          ? data?.contactDetails["lastName"]
              ?.toLowerCase()
              ?.includes(obj["lastName"]?.toLowerCase())
          : true) &&
        (obj["contactRole"] !== ""
          ? data["contactRoleList"]?.some((role) =>
              role.toLowerCase()?.includes(obj["contactRole"]?.toLowerCase())
            )
          : true) &&
        (obj["companyName"] !== ""
          ? data?.contactDetails["companyName"]
              ?.toLowerCase()
              ?.includes(obj["companyName"]?.toLowerCase())
          : true)
      );
    });

    setFilteredList(newData);
  };

  const sortFunc = (sorton, map) => {
    let newArray = [];
    if (labelSort !== sorton) {
      setLabelSort(sorton);
      setSortOrder("asc");
      setSortField(sorton);

      newArray = filteredList.sort((a, b) => {
        if (get(a, map) === get(b, map)) {
          return 0;
        }

        if (get(a, map) === "" || get(a, map) === null) {
          return 1;
        }
        if (get(b, map) === "" || get(b, map) === null) {
          return -1;
        }

        return (get(a, map) ? get(a, map).toLowerCase() : "") <
          (get(b, map) ? get(b, map).toLowerCase() : "")
          ? -1
          : 1;
      });
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(sorton);
      newArray = filteredList.sort((a, b) => {
        if (get(a, map) === get(b, map)) {
          return 0;
        }

        if (get(a, map) === "" || get(a, map) === null) {
          return 1;
        }
        if (get(b, map) === "" || get(b, map) === null) {
          return -1;
        }

        return (get(a, map) ? get(a, map).toLowerCase() : "") <
          (get(b, map) ? get(b, map).toLowerCase() : "")
          ? 1
          : -1;
      });
    }
    setFilteredList(newArray);
  };

  const handleDeleteAlert = () => {
    if (selectedList && selectedList.length > 0) {
      setUnLinkAlert(true);
    } else {
      toast.warning("Please select any contact");
    }
  };

  const handleDelete = async () => {
    let formData = {
      id: data.id,
      matterContacts: selectedList,
    };
    try {
      setLoading(true);
      const { data } = await unlinkMatterContact(formData);
      if (data.success) {
        refresh();
        setTimeout(() => {
          setSelectedList([]);
        }, 10);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Something went wrong, please try again later.");
    }
  };

  const handleViewDetail = (arg) => {
    setSelectedContact(arg);
  };

  const handleEditRowDetail = (row) => {
    const formValue = {
      ...row,
      ...row.contactDetails,
    };
    dispatch(
      navigationEditFormAction({
        currentValue: { ...row, tab: "CONTACTS", original: "Matters" },
        newValue: formValue,
      })
    );
    navigate("/Contacts");
  };

  const handleOpenPerson = async () => {
    setDisabled(true);
    setLoading(true);
    try {
      const { data } = await fetchAllContactsFromDb("ORGANISATION");
      if (data.success) {
        setCompanyList(data?.data?.contactLists);
        setTimeout(() => {
          setNewPerson(true);
        }, 10);
      }
      setLoading(false);
      setDisabled(false);
    } catch (error) {
      console.error(error);
      setDisabled(false);
      setLoading(false);
      toast.error("Something went wrong, please check console");
    }
  };

  const handleOpenOrg = async () => {
    setDisabled(true);
    setLoading(true);
    try {
      const { data } = await fetchAllContactsFromDb("PERSON");
      if (data.success) {
        setPersonList(data?.data?.contactLists);
        setTimeout(() => {
          setNewOrg(true);
        }, 10);
      }
      setLoading(false);
      setDisabled(false);
    } catch (error) {
      console.error(error);
      setDisabled(false);
      setLoading(false);
      toast.error("Something went wrong, please check console");
    }
  };

  const displayRoles = (arg) => {
    if (arg && arg.length > 0) {
      return arg.join(", ");
    } else {
      return "";
    }
  };

  return (
    <div className="mx-2">
      {/* <div className="d-flex align-items-center justify-content-end mb-2">
        <Button
          color="success"
          disabled={disabled}
          onClick={() => setLinkContact(true)}
          className="d-flex mx-4"
        >
          <span className="plusdiv">+</span>Link
        </Button>
        
      </div> */}

      <Table responsive={true} striped={true} hover={true}>
        <thead className="mb-2 bg-light">
          <tr>
            <th>#</th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() =>
                  sortFunc("contactCode", "contactDetails.contactCode")
                }
              >
                <p>Contact</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "contactCode" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "contactCode" ? (
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
              </div>
              <Input
                type="text"
                autoComplete="off"
                name="contactCode"
                value={filterInput.contactCode}
                onChange={handleFilter}
              />
            </th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() =>
                  sortFunc("firstName", "contactDetails.firstName")
                }
              >
                <p>First Name</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "firstName" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
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
              </div>
              <Input
                type="text"
                autoComplete="off"
                name="firstName"
                value={filterInput.firstName}
                onChange={handleFilter}
              />
            </th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() => sortFunc("lastName", "contactDetails.lastName")}
              >
                <p>Last Name</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "lastName" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
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
              </div>
              <Input
                type="text"
                autoComplete="off"
                name="lastName"
                value={filterInput.lastName}
                onChange={handleFilter}
              />
            </th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() => sortFunc("contactRole", "contactRole")}
              >
                <p>Role</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "contactRole" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "contactRole" ? (
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
              </div>
              <Input
                type="text"
                autoComplete="off"
                name="contactRole"
                value={filterInput.contactRole}
                onChange={handleFilter}
              />
            </th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() => sortFunc("contactType", "contactType")}
              >
                <p>Contact Type</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "contactType" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "contactType" ? (
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
              </div>
              <Input
                type="text"
                autoComplete="off"
                name="contactType"
                value={filterInput.contactType}
                onChange={handleFilter}
              />
            </th>
            <th>
              <div
                className="matter-sorting-label"
                onClick={() =>
                  sortFunc("companyName", "contactDetails.companyName")
                }
              >
                <p>Company</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "companyName" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "companyName" ? (
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
              </div>
              <Input
                type="text"
                autoComplete="off"
                name="companyName"
                value={filterInput.companyName}
                onChange={handleFilter}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredList?.map((contact, i) => (
            <tr
              key={`${contact.contactId}_${contact.contactType}`}
              onClick={() => handleEditRowDetail(contact)}
              className="pe-cursor"
            >
              <td>
                {/* <input
                className='mc-check'
                type='checkbox'
                checked={isSelected(contact)}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={() => handleSelect(contact)}
              /> */}
                <p className="mb-0">{`${i + 1}`}</p>
              </td>
              <td>
                <p className="mb-0">{contact?.contactDetails?.contactCode}</p>
              </td>
              <td>
                <p className="mb-0">{contact?.contactDetails?.firstName}</p>
              </td>
              <td>
                <p className="mb-0">{contact?.contactDetails?.lastName}</p>
              </td>
              <td>
                <p
                  className="mb-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetail(contact);
                  }}
                >
                  <TooltipWrapper
                    id={`contact-${i}`}
                    placement="bottom"
                    text={"Edit Contact's Roles"}
                    content={""}
                    icon={<MdOutlineEdit />}
                  ></TooltipWrapper>
                  <span className="px-1">
                    {displayRoles(contact.contactRoleList)}
                  </span>
                </p>
              </td>
              <td>
                <p className="mb-0">{contact.contactType}</p>
              </td>
              <td>
                <p className="mb-0">{contact?.contactDetails?.companyName}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="mc-header" style={{ display: "none" }}>
        <div className="mc-col xsm">
          {/* <input
            className='mc-check'
            type='checkbox'
            onClick={(e) => e.stopPropagation()}
            onChange={handleSelectAll}
            checked={
              contactList.length > 0 &&
              selectedList.length === contactList.length
            }
          /> */}
          <p>#</p>
        </div>
        <div className="mc-col md"></div>
        <div className="mc-col md"></div>
        <div className="mc-col md"></div>
        <div className="mc-col md"></div>
        <div className="mc-col md"></div>
        <div className="mc-col md"></div>
        {/* <div className='mc-col md'>
          <p>Actions</p>
        </div> */}
      </div>
      {/************Table rows************ */}
      <div className="mc-tBody" style={{ display: "none" }}>
        {filteredList?.map((contact, i) => (
          <div
            className="mc-row pe-cursor"
            key={`${contact.contactId}_${contact.contactType}`}
            onClick={() => handleViewDetail(contact)}
          >
            <div className="mc-col xsm">
              {/* <input
                className='mc-check'
                type='checkbox'
                checked={isSelected(contact)}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={() => handleSelect(contact)}
              /> */}
              <p>{`${i + 1}`}</p>
            </div>
            <div className="mc-col md">
              <p>{contact?.contactDetails?.contactCode}</p>
            </div>
            <div className="mc-col md">
              <p>{contact?.contactDetails?.firstName}</p>
            </div>
            <div className="mc-col md">
              <p>{contact?.contactDetails?.lastName}</p>
            </div>
            <div className="mc-col md">
              <p>{displayRoles(contact.contactRoleList)}</p>
            </div>
            <div className="mc-col md">
              <p>{contact.contactType}</p>
            </div>
            <div className="mc-col md">
              <p>{contact?.contactDetails?.companyName}</p>
            </div>
          </div>
        ))}
      </div>

      {unLinkAlert && (
        <Modal
          isOpen={unLinkAlert}
          toggle={() => {
            setUnLinkAlert(false);
            setSelectedList([]);
          }}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => {
              setUnLinkAlert(false);
              setSelectedList([]);
            }}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              message="Are you sure you want to unlink this contact?"
              heading="Confirm Your Action"
              closeForm={() => {
                setUnLinkAlert(false);
                setSelectedList([]);
              }}
              btn1="No"
              btn2="Yes"
              handleFunc={handleDelete}
            />
          </ModalBody>
        </Modal>
      )}

      {newPerson && (
        <Modal
          isOpen={newPerson}
          toggle={() => setNewPerson(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setNewPerson(false)}
            className="bg-light p-3"
          >
            Add New Person
          </ModalHeader>
          <ModalBody>
            <AddNewPerson
              close={() => {
                setNewPerson(false);
                setIsReload(true);
              }}
              companyList={companyList}
            />
          </ModalBody>
        </Modal>
      )}

      {newOrg && (
        <Modal
          isOpen={newOrg}
          toggle={() => setNewOrg(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader toggle={() => setNewOrg(false)} className="bg-light p-3">
            Add New Organisation
          </ModalHeader>
          <ModalBody>
            <AddNewOrg
              close={() => {
                setNewOrg(false);
                setIsReload(true);
              }}
              personList={personList}
            />
          </ModalBody>
        </Modal>
      )}

      {addAttach && (
        <AddAttachment
          closeForm={() => {
            setAddAttach(false);
            setTimeout(() => {
              setSelectedList([]);
            }, 10);
          }}
          details={selectedList}
        />
      )}

      {linkContact && (
        <Modal
          isOpen={linkContact}
          toggle={() => setLinkContact(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setLinkContact(false)}
            className="bg-light p-3"
          >
            Link Contact
          </ModalHeader>
          <ModalBody>
            <LinkContactPage
              closeForm={() => setLinkContact(false)}
              refresh={refresh}
              data={data}
              openOrg={handleOpenOrg}
              openPerson={handleOpenPerson}
              disabled={disabled}
              isReload={isReload}
              setIsReload={setIsReload}
            />
          </ModalBody>
        </Modal>
      )}

      {selectedContact && (
        <Modal
          isOpen={selectedContact}
          toggle={() => setSelectedContact(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setSelectedContact(false)}
            className="bg-light p-3"
          >
            Edit Link Contact
          </ModalHeader>
          <ModalBody>
            <EditLinkedContact
              closeForm={() => setSelectedContact(null)}
              refresh={refresh}
              data={data}
              selectedContact={selectedContact}
              openOrg={handleOpenOrg}
              openPerson={handleOpenPerson}
              disabled={disabled}
            />
          </ModalBody>
        </Modal>
      )}

      {loading && <LoadingPage />}
    </div>
  );
};

export default MatterContacts;
