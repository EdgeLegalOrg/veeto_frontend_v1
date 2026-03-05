import React, { useEffect, useState, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
} from "reactstrap";
import upArrow from "../../images/upArrow.svg";
import downArrow from "../../images/downArrow.svg";
import downArrowColoured from "../../images/downArrowColoured.svg";
import upArrowColoured from "../../images/upArrowColoured.svg";
import ContactStripe from "../topStripes/ContactStripe";
import LoadingPage from "../../utils/LoadingPage";
import { MdSearch } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import Pagination from "../Pagination";
import SingleContact from "./SingleContact";
import { allContacts, deleteContacts, checkContactsLinked } from "../../apis";
import "../../stylesheets/contacts.css";
import { convertSubstring } from "../../utils/utilFunc";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import { toast } from "react-toastify";
// Actions
import { resetCurrentRouterState } from "../../../../slices/thunks.js";

const filterFields = {
  contactCode: "",
  firstName: "",
  lastName: "",
  organisation: "",
  contactType: "",
  role: "",
  emailAddress: "",
  telephoneNumber: "",
};

const ConfirmationPopup = (props) => {
  const { ids, types, closeForm, setBoolVal, setAllInitial } = props;
  const contactIds = ids.join(",");
  const contactTypes = types.join(",");
  const [enableButton, setEnableButton] = useState(true);

  const handleDeleteContact = () => {
    setEnableButton(false);
    deleteContacts(contactIds, contactTypes)
      .then((res) => {
        setBoolVal(false);
        closeForm();
        setAllInitial();
        setEnableButton(true);
      })
      .catch((err) => {
        console.error(err);
        setEnableButton(true);
      });
  };

  return (
    <div className="">
      <div>
        <div className="p-4">
          <p>Are you sure you want to delete the record?</p>
        </div>
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            className="mx-1"
            color="danger"
            onClick={closeForm}
            disabled={!enableButton}
            type="button"
          >
            No
          </Button>
          <Button
            className="mx-1"
            color="success"
            onClick={handleDeleteContact}
            disabled={!enableButton}
            type="button"
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

function Contacts(props) {
  document.title = "Contacts | EdgeLegal";
  const dispatch = useDispatch();
  const { currentRouterState, navigationEditForm } = useSelector(
    (state) => state.Layout
  );

  const contactDetails = props?.location?.aboutProps
    ? props?.location?.aboutProps
    : null;

  const source = props?.location?.source ? props?.location?.source : null;
  const [contactLists, setContactLists] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterInput, setFilterInput] = useState(filterFields);
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [selectedContactType, setSelectedContactType] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState([]);
  const [selectedContactInd, setSelectedContactInd] = useState([]);
  const [boolVal, setBoolVal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmScreen, setConfirmScreen] = useState(false);
  const [labelSort, setLabelSort] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [allContactList, setAllContactList] = useState([]);
  const [personList, setPersonList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [selectedContact, setSelectedContact] = useState(contactDetails);

  const filterPersons = (data) => {
    const persons = data.filter((contact) => contact.contactType === "PERSON");
    setPersonList(persons);
  };

  const handleClearFilter = () => {
    setFilterInput(filterFields);
    fetchContactListByPage(0, filterFields);
  };

  const filterCompany = (data) => {
    const companies = data.filter(
      (contact) => contact.contactType === "ORGANISATION"
    );
    setCompanyList(companies);
  };

  useEffect(() => {
    if (navigationEditForm.isEditMode) {
      setSelectedContact(navigationEditForm.currentFormValue);
    }
  }, [navigationEditForm]);

  useEffect(() => {
    if (currentRouterState) {
      setSelectedContact(contactDetails);
      dispatch(resetCurrentRouterState());
    }
  }, [currentRouterState]);

  useEffect(() => {
    if (!boolVal) {
      setIsLoading(true);
      allContacts({
        ...filterInput,
        sortField: sortField,
        sortOrder: sortOrder.toUpperCase(),
        pageNo: pageNo,
        pageSize: pageSize,
      })
        .then((response) => {
          if (response.data.success) {
            filterCompany(response.data.data.contactLists);
            filterPersons(response.data.data.contactLists);
            setContactLists(response.data.data.contactLists);
            setAllContactList(response.data.data.contactLists);
            setFilteredData(response.data.data.contactLists);
            setTotalPages(response.data.metadata.page.totalPages);
            setTotalRecords(response.data.metadata.page.totalRecords);
            setIsLoading(false);
            setBoolVal(true);
          } else {
            setIsLoading(false);
            toast.error(
              "There is some problem from server side, please try later."
            );
            //redirect to error page
          }
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        });
    }
  }, [boolVal]);

  const filterData = (obj) => {
    const newData = contactLists.filter(
      (data) =>
        data["contactCode"]
          .toLowerCase()
          .includes(obj["contactCode"].toLowerCase()) &&
        data["firstName"]
          .toLowerCase()
          .includes(obj["firstName"].toLowerCase()) &&
        data["lastName"]
          .toLowerCase()
          .includes(obj["lastName"].toLowerCase()) &&
        data["companyName"]
          .toLowerCase()
          .includes(obj["companyName"].toLowerCase()) &&
        (data["role"]
          ? data["role"].toLowerCase().includes(obj["role"].toLowerCase())
          : true) &&
        (data["emailAddress"]
          ? data["emailAddress"]
              .toLowerCase()
              .includes(obj["emailAddress"].toLowerCase())
          : true) &&
        (data["telephoneNumber"]
          ? data["telephoneNumber"]
              .toLowerCase()
              .includes(obj["telephoneNumber"].toLowerCase())
          : true)
    );
    setFilteredData(newData);
  };

  const handleFilter = (e) => {
    const { name } = e.target;
    setFilterInput({ ...filterInput, [name]: e.target.value });
    setTimeout(() => {
      if (name === "contactType") {
        fetchContactListByPage(0, { ...filterInput, [name]: e.target.value });
      }
    }, 10);
  };

  const fetchContactList = () => {
    setIsLoading(true);
    allContacts({
      ...filterInput,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
      pageNo: pageNo,
      pageSize: pageSize,
    })
      .then((response) => {
        if (response.data.success) {
          setContactLists(response.data.data.contactLists);
          setFilteredData(response.data.data.contactLists);
          setTotalPages(response.data.metadata.page.totalPages);
          setTotalRecords(response.data.metadata.page.totalRecords);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          // redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        // redirect to error page
      });
  };

  const fetchContactListByPage = (num, filters = filterInput) => {
    setIsLoading(true);
    allContacts({
      ...filters,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
      pageNo: num,
      pageSize: pageSize,
    })
      .then((response) => {
        if (response.data.success) {
          setContactLists(response.data.data.contactLists);
          setFilteredData(response.data.data.contactLists);
          setTotalPages(response.data.metadata.page.totalPages);
          setTotalRecords(response.data.metadata.page.totalRecords);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          // redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        // redirect to error page
      });
  };

  const fetchContactListBySort = (field, order) => {
    setIsLoading(true);
    allContacts({
      ...filterInput,
      sortField: field,
      sortOrder: order.toUpperCase(),
      pageNo: pageNo,
      pageSize: pageSize,
    })
      .then((response) => {
        if (response.data.success) {
          setContactLists(response.data.data.contactLists);
          setFilteredData(response.data.data.contactLists);
          setTotalPages(response.data.metadata.page.totalPages);
          setTotalRecords(response.data.metadata.page.totalRecords);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          // redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        // redirect to error page
      });
  };

  const handleOpenSelectedContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleSortByLabel = (field) => {
    if (labelSort !== field) {
      setLabelSort(field);
      setSortOrder("asc");
      setSortField(field);
      fetchContactListBySort(field, "ASC");
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(field);
      fetchContactListBySort(field, "DESC");
    }
  };

  const handleSelectContact = (data, index) => {
    const selectedIndex = selectedContactInd.indexOf(index);
    let newSelectedId = [];
    let newSelectedContactType = [];
    let newSelectedInd = [];

    if (selectedIndex === -1) {
      newSelectedInd = newSelectedInd.concat(selectedContactInd, index);
      newSelectedId = newSelectedId.concat(selectedContactId, data.contactId);
      newSelectedContactType = newSelectedContactType.concat(
        selectedContactType,
        data.contactType
      );
    } else if (selectedIndex === 0) {
      newSelectedInd = newSelectedInd.concat(selectedContactInd.slice(1));
      newSelectedId = newSelectedId.concat(selectedContactId.slice(1));
      newSelectedContactType = newSelectedContactType.concat(
        selectedContactType.slice(1)
      );
    } else if (selectedIndex === selectedContactId?.length - 1) {
      newSelectedInd = newSelectedInd.concat(selectedContactInd.slice(0, -1));
      newSelectedId = newSelectedId.concat(selectedContactId.slice(0, -1));
      newSelectedContactType = newSelectedContactType.concat(
        selectedContactType.slice(0, -1)
      );
    } else if (selectedIndex > 0) {
      newSelectedInd = newSelectedInd.concat(
        selectedContactInd.slice(0, selectedIndex),
        selectedContactInd.slice(selectedIndex + 1)
      );
      newSelectedId = newSelectedId.concat(
        selectedContactId.slice(0, selectedIndex),
        selectedContactId.slice(selectedIndex + 1)
      );
      newSelectedContactType = newSelectedContactType.concat(
        selectedContactType.slice(0, selectedIndex),
        selectedContactType.slice(selectedIndex + 1)
      );
    }
    setSelectedContactInd(newSelectedInd);
    setSelectedContactId(newSelectedId);
    setSelectedContactType(newSelectedContactType);
  };

  const handleSelectAllContact = (event) => {
    if (event.target.checked) {
      const newSelectedInd = filteredData?.map((row, index) => index);
      const newSelectedId = filteredData?.map((row) => row.contactId);
      const newSelectedContactType = filteredData?.map(
        (row) => row.contactType
      );
      setSelectedContactInd(newSelectedInd);
      setSelectedContactId(newSelectedId);
      setSelectedContactType(newSelectedContactType);
      return;
    }
    setSelectedContactInd([]);
    setSelectedContactId([]);
    setSelectedContactType([]);
  };

  const isContactSelected = (ind) => selectedContactInd.indexOf(ind) !== -1;

  const handleDeleteSeletedContact = () => {
    if (selectedContactInd?.length === 0) {
      toast.warning(
        "One or more contacts need to be selected before you can Delete contacts",
      );
      return;
    }

    setIsLoading(true);

    checkContactsLinked(selectedContactId, selectedContactType)
      .then((res) => {
        if (res?.data?.success) {
          const isLinked = res.data.data;

          if (isLinked) {
            toast.warning("The selected contact(s) are linked to matters and cannot be deleted.");
          } else {
            setConfirmScreen(true);
          }
        } else {
          toast.error("Unable to verify linked contacts.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Server error while checking linked contacts.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSetInitial = () => {
    setSelectedContactInd([]);
    setSelectedContactId([]);
    setSelectedContactType([]);
  };

  const changeNumberOfRows = (e) => {
    setIsLoading(true);
    setPageSize(e.target.value);
    let currSize = e.target.value;

    let tempTotalPages = Math.ceil(totalRecords / currSize);
    let tempPageNo = tempTotalPages - 1;

    if (tempPageNo < pageNo) {
      setPageNo(tempPageNo);
    } else {
      tempPageNo = pageNo;
    }

    allContacts({
      ...filterInput,
      pageNo: tempPageNo,
      pageSize: currSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
    })
      .then((response) => {
        if (response?.data?.success) {
          setContactLists(response?.data?.data?.contactLists);
          setFilteredData(response?.data?.data?.contactLists);
          setTotalPages(response?.data?.metadata?.page?.totalPages);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          // redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        // redirect to error page
      });
  };

  const handleNextPage = () => {
    setIsLoading(true);
    let pg = pageNo + 1;
    setPageNo(pg);

    allContacts({
      ...filterInput,
      pageNo: pg,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
    })
      .then((response) => {
        if (response?.data?.success) {
          setContactLists(response?.data?.data?.contactLists);
          setFilteredData(response?.data?.data?.contactLists);
          setTotalPages(response?.data?.metadata?.page?.totalPages);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          // redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        // redirect to error page
      });
  };

  const handlePreviousPage = () => {
    setIsLoading(true);
    let pg = pageNo - 1;
    setPageNo(pg);

    allContacts({
      ...filterInput,
      pageNo: pg,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
    })
      .then((response) => {
        if (response.data.success) {
          setContactLists(response.data.data.contactLists);
          setFilteredData(response.data.data.contactLists);
          setTotalPages(response.data.metadata.page.totalPages);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          // redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        // redirect to error page
      });
  };

  const handleJumpToPage = (num) => {
    setIsLoading(true);
    setPageNo(num - 1);

    allContacts({
      ...filterInput,
      pageNo: num - 1,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
    })
      .then((response) => {
        if (response.data.success) {
          setContactLists(response.data.data.contactLists);
          setFilteredData(response.data.data.contactLists);
          setTotalPages(response.data.metadata.page.totalPages);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          // redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        // redirect to error page
      });
  };

  const handleFilterSubmit = () => {
    setPageNo(0);
    fetchContactListByPage(0);
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Contacts" pageTitle="Contacts" />
          <Card>
            {!selectedContact || Object.keys(selectedContact) === 0 ? (
              <>
                <CardHeader className="border-0">
                  <ContactStripe
                    handleDelete={handleDeleteSeletedContact}
                    changeBool={setBoolVal}
                    personList={personList}
                    companyList={companyList}
                  />
                </CardHeader>
                <div className="">
                  <Table responsive={true} striped={true} hover={true}>
                    <thead className="table-light">
                      <tr>
                        <th>
                          <Input
                            type="checkbox"
                            onChange={handleSelectAllContact}
                            checked={
                              filteredData?.length > 0 &&
                              selectedContactInd?.length ===
                                filteredData?.length
                            }
                          />
                        </th>
                        <th>
                          <label
                            onClick={() => handleSortByLabel("firstName")}
                            className="d-flex"
                          >
                            First Name
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "firstName" ? (
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
                              {sortOrder === "desc" &&
                              sortField === "firstName" ? (
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
                            name="firstName"
                            placeholder="First Name"
                            value={filterInput.firstName}
                            onChange={handleFilter}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleFilterSubmit()
                            }
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex"
                            onClick={() => handleSortByLabel("lastName")}
                          >
                            Last Name
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "lastName" ? (
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
                              {sortOrder === "desc" &&
                              sortField === "lastName" ? (
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
                            placeholder="Last Name"
                            name="lastName"
                            onChange={handleFilter}
                            value={filterInput.lastName}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleFilterSubmit()
                            }
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex"
                            onClick={() => handleSortByLabel("organisation")}
                          >
                            Company
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "organisation" ? (
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
                              {sortOrder === "desc" &&
                              sortField === "organisation" ? (
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
                            placeholder="Organisation"
                            onChange={handleFilter}
                            value={filterInput.organisation}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleFilterSubmit()
                            }
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex"
                            onClick={() => handleSortByLabel("role")}
                          >
                            Role
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" && sortField === "role" ? (
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
                              {sortOrder === "desc" && sortField === "role" ? (
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
                            name="role"
                            placeholder="Role"
                            onChange={handleFilter}
                            value={filterInput.role}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleFilterSubmit()
                            }
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex"
                            onClick={() => handleSortByLabel("contactType")}
                          >
                            Contact Type
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "contactType" ? (
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
                              {sortOrder === "desc" &&
                              sortField === "contactType" ? (
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
                            type="select"
                            name="contactType"
                            onChange={handleFilter}
                            value={filterInput.contactType}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleFilterSubmit()
                            }
                          >
                            <i className="mdi mdi-chevron-down"></i>
                            <option value="">All</option>
                            <option value="ORGANISATION">ORGANISATION</option>
                            <option value="PERSON">PERSON</option>
                          </Input>
                        </th>
                        <th>
                          <label
                            className="d-flex"
                            onClick={() => handleSortByLabel("emailAddress")}
                          >
                            Email Address
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "emailAddress" ? (
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
                              {sortOrder === "desc" &&
                              sortField === "emailAddress" ? (
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
                            placeholder="Email"
                            name="emailAddress"
                            onChange={handleFilter}
                            value={filterInput.emailAddress}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleFilterSubmit()
                            }
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex"
                            onClick={() => handleSortByLabel("telephoneNumber")}
                          >
                            Phone Number
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "telephoneNumber" ? (
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
                              {sortOrder === "desc" &&
                              sortField === "telephoneNumber" ? (
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
                            placeholder="Telephone Number"
                            name="telephoneNumber"
                            onChange={handleFilter}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleFilterSubmit()
                            }
                            value={filterInput.telephoneNumber}
                          />
                        </th>
                        <th>
                          <div className="d-flex gap-1">
                            <Button
                              onClick={handleFilterSubmit}
                              color="success"
                              className="mx-1"
                            >
                              <MdSearch size={18} />
                            </Button>
                            <Button
                              onClick={handleClearFilter}
                              color="danger"
                              className="mx-1"
                            >
                              <AiOutlineClose size={18} />
                            </Button>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData?.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: "center" }}>
                            <p>No records to display</p>
                          </td>
                        </tr>
                      ) : (
                        <>
                          {filteredData.map((contact, index) => {
                            if (index % 2 == 0)
                              return (
                                <tr
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSelectedContact(contact);
                                  }}
                                  className="pe-cursor"
                                >
                                  <td>
                                    <Input
                                      type="checkbox"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={() =>
                                        handleSelectContact(contact, index)
                                      }
                                      checked={isContactSelected(index)}
                                    />
                                  </td>
                                  <td>
                                    {contact.contactType === "PERSON"
                                      ? contact.firstName
                                      : ""}
                                  </td>
                                  <td>
                                    {contact.contactType === "PERSON"
                                      ? contact.lastName
                                      : ""}
                                  </td>
                                  <td>{contact.organisation}</td>
                                  <td>
                                    <OverlayTrigger
                                      key="bottom"
                                      placement="bottom-start"
                                      overlay={
                                        <Tooltip id={`tooltip-bottom`}>
                                          {contact.contactType === "PERSON" && (
                                            <p
                                              style={{ textAlign: "left" }}
                                              className="mb-0"
                                            >
                                              {contact?.role
                                                ? contact.role
                                                : ""}
                                            </p>
                                          )}
                                          {contact.contactType ===
                                            "ORGANISATION" && (
                                            <p
                                              style={{ textAlign: "left" }}
                                              className="mb-0"
                                            >
                                              {contact.subType
                                                ? contact.subType
                                                : ""}
                                            </p>
                                          )}
                                        </Tooltip>
                                      }
                                    >
                                      <p className="mb-0">
                                        {contact.contactType === "PERSON" &&
                                          convertSubstring(contact.role, 9)}
                                        {contact.contactType ===
                                          "ORGANISATION" &&
                                          convertSubstring(contact.subType, 9)}
                                      </p>
                                    </OverlayTrigger>
                                  </td>
                                  <td>
                                    <p className="mb-0">
                                      {contact.contactType}
                                    </p>
                                  </td>
                                  <td>
                                    <OverlayTrigger
                                      key="bottom"
                                      placement="bottom-start"
                                      overlay={
                                        <Tooltip id={`tooltip-bottom`}>
                                          <p
                                            style={{ textAlign: "left" }}
                                            className="mb-0"
                                          >
                                            {contact.emailAddress}
                                          </p>
                                        </Tooltip>
                                      }
                                    >
                                      <p className="mb-0">
                                        {contact.emailAddress
                                          ? contact.emailAddress.substring(
                                              0,
                                              15
                                            )
                                          : ""}
                                      </p>
                                    </OverlayTrigger>
                                  </td>
                                  <td>
                                    <p className="mb-0">
                                      {contact.telephoneNumber}
                                    </p>
                                  </td>
                                  <td></td>
                                </tr>
                              );
                            else {
                              return (
                                <tr
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSelectedContact(contact);
                                  }}
                                  className="pe-cursor"
                                >
                                  <td>
                                    <Input
                                      type="checkbox"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={() =>
                                        handleSelectContact(contact, index)
                                      }
                                      checked={isContactSelected(index)}
                                    />
                                  </td>
                                  <td>
                                    <p className="mb-0">
                                      {contact.contactType === "PERSON"
                                        ? contact.firstName
                                        : ""}
                                    </p>
                                  </td>
                                  <td>
                                    <p className="mb-0">
                                      {contact.contactType === "PERSON"
                                        ? contact.lastName
                                        : ""}
                                    </p>
                                  </td>
                                  <td>
                                    <p className="mb-0">
                                      {contact.organisation}
                                    </p>
                                  </td>
                                  <td>
                                    <OverlayTrigger
                                      key="bottom"
                                      placement="bottom-start"
                                      overlay={
                                        <Tooltip id={`tooltip-bottom`}>
                                          {contact.contactType === "PERSON" && (
                                            <p
                                              style={{ textAlign: "left" }}
                                              className="mb-0"
                                            >
                                              {contact?.role
                                                ? contact.role
                                                : ""}
                                            </p>
                                          )}
                                          {contact.contactType ===
                                            "ORGANISATION" && (
                                            <p
                                              style={{ textAlign: "left" }}
                                              className="mb-0"
                                            >
                                              {contact.subType
                                                ? contact.subType
                                                : ""}
                                            </p>
                                          )}
                                        </Tooltip>
                                      }
                                    >
                                      <p className="mb-0">
                                        {contact.contactType === "PERSON" &&
                                          convertSubstring(contact.role, 9)}
                                        {contact.contactType ===
                                          "ORGANISATION" &&
                                          convertSubstring(contact.subType, 9)}
                                      </p>
                                    </OverlayTrigger>
                                  </td>
                                  <td>
                                    <p className="mb-0">
                                      {contact.contactType}
                                    </p>
                                  </td>
                                  <td>
                                    <OverlayTrigger
                                      key="bottom"
                                      placement="bottom-start"
                                      overlay={
                                        <Tooltip id={`tooltip-bottom`}>
                                          <p
                                            style={{ textAlign: "left" }}
                                            className="mb-0"
                                          >
                                            {contact.emailAddress}
                                          </p>
                                        </Tooltip>
                                      }
                                    >
                                      <p className="mb-0">
                                        {convertSubstring(contact.emailAddress)}
                                      </p>
                                    </OverlayTrigger>
                                  </td>
                                  <td>
                                    <p className="mb-0">
                                      {contact.telephoneNumber}
                                    </p>
                                  </td>
                                  <th></th>
                                  <th></th>
                                </tr>
                              );
                            }
                          })}
                        </>
                      )}
                    </tbody>
                  </Table>
                </div>
                <CardBody className="mt-2">
                  {!isLoading && (
                    <Pagination
                      pageNo={pageNo}
                      pageSize={pageSize}
                      totalRecords={totalRecords}
                      totalPages={totalPages}
                      handlePreviousPage={handlePreviousPage}
                      handleNextPage={handleNextPage}
                      handleJumpToPage={handleJumpToPage}
                      changeNumberOfRows={changeNumberOfRows}
                    />
                  )}
                </CardBody>
                {confirmScreen && (
                  <Modal
                    isOpen={confirmScreen}
                    toggle={() => setConfirmScreen(false)}
                    backdrop="static"
                    scrollable={true}
                    size="md"
                    centered
                  >
                    <ModalHeader
                      toggle={() => setConfirmScreen(false)}
                      className="bg-light p-3"
                    >
                      Confirm Your Action
                    </ModalHeader>
                    <ModalBody>
                      <ConfirmationPopup
                        closeForm={() => setConfirmScreen(false)}
                        setBoolVal={setBoolVal}
                        ids={selectedContactId}
                        types={selectedContactType}
                        setAllInitial={handleSetInitial}
                      />
                    </ModalBody>
                  </Modal>
                )}

                {isLoading && <LoadingPage />}
              </>
            ) : (
              <SingleContact
                refreshList={setBoolVal}
                contact={selectedContact}
                source={source}
                setSelectedContact={setSelectedContact}
                companyList={companyList}
                personList={personList}
              />
            )}
          </Card>
        </Container>
      </div>
    </Fragment>
  );
}

export default Contacts;
