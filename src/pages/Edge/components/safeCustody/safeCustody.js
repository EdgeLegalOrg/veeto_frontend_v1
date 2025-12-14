import fileDownload from "js-file-download";
import { useSelector, useDispatch } from "react-redux";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v1 as uuidv1 } from "uuid";
import EditContentAttachment from "./EditContentAttachment.js";
import ReceiptDocument from "./ReceiptDocument";
import AssociatedContacts from "./associatedContacts.js";
import Document from "./document.js";
import { formatDateFunc } from "../../utils/utilFunc";

// import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import classnames from "classnames";
import {
  deleteContentAttachment,
  downloadContentAttachment,
  editSafecustody,
  fetchAllContactsFromDb,
  fetchLinkedContacts,
  prepareReceiptForCustody,
  setPrimaryContactForCustody,
  unlinkContactToSafecustody,
} from "../../apis";
import downArrow from "../../images/downArrow.svg";
import downArrowColoured from "../../images/downArrowColoured.svg";
import upArrow from "../../images/upArrow.svg";
import upArrowColoured from "../../images/upArrowColoured.svg";
import "../../stylesheets/safeCustody.css";
import LoadingPage from "../../utils/LoadingPage";
import {
  AlertPopup,
  ConfirmationCustodyPopup,
} from "../customComponents/CustomComponents";
import AddCustodyForm from "./AddCustodyForm";
import AddOrganisation from "./AddOrganisation";
import AddPerson from "./AddPerson";
import LinkContactForm from "./LinkContactForm";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";
import {
  updateFormStatusAction,
  resetFormStatusAction,
} from "slices/layouts/reducer";

const filterFields = {
  contactCode: "",
  firstName: "",
  lastName: "",
  companyName: "",
  contactType: "",
  emailAddress: "",
  telephoneNumber: "",
  organisation: "",
  name: "",
};

