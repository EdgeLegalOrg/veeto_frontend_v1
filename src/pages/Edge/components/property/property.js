import React, { useEffect, useState, Fragment, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { v1 as uuidv1 } from "uuid";
import validator from "validator";
import { MdFilterAltOff, MdSearch } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import upArrow from "../../images/upArrow.svg";
import downArrow from "../../images/downArrow.svg";
import downArrowColoured from "../../images/downArrowColoured.svg";
import upArrowColoured from "../../images/upArrowColoured.svg";
import closeBtn from "../../images/close-white-btn.svg";

import "../../stylesheets/property.css";

import PopupFormR from "./popupformR.js";
import PopupFormUnR from "./popupformUnR.js";
import RegisteredLot from "./registeredLot.js";
import UnregisteredLot from "./unregisteredLot.js";
import LoadingPage from "../../utils/LoadingPage.js";
// import { Modal } from "react-bootstrap";
// import { FormControl, TextField } from '@mui/material';
import AddProperty from "./AddProperty.js";
import Pagination from "../Pagination";
import {
  CustomTextInput,
  ConfirmationAddressPopup,
  AlertPopup,
} from "../customComponents/CustomComponents";
import {
  fetchPropertyList,
  editPropertyDetails,
  fetchPropertyById,
  deletePropertyFromList,
  deletePropertyById,
  checkPropertyLinkedToMatter,
} from "../../apis";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Button,
  Table,
  Form,
  Row,
  Col,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import TableContainer from "../../../../Components/Common/TableContainer";
import TooltipWrapper from "../../../../Components/Common/TooltipWrapper";
import { toast } from "react-toastify";
import { convertSubstring } from "../../utils/utilFunc";
// Actions
import { resetCurrentRouterState } from "../../../../slices/thunks.js";
import {
  TextInputField,
  SearchableAddressDropDown,
  SearchableState,
  SearchableCountry,
} from "pages/Edge/components/InputField";
import {
  updateFormStatusAction,
  resetFormStatusAction,
} from "slices/layouts/reducer";

const filterRegisterFields = {
  depositedPlanNumber: "",
  description: "",
  lotNumber: "",
  strataPlanNumber: "",
  titleReference: "",
  section: "",
};

const filterUnregisterFields = {
  partOfLot: "",
  description: "",
  lot: "",
  plan: "",
  section: "",
};

const filterFields = {
  titleReferences: "",
  address: "",
};

const searchField = {
  suburb: "",
  state: "",
  postCode: "",
  country: "",
};

const ConfirmationPopup = (props) => {
  const {
    closeForm,
    setBoolVal,
    selected,
    setSelected,
    deleteType,
    propertyId,
    backToSearch,
    setdisableButton,
    setShowAlert,
    setAlertMsg,
    setAlertOptions,
  } = props;

  const deletePropertyOnMain = async () => {
    if (selected.length === 0) return;
    try {
      const res = await deletePropertyFromList(selected.join(","));
      setSelected([]);
      setBoolVal(false);
      setdisableButton(false);
      closeForm();
    } catch (err) {
      console.error(err);
      setdisableButton(false);
    }
  };

  async function deleteProperty() {
    const id = propertyId;
    try {
      await deletePropertyById(id);
      closeForm();
      setdisableButton(false);
      setBoolVal(false);
      backToSearch();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className="p-4">
        <p>Are you sure you want to delete the record(s)?</p>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button
          color="danger"
          onClick={() => {
            closeForm();
            setdisableButton(false);
          }}
          type="button"
          className="mx-1"
        >
          No
        </Button>
        <Button
          color="success"
          type="button"
          onClick={
            deleteType === "main" ? deletePropertyOnMain : deleteProperty
          }
          className="mx-1"
        >
          Yes
        </Button>
      </div>
    </div>
  );
};

function RenderProperty() {
  document.title = "Property | EdgeLegal";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentRouterState, formStatus, navigationEditForm } = useSelector(
    (state) => state.Layout
  );
  const [allProperties, setAllProperties] = useState([]);
  const [filterInput, setFilterInput] = useState(filterFields);
  const [filteredData, setFilteredData] = useState([]);
  const [filterRegisterInput, setFilterRegisterInput] =
    useState(filterRegisterFields);
  const [filteredRegisterLot, setFilteredRegisterLot] = useState([]);
  const [filterUnregisterInput, setFilterUnregisterInput] = useState(
    filterUnregisterFields
  );
  const [filteredUnregisterLot, setFilteredUnregisterLot] = useState([]);
  const [specificProperty, setSpecificProperty] = useState([]);
  const [tempSpecificProperty, setTempSpecificProperty] = useState([]);
  const [registeredLots, setRegisteredLots] = useState([]);
  const [unregisteredLots, setUnregisteredLots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState("");

  // to delete property
  const [selected, setSelected] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [postalList, setPostalList] = useState([]);

  const [isEditTrue, setIsEditTrue] = useState(false);
  const [isAddTrue, setIsAddTrue] = useState(false);
  const [isPopRForm, setIsPopRForm] = useState(false);
  const [isPopUForm, setIsPopUForm] = useState(false);
  const [isPopEditRForm, setIsPopEditRForm] = useState(false);
  const [isPopEditUForm, setIsPopEditUForm] = useState(false);

  const [boolVal, setBoolVal] = useState(false);
  const [labelSort, setLabelSort] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [disableButton, setdisableButton] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [fieldLength, setFieldLength] = useState({});
  const [requiredGeneral, setRequiredGeneral] = useState([]);
  const [requiredRegistered, setRequiredRegistered] = useState([]);
  const [requiredUnregistered, setRequiredUnregistered] = useState([]);
  const [tempSearchField, setTempSearchField] = useState(searchField);
  const [confirmAddress, setConfirmAddress] = useState(false);
  const [warningData, setWarningData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertOptions, setAlertOptions] = useState({
    btn1: "Close",
    btn2: "Refresh",
    handleFunc: () => fetchPropertyData(specificProperty.id),
  });

  const [submitted, setSubmitted] = useState(false);
  const [formStatusNew, setFormStatusNew] = useState({
    isFormChanged: false,
    isShowModal: false,
  });

  const handleClearFilter = () => {
    setFilterInput(filterFields);
    setTimeout(() => {
      handleFilterSubmit(filterFields);
    }, 10);
  };

  const fetchFieldLength = () => {
    let allLengths = {};
    JSON.parse(window.localStorage.getItem("metaData"))?.property?.fields?.map(
      (f) => {
        allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
      }
    );
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.registered_property?.fields?.map((f) => {
      allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
    });

    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.unregistered_property?.fields?.map((f) => {
      allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
    });
    setFieldLength(allLengths);
  };

  const fetchRequired = () => {
    let general = [];
    JSON.parse(window.localStorage.getItem("metaData"))?.property?.fields?.map(
      (f) => {
        if (f.mandatory) {
          general.push(f.fieldName.toLowerCase());
        }
      }
    );
    setRequiredGeneral(general);
    let reg = [];
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.registered_property?.fields?.map((f) => {
      if (f.mandatory) {
        reg.push(f.fieldName.toLowerCase());
      }
    });
    setRequiredRegistered(reg);
    let unreg = [];
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.unregistered_property?.fields?.map((f) => {
      if (f.mandatory) {
        unreg.push(f.fieldName.toLowerCase());
      }
    });
    setRequiredUnregistered(unreg);
  };

  useEffect(() => {
    if (currentRouterState) {
      backToSearch();
      dispatch(resetCurrentRouterState());
    }
  }, [currentRouterState]);

  useEffect(() => {
    if (navigationEditForm.isEditMode) {
      fetchPropertyData(navigationEditForm.editFormValue.id);
    }
  }, [navigationEditForm]);

  useEffect(() => {
    const isChanged =
      JSON.stringify(specificProperty) !== JSON.stringify(tempSpecificProperty);
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [specificProperty, tempSpecificProperty]);

  useEffect(() => {
    const fetchCountries = () => {
      setCountries(JSON.parse(window.localStorage.getItem("countryList")));
    };

    const fetchPostalList = () => {
      setPostalList(JSON.parse(window.localStorage.getItem("postalList")));
    };

    if (!boolVal) {
      fetchRequired();
      fetchFieldLength();
      setIsLoading(true);
      fetchPropertyList({
        ...filterInput,
        pageNo: pageNo,
        pageSize: pageSize,
        sortField: sortField,
        sortOrder: sortOrder.toUpperCase(),
      })
        .then((response) => {
          fetchCountries();
          fetchPostalList();
          setFilteredData(response.data.data.properties);
          setAllProperties(response.data.data.properties);
          setTotalPages(response.data.metadata.page.totalPages);
          setTotalRecords(response.data.metadata.page.totalRecords);
          setBoolVal(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [boolVal]);

  const handleChangeCountryAndState = (fieldName, val) => {
    if (fieldName === "country") {
      const selectedCountry = countries.filter(
        (country) => country.countryName === val
      );
      setSpecificProperty({
        ...specificProperty,
        country: selectedCountry[0].countryName,
      });
      setStates(selectedCountry[0].states);
      setTempSearchField({
        ...tempSearchField,
        country: selectedCountry[0].countryName,
      });
    }
    if (fieldName === "state") {
      setSpecificProperty({
        ...specificProperty,
        state: val,
      });
      setTempSearchField({
        ...tempSearchField,
        state: val,
      });
    }
  };

  const filterData = (prop, val) => {
    const newData = allProperties.filter((data) => {
      return data[prop]?.toLowerCase().includes(val.toLowerCase());
    });
    setFilteredData(newData);
  };

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
  };

  const handleSortSubmit = (field, sortType) => {
    setIsLoading(true);
    fetchPropertyList({
      ...filterInput,
      pageNo: pageNo,
      pageSize: pageSize,
      sortField: field,
      sortOrder: sortType.toUpperCase(),
    })
      .then((response) => {
        setFilteredData(response.data.data.properties);
        setAllProperties(response.data.data.properties);
        setTotalPages(response.data.metadata.page.totalPages);
        setTotalRecords(response.data.metadata.page.totalRecords);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const handleFilterSubmit = (filter = filterInput) => {
    setPageNo(0);
    setIsLoading(true);
    fetchPropertyList({
      ...filter,
      pageNo: 0,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
    })
      .then((response) => {
        setFilteredData(response.data.data.properties);
        setAllProperties(response.data.data.properties);
        setTotalPages(response.data.metadata.page.totalPages);
        setTotalRecords(response.data.metadata.page.totalRecords);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const filterRegisterData = (obj) => {
    const newData = registeredLots?.filter(
      (data) =>
        (data["description"]
          ? data["description"]
              ?.toLowerCase()
              .includes(obj["description"]?.toLowerCase())
          : true) &&
        (data["lotNumber"]
          ? data["lotNumber"]
              ?.toLowerCase()
              .includes(obj["lotNumber"]?.toLowerCase())
          : true) &&
        (data["depositedPlanNumber"]
          ? data["depositedPlanNumber"]
              ?.toLowerCase()
              .includes(obj["depositedPlanNumber"]?.toLowerCase())
          : true) &&
        (data["planNumber"]
          ? data["planNumber"]
              ?.toLowerCase()
              .includes(obj["planNumber"]?.toLowerCase())
          : true) &&
        (data["strataPlanNumber"]
          ? data["strataPlanNumber"]
              .toLowerCase()
              .includes(obj["strataPlanNumber"].toLowerCase())
          : true) &&
        (data["section"]
          ? data["section"].toLowerCase().includes(obj["section"].toLowerCase())
          : true) &&
        (data["titleReference"]
          ? data["titleReference"]
              .toLowerCase()
              .includes(obj["titleReference"].toLowerCase())
          : true)
    );
    setFilteredRegisterLot(newData);
  };

  const handleFilterRegister = (e) => {
    const { name } = e.target;
    setFilterRegisterInput({ ...filterRegisterInput, [name]: e.target.value });
    filterRegisterData({ ...filterRegisterInput, [name]: e.target.value });
  };

  const filterUnregisterData = (obj) => {
    const newData = unregisteredLots?.filter(
      (data) =>
        (data["description"]
          ? data["description"]
              ?.toLowerCase()
              .includes(obj["description"]?.toLowerCase())
          : true) &&
        (data["lot"]
          ? data["lot"]?.toLowerCase().includes(obj["lot"]?.toLowerCase())
          : true) &&
        (data["plan"]
          ? data["plan"]?.toLowerCase().includes(obj["plan"]?.toLowerCase())
          : true) &&
        (data["partOfLot"]
          ? data["partOfLot"]
              .toLowerCase()
              .includes(obj["partOfLot"].toLowerCase())
          : true) &&
        (data["section"]
          ? data["section"].toLowerCase().includes(obj["section"].toLowerCase())
          : true)
    );
    setFilteredUnregisterLot(newData);
  };

  const handleFilterUnregister = (e) => {
    const { name } = e.target;
    setFilterUnregisterInput({
      ...filterUnregisterInput,
      [name]: e.target.value,
    });
    filterUnregisterData({ ...filterUnregisterInput, [name]: e.target.value });
  };

  const handleSortByLabel = (field) => {
    if (labelSort !== field) {
      setLabelSort(field);
      setSortOrder("asc");
      setSortField(field);
      handleSortSubmit(field, "asc");
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(field);
      handleSortSubmit(field, "desc");
    }
  };

  const handleRegisterSort = (field) => {
    let fieldName = field === "section1" ? "section" : field;
    let sortedData = filteredRegisterLot.sort((a, b) => {
      if (
        a[fieldName] &&
        b[fieldName] &&
        validator.isInt(a[fieldName]) &&
        validator.isInt(b[fieldName])
      ) {
        if (labelSort !== fieldName) {
          setLabelSort(fieldName);
          setSortOrder("asc");
          setSortField(field);
          return parseInt(a[fieldName]) < parseInt(b[fieldName]) ? -1 : 1;
        } else {
          setLabelSort("");
          setSortOrder("desc");
          setSortField(field);
          return parseInt(a[fieldName]) < parseInt(b[fieldName]) ? 1 : -1;
        }
      } else {
        if (labelSort !== fieldName) {
          setLabelSort(fieldName);
          setSortOrder("asc");
          setSortField(field);
          return (a[fieldName] ? a[fieldName].toLowerCase() : "") <
            (b[fieldName] ? b[fieldName].toLowerCase() : "")
            ? -1
            : 1;
        } else {
          setLabelSort("");
          setSortOrder("desc");
          setSortField(field);
          return (a[fieldName] ? a[fieldName].toLowerCase() : "") <
            (b[fieldName] ? b[fieldName].toLowerCase() : "")
            ? 1
            : -1;
        }
      }
    });
    setFilteredRegisterLot(sortedData);
  };

  const handleUnregisterSort = (field) => {
    let sortedData = filteredUnregisterLot.sort((a, b) => {
      if (
        a[field] &&
        b[field] &&
        validator.isInt(a[field]) &&
        validator.isInt(b[field])
      ) {
        if (labelSort !== field) {
          setLabelSort(field);
          setSortOrder("asc");
          setSortField(field);
          return parseInt(a[field]) < parseInt(b[field]) ? -1 : 1;
        } else {
          setLabelSort("");
          setSortOrder("desc");
          setSortField(field);
          return parseInt(a[field]) < parseInt(b[field]) ? 1 : -1;
        }
      } else {
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
      }
    });
    setFilteredUnregisterLot(sortedData);
  };

  const handleSelectToDelete = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredData?.map((row) => row.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  // to check whether the property is selected or not
  const isSelected = (id) => selected.indexOf(id) !== -1;

  function renderAllProperties() {
    if (filteredData.length === 0) {
      return (
        <tr style={{ textAlign: "center" }}>
          <td colSpan={3} style={{ textAlign: "center" }}>
            <p>No records to display</p>
          </td>
        </tr>
      );
    } else {
      return filteredData?.map((property, index) => {
        return (
          <tr
            key={property.id}
            onClick={() => fetchPropertyData(property.id)}
            className="pe-cursor"
          >
            <td>
              <Input
                type="checkbox"
                onClick={(e) => e.stopPropagation()}
                onChange={() => handleSelectToDelete(property.id)}
                checked={isSelected(property.id)}
              />
            </td>
            <td>
              <h6
                className="mb-0 pe-cursor"
                onClick={() => {
                  fetchPropertyData(property.id);
                }}
              >
                {property.titleReferences}
              </h6>
            </td>
            <td>
              <h6
                onClick={() => {
                  fetchPropertyData(property.id);
                }}
                className="mb-0 pe-cursor"
              >
                <TooltipWrapper
                  id={`address-${property.id}`}
                  placement="bottom"
                  text={property.address}
                  content={convertSubstring(property.address, 100)}
                ></TooltipWrapper>
              </h6>
            </td>
            <td></td>
          </tr>
        );
      });
    }
  }

  function fetchPropertyData(id) {
    setIsLoading(true);
    fetchPropertyById(id)
      .then((response) => {
        setSpecificProperty(response.data.data);
        setTempSpecificProperty(response.data.data);
        setTempSearchField({
          ...tempSearchField,
          state: response.data.data.state,
          country: response.data.data.country,
          suburb: response.data.data.suburb,
          postCode: response.data.data.postCode,
        });
        let countryArray = countries.filter(
          (country) => country.countryName === response.data.data.country
        );
        setStates(countryArray.length > 0 ? countryArray[0].states : []);

        setRegisteredLots(
          response.data.data.registeredProperties
            ? response.data.data.registeredProperties
            : []
        );
        setFilteredRegisterLot(
          response.data.data.registeredProperties
            ? response.data.data.registeredProperties
            : []
        );
        setUnregisteredLots(
          response.data.data.unregisteredProperties
            ? response.data.data.unregisteredProperties
            : []
        );
        setFilteredUnregisterLot(
          response.data.data.unregisteredProperties
            ? response.data.data.unregisteredProperties
            : []
        );
        setIsLoading(false);
        document
          .getElementById("searchPropertyDiv")
          .classList.add("hideSection");
        document
          .getElementById("mainPropertyDiv")
          .classList.remove("hideSection");
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }

  function backToSearch() {
    setSpecificProperty(undefined);
    setTempSpecificProperty(undefined);
    setTempSearchField(undefined);
    document
      .getElementById("searchPropertyDiv")
      .classList.remove("hideSection");
    document.getElementById("mainPropertyDiv").classList.add("hideSection");
  }

  function renderRegisteredLots() {
    if (filteredRegisterLot.length === 0) {
      return (
        <td colSpan={7} style={{ textAlign: "center" }}>
          <p>No records to display</p>
        </td>
      );
    } else {
      return filteredRegisterLot?.map((registeredLot, idx) => {
        return (
          <RegisteredLot
            key={idx}
            modal={1}
            idx={idx}
            registeredLot={registeredLot}
            handleFilter={handleFilterRegister}
            specifiedDetails={specificProperty}
            setBoolVal={setBoolVal}
            fetchPropertyData={fetchPropertyData}
            requiredReg={requiredRegistered}
            fieldLength={fieldLength}
            setShowAlert={setShowAlert}
            setAlertMsg={setAlertMsg}
            isPopEditRForm={isPopEditRForm}
            setIsPopEditRForm={setIsPopEditRForm}
            formStatusNew={formStatusNew}
            setFormStatusNew={setFormStatusNew}
          />
        );
      });
    }
  }

  function renderUnregisteredLots() {
    if (filteredUnregisterLot.length === 0) {
      return (
        <td colSpan={6} style={{ textAlign: "center" }}>
          <p>No records to display</p>
        </td>
      );
    } else {
      return filteredUnregisterLot?.map((unregisteredLot, index) => {
        return (
          <UnregisteredLot
            modal={2}
            unregisteredLot={unregisteredLot}
            setBoolVal={setBoolVal}
            isEditTrue={isEditTrue}
            specifiedDetails={specificProperty}
            setIsEditTrue={setIsEditTrue}
            fetchPropertyData={fetchPropertyData}
            requiredUnreg={requiredUnregistered}
            fieldLength={fieldLength}
            index={index}
            setShowAlert={setShowAlert}
            setAlertMsg={setAlertMsg}
            isPopEditUForm={isPopEditUForm}
            setIsPopEditUForm={setIsPopEditUForm}
            formStatusNew={formStatusNew}
            setFormStatusNew={setFormStatusNew}
          />
        );
      });
    }
  }

  const handleSubmitUpdateForm = async () => {
    setdisableButton(true);
    const dataToBeSent = {
      ...specificProperty,
      suburb: tempSearchField.suburb,
      state: tempSearchField.state,
      country: tempSearchField.country,
      postCode: tempSearchField.postCode,
      registeredProperties: registeredLots,
      unregisteredProperties: unregisteredLots,
    };

    try {
      const { data } = await editPropertyDetails({
        requestId: uuidv1(),
        data: dataToBeSent,
      });
      if (data.success) {
        fetchPropertyData(specificProperty.id);
      } else {
        setShowAlert(true);
        setAlertMsg(data?.error?.message);
      }
      setdisableButton(false);
    } catch (error) {
      console.error(error);
      setdisableButton(false);
    }
  };

  function updateProperty(e) {
    e.preventDefault();
    const keyArray = Object.keys(specificProperty);

    let bool = true;

    keyArray.forEach((key) => {
      if (requiredGeneral.indexOf(key) >= 0 && specificProperty[key] === "") {
        bool = false;
      }
    });

    if (!bool) {
      return setSubmitted(true);
    }

    let existInList = true;

    if (existInList) {
      let checkSuburb = false;
      postalList.forEach((info) => {
        if (
          (tempSearchField?.suburb !== ""
            ? info.locality?.toUpperCase() ===
              tempSearchField?.suburb?.toUpperCase()
            : true) &&
          (tempSearchField?.postCode !== ""
            ? info.postCode.toString() === tempSearchField?.postCode?.toString()
            : true) &&
          (tempSearchField?.state !== ""
            ? info.state?.toUpperCase() ===
              tempSearchField?.state?.toUpperCase()
            : true) &&
          (tempSearchField?.country !== ""
            ? info.country?.toUpperCase() ===
              tempSearchField?.country?.toUpperCase()
            : true)
        ) {
          checkSuburb = true;
        }
      });

      if (!checkSuburb) {
        existInList = false;
        let content = [];
        if (
          !requiredGeneral.includes("suburb") &&
          tempSearchField?.suburb !== ""
        ) {
          content.push(tempSearchField?.suburb);
        }
        if (
          !requiredGeneral.includes("state") &&
          tempSearchField?.state !== ""
        ) {
          content.push(tempSearchField?.state);
        }
        if (
          !requiredGeneral.includes("country") &&
          tempSearchField?.country !== ""
        ) {
          content.push(tempSearchField?.country);
        }
        if (
          !requiredGeneral.includes("postCode") &&
          tempSearchField?.postCode !== ""
        ) {
          content.push(tempSearchField?.postCode);
        }

        if (content.length > 0) {
          setWarningData(content);
        } else {
          existInList = true;
        }
      }
    }

    if (!existInList) {
      return setConfirmAddress(true);
    }

    handleSubmitUpdateForm();
  }

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

    fetchPropertyList({
      ...filterInput,
      pageNo: tempPageNo,
      pageSize: e.target.value,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
    })
      .then((response) => {
        setAllProperties(response.data.data.properties);
        setFilteredData(response.data.data.properties);
        setTotalPages(response.data.metadata.page.totalPages);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const handleNextPage = () => {
    setIsLoading(true);
    let pg = pageNo + 1;
    setPageNo(pg);
    fetchPropertyList({
      ...filterInput,
      pageNo: pg,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
    })
      .then((response) => {
        setAllProperties(response.data.data.properties);
        setFilteredData(response.data.data.properties);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const handlePreviousPage = () => {
    setIsLoading(true);
    let pg = pageNo - 1;
    setPageNo(pg);
    fetchPropertyList({
      ...filterInput,
      pageNo: pg,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
    })
      .then((response) => {
        setAllProperties(response.data.data.properties);
        setFilteredData(response.data.data.properties);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const handleJumpToPage = (num) => {
    setIsLoading(true);
    setPageNo(num - 1);
    fetchPropertyList({
      ...filterInput,
      pageNo: num - 1,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
    })
      .then((response) => {
        setAllProperties(response.data.data.properties);
        setFilteredData(response.data.data.properties);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const handleSelectSuburb = (fieldName, obj) => {
    const selectedCountry = countries.filter(
      (country) => country.countryName === obj.country
    );

    setStates(selectedCountry[0].states);

    setSpecificProperty({
      ...specificProperty,
      suburb: obj.locality,
      postCode: obj.postCode.toString(),
      country: obj.country,
      state: obj.state,
    });
    setTempSearchField({
      ...tempSearchField,
      suburb: obj.locality,
      postCode: obj.postCode,
      country: obj.country,
      state: obj.state,
    });
  };

  const handleChange = (e) => {
    const { name } = e.target;
    if (name === "postCode") {
      setTempSearchField({ ...tempSearchField, [name]: e.target.value });
    }
    setSpecificProperty({ ...specificProperty, [name]: e.target.value });
  };

  const columns = useMemo(
    () => [
      {
        Header: "Title Ref.",
        accessor: "titleReferences",
        sortable: true,
        sortBy: [{ id: "titleReferences", desc: false }],
        Cell: ({ cell }) => (
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              fetchPropertyData(cell.row.original.id);
            }}
          >
            {cell.value}
          </div>
        ),
      },
      {
        Header: "Address",
        accessor: "address",
        sortable: true,
        sortBy: [{ id: "address", desc: false }],
        Cell: ({ cell }) => (
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              fetchPropertyData(cell.row.original.id);
            }}
          >
            {cell.value}
          </div>
        ),
      },
    ],
    []
  );

  const getTableView = () => {
    if (filteredData.length === 0) {
      return (
        <div className="row" style={{ textAlign: "center" }}>
          <p>No records to display</p>
        </div>
      );
    } else {
      return (
        <TableContainer
          columns={columns}
          data={filteredData || []}
          customPageSize={10}
          divClass="table-responsive table-card mb-1"
          tableClass="align-middle table-nowrap"
          theadClass="table-light text-muted"
        />
      );
    }
  };

  const checkAndConfirmDelete = async (id, deleteType, callback) => {
    setIsLoading(true);
    try {
      const res = await checkPropertyLinkedToMatter(id);
      const { unregisterOrRegisterLot, propertyLinked } = res?.data?.data || {};

      if (propertyLinked) {
        toast.warning("Property(s) are linked to a matter and can't be deleted");
        return;
      }

      if (unregisterOrRegisterLot) {
        toast.warning("Property having Registered or Unregistered lots can't be deleted");
        return;
      }

      callback?.();
      setDeleteType(deleteType);
      setShowConfirm(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleDeleteClick = async () => {
    if (
      specificProperty?.registeredProperties?.length > 0 ||
      specificProperty?.unregisteredProperties?.length > 0
    ) {
      toast.warning("Property having Registered or Unregistered lots can't be deleted");
      return;
    }

    await checkAndConfirmDelete(specificProperty.id, "specific", () =>
      setdisableButton(true)
    );
  };

  const handleDeleteSelectedProperties = async () => {
    await checkAndConfirmDelete(selected, "main");
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Property" pageTitle="property" />
          <div className="">
            <div id="searchPropertyDiv">
              <Card>
                <CardHeader>
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                      Property
                    </h5>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-1 flex-wrap">
                        <Button
                          color="success"
                          type="button"
                          onClick={() => setShowAddProperty(true)}
                        >
                          <i className="ri-add-line align-bottom me-1"></i> Add
                        </Button>

                        {selected.length > 0 && (
                          <Button
                            color="danger"
                            type="button"
                            onClick={handleDeleteSelectedProperties}
                          >
                            <i className="ri-delete-bin-5-line align-bottom me-1"></i>{" "}
                              Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardBody
                  className="border border-dashed border-end-0 border-start-0"
                  style={{ display: "none" }}
                >
                  <Form>
                    <Row className="g-3">
                      <Col sm={4}>
                        <div className="search-box">
                          <Input
                            type="text"
                            className="search"
                            placeholder="Search for title references"
                            name="titleReferences"
                            value={filterInput.titleReferences}
                            onChange={handleFilter}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleFilterSubmit()
                            }
                          />
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="search-box">
                          <TextInputField
                            className="search"
                            placeholder="Search for address"
                            name="address"
                            value={filterInput.address}
                            onChange={handleFilter}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleFilterSubmit()
                            }
                          />
                        </div>
                      </Col>
                      <Col sm={1}>
                        <div>
                          <Button
                            type="button"
                            color="primary"
                            className="btn w-100"
                            onClick={() => handleFilterSubmit()}
                          >
                            <MdSearch size={18} />
                          </Button>
                        </div>
                      </Col>
                      <Col sm={1}>
                        <div>
                          <Button
                            type="button"
                            color="danger"
                            className="mx-1"
                            onClick={handleClearFilter}
                          >
                            <MdFilterAltOff size={18} />
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>

                <Table responsive={true} striped={true} hover={true}>
                  <thead className="mb-2">
                    <tr>
                      <th style={{ width: "3%", verticalAlign: "middle" }}>
                        <Input
                          type="checkbox"
                          onChange={handleSelectAllClick}
                          checked={
                            filteredData?.length > 0 &&
                            selected?.length === filteredData?.length
                          }
                        />
                      </th>
                      <th style={{ width: "20%" }}>
                        <label className="d-flex">
                          Title Ref.
                          <div className="associatedContacts-label-btn labelCursor">
                            {sortOrder === "asc" &&
                            sortField === "titleReference" ? (
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
                            sortField === "titleReference" ? (
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
                        <TextInputField
                          type="text"
                          placeholder="Search for Title"
                          name="titleReferences"
                          value={filterInput.titleReferences}
                          onChange={handleFilter}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleFilterSubmit()
                          }
                        />
                      </th>
                      <th style={{ width: "60%" }}>
                        <label className="d-flex">
                          Address
                          <div className="associatedContacts-label-btn labelCursor">
                            {sortOrder === "asc" && sortField === "address" ? (
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
                            {sortOrder === "desc" && sortField === "address" ? (
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
                        <TextInputField
                          type="text"
                          placeholder="Search for address"
                          name="address"
                          value={filterInput.address}
                          onChange={handleFilter}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleFilterSubmit()
                          }
                        />
                      </th>
                      <th style={{ width: "20%", verticalAlign: "middle" }}>
                        <div className="d-flex justify-content-end">
                          <Button
                            type="button"
                            color="success"
                            className="mx-1"
                            onClick={() => handleFilterSubmit()}
                          >
                            <MdSearch size={18} />
                          </Button>
                          <Button
                            type="button"
                            color="danger"
                            className="mx-1"
                            onClick={handleClearFilter}
                          >
                            <MdFilterAltOff size={18} />
                          </Button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>{!isLoading && renderAllProperties()}</tbody>
                </Table>

                {!isLoading && (
                  <CardBody className="mt-2">
                    {/* {isLoading ? <LoadingPage /> : getTableView()} */}
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
                  </CardBody>
                )}

                <CardBody style={{ display: "none" }}>
                  <div className="">
                    {/* <div className="table-responsive">
                      <Table className="table-nowrap align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>
                              <label className="d-flex">
                                Title Ref.
                                <div className="associatedContacts-label-btn labelCursor">
                                  {sortOrder === "asc" &&
                                  sortField === "titleReference" ? (
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
                                  sortField === "titleReference" ? (
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
                              <input
                                id="titleReference"
                                name="titleReferences"
                                value={filterInput.titleReferences}
                                onChange={handleFilter}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleFilterSubmit()
                                }
                                type="text"
                              />
                            </th>
                            <th>
                              <label className="d-flex">
                                Address
                                <div className="associatedContacts-label-btn labelCursor">
                                  {sortOrder === "asc" &&
                                  sortField === "address" ? (
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
                                  sortField === "address" ? (
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
                              <input
                                id="address"
                                name="address"
                                value={filterInput.address}
                                onChange={handleFilter}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleFilterSubmit()
                                }
                                type="text"
                              />
                            </th>
                            <th>
                              <button
                                className="property-searchButton"
                                type="button"
                                onClick={handleFilterSubmit}
                              >
                                <MdSearch size={25} />
                              </button>
                            </th>
                            <th>
                              <button
                                className="property-searchButton"
                                type="button"
                                onClick={handleClearFilter}
                              >
                                <AiOutlineClose size={25} />
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>{renderAllProperties()}</tbody>
                      </Table>
                    </div> */}
                    {/* <div className="row">
                          <div className="col-4">
                            <div
                              className="associatedContacts-label"
                              onClick={() =>
                                handleSortByLabel("titleReference")
                              }
                            >
                              <label className="labelCursor">Title Ref.</label>
                              <div className="associatedContacts-label-btn labelCursor">
                                {sortOrder === "asc" &&
                                sortField === "titleReference" ? (
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
                                sortField === "titleReference" ? (
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
                          </div>
                          <div className="col-5">
                            <div
                              className="associatedContacts-label"
                              onClick={() => handleSortByLabel("address")}
                            >
                              <label className="labelCursor">Address</label>
                              <div className="associatedContacts-label-btn labelCursor">
                                {sortOrder === "asc" &&
                                sortField === "address" ? (
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
                                sortField === "address" ? (
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
                          </div>
                          <div className="col-1 sm"></div>
                          <div className="col-1 sm"></div>
                        </div>
                        <div className="row">
                          <div className="col-4">
                            <input
                              style={{
                                width: "100%",
                                marginTop: "10px",
                                marginBottom: "15px",
                              }}
                              className="filterTextbox"
                              id="titleReference"
                              name="titleReferences"
                              value={filterInput.titleReferences}
                              onChange={handleFilter}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleFilterSubmit()
                              }
                              type="text"
                            />
                          </div>
                          <div className="col-5">
                            <input
                              style={{
                                width: "90%",
                                marginTop: "10px",
                                marginBottom: "15px",
                              }}
                              className="filterTextbox"
                              id="address"
                              name="address"
                              value={filterInput.address}
                              onChange={handleFilter}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleFilterSubmit()
                              }
                              type="text"
                            />
                          </div>
                          <div className="col-1 sm">
                            <button
                              className="property-searchButton"
                              type="button"
                              onClick={handleFilterSubmit}
                            >
                              <MdSearch size={25} />
                            </button>
                          </div>
                          <div className="col-1 sm">
                            <button
                              className="property-searchButton"
                              type="button"
                              onClick={handleClearFilter}
                            >
                              <AiOutlineClose size={25} />
                            </button>
                          </div>
                        </div> */}
                    {/* {renderAllProperties()} */}
                    {/* {!isLoading && (
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
                    )} */}
                  </div>
                </CardBody>
              </Card>

              {/* <div className="propertyPageHeadings">
                  <div className="propertyHeaderContainer">
                    <div className="propertyButton-div">
                      <button
                        className="propertyPageBtns"
                        type="button"
                        onClick={() => setShowAddProperty(true)}
                      >
                        <span className="plusdiv">+</span>Add
                      </button>
                      {selected.length > 0 && (
                        <button
                          type="button"
                          className="propertyButton-delete"
                          onClick={() => {
                            setDeleteType("main");
                            setShowConfirm(true);
                          }}
                        >
                          <span className="plusdiv">-</span> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div> */}
            </div>

            <div className="col-12 hideSection" id="mainPropertyDiv">
              <Card>
                <div>
                  <form onSubmit={updateProperty}>
                    <div className="bg-light d-flex align-items-center justify-content-between p-2">
                      <h5 className="mb-0">Property</h5>
                      <div className="d-flex">
                        <Button
                          disabled={disableButton}
                          color="success"
                          type="submit"
                          className="mx-1"
                        >
                          Save
                        </Button>
                        <Button
                          disabled={disableButton}
                          color="danger"
                          type="button"
                          onClick={handleSingleDeleteClick}
                          className="d-flex mx-1"
                        >
                          Delete
                        </Button>
                        <Button
                          disabled={disableButton}
                          type="button"
                          onClick={() => {
                            if (formStatus.isFormChanged) {
                              return dispatch(
                                updateFormStatusAction({
                                  key: "isShowModal",
                                  value: true,
                                  callback: () => {
                                    navigate(-1);
                                  },
                                })
                              );
                            }
                            if (navigationEditForm.isEditMode) {
                              return navigate(-1);
                            }
                            backToSearch();
                          }}
                          color="warning"
                          className="mx-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="row">
                        <div className="col-3">
                          <TextInputField
                            label="Building Name"
                            name="buildingName"
                            placeholder="Building Name"
                            onChange={handleChange}
                            value={specificProperty?.buildingName}
                            required={
                              requiredGeneral.indexOf(
                                "buildingName".toLowerCase()
                              ) >= 0
                            }
                            invalid={
                              submitted &&
                              requiredGeneral.indexOf(
                                "buildingName".toLowerCase()
                              ) >= 0
                                ? true
                                : false
                            }
                            invalidMessage="Building Name is required"
                            maxLength={
                              fieldLength["buildingName".toLowerCase()]
                            }
                          />
                        </div>
                        <div className="col-3">
                          <TextInputField
                            label="Unit"
                            name="unit"
                            placeholder="Unit"
                            onChange={(e) => {
                              setSpecificProperty({
                                ...specificProperty,
                                unit: e.target.value,
                              });
                            }}
                            value={specificProperty?.unit}
                            required={
                              requiredGeneral.indexOf(
                                "buildingName".toLowerCase()
                              ) >= 0
                            }
                            invalid={
                              submitted &&
                              requiredGeneral.indexOf("unit".toLowerCase()) >= 0
                                ? true
                                : false
                            }
                            invalidMessage="Unit is required"
                            maxLength={fieldLength["unit".toLowerCase()]}
                          />
                        </div>
                        <div className="col-3">
                          <TextInputField
                            label="Street No."
                            name="streetNo"
                            placeholder="Street No."
                            onChange={handleChange}
                            value={specificProperty?.streetNo}
                            required={
                              requiredGeneral.indexOf(
                                "streetNo".toLowerCase()
                              ) >= 0
                            }
                            invalid={
                              submitted &&
                              requiredGeneral.indexOf(
                                "streetNo".toLowerCase()
                              ) >= 0
                                ? true
                                : false
                            }
                            invalidMessage="Street No. is required"
                            maxLength={fieldLength["streetNo".toLowerCase()]}
                          />
                        </div>
                        <div className="col-3">
                          <TextInputField
                            label="Street"
                            name="street"
                            placeholder="Street"
                            onChange={handleChange}
                            value={specificProperty?.street}
                            required={
                              requiredGeneral.indexOf("street".toLowerCase()) >=
                              0
                            }
                            invalid={
                              submitted &&
                              requiredGeneral.indexOf("street".toLowerCase()) >=
                                0
                                ? true
                                : false
                            }
                            invalidMessage="Street is required"
                            maxLength={fieldLength["street".toLowerCase()]}
                          />
                        </div>
                      </div>
                      <div className="row" style={{ marginTop: "15px" }}>
                        <div className="col-3">
                          <SearchableAddressDropDown
                            name="suburb"
                            label="Suburb"
                            placeholder="Suburb"
                            setTempSearchField={setTempSearchField}
                            tempSearchField={tempSearchField}
                            optionArray={postalList}
                            selected={`${tempSearchField?.suburb}${tempSearchField?.postCode}`}
                            fieldVal={specificProperty?.suburb}
                            required={
                              requiredGeneral.indexOf("suburb".toLowerCase()) >=
                              0
                            }
                            invalid={
                              submitted &&
                              requiredGeneral.indexOf("suburb".toLowerCase()) >=
                                0
                                ? true
                                : false
                            }
                            invalidMessage="Suburb is required"
                            handleSelectSuburb={handleSelectSuburb}
                            maxLength={fieldLength["suburb".toLowerCase()]}
                          />
                        </div>
                        <div className="col-3 rowWise">
                          <SearchableState
                            name="state"
                            label="State"
                            placeholder="State"
                            setTempSearchField={setTempSearchField}
                            tempSearchField={tempSearchField}
                            handleSelectCountryAndState={
                              handleChangeCountryAndState
                            }
                            selected={tempSearchField?.state}
                            fieldVal={specificProperty?.state ?? ""}
                            optionArray={states}
                            required={
                              requiredGeneral.indexOf("state".toLowerCase()) >=
                              0
                            }
                            invalid={
                              submitted &&
                              requiredGeneral.indexOf("state".toLowerCase()) >=
                                0
                                ? true
                                : false
                            }
                            invalidMessage="State is required"
                            maxLength={fieldLength["state".toLowerCase()]}
                          />
                        </div>
                        <div className="col-3">
                          <TextInputField
                            label="Post Code"
                            name="postCode"
                            placeholder="Post Code"
                            onChange={handleChange}
                            value={
                              !!specificProperty?.postCode
                                ? specificProperty?.postCode
                                : ""
                            }
                            required={
                              requiredGeneral.indexOf(
                                "postCode".toLowerCase()
                              ) >= 0
                            }
                            invalid={
                              submitted &&
                              requiredGeneral.indexOf(
                                "postCode".toLowerCase()
                              ) >= 0
                                ? true
                                : false
                            }
                            invalidMessage="Post Code is required"
                            maxLength={fieldLength["postCode".toLowerCase()]}
                          />
                        </div>

                        <div className="col-3 rowWise">
                          <SearchableCountry
                            name="country"
                            label="Country"
                            placeholder="Country"
                            setTempSearchField={setTempSearchField}
                            tempSearchField={tempSearchField}
                            handleSelectCountryAndState={
                              handleChangeCountryAndState
                            }
                            selected={tempSearchField?.country}
                            fieldVal={specificProperty?.country ?? ""}
                            optionArray={countries}
                            required={
                              requiredGeneral.indexOf(
                                "country".toLowerCase()
                              ) >= 0
                            }
                            invalid={
                              submitted &&
                              requiredGeneral.indexOf(
                                "country".toLowerCase()
                              ) >= 0
                                ? true
                                : false
                            }
                            invalidMessage="Country is required"
                            maxLength={fieldLength["country".toLowerCase()]}
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="mt-4">
                  <div className="bg-light d-flex align-items-center justify-content-between p-2">
                    <h5 className="mb-0">Add/Edit Registered Lots</h5>
                    <Button
                      type="button"
                      color="success"
                      className="d-flex"
                      disabled={disableButton}
                      onClick={() => {
                        setIsAddTrue(false);
                        setIsPopRForm(true);
                      }}
                    >
                      Add
                    </Button>
                    {isPopRForm && (
                      <Modal
                        isOpen={isPopRForm}
                        toggle={() => {
                          if (formStatusNew.isFormChanged) {
                            return setFormStatusNew((prev) => ({
                              ...prev,
                              isShowModal: true,
                            }));
                          }
                          setIsPopRForm(false);
                        }}
                        backdrop="static"
                        centered
                        size="lg"
                      >
                        <ModalHeader
                          toggle={() => {
                            if (formStatusNew.isFormChanged) {
                              return setFormStatusNew((prev) => ({
                                ...prev,
                                isShowModal: true,
                              }));
                            }
                            setIsPopRForm(false);
                          }}
                          // style={{ background: "inherit", color: "inherit" }}
                          // className="border-bottom pb-2"
                          className="bg-light p-3"
                        >
                          Registered Lots
                        </ModalHeader>
                        <ModalBody className="">
                          <PopupFormR
                            modalId={1}
                            addBtn={1}
                            tempRegistered={registeredLots}
                            specifiedDetails={specificProperty}
                            setTempRegistered={setRegisteredLots}
                            isAddTrue={isAddTrue}
                            setBoolVal={setBoolVal}
                            setIsPopRForm={setIsPopRForm}
                            fetchPropertyData={(id) => fetchPropertyData(id)}
                            fieldLength={fieldLength}
                            requiredReg={requiredRegistered}
                            formStatusNew={formStatusNew}
                            setFormStatusNew={setFormStatusNew}
                          />
                        </ModalBody>
                      </Modal>
                    )}
                  </div>
                  <Table responsive={true} striped={true} hover={true}>
                    <thead className="mb-2">
                      <tr>
                        <th>
                          <label className="d-flex mb-0">Edit</label>
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() => handleRegisterSort("lotNumber")}
                          >
                            Lot No.
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "lotNumber" ? (
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
                              sortField === "lotNumber" ? (
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
                            name="lotNumber"
                            onChange={handleFilterRegister}
                            placeholder="Lot No."
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() => handleRegisterSort("section1")}
                          >
                            Section
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "section1" ? (
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
                              sortField === "section1" ? (
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
                            name="section"
                            onChange={handleFilterRegister}
                            placeholder="Section"
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() => handleRegisterSort("titleReference")}
                          >
                            Title Reference
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "titleReference" ? (
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
                              sortField === "titleReference" ? (
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
                            name="titleReference"
                            onChange={handleFilterRegister}
                            placeholder="Title Reference"
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() =>
                              handleRegisterSort("depositedPlanNumber")
                            }
                          >
                            Deposited Plan No.
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "depositedPlanNumber" ? (
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
                              sortField === "depositedPlanNumber" ? (
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
                            name="depositedPlanNumber"
                            onChange={handleFilterRegister}
                            placeholder="Deposited Plan No."
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() =>
                              handleRegisterSort("strataPlanNumber")
                            }
                          >
                            Strata Plan No.
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "strataPlanNumber" ? (
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
                              sortField === "strataPlanNumber" ? (
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
                            name="strataPlanNumber"
                            onChange={handleFilterRegister}
                            placeholder="Strata Plan No."
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() => handleRegisterSort("description")}
                          >
                            Description
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "description" ? (
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
                              sortField === "description" ? (
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
                            name="description"
                            onChange={handleFilterRegister}
                            placeholder="Description"
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="mt-2">{renderRegisteredLots()}</tbody>
                  </Table>
                </div>
                <div className="mt-3">
                  <div className="bg-light d-flex align-items-center justify-content-between p-2">
                    <h5 className="mb-0">Add/Edit Unregistered Lots</h5>
                    <Button
                      type="button"
                      color="success"
                      className="d-flex"
                      data-bs-toggle="modal"
                      data-bs-target="#staticBackdrop2"
                      disabled={disableButton}
                      onClick={() => {
                        setIsAddTrue(false);
                        setIsPopUForm(true);
                      }}
                    >
                      Add
                    </Button>
                    {isPopUForm && (
                      <Modal
                        isOpen={isPopUForm}
                        toggle={() => {
                          if (formStatusNew.isFormChanged) {
                            return setFormStatusNew((prev) => ({
                              ...prev,
                              isShowModal: true,
                            }));
                          }
                          setIsPopUForm(false);
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
                            setIsPopUForm(false);
                          }}
                          // style={{ background: "inherit", color: "inherit" }}
                          // className="border-bottom"
                          className="bg-light p-3"
                        >
                          Unregistered Lots
                        </ModalHeader>
                        <ModalBody>
                          <PopupFormUnR
                            modalId={2}
                            addBtn={1}
                            tempUnregistered={unregisteredLots}
                            specifiedDetails={specificProperty}
                            setTempUnregistered={setUnregisteredLots}
                            isAddTrue={isAddTrue}
                            setBoolVal={setBoolVal}
                            setIsPopUForm={setIsPopUForm}
                            fetchPropertyData={(id) => fetchPropertyData(id)}
                            fieldLength={fieldLength}
                            requiredUnreg={requiredUnregistered}
                            formStatusNew={formStatusNew}
                            setFormStatusNew={setFormStatusNew}
                          />
                        </ModalBody>
                      </Modal>
                    )}
                  </div>
                  <Table responsive={true} striped={true} hover={true}>
                    <thead className="mb-2">
                      <tr>
                        <th>
                          <label className="d-flex mb-0">Edit</label>
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() => handleUnregisterSort("lot")}
                          >
                            Lot No.
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" && sortField === "lot" ? (
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
                              {sortOrder === "desc" && sortField === "lot" ? (
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
                            name="lot"
                            onChange={handleFilterUnregister}
                            placeholder="Lot No."
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() => handleUnregisterSort("partOfLot")}
                          >
                            Part of lot
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "partOfLot" ? (
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
                              sortField === "partOfLot" ? (
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
                            name="partOfLot"
                            onChange={handleFilterUnregister}
                            placeholder="Part of lot"
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() => handleUnregisterSort("section")}
                          >
                            Section
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "section" ? (
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
                              sortField === "section" ? (
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
                            name="section"
                            onChange={handleFilterUnregister}
                            placeholder="Section"
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() => handleUnregisterSort("plan")}
                          >
                            Plan Number
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" && sortField === "plan" ? (
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
                              {sortOrder === "desc" && sortField === "plan" ? (
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
                            name="plan"
                            onChange={handleFilterUnregister}
                            placeholder="Plan Number"
                          />
                        </th>
                        <th>
                          <label
                            className="d-flex mb-0"
                            onClick={() => handleUnregisterSort("description")}
                          >
                            Description
                            <div className="associatedContacts-label-btn">
                              {sortOrder === "asc" &&
                              sortField === "description" ? (
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
                              sortField === "description" ? (
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
                            name="description"
                            onChange={handleFilterUnregister}
                            placeholder="Description"
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="mt-2">{renderUnregisteredLots()}</tbody>
                  </Table>
                </div>
                {/* <div className="4">
                      <div className="propertyPageHeadings">
                        <h6 className="propertyPageHeads">Related Matters</h6>
                      </div>
                      <div className="propertyPagesubHeads">
                        <div
                          className="row relatedMattersDiv"
                          style={{ paddingLeft: "10px" }}
                        >
                          <div className="col-1">
                            <h6>Matter</h6>
                            <input
                              type="text"
                              className="filterTextbox"
                            ></input>
                          </div>
                          <div className="col-2">
                            <h6>Client Name</h6>
                            <input
                              type="text"
                              className="filterTextbox"
                            ></input>
                          </div>
                          <div className="col-2">
                            <h6>Responsible Person</h6>
                            <input
                              type="text"
                              className="filterTextbox"
                            ></input>
                          </div>
                          <div className="col-1">
                            <h6>Status</h6>
                            <input
                              type="text"
                              className="filterTextbox"
                            ></input>
                          </div>
                          <div className="col-1">
                            <h6>Sub type</h6>
                            <input
                              type="text"
                              className="filterTextbox"
                            ></input>
                          </div>
                          <div className="col-1">
                            <h6>Amount Due</h6>
                            <input
                              type="text"
                              className="filterTextbox"
                            ></input>
                          </div>
                          <div className="col-2">
                            <h6>Start Date</h6>
                            <input
                              type="text"
                              className="filterTextbox"
                            ></input>
                          </div>
                          <div className="col-2">
                            <h6>End Date</h6>
                            <input
                              type="text"
                              className="filterTextbox"
                            ></input>
                          </div>
                        </div>
                        <div className="lotsScrollDiv"></div>
                      </div>
                    </div> */}
              </Card>
              {confirmAddress && (
                <Modal
                  isOpen={confirmAddress}
                  toggle={() => setConfirmAddress(false)}
                  backdrop="static"
                  scrollable={true}
                  size="md"
                  centered
                >
                  <ModalHeader
                    toggle={() => setConfirmAddress(false)}
                    className="bg-light p-3"
                  >
                    Confirm Your Action
                  </ModalHeader>
                  <ModalBody>
                    <ConfirmationAddressPopup
                      closeForm={() => setConfirmAddress(false)}
                      setData={handleSubmitUpdateForm}
                      warningData={warningData}
                    />
                  </ModalBody>
                </Modal>
              )}
            </div>
          </div>
          {isLoading && <LoadingPage />}
          {showAddProperty && (
            <Modal
              isOpen={showAddProperty}
              toggle={() => {
                if (formStatus.isFormChanged) {
                  return dispatch(
                    updateFormStatusAction({
                      key: "isShowModal",
                      value: true,
                    }),
                  );
                }
                setShowAddProperty(false);
              }}
              backdrop="static"
              scrollable={true}
              size="lg"
              centered
            >
              <ModalHeader
                toggle={() => {
                  if (formStatus.isFormChanged) {
                    return dispatch(
                      updateFormStatusAction({
                        key: "isShowModal",
                        value: true,
                      })
                    );
                  }
                  setShowAddProperty(false);
                }}
                className="bg-light p-3"
              >
                Add New Property
              </ModalHeader>
              <ModalBody>
                <AddProperty
                  allCountries={countries || []}
                  postalList={postalList || []}
                  setBoolVal={setBoolVal}
                  requiredGeneral={requiredGeneral}
                  requiredRegistered={requiredRegistered}
                  requiredUnregistered={requiredUnregistered}
                  fieldLength={fieldLength}
                  close={() => setShowAddProperty(false)}
                />
              </ModalBody>
            </Modal>
          )}
          {showConfirm && (
            <Modal
              isOpen={showConfirm}
              toggle={() => {
                setShowConfirm(false);
                setdisableButton(false);
              }}
              backdrop="static"
              scrollable={true}
              size="md"
              centered
            >
              <ModalHeader
                toggle={() => {
                  setShowConfirm(false);
                  setdisableButton(false);
                }}
                className="bg-light p-3"
              >
                Confirm Your Action
              </ModalHeader>
              <ModalBody>
                <ConfirmationPopup
                  selected={selected}
                  setSelected={setSelected}
                  closeForm={() => setShowConfirm(false)}
                  setBoolVal={setBoolVal}
                  deleteType={deleteType}
                  propertyId={specificProperty?.id}
                  backToSearch={backToSearch}
                  setdisableButton={setdisableButton}
                  setShowAlert={setShowAlert}
                  setAlertMsg={setAlertMsg}
                  setAlertOptions={setAlertOptions}
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
                  btn1={alertOptions.btn1}
                  btn2={alertOptions.btn2}
                  handleFunc={alertOptions.handleFunc}
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
                    setShowAddProperty(false);
                    backToSearch();
                    formStatus.callback?.();
                    if (
                      navigationEditForm.currentFormValue?.tab === "PROPERTY"
                    ) {
                      dispatch(resetFormStatusAction());
                    }
                  }}
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
                    setFormStatusNew((prev) => ({
                      ...prev,
                      isShowModal: false,
                    }));
                  }}
                  btn1={"No"}
                  btn2="Yes"
                  handleFunc={() => {
                    setFormStatusNew({
                      isFormChanged: false,
                      isShowModal: false,
                    });
                    setIsPopRForm(false);
                    setIsPopUForm(false);
                    setIsPopEditRForm(false);
                    setIsPopEditUForm(false);
                  }}
                />
              </ModalBody>
            </Modal>
          )}
        </Container>
      </div>
    </Fragment>
  );
}

export default RenderProperty;