const ConfirmationPopup = (props) => {
  const {
    formData,
    closeForm,
    setBoolVal,
    selectedContent,
    clearSelected,
    deleteType,
    message,
  } = props;

  const [enableButton, setEnableButton] = useState(true);

  const handleDeleteAttachment = () => {
    setEnableButton(false);
    const ids = selectedContent.join(",");
    deleteContentAttachment(ids)
      .then((res) => {
        setEnableButton(true);
        clearSelected();
        setBoolVal(false);
        closeForm();
      })
      .catch((e) => {
        console.error(e);
        setEnableButton(true);
      });
  };

  const handleDeleteContact = async () => {
    setEnableButton(false);
    unlinkContactToSafecustody(formData)
      .then((res) => {
        setEnableButton(true);
        clearSelected();
        setBoolVal(false);
        closeForm();
      })
      .catch((err) => {
        setEnableButton(true);
        console.error(err);
      });
  };

  return (
    <div className="">
      <div className="">
        <div className="p-4">
          <p>{message}</p>
        </div>
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            className="mx-1"
            onClick={closeForm}
            disabled={!enableButton}
            color="danger"
          >
            No
          </Button>
          <Button
            className="mx-1"
            onClick={() => {
              if (deleteType === "content") {
                handleDeleteAttachment();
              } else {
                handleDeleteContact();
              }
            }}
            disabled={!enableButton}
            color="success"
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

function RenderSafeCustody(props) {
  const { id, setSelectedCustody, aboutProps } = props;
  const source = aboutProps ? aboutProps.source : "safecustody";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formStatus, navigationEditForm } = useSelector(
    (state) => state.Layout
  );
  const [formStatusNew, setFormStatusNew] = useState({
    isFormChanged: false,
    isShowModal: false,
  });

  const [boolVal, setBoolVal] = useState(false);
  const [custodyPacketContacts, setCustodyPacketContacts] = useState([]);
  const [filterPerpare, setFilterPrepare] = useState([]);
  const [custodyPacket, setCustodyPacket] = useState({});
  const [tempCustodyPacket, settempCustodyPacket] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [filterInput, setFilterInput] = useState(filterFields);
  const [prepareInput, setPrepareInput] = useState(filterFields);
  const [prepareSelect, setPrepareSelect] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState({
    receiptDate: new Date(),
    comment: "",
  });
  const [prepareReceiptContact, setPrepareReceiptContact] = useState(undefined);
  const [isAddCustodyOpen, setIsAddCustoduOpen] = useState(false);

  const [openLinkContactForm, setOpenLinkContactForm] = useState(false);
  const [contactLists, setContactLists] = useState([]); // all contact list
  const [selectedContact, setSelectedContact] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState([]);
  const [selectedContent, setSelectedContent] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState([]);
  const [selectPrepare, setSelectPrepare] = useState([]);
  const [contentShow, setContentShow] = useState(false);
  const [confirmScreen, setConfirmScreen] = useState(false);
  const [primaryContactDetail, setPrimaryContactDetail] = useState({});
  const [formDataForUnlink, setFormDataForUnlink] = useState({});
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [isEnableButtons, setIsEnableButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addContactLoading, setAddContactLoading] = useState(false);
  const [labelSort, setLabelSort] = useState("");
  const [deleteType, setDeleteType] = useState("");
  const [openEditWindow, setOpenEditWindow] = useState(false);
  const [contentToEdit, setContentToEdit] = useState({});
  const [allCountries, setAllCountries] = useState([]);
  const [postalList, setPostalList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [personList, setPersonList] = useState([]);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [confirmCustody, setConfirmCustody] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    const isChanged =
      JSON.stringify(tempCustodyPacket) !== JSON.stringify(custodyPacket);
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [tempCustodyPacket, custodyPacket]);

  const makeContactArray = (data) => {
    let arrayData = [];
    data.forEach((d) => {
      if (d.contactType === "PERSON") {
        const obj = {
          name: `${d.firstName} ${d.lastName}`,
          contactType: d.contactType,
          contactId: d.contactId,
          firstName: d.firstName,
          lastName: d.lastName,
          contactRole: d.role,
          organisation: d.organisation ? d.organisation : "",
        };
        arrayData.push(obj);
      } else {
        const obj = {
          name: `${d.organisation}`,
          contactType: d.contactType,
          contactId: d.contactId,
          organisation: d.organisation,
          contactRole: d.role,
        };
        arrayData.push(obj);
      }
    });
    setContactLists(arrayData);
    setFilterPrepare(arrayData);
  };

  const fetchAllContacts = () => {
    fetchAllContactsFromDb("")
      .then((res) => {
        if (res.data.success) {
          makeContactArray(res.data?.data?.contactLists);
          setIsEnableButtons(true);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          setSelectedCustody(null);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        }
      })
      .catch((e) => {
        console.error(e);
        setIsEnableButtons(true);
        setIsLoading(false);
        setSelectedCustody(null);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      });
  };

  const findPrimary = (data) => {
    const primary = data.filter((ele) => ele.primaryContact === true);
    setPrimaryContactDetail({
      ...primaryContactDetail,
      firstName: primary[0]?.contactDetails?.firstName,
      lastName: primary[0]?.contactDetails?.lastName,
      contactType: primary[0]?.contactType,
      fullAddress: primary[0]?.fullAddress,
    });
  };

  useEffect(() => {
    if (!boolVal) {
      setIsLoading(true);
      fetchAllContacts();
      fetchLinkedContacts(id)
        .then((response) => {
          if (response.data.success) {
            setBoolVal(true);
            if (response.data.data) {
              findPrimary(response.data?.data?.custodyPacketContacts);
            }
            setCustodyPacketContacts(
              response.data?.data?.custodyPacketContacts
                ? response.data?.data?.custodyPacketContacts
                : []
            );
            setCustodyPacket(response.data?.data);
            settempCustodyPacket(response.data?.data);
            setFilteredData(
              response.data?.data?.custodyPacketContacts
                ? response.data?.data?.custodyPacketContacts
                : []
            );
            setIsLoading(false);
          } else {
            setBoolVal(true);
            setIsLoading(false);
            setSelectedCustody(null);
            toast.error(
              "There is some problem from server side, please try later."
            );
            //redirect to error page
          }
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
          setSelectedCustody(null);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        });
    }
  }, [boolVal, primaryContactDetail, id]);

  const fetchCustodyDetails = async () => {
    setIsLoading(true);
    try {
      const { data } = await fetchLinkedContacts(id);
      if (data.success) {
        if (data.data) {
          findPrimary(data?.data?.custodyPacketContacts);
        }
        setCustodyPacketContacts(
          data?.data?.custodyPacketContacts
            ? data?.data?.custodyPacketContacts
            : []
        );
        setCustodyPacket(data?.data);
        settempCustodyPacket(data?.data);
        setFilteredData(
          data?.data?.custodyPacketContacts
            ? data?.data?.custodyPacketContacts
            : []
        );
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setSelectedCustody(null);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  const handleAddCustody = () => {
    setIsAddCustoduOpen(true);
  };
  const handleContentClose = () => {
    setContentShow(false);
    setPrepareInput(filterFields);
    setSelectPrepare([]);
    setPrepareReceiptContact(undefined);
  };
  const handleContentShow = () => {
    setSelectPrepare(selectedContent);
    setContentShow(true);
  };

  const handleSelectContactForContact = (data, index) => {
    const selectedIndex = selectedContactId.indexOf(index);
    let newSelectedId = [];
    let newSelectedContact = [];

    if (selectedIndex === -1) {
      newSelectedId = newSelectedId.concat(selectedContactId, index);
      newSelectedContact = newSelectedContact.concat(selectedContact, {
        safeCustodyPacketId: data.safeCustodyPacketId,
        contactId: data.contactId,
        contactType: data.contactType,
        contactRole: data.contactRole,
        primaryContact: data.primaryContact,
        contactName: data.contactDetails.companyName
          ? data.contactDetails.companyName
          : `${
              data.contactDetails.firstName ? data.contactDetails.firstName : ""
            }${
              data.contactDetails.lastName
                ? ` ${data.contactDetails.lastName}`
                : ""
            }`,
      });
    } else if (selectedIndex === 0) {
      newSelectedId = newSelectedId.concat(selectedContactId.slice(1));
      newSelectedContact = newSelectedContact.concat(selectedContact.slice(1));
    } else if (selectedIndex === selectedContactId?.length - 1) {
      newSelectedId = newSelectedId.concat(selectedContactId.slice(0, -1));
      newSelectedContact = newSelectedContact.concat(
        selectedContact.slice(0, -1)
      );
    } else if (selectedIndex > 0) {
      newSelectedId = newSelectedId.concat(
        selectedContactId.slice(0, selectedIndex),
        selectedContactId.slice(selectedIndex + 1)
      );
      newSelectedContact = newSelectedContact.concat(
        selectedContact.slice(0, selectedIndex),
        selectedContact.slice(selectedIndex + 1)
      );
    }
    setSelectedContactId(newSelectedId);
    setSelectedContact(newSelectedContact);
  };

  const handleSelectAllContact = (event) => {
    if (event.target.checked) {
      const newSelectedId = filteredData?.map((row, index) => index);
      const newSelectedContact = filteredData?.map((row) => {
        return {
          safeCustodyPacketId: row.safeCustodyPacketId,
          contactId: row.contactId,
          contactType: row.contactType,
          contactRole: row.contactRole,
          primaryContact: row.primaryContact,
        };
      });
      setSelectedContactId(newSelectedId);
      setSelectedContact(newSelectedContact);
      return;
    }
    setSelectedContactId([]);
    setSelectedContact([]);
  };

  // to check whether the property is selected or not
  const isContactSelected = (id) => selectedContactId.indexOf(id) !== -1;

  const handleCommentChange = (e) => {
    setCustodyPacket({ ...custodyPacket, comments: e.target.value });
  };

  const checkForAllChecked = (data) => {
    let newSelectedId = [];
    custodyPacket?.custodyPacketAttachments?.forEach((row) => {
      if (row.dateOut === null) {
        newSelectedId.push(row.id);
      }
    });
    return newSelectedId?.length > 0 && data?.length === newSelectedId?.length;
  };

  const handleSelectAllContent = (event) => {
    if (event.target.checked) {
      let newSelectedId = [];
      let newSelectedName = [];
      custodyPacket?.custodyPacketAttachments?.forEach((row) => {
        if (row.dateOut === null) {
          newSelectedId.push(row.id);
          newSelectedName.push(row.name);
        }
      });
      setSelectedContent(newSelectedId);
      setSelectedFilename(newSelectedName);
      return;
    }
    setSelectedContent([]);
    setSelectedFilename([]);
  };

  const handleSaveCustody = async () => {
    try {
      const { data } = await editSafecustody({
        requestId: uuidv1(),
        data: {
          id: custodyPacket.id,
          comments: custodyPacket.comments,
          packetNumber: custodyPacket.packetNumber,
          checksum: custodyPacket.checksum,
        },
      });
      if (data.success) {
        setCustodyPacket({
          ...custodyPacket,
          checksum: data?.data?.checksum,
          comments: data?.data?.comments,
        });
        settempCustodyPacket({
          ...custodyPacket,
          checksum: data?.data?.checksum,
          comments: data?.data?.comments,
        });
        toast.info("Saved!");
      } else {
        setShowAlert(true);
        setAlertMsg(data?.error?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowContacts = () => {
    if (formStatus.isFormChanged) {
      return dispatch(
        updateFormStatusAction({ key: "isShowModal", value: true })
      );
    }

    fetchLinkedContacts(id).then((response) => {
      setCustodyPacketContacts(
        response.data?.data?.custodyPacketContacts
          ? response.data?.data?.custodyPacketContacts
          : []
      );
      setFilteredData(
        response.data?.data?.custodyPacketContacts
          ? response.data?.data?.custodyPacketContacts
          : []
      );
      setCurrentSafe("contacts");
    });
  };

  const handleShowReceipts = () => {
    if (formStatus.isFormChanged) {
      return dispatch(
        updateFormStatusAction({ key: "isShowModal", value: true })
      );
    }
    setCurrentSafe("recepients");
  };

  const handleOpenLinkForm = async () => {
    setOpenLinkContactForm(true);
  };

  const handleUnLink = async () => {
    if (selectedContact?.length !== 0) {
      let formData = {
        requestId: uuidv1(),
        data: selectedContact,
      };
      setDeleteType("contact");
      setFormDataForUnlink(formData);
      setConfirmScreen(true);
    } else {
      toast.error(
        "One or more contacts need to be selected before you can Delete contacts"
      );
    }
  };

  const handleSetPrimary = async () => {
    if (selectedContact?.length === 1) {
      setConfirmCustody(true);
    } else {
      if (selectedContact?.length === 0) {
        toast.warning(
          "A contact needs to be selected to assign as a Primary Contact."
        );
      } else {
        toast.warning(
          "Only 1 contact can be set as a Primary Contact. Please select only 1 contact"
        );
      }
    }
  };

  const updatePrimaryContact = () => {
    let formData = {
      requestId: uuidv1(),
      data: {
        safeCustodyPacketId: selectedContact[0].safeCustodyPacketId,
        contactId: selectedContact[0].contactId,
        contactType: selectedContact[0].contactType,
        contactRole: selectedContact[0].contactRole,
        primaryContact: true,
      },
    };
    setIsEnableButtons(false);
    setPrimaryContactForCustody(formData)
      .then((res) => {
        if (res.data.success) {
          setIsEnableButtons(true);
          setBoolVal(false);
          setConfirmCustody(false);
          // setSelectedContact([]);
          toast.info("Successfully changed Primary Contact");
        } else {
          setIsEnableButtons(true);
          setConfirmCustody(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        }
      })
      .catch((e) => {
        console.error(e);
        setIsEnableButtons(true);
        setConfirmCustody(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      });
  };

  const filterData = (obj) => {
    const newData = custodyPacketContacts.filter(
      (data) =>
        (data.contactDetails["contactCode"]
          ? data.contactDetails["contactCode"]
              .toLowerCase()
              .includes(obj["contactCode"].toLowerCase())
          : true) &&
        (data.contactDetails["firstName"]
          ? data.contactDetails["firstName"]
              .toLowerCase()
              .includes(obj["firstName"].toLowerCase())
          : true) &&
        (data.contactDetails["lastName"]
          ? data.contactDetails["lastName"]
              .toLowerCase()
              .includes(obj["lastName"].toLowerCase())
          : true) &&
        (data.contactDetails["companyName"]
          ? data.contactDetails["companyName"]
              .toLowerCase()
              .includes(obj["companyName"].toLowerCase())
          : true) &&
        (data.contactDetails["emailAddress"]
          ? data.contactDetails["emailAddress"]
              .toLowerCase()
              .includes(obj["emailAddress"].toLowerCase())
          : true) &&
        (data.contactDetails["telephoneNumber"]
          ? data.contactDetails["telephoneNumber"]
              .toLowerCase()
              .includes(obj["telephoneNumber"].toLowerCase())
          : true) &&
        (data["contactType"]
          ? data["contactType"]
              .toLowerCase()
              .includes(obj["contactType"].toLowerCase())
          : true)
    );
    setFilteredData(newData);
  };

  const handleFilter = (e) => {
    const { name } = e.target;
    setFilterInput({ ...filterInput, [name]: e.target.value });
    filterData({ ...filterInput, [name]: e.target.value });
  };

  const filterPrepareData = (obj) => {
    const newData = contactLists.filter((data) => {
      return data.name.toLowerCase().includes(obj["name"].toLowerCase());
    });
    setFilterPrepare(newData);
  };

  const handleFilterPrepare = (e) => {
    const { name } = e.target;
    if (prepareSelect) {
      setPrepareSelect(false);
    }
    setPrepareInput({ ...prepareInput, [name]: e.target.value });
    filterPrepareData({ ...prepareInput, [name]: e.target.value });
  };

  const handleSortByLabel = (field) => {
    let sortedData = filteredData.sort((a, b) => {
      if (labelSort !== field) {
        setLabelSort(field);
        setSortOrder("asc");
        setSortField(field);
        return a.contactDetails[field] < b.contactDetails[field] ? -1 : 1;
      } else {
        setLabelSort("");
        setSortOrder("desc");
        setSortField(field);
        return a.contactDetails[field] < b.contactDetails[field] ? 1 : -1;
      }
    });
    setFilteredData(sortedData);
  };

  const handleSelectToPrepare = (id) => {
    const selectedIndex = selectPrepare.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectPrepare, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectPrepare.slice(1));
    } else if (selectedIndex === selectPrepare?.length - 1) {
      newSelected = newSelected.concat(selectPrepare.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectPrepare.slice(0, selectedIndex),
        selectPrepare.slice(selectedIndex + 1)
      );
    }
    setSelectPrepare(newSelected);
  };

  const handleSelectAllPrepare = (event) => {
    if (event.target.checked) {
      let newSelecteds = [];
      custodyPacket?.custodyPacketAttachments?.forEach((row) => {
        if (row.dateOut === null) {
          newSelecteds.push(row.id);
        }
      });
      setSelectPrepare(newSelecteds);
      return;
    }
    setSelectPrepare([]);
  };

  // to check whether the property is selected or not
  const isSelected = (id) => selectPrepare.indexOf(id) !== -1;

  const handleSelectContactForReceipt = (i) => {
    const data = JSON.parse(i);
    setPrepareSelect(true);
    setPrepareInput({
      ...prepareInput,
      name: data.name,
    });
    setPrepareReceiptContact(data);
  };

  const handlePrepareReceipt = () => {
    if (prepareReceiptContact && selectPrepare?.length !== 0) {
      const data = {
        contactId: prepareReceiptContact.contactId,
        contactType: prepareReceiptContact.contactType,
        safeCustodyPacketId: id,
        custodyPacketAttachmentIdList: selectPrepare,
        comments: receiptInfo.comment,
        receiptDate: receiptInfo.receiptDate,
      };

      prepareReceiptForCustody({
        requestId: uuidv1(),
        data: data,
      })
        .then((response) => {
          handleContentClose();
          setSelectPrepare([]);
          setSelectedContent([]);
          setBoolVal(false);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      toast.warning("Select contact and document");
    }
  };

  const handleDeleteAttachment = () => {
    if (selectedContent?.length !== 0) {
      setDeleteType("content");
      setConfirmScreen(true);
    } else {
      toast.warning("Select attachment");
    }
  };

  const handleDownloadContentAttachment = () => {
    const ids = selectedContent.join(",");

    if (selectedContent?.length !== 0) {
      if (selectedContent?.length > 1) {
        downloadContentAttachment(ids)
          .then((res) => {
            fileDownload(res.data, "documents.zip");
            setSelectedContent([]);
            setSelectedFilename([]);
          })
          .catch((e) => {
            console.error(e);
            setSelectedContent([]);
            setSelectedFilename([]);
            toast.error(
              "There is some problem from server side, please try later."
            );
            //redirect to error page
          });
      } else {
        downloadContentAttachment(ids)
          .then((res) => {
            fileDownload(res.data, selectedFilename[0]);
            setSelectedContent([]);
            setSelectedFilename([]);
          })
          .catch((e) => {
            console.error(e);
            setSelectedContent([]);
            setSelectedFilename([]);
            toast.error(
              "There is some problem from server side, please try later."
            );
          });
      }
    } else {
      toast.warning("Select attachment");
    }
  };

  const handleEditContent = () => {
    if (selectedContent?.length > 1) {
      toast.warning("Select one content at a time");
    } else {
      if (selectedContent?.length !== 0) {
        custodyPacket?.custodyPacketAttachments?.forEach((d) => {
          if (d.id === selectedContent[0]) {
            setContentToEdit(d);
            return setOpenEditWindow(true);
          }
        });
      } else {
        toast.warning("Select attachment");
      }
    }
  };

  const handleAddPerson = async () => {
    setAddContactLoading(true);
    try {
      const { data } = await fetchAllContactsFromDb("PERSON");
      setPersonList(data.data.contactLists);
      setAllCountries(JSON.parse(window.localStorage.getItem("countryList")));
      setPostalList(JSON.parse(window.localStorage.getItem("postalList")));
      setRoleList(JSON.parse(window.localStorage.getItem("roleList")));
      setAddContactLoading(false);
      setShowAddPerson(true);
    } catch (error) {
      console.error(error);
      setAddContactLoading(false);
    }
  };

  const handleAddOrganisation = async () => {
    setAddContactLoading(true);
    try {
      const { data } = await fetchAllContactsFromDb("ORGANISATION");
      setCompanyList(data.data.contactLists);
      setAllCountries(JSON.parse(window.localStorage.getItem("countryList")));
      setPostalList(JSON.parse(window.localStorage.getItem("postalList")));
      setRoleList(JSON.parse(window.localStorage.getItem("roleList")));
      setShowAddOrg(true);
      setAddContactLoading(false);
    } catch (error) {
      console.error(error);
      setAddContactLoading(false);
    }
  };

  const handleAddNewContact = (type) => {
    setIsLoading(true);
    fetchAllContacts();
    if (type === "person") {
      setShowAddPerson(false);
    } else {
      setShowAddOrg(false);
    }
  };

  function renderSafeContactsTop() {
    return (
      <>
        <div className="bg-light d-flex align-items-center justify-content-between p-2">
          <h5 className="mb-0">
            {`Associated contacts for packet no. ${
              custodyPacket.packetNumber ? custodyPacket.packetNumber : ""
            }`}
          </h5>
          <div className="d-flex justify-content-end">
            <Button
              onClick={handleOpenLinkForm}
              disabled={!isEnableButtons}
              color="success"
              className="d-flex mx-1"
            >
              <span className="plusdiv">+</span> Add
            </Button>
            <Button
              onClick={handleUnLink}
              disabled={!isEnableButtons}
              color="danger"
              className="d-flex mx-1"
            >
              <span className="plusdiv">-</span> Delete
            </Button>
            <Button
              onClick={handleSetPrimary}
              disabled={!isEnableButtons}
              color="success"
              className="d-flex mx-1"
            >
              Set Primary Contact
            </Button>
            {source === "safecustody" ? (
              <Button
                onClick={() => {
                  if (navigationEditForm.isEditMode) {
                    return navigate(-1);
                  }
                  setSelectedCustody("");
                }}
                color="warning"
                className="d-flex mx-1"
              >
                Close
              </Button>
            ) : (
              <Link
                to={{
                  pathname: "/Contacts",
                  aboutProps: aboutProps.contact,
                }}
                style={{ textDecoration: "none" }}
              >
                <Button color="warning" className="d-flex mx-1">
                  Close
                </Button>
              </Link>
            )}
          </div>
        </div>
      </>
    );
  }

  function renderSafeContentsTop() {
    return (
      <div className="bg-light d-flex align-items-center justify-content-between p-2">
        <h5 className="mb-0">{`Details for packet no. ${
          custodyPacket.packetNumber ? custodyPacket.packetNumber : ""
        }`}</h5>
        <div className="d-flex justify-content-end">
          <Button
            type="button"
            onClick={handleSaveCustody}
            color="success"
            className="mx-1"
          >
            Save
          </Button>
          <Button
            onClick={() => {
              if (formStatus.isFormChanged) {
                return dispatch(
                  updateFormStatusAction({ key: "isShowModal", value: true })
                );
              }
              setSelectedCustody("");
            }}
            type="button"
            color="warning"
            className="mx-1"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  function renderSafeReceiptsTop() {
    return (
      <div>
        <div className="bg-light d-flex align-items-center justify-content-between p-2">
          <h5 className="mb-0">{`Receipts for packet no. ${
            custodyPacket.packetNumber ? custodyPacket.packetNumber : ""
          }`}</h5>
          <div className="d-flex justify-content-end">
            <Button
              className="mx-1"
              onClick={handleContentShow}
              color="success"
            >
              Prepare Receipt
            </Button>
            <Button
              className="mx-1"
              onClick={() => setSelectedCustody("")}
              color="danger"
            >
              Close
            </Button>
          </div>
          <Modal
            isOpen={contentShow}
            toggle={handleContentClose}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader
              toggle={() => handleContentClose()}
              className="bg-light p-3"
            >
              Prepare Reciept
            </ModalHeader>
            <ModalBody>
              <div className="px-4 py-2">
                <div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex  align-items-end gap-2">
                      <TextInputField
                        type="text"
                        name="name"
                        placeholder="Search Contact"
                        value={prepareInput.name}
                        onChange={handleFilterPrepare}
                        autoComplete="off"
                      />
                      <TextInputField
                        label="Receipt Date"
                        name="receiptDate"
                        placeholder="Receipt Date"
                        type="date"
                        value={
                          receiptInfo.receiptDate
                            ? formatDateFunc(receiptInfo.receiptDate)
                            : ""
                        }
                        onChange={(e) =>
                          setReceiptInfo({
                            ...receiptInfo,
                            receiptDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="d-flex">
                      <Button
                        onClick={handleAddPerson}
                        className="d-flex mx-1"
                        color="primary"
                      >
                        <span className="plusdiv">+</span>Person
                      </Button>
                      <Button
                        onClick={handleAddOrganisation}
                        className="d-flex mx-1"
                        color="primary"
                      >
                        <span className="plusdiv">+</span>Organisation
                      </Button>
                    </div>
                  </div>
                  {prepareInput.name?.length > 0 && !prepareSelect && (
                    <div className="prepareReceipt-searchContact-optionDiv">
                      {filterPerpare.map((contact, idx) => (
                        <p
                          className="prepareReceipt-searchContact-option"
                          onClick={() =>
                            handleSelectContactForReceipt(
                              JSON.stringify(contact)
                            )
                          }
                          key={idx}
                        >
                          {contact.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <hr />
              <div style={{ diplay: "flex", width: "100%" }}>
                <div className="row">
                  <div className="smaller-div">
                    <Input
                      style={{ marginLeft: "35%" }}
                      type="checkbox"
                      checked={checkForAllChecked(selectPrepare)}
                      onChange={handleSelectAllPrepare}
                    />
                  </div>
                  <div className="larger-div">
                    <h5 style={{ color: "inherit" }}>Document Name</h5>
                  </div>
                  <div className="medium-div">
                    <h5 style={{ color: "inherit" }}>Date</h5>
                  </div>
                </div>
              </div>
              <hr />
              <div className="documentData">
                {custodyPacket?.custodyPacketAttachments?.map((d) => {
                  if (d.dateOut === null) {
                    return (
                      <Fragment>
                        <div className="row">
                          <div className="smaller-div">
                            <Input
                              style={{ marginLeft: "36%" }}
                              type="checkbox"
                              checked={isSelected(d.id)}
                              onChange={() => handleSelectToPrepare(d.id)}
                            />
                          </div>
                          <div className="larger-div">
                            <p>{d.name ? d.name : "name"}</p>
                          </div>
                          <div className="medium-div">
                            <p>
                              {d.dateReceived
                                ? formatDateFunc(d.dateReceived)
                                : "date"}
                            </p>
                          </div>
                        </div>
                      </Fragment>
                    );
                  }
                })}
              </div>
              <div className="p-4">
                <TextInputField
                  name="prepareComment"
                  rows="3"
                  placeholder="Comment"
                  value={receiptInfo.comment}
                  onChange={(e) =>
                    setReceiptInfo({ ...receiptInfo, comment: e.target.value })
                  }
                />
              </div>
              <div className="border-top px-4 py-2 text-end">
                <Button onClick={handlePrepareReceipt} color="success">
                  Prepare
                </Button>
              </div>
              {addContactLoading && <LoadingPage />}
            </ModalBody>
          </Modal>
        </div>
      </div>
    );
  }

  function renderSafeContacts() {
    return (
      <>
        <div>
          <div className="">
            <Table responsive={true} striped={true} hover={true}>
              <thead>
                <tr>
                  <th>
                    <Input
                      type="checkbox"
                      checked={
                        filteredData?.length > 0 &&
                        selectedContact?.length === filteredData?.length
                      }
                      onChange={handleSelectAllContact}
                    />
                  </th>
                  <th>
                    <label
                      className="associatedContacts-label labelCursor"
                      onClick={() => handleSortByLabel("contactCode")}
                    >
                      Code
                      <div className="associatedContacts-label-btn">
                        {sortOrder === "asc" && sortField === "contactCode" ? (
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
                    </label>
                    <Input
                      type="text"
                      name="contactCode"
                      onChange={handleFilter}
                    />
                  </th>
                  <th>
                    <label
                      className="associatedContacts-label labelCursor"
                      onClick={() => handleSortByLabel("firstName")}
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
                    <Input
                      type="text"
                      name="firstName"
                      onChange={handleFilter}
                    />
                  </th>
                  <th>
                    <label
                      className="associatedContacts-label labelCursor"
                      onClick={() => handleSortByLabel("lastName")}
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
                    <Input
                      type="text"
                      name="lastName"
                      onChange={handleFilter}
                    />
                  </th>
                  <th>
                    <label
                      className="associatedContacts-label labelCursor"
                      onClick={() => handleSortByLabel("companyName")}
                    >
                      Company
                      <div className="associatedContacts-label-btn">
                        {sortOrder === "asc" && sortField === "companyName" ? (
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
                    </label>
                    <Input
                      type="text"
                      name="companyName"
                      onChange={handleFilter}
                    />
                  </th>
                  <th>
                    <label
                      className="associatedContacts-label labelCursor"
                      onClick={() => handleSortByLabel("emailAddress")}
                    >
                      Email Address
                      <div className="associatedContacts-label-btn">
                        {sortOrder === "asc" && sortField === "emailAddress" ? (
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
                      name="emailAddress"
                      onChange={handleFilter}
                    />
                  </th>
                  <th>
                    <label
                      className="associatedContacts-label labelCursor"
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
                      name="telephoneNumber"
                      onChange={handleFilter}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                <AssociatedContacts
                  contacts={filteredData}
                  handleSelectContact={handleSelectContactForContact}
                  isContactSelected={isContactSelected}
                  safecustodyId={id}
                />
              </tbody>
            </Table>
          </div>
        </div>
        {openLinkContactForm && (
          <Modal
            isOpen={openLinkContactForm}
            toggle={() => setOpenLinkContactForm(false)}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader
              toggle={() => setOpenLinkContactForm(false)}
              className="bg-light p-3"
            >
              Confirm Your Action
            </ModalHeader>
            <ModalBody>
              <LinkContactForm
                closeForm={() => setOpenLinkContactForm(false)}
                contactLists={contactLists}
                safeCustodyPacketId={id}
                setBoolVal={setBoolVal}
                linkedContacts={custodyPacketContacts}
              />
            </ModalBody>
          </Modal>
        )}
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
                formData={formDataForUnlink}
                setBoolVal={setBoolVal}
                deleteType={deleteType}
                selectedContent={selectedContent}
                message={
                  "You are about to delete the link between the selected contacts and the selected Safe Custody file. Are you sure you want to continue?"
                }
                clearSelected={() => {
                  if (deleteType === "contact") {
                    setSelectedContact([]);
                    setSelectedContactId([]);
                  } else if (deleteType === "content") {
                    setSelectedContent([]);
                    setSelectedFilename([]);
                  }
                }}
              />
            </ModalBody>
          </Modal>
        )}
        {confirmCustody && (
          <Modal
            isOpen={confirmCustody}
            toggle={() => setConfirmCustody(false)}
            backdrop="static"
            scrollable={true}
            size="md"
            centered
          >
            <ModalHeader
              toggle={() => setConfirmCustody(false)}
              className="bg-light p-3"
            >
              Confirm Your Action
            </ModalHeader>
            <ModalBody>
              <ConfirmationCustodyPopup
                closeForm={() => setConfirmCustody(false)}
                message={`You are about to replace the current  Primary Contact ${
                  primaryContactDetail.firstName
                    ? primaryContactDetail.firstName
                    : ""
                } ${
                  primaryContactDetail.lastName
                    ? primaryContactDetail.lastName
                    : ""
                } with ${
                  selectedContact[0].contactName
                    ? selectedContact[0].contactName
                    : "Anonymous"
                }. Are you sure you want to continue?`}
                handleFunc={updatePrimaryContact}
              />
            </ModalBody>
          </Modal>
        )}
      </>
    );
  }
  function renderSafeContents() {
    return (
      <div>
        <div>
          <div className="row px-2 py-4">
            <div className="col-12">
              <div className="d-flex mt-2">
                <div style={{ width: "10rem" }}>
                  <label for="contents">Contents</label>
                </div>
                <div
                  className="allContent-div"
                  style={{ width: "30rem", background: "#f5f5f5" }}
                >
                  {custodyPacket?.custodyPacketAttachments?.map((d) => {
                    if (d.dateOut === null) {
                      return <p>{d.name}</p>;
                    }
                  })}
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="d-flex mt-2">
                <div style={{ width: "10rem" }}>
                  <label for="comments">Comments</label>
                </div>

                <TextInputField
                  type="textarea"
                  rows="2"
                  cols="40"
                  value={custodyPacket.comments}
                  placeholder="Comment"
                  onChange={handleCommentChange}
                  style={{ width: "30rem" }}
                />
              </div>
            </div>
            <div className="contentsInfo my-4">
              <div
                style={{
                  marginRight: "90px",
                  display: "flex",
                  flexDirection: "column",
                  width: "500px",
                }}
              >
                <div className="data-show-div mt-2">
                  <span>First Name : </span>
                  <p>{primaryContactDetail.firstName}</p>
                </div>
                <div className="data-show-div mt-2">
                  <span>Last Name : </span>
                  <p>{primaryContactDetail.lastName}</p>
                </div>
              </div>
              <div style={{ width: "500px", flexWrap: "wrap" }}>
                <div className="data-show-div">
                  <span>Address:</span>
                  <p>{primaryContactDetail.fullAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="">
          <div className="d-flex align-items-center justify-content-between border p-2">
            <h6 className="mb-0">
              {`Associated documents for packet no. ${
                custodyPacket.packetNumber ? custodyPacket.packetNumber : ""
              }`}
            </h6>
            <div className="d-flex">
              <Button
                onClick={handleAddCustody}
                className="d-flex mx-1"
                color="success"
              >
                <span className="plusdiv">+</span> Add
              </Button>
              <Button
                onClick={handleDeleteAttachment}
                className="d-flex mx-1"
                color="danger"
              >
                <span className="plusdiv">-</span> Delete
              </Button>
              <Button
                onClick={handleEditContent}
                className="d-flex mx-1"
                color="warning"
              >
                Edit
              </Button>
              <Button
                onClick={handleDownloadContentAttachment}
                className="d-flex mx-1"
              >
                Download
              </Button>
              <Button onClick={handleContentShow} className="d-flex mx-1">
                Prepare Receipt
              </Button>
            </div>
          </div>
        </div>
        <Modal centered="true" isOpen={contentShow} size="lg">
          <ModalHeader toggle={handleContentClose} className="bg-light p-3">
            Prepare Receipt
          </ModalHeader>
          <ModalBody>
            <div className="popup-content">
              <div>
                <div className="prepare-headerDiv">
                  <div className="d-flex flex-column">
                    <label>Contacts</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Search Contact"
                      value={prepareInput.name}
                      onChange={handleFilterPrepare}
                      autoComplete="off"
                      className="form-control"
                    />
                  </div>
                  <div className="d-flex">
                    <Button
                      className="mx-1 d-flex"
                      color="primary"
                      onClick={handleAddPerson}
                    >
                      <span className="plusdiv">+</span>Person
                    </Button>
                    <Button
                      className="mx-1 d-flex"
                      color="primary"
                      onClick={handleAddOrganisation}
                    >
                      <span className="plusdiv">+</span>Organisation
                    </Button>
                  </div>
                </div>
                {prepareInput?.name?.length > 0 && !prepareSelect && (
                  <div className="prepareReceipt-searchContact-optionDiv">
                    {filterPerpare.map((contact) => (
                      <p
                        className="prepareReceipt-searchContact-option pe-cursor"
                        onClick={() =>
                          handleSelectContactForReceipt(JSON.stringify(contact))
                        }
                      >
                        {`${contact.firstName ? contact.firstName : ""} ${
                          contact.lastName ? contact.lastName : ""
                        }`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="m-3">
              <hr />
              <div style={{ diplay: "flex", width: "100%" }}>
                <div className="row">
                  <div className="smaller-div">
                    <input
                      style={{ marginLeft: "50%" }}
                      type="checkbox"
                      checked={checkForAllChecked(selectPrepare)}
                      onChange={handleSelectAllPrepare}
                    />
                  </div>
                  <div className="larger-div">
                    <h3>Document Name</h3>
                  </div>
                  <div className="medium-div">
                    <h3>Date</h3>
                  </div>
                </div>
              </div>
              <hr />
              <div className="documentData">
                {custodyPacket?.custodyPacketAttachments?.map((d) => {
                  if (d.dateOut === null) {
                    return (
                      <div className="row">
                        <div className="smaller-div">
                          <input
                            style={{ marginLeft: "50%" }}
                            type="checkbox"
                            checked={isSelected(d.id)}
                            onChange={() => handleSelectToPrepare(d.id)}
                          />
                        </div>
                        <div className="larger-div">
                          <p>{d.name ? d.name : "name"}</p>
                        </div>
                        <div className="medium-div">
                          <p>
                            {d.dateReceived
                              ? formatDateFunc(d.dateReceived)
                              : "date"}
                          </p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
            <div className="mx-2 my-4">
              <TextInputField
                type="textarea"
                name="prepareComment"
                rows="3"
                placeholder="Comment"
                className="prepareReceipt-comment"
                value={receiptInfo.comment}
                onChange={(e) =>
                  setReceiptInfo({ ...receiptInfo, comment: e.target.value })
                }
              />
            </div>
            <div className="prepare-btn-div">
              <Button
                className="mx-1 d-flex"
                color="primary"
                onClick={handlePrepareReceipt}
              >
                Prepare
              </Button>
            </div>
            {addContactLoading && <LoadingPage />}
          </ModalBody>
        </Modal>
        {isAddCustodyOpen && (
          <Modal
            isOpen={isAddCustodyOpen}
            toggle={() => {
              if (formStatusNew.isFormChanged) {
                return setFormStatusNew((prev) => ({
                  ...prev,
                  isShowModal: true,
                }));
              }
              setIsAddCustoduOpen(false);
            }}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader
              toggle={() => {
                if (formStatusNew.isFormChanged) {
                  return setFormStatusNew((prev) => ({
                    ...prev,
                    isShowModal: true,
                  }));
                }
                setIsAddCustoduOpen(false);
              }}
              className="bg-light p-3"
            >
              Add Safe Custody Item
            </ModalHeader>
            <ModalBody>
              <AddCustodyForm
                closeForm={(isClose = false) => {
                  const isCloseType = isClose && typeof isClose === "boolean";
                  if (formStatusNew.isFormChanged && !isCloseType) {
                    return setFormStatusNew((prev) => ({
                      ...prev,
                      isShowModal: true,
                    }));
                  }
                  setIsAddCustoduOpen(false);
                }}
                setBoolVal={setBoolVal}
                safeCustodyPacketId={id}
                setFormStatusNew={setFormStatusNew}
              />
            </ModalBody>
          </Modal>
        )}
        {openEditWindow && (
          <Modal
            isOpen={openEditWindow}
            toggle={() => {
              if (formStatusNew.isFormChanged) {
                return setFormStatusNew((prev) => ({
                  ...prev,
                  isShowModal: true,
                }));
              }
              setOpenEditWindow(false);
            }}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader
              toggle={() => {
                if (formStatusNew.isFormChanged) {
                  return setFormStatusNew((prev) => ({
                    ...prev,
                    isShowModal: true,
                  }));
                }
                setOpenEditWindow(false);
              }}
              className="bg-light p-3"
            >
              Edit Safe Custody Item
            </ModalHeader>
            <ModalBody>
              <EditContentAttachment
                closeForm={(isClose = false) => {
                  const isCloseType = isClose && typeof isClose === "boolean";
                  if (formStatusNew.isFormChanged && !isCloseType) {
                    return setFormStatusNew((prev) => ({
                      ...prev,
                      isShowModal: true,
                    }));
                  }
                  setOpenEditWindow(false);
                }}
                contentToEdit={contentToEdit}
                safeCustodyPacketId={id}
                fetchCustodyDetails={fetchCustodyDetails}
                setFormStatusNew={setFormStatusNew}
              />
            </ModalBody>
          </Modal>
        )}
        <div className="">
          <Table responsive={true} striped={true} hover={true}>
            <thead className="mb-2">
              <tr>
                <th>
                  <Input
                    type="checkbox"
                    onChange={handleSelectAllContent}
                    checked={checkForAllChecked(selectedContent)}
                  />
                </th>
                <th>
                  <label>Document Name</label>
                </th>
                <th>
                  <label>Date Received</label>
                </th>

                <th>
                  <label>Uploaded By</label>
                </th>
                <th>
                  <label>Comments</label>
                </th>
              </tr>
            </thead>
            <tbody>
              <Document
                data={custodyPacket}
                selectedContent={selectedContent}
                selectedFilename={selectedFilename}
                setSelectedFilename={setSelectedFilename}
                setSelectedContent={setSelectedContent}
              />
            </tbody>
          </Table>
        </div>

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
                formData={formDataForUnlink}
                message={`Are you sure you want to delete the record?`}
                setBoolVal={setBoolVal}
                deleteType={deleteType}
                selectedContent={selectedContent}
                clearSelected={() => {
                  if (deleteType === "contact") {
                    setSelectedContact([]);
                    setSelectedContactId([]);
                  } else if (deleteType === "content") {
                    setSelectedContent([]);
                    setSelectedFilename([]);
                  }
                }}
              />
            </ModalBody>
          </Modal>
        )}

        {showAlert && (
          <Modal
            isOpen={showAlert}
            toggle={() => setShowAlert(false)}
            backdrop="static"
            scrollable={true}
            size="md"
            centered
          >
            <ModalHeader
              toggle={() => setShowAlert(false)}
              className="bg-light p-3"
            >
              Confirm Your Action
            </ModalHeader>
            <ModalBody>
              <AlertPopup
                closeForm={() => setShowAlert(false)}
                message={alertMsg}
                btn1={"Close"}
                btn2={"Refresh"}
                handleFunc={fetchCustodyDetails}
              />
            </ModalBody>
          </Modal>
        )}
      </div>
    );
  }

  function renderSafeReceipts() {
    return (
      <div>
        <ReceiptDocument data={custodyPacket.custodyPacketReciepts} />
      </div>
    );
  }

  const [currentSafe, setCurrentSafe] = useState("contacts");

  function handleClose(isClose = false) {
    const isCloseType = isClose && typeof isClose === "boolean";
    if (formStatus.isFormChanged && !isCloseType) {
      return dispatch(
        updateFormStatusAction({ key: "isShowModal", value: true })
      );
    }
    setShowAddPerson(false);
    setShowAddOrg(false);
  }

  return (
    <div>
      {isLoading && <LoadingPage />}
      <div className="">
        {currentSafe === "contacts" && renderSafeContactsTop()}
        {currentSafe === "contents" && renderSafeContentsTop()}
        {currentSafe === "recepients" && renderSafeReceiptsTop()}

        <div className="row py-2">
          <div className="col-md-12">
            <Nav tabs className="nav nav-tabs nav-tabs-custom nav-success">
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({
                    active: currentSafe === "contacts",
                  })}
                  onClick={handleShowContacts}
                  disabled={!isEnableButtons}
                >
                  Contacts
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({
                    active: currentSafe === "contents",
                  })}
                  onClick={() => {
                    if (formStatus.isFormChanged) {
                      return dispatch(
                        updateFormStatusAction({
                          key: "isShowModal",
                          value: true,
                        })
                      );
                    }
                    setCurrentSafe("contents");
                  }}
                  disabled={!isEnableButtons}
                >
                  Contents
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({
                    active: currentSafe === "recepients",
                  })}
                  onClick={handleShowReceipts}
                  disabled={!isEnableButtons}
                >
                  Receipts
                </NavLink>
              </NavItem>
            </Nav>
          </div>
        </div>

        {currentSafe === "contacts" && renderSafeContacts()}
        {currentSafe === "contents" && renderSafeContents()}
        {currentSafe === "recepients" && renderSafeReceipts()}
        {showAddPerson && (
          <Modal
            isOpen={showAddPerson}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader toggle={handleClose} className="bg-light p-3">
              Add Person Details
            </ModalHeader>
            <ModalBody>
              <AddPerson
                allCountries={allCountries}
                roleList={roleList}
                postalList={postalList}
                companyList={companyList}
                close={handleClose}
                refresh={() => handleAddNewContact("person")}
              />
            </ModalBody>
          </Modal>
        )}
        {showAddOrg && (
          <Modal
            isOpen={showAddOrg}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader toggle={handleClose} className="bg-light p-3">
              Add Organisation Details
            </ModalHeader>
            <ModalBody>
              <AddOrganisation
                allCountries={allCountries}
                roleList={roleList}
                postalList={postalList}
                personList={personList}
                close={handleClose}
                refresh={() => handleAddNewContact("org")}
              />
            </ModalBody>
          </Modal>
        )}
        {formStatusNew.isShowModal && (
          <Modal
            isOpen={formStatusNew.isShowModal}
            backdrop="static"
            scrollable={true}
            size="md"
            centered
          >
            <ModalHeader className="bg-light p-3">
              Confirm Your Action
            </ModalHeader>
            <ModalBody>
              <AlertPopup
                message="You have unsaved data in your form are you sure you want to
                        discard the changes?"
                closeForm={() => {
                  setFormStatusNew((prev) => ({ ...prev, isShowModal: false }));
                }}
                btn1={"No"}
                btn2="Yes"
                handleFunc={() => {
                  setIsAddCustoduOpen(false);
                  setOpenEditWindow(false);
                  setFormStatusNew({
                    isFormChanged: false,
                    isShowModal: false,
                  });
                }}
              />
            </ModalBody>
          </Modal>
        )}
        {formStatus.isShowModal && (
          <Modal
            isOpen={formStatus.isShowModal}
            backdrop="static"
            scrollable={true}
            size="md"
            centered
          >
            <ModalHeader className="bg-light p-3">
              Confirm Your Action
            </ModalHeader>
            <ModalBody>
              <AlertPopup
                message="You have unsaved data in your form are you sure you want to
                        discard the changes?"
                closeForm={() => {
                  dispatch(
                    updateFormStatusAction({
                      key: "isShowModal",
                      value: false,
                    })
                  );
                }}
                btn1={"No"}
                btn2="Yes"
                handleFunc={() => {
                  setShowAddPerson(false);
                  setShowAddOrg(false);
                  formStatus.callback?.();
                  dispatch(resetFormStatusAction());
                  setSelectedCustody("");
                }}
              />
            </ModalBody>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default RenderSafeCustody;
