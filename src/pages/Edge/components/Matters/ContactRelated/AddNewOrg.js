import React, { useState, useEffect, Fragment } from "react";
import { Button, Input, Modal, ModalBody, ModalHeader } from "reactstrap";
import {
  ConfirmationAddressPopup,
  CustomToastWindow,
} from "../../customComponents/CustomComponents";
import LoadingPage from "../../../utils/LoadingPage";
import { createContact } from "../../../apis";
import { v1 as uuidv1 } from "uuid";
import { toast } from "react-toastify";
import {
  TextInputField,
  SearchableAddressDropDown,
  SearchableRoleDropDown,
  SearchableState,
  SearchableMailingState,
  SearchableCountry,
  SearchableRepresentativeDropDown,
} from "pages/Edge/components/InputField";

const initialData = {
  role: "Bussiness/Partnership",
  subType: "",
  legalName: "",
  name: "",
  title: "",
  phoneNumber1: "",
  phoneNumber2: "",
  phoneNumber3: "",
  faxNumber: "",
  mobilePhoneNumber: "",
  website: "",
  emailId1: "",
  emailId2: "",
  dxNumber: "",
  dxCity: "",
  abn: "",
  acn: "",
  commAddress1: "",
  commAddress2: "",
  commAddress3: "",
  commCity: "",
  commState: "",
  commPostCode: "",
  commCountry: "",
  mailingAddress1: "",
  mailingAddress2: "",
  mailingAddress3: "",
  mailingCity: "",
  mailingState: "",
  mailingPostCode: "",
  mailingCountry: "",
  representativeId: "",
};

const searchField = {
  commCity: "",
  commState: "",
  commPostCode: "",
  commCountry: "",
  mailingCity: "",
  mailingState: "",
  mailingPostCode: "",
  mailingCountry: "",
};

const AddNewOrg = (props) => {
  const [organizationDetails, setOrganizationDetails] = useState(initialData);
  const [sameAddress, setSameAddress] = useState(false);

  const [roleList, setRoleList] = useState([]);
  const [personList, setPersonList] = useState([]);
  const [countries, setCountries] = useState([]);
  const [postalList, setPostalList] = useState([]);
  const [fieldLength, setFieldLength] = useState({});
  const [requiredFields, setRequiredFields] = useState([]);

  const [commStates, setCommStates] = useState([]);
  const [mailStates, setMailStates] = useState([]);
  const [tempSearchField, setTempSearchField] = useState(searchField);
  const [confirmAddress, setConfirmAddress] = useState(false);
  const [warningData, setWarningData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchFieldLength = () => {
    let allLengths = {};

    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.organisation?.fields?.map((f) => {
      allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
    });
    setFieldLength(allLengths);
  };

  const fetchRequired = () => {
    let arr = [];

    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.organisation?.fields?.map((f) => {
      if (f.mandatory) {
        arr.push(f.fieldName);
      }
    });
    setRequiredFields(arr);
  };

  const setCountriesAndStates = () => {
    let allCountries = JSON.parse(window.localStorage.getItem("countryList"));
    if (allCountries && allCountries.length > 0) {
      setCountries(allCountries);
      setCommStates(allCountries[0].states);
      setMailStates(allCountries[0].states);
    }
    let postals = JSON.parse(window.localStorage.getItem("postalList"));

    if (postals && postals.length > 0) {
      setPostalList(postals);
    }
  };

  const fetchRoles = () => {
    let roles = JSON.parse(window.localStorage.getItem("roleList"));
    if (roles && roles.length > 0) {
      setRoleList(roles);
    }
  };

  useEffect(() => {
    fetchRequired();
    fetchFieldLength();
    fetchRoles();
    setCountriesAndStates();
  }, []);

  useEffect(() => {
    setPersonList(props.personList);
  }, [props.personList]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    if (name === "mailingPostCode" || name === "commPostCode") {
      setTempSearchField({ ...tempSearchField, [name]: e.target.value });
    }
    setOrganizationDetails({ ...organizationDetails, [name]: e.target.value });
  };

  const handleSelectSuburb = (fieldName, obj) => {
    const selectedCountry = countries.filter(
      (country) => country.countryName === obj.country
    );

    setCommStates(selectedCountry[0].states);
    setMailStates(selectedCountry[0].states);

    if (fieldName === "commCity") {
      setOrganizationDetails({
        ...organizationDetails,
        commCity: obj.locality,
        commPostCode: obj.postCode,
        commCountry: obj.country,
        commState: obj.state,
      });
      setTempSearchField({
        ...tempSearchField,
        commCity: obj.locality,
        commPostCode: obj.postCode,
        commCountry: obj.country,
        commState: obj.state,
      });
    } else {
      setOrganizationDetails({
        ...organizationDetails,
        mailingCity: obj.locality,
        mailingPostCode: obj.postCode,
        mailingCountry: obj.country,
        mailingState: obj.state,
      });
      setTempSearchField({
        ...tempSearchField,
        mailingCity: obj.locality,
        mailingPostCode: obj.postCode,
        mailingCountry: obj.country,
        mailingState: obj.state,
      });
    }
  };

  const handleChangeCountryAndState = (fieldName, val) => {
    if (val === null || val === "None") {
      setOrganizationDetails({
        ...organizationDetails,
        commCountry: val,
        commState: val,
      });
      setTempSearchField({
        ...tempSearchField,
        commCountry: val,
        commState: val,
      });
      setCommStates([]);
    } else {
      if (fieldName === "commCountry") {
        const selectedCountry = countries.filter(
          (country) => country.countryName === val
        );
        setOrganizationDetails({
          ...organizationDetails,
          commCountry: selectedCountry[0].countryName,
          // commState: selectedCountry[0].states[0].stateName,
        });
        setTempSearchField({
          ...tempSearchField,
          commCountry: selectedCountry[0].countryName,
          // commState: selectedCountry[0].states[0].stateName,
        });
        setCommStates(selectedCountry[0].states);
      }
      if (fieldName === "commState") {
        setOrganizationDetails({
          ...organizationDetails,
          commState: val,
        });
        setTempSearchField({
          ...tempSearchField,
          commState: val,
        });
      }
    }
  };

  const handleChangeMailCountryAndState = (fieldName, val) => {
    if (val === null || val === "None") {
      setOrganizationDetails({
        ...organizationDetails,
        mailingCountry: val,
        mailingState: val,
      });
      setTempSearchField({
        ...tempSearchField,
        mailingCountry: val,
        mailingState: val,
      });
      setMailStates([]);
    } else {
      if (fieldName === "mailingCountry") {
        const selectedCountry = countries.filter(
          (country) => country.countryName === val
        );
        setOrganizationDetails({
          ...organizationDetails,
          mailingCountry: selectedCountry[0].countryName,
          // mailingState: selectedCountry[0].states[0].stateName,
        });
        setTempSearchField({
          ...tempSearchField,
          mailingCountry: selectedCountry[0].countryName,
          // mailingState: selectedCountry[0].states[0].stateName,
        });
        setMailStates(selectedCountry[0].states);
      }
      if (fieldName === "mailingState") {
        setOrganizationDetails({
          ...organizationDetails,
          mailingState: val,
        });
        setTempSearchField({
          ...tempSearchField,
          mailingState: val,
        });
      }
    }
  };

  const handleMailingAddress = () => {
    if (sameAddress === false) {
      setSameAddress(true);
      setMailStates(commStates);
      setOrganizationDetails({
        ...organizationDetails,
        mailingAddress1: organizationDetails.commAddress1,
        mailingAddress2: organizationDetails.commAddress2,
        mailingAddress3: organizationDetails.commAddress3,
        mailingCity: tempSearchField.commCity,
        mailingState: tempSearchField.commState,
        mailingPostCode: tempSearchField.commPostCode,
        mailingCountry: tempSearchField.commCountry,
      });
      setTempSearchField({
        ...tempSearchField,
        mailingAddress1: organizationDetails.commAddress1,
        mailingAddress2: organizationDetails.commAddress2,
        mailingAddress3: organizationDetails.commAddress3,
        mailingCity: tempSearchField.commCity,
        mailingState: tempSearchField.commState,
        mailingPostCode: tempSearchField.commPostCode,
        mailingCountry: tempSearchField.commCountry,
      });
    }
    if (sameAddress === true) {
      setSameAddress(false);
      setOrganizationDetails({
        ...organizationDetails,
        mailingAddress1: "",
        mailingAddress2: "",
        mailingAddress3: "",
        mailingCity: "",
        mailingState: "",
        mailingPostCode: "",
        mailingCountry: "",
      });
      setTempSearchField({
        ...tempSearchField,
        mailingAddress1: "",
        mailingAddress2: "",
        mailingAddress3: "",
        mailingCity: "",
        mailingState: "",
        mailingPostCode: "",
        mailingCountry: "",
      });
    }
  };

  const handleCreateOrg = async (formData) => {
    const userDetails = JSON.parse(window.localStorage.getItem("userDetails"));

    try {
      setLoading(true);
      const { data } = await createContact({
        requestId: uuidv1(),
        data: {
          companyId: userDetails?.organizationId,
          siteId: userDetails.siteId,
          organisation: {
            ...formData,
          },
        },
      });
      if (!data.success) {
        toast.warning("Something went wrong, please try later");
      }
      setOrganizationDetails(initialData);
      props.close();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.warning("Something went wrong, please check console");
      console.error(error);
    }
  };

  const handleCreateHelper = async () => {
    const keys = Object.keys(organizationDetails);
    let orgData = {};
    keys.forEach((key) => {
      if (
        organizationDetails[key] === "" ||
        (organizationDetails[key] && organizationDetails[key] === "None") ||
        organizationDetails[key === "NONE"]
      ) {
        orgData = { ...orgData, [key]: null };
      } else {
        orgData = { ...orgData, [key]: organizationDetails[key] };
      }
    });

    handleCreateOrg(orgData);
  };

  function checkFields(obj, fields) {
    for (const field of fields) {
      if (!obj.hasOwnProperty(field) || obj[field] === "") {
        return true;
      }
    }
    return false;
  }

  const handleSubmit = async () => {
    const newRequiredFields = requiredFields.filter((field) => field !== "id");
    const hasInalid = checkFields(organizationDetails, newRequiredFields);
    if (hasInalid) {
      setSubmitted(true);
      return;
    }

    let existInList = true;

    if (existInList) {
      let checkForComm = false;
      let checkForMailing = false;
      postalList.forEach((info) => {
        if (
          (tempSearchField?.commCity !== ""
            ? info.locality?.toUpperCase() ===
              tempSearchField?.commCity?.toUpperCase()
            : true) &&
          (tempSearchField?.commPostCode !== ""
            ? info.postCode.toString() ===
              tempSearchField?.commPostCode?.toString()
            : true) &&
          (tempSearchField?.commState !== ""
            ? info.state?.toUpperCase() ===
              tempSearchField?.commState?.toUpperCase()
            : true) &&
          (tempSearchField?.commCountry !== ""
            ? info.country?.toUpperCase() ===
              tempSearchField?.commCountry?.toUpperCase()
            : true)
        ) {
          checkForComm = true;
        }
        if (
          (tempSearchField?.mailingCity !== ""
            ? info.locality?.toUpperCase() ===
              tempSearchField?.mailingCity?.toUpperCase()
            : true) &&
          (tempSearchField.mailingPostCode !== ""
            ? info.postCode.toString() ===
              tempSearchField?.mailingPostCode?.toString()
            : true) &&
          (tempSearchField?.mailingState !== ""
            ? info.state?.toUpperCase() ===
              tempSearchField?.mailingState?.toUpperCase()
            : true) &&
          (tempSearchField?.mailingCountry !== ""
            ? info.country?.toUpperCase() ===
              tempSearchField?.mailingCountry?.toUpperCase()
            : true)
        ) {
          checkForMailing = true;
        }
      });
      if (!checkForComm || !checkForMailing) {
        existInList = false;
        let content = [];
        if (!checkForComm) {
          if (
            !requiredFields.includes("commCity") &&
            tempSearchField?.commCity
          ) {
            content.push(tempSearchField?.commCity);
          }
          if (
            !requiredFields.includes("commPostCode") &&
            tempSearchField?.commPostCode
          ) {
            content.push(tempSearchField?.commPostCode);
          }
          if (
            !requiredFields.includes("commState") &&
            tempSearchField?.commState
          ) {
            content.push(tempSearchField?.commState);
          }
          if (
            !requiredFields.includes("commCountry") &&
            tempSearchField?.commCountry
          ) {
            content.push(tempSearchField?.commCountry);
          }

          if (content.length > 0) {
            setWarningData(content);
          } else {
            existInList = true;
          }
        } else {
          if (
            !requiredFields.includes("mailingCity") &&
            tempSearchField?.mailingCity
          ) {
            content.push(tempSearchField?.mailingCity);
          }
          if (
            !requiredFields.includes("mailingPostCode") &&
            tempSearchField?.mailingPostCode
          ) {
            content.push(tempSearchField?.mailingPostCode);
          }
          if (
            !requiredFields.includes("mailingState") &&
            tempSearchField?.mailingState
          ) {
            content.push(tempSearchField?.mailingState);
          }
          if (
            !requiredFields.includes("mailingCountry") &&
            tempSearchField?.mailingCountry
          ) {
            content.push(tempSearchField?.mailingCountry);
          }
          if (content.length > 0) {
            setWarningData(content);
          } else {
            existInList = true;
          }
        }
      }
    }

    if (!existInList) {
      return setConfirmAddress(true);
    }

    handleCreateHelper();
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
        closeForm={props.close}
        btn1={"Cancel"}
        btn2="Add"
        heading="Add New Organisation"
        handleFunc={handleSubmit}
        autoClose={false}
        gridSize={"75%"}
      > */}

      <div className="mt-3 mx-3">
        <p>
          Organisation Type {requiredFields.indexOf("role") >= 0 ? "*" : ""}
        </p>
        <Input
          type="radio"
          name="role"
          value="Bussiness/Partnership"
          onChange={handleFormChange}
          checked={organizationDetails.role === "Bussiness/Partnership"}
          className="mx-2"
        />
        Bussiness/Partnership&nbsp;&nbsp;&nbsp;
        <Input
          type="radio"
          name="role"
          value="Company"
          onChange={handleFormChange}
          checked={organizationDetails.role === "Company"}
          className="mx-2"
        />{" "}
        Company&nbsp;&nbsp;&nbsp;
        <Input
          type="radio"
          name="role"
          value="Government Department"
          onChange={handleFormChange}
          checked={organizationDetails.role === "Government Department"}
          className="mx-2"
        />{" "}
        Government Department&nbsp;&nbsp;&nbsp;
        <Input
          type="radio"
          name="role"
          value="Trust"
          onChange={handleFormChange}
          checked={organizationDetails.role === "Trust"}
          className="mx-2"
        />{" "}
        Trust&nbsp;&nbsp;&nbsp;
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="Name"
            name="legalName"
            placeholder="Name"
            value={organizationDetails.legalName}
            onChange={handleFormChange}
            required={requiredFields.indexOf("legalName") >= 0}
            invalid={
              submitted && requiredFields.indexOf("legalName") >= 0
                ? true
                : false
            }
            invalidMessage={"Name is required"}
            maxLength={fieldLength["legalName".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <SearchableRoleDropDown
            label="Role"
            name="subType"
            placeholder="Role"
            labelId="subType-sample"
            value={organizationDetails.subType}
            setDetails={setOrganizationDetails}
            details={organizationDetails}
            optionArray={
              requiredFields.indexOf("role") >= 0
                ? roleList
                : [{ id: "NONE", roleName: "None" }, ...roleList]
            }
            required={requiredFields.indexOf("role") >= 0}
            invalid={
              submitted && requiredFields.indexOf("role") >= 0 ? true : false
            }
            invalidMessage={"Role is required"}
            maxLength={fieldLength["role".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Title"
            name="title"
            placeholder="Title"
            value={organizationDetails.title}
            onChange={handleFormChange}
            invalid={
              submitted && requiredFields.indexOf("title") >= 0 ? true : false
            }
            required={requiredFields.indexOf("title") >= 0}
            invalidMessage={"Title is required"}
            maxLength={fieldLength["title".toLowerCase()]}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="Phone Number 1"
            name="phoneNumber1"
            placeholder="Phone Number 1"
            value={organizationDetails.phoneNumber1}
            onChange={handleFormChange}
            required={requiredFields.indexOf("phoneNumber1") >= 0}
            invalid={
              submitted && requiredFields.indexOf("phoneNumber1") >= 0
                ? true
                : false
            }
            invalidMessage={"Phone Number 1 is required"}
            maxLength={fieldLength["phoneNumber1".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Phone Number 2"
            name="phoneNumber2"
            placeholder="Phone Number 2"
            value={organizationDetails.phoneNumber2}
            onChange={handleFormChange}
            required={requiredFields.indexOf("phoneNumber2") >= 0}
            invalid={
              submitted && requiredFields.indexOf("phoneNumber2") >= 0
                ? true
                : false
            }
            invalidMessage={"Phone Number 2 is required"}
            maxLength={fieldLength["phoneNumber2".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Mobile Number"
            name="mobilePhoneNumber"
            placeholder="Mobile Number"
            value={organizationDetails.mobilePhoneNumber}
            onChange={handleFormChange}
            required={requiredFields.indexOf("mobilePhoneNumber") >= 0}
            invalid={
              submitted && requiredFields.indexOf("mobilePhoneNumber") >= 0
                ? true
                : false
            }
            invalidMessage={"Mobile Number is required"}
            maxLength={fieldLength["mobilePhoneNumber".toLowerCase()]}
          />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="Fax"
            name="faxNumber"
            placeholder="Fax"
            value={organizationDetails.faxNumber}
            onChange={handleFormChange}
            required={requiredFields.indexOf("faxNumber") >= 0}
            invalid={
              submitted && requiredFields.indexOf("faxNumber") >= 0
                ? true
                : false
            }
            invalidMessage={"Fax is required"}
            maxLength={fieldLength["faxNumber".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Website"
            name="website"
            placeholder="Website"
            value={organizationDetails.website}
            onChange={handleFormChange}
            required={requiredFields.indexOf("website") >= 0}
            invalid={
              submitted && requiredFields.indexOf("website") >= 0 ? true : false
            }
            invalidMessage={"Website is required"}
            maxLength={fieldLength["website".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Email 1"
            name="emailId1"
            placeholder="Email 1"
            value={organizationDetails.emailId1}
            onChange={handleFormChange}
            required={requiredFields.indexOf("emailId1") >= 0}
            invalid={
              submitted && requiredFields.indexOf("emailId1") >= 0
                ? true
                : false
            }
            invalidMessage={"Email 1 is required"}
            maxLength={fieldLength["emailId1".toLowerCase()]}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="Email 2"
            name="emailId2"
            placeholder="Email 2"
            value={organizationDetails.emailId2}
            onChange={handleFormChange}
            required={requiredFields.indexOf("emailId2") >= 0}
            invalid={
              submitted && requiredFields.indexOf("emailId2") >= 0
                ? true
                : false
            }
            invalidMessage={"Email 2 is required"}
            maxLength={fieldLength["emailId2".toLowerCase()]}
          />
        </div>
        {/* <TextInputField
        
              name='dxNumber'
              placeholder='DX Number'
              value={organizationDetails.dxNumber}
              onChange={handleFormChange}
              invalid={requiredFields.indexOf('dxNumber') >= 0 ? true : false}
              maxLength={fieldLength['dxNumber'.toLowerCase()]}
            />
            <TextInputField
            
              name='dxCity'
              placeholder='DX City'
              value={organizationDetails.dxCity}
              onChange={handleFormChange}
              invalid={requiredFields.indexOf('dxCity') >= 0 ? true : false}
              maxLength={fieldLength['dxCity'.toLowerCase()]}
            /> */}
        <div className="col-md-4">
          <SearchableRepresentativeDropDown
            label="Representative"
            name="representativeId"
            placeholder="Representative"
            value={organizationDetails.representativeId}
            setOrganizationDetails={setOrganizationDetails}
            organizationDetails={organizationDetails}
            optionArray={personList}
            required={requiredFields.indexOf("representativeId") >= 0}
            invalid={
              submitted && requiredFields.indexOf("representativeId") >= 0
                ? true
                : false
            }
            invalidMessage={"Representative is required"}
            maxLength={fieldLength["representativeId".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="ABN"
            name="abn"
            placeholder="ABN"
            value={organizationDetails.abn}
            onChange={handleFormChange}
            required={requiredFields.indexOf("abn") >= 0}
            invalid={
              submitted && requiredFields.indexOf("abn") >= 0 ? true : false
            }
            invalidMessage={"ABN is required"}
            maxLength={fieldLength["abn".toLowerCase()]}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="ACN"
            name="acn"
            placeholder="ACN"
            value={organizationDetails.acn}
            onChange={handleFormChange}
            required={requiredFields.indexOf("acn") >= 0}
            invalid={
              submitted && requiredFields.indexOf("acn") >= 0 ? true : false
            }
            invalidMessage={"ACN is required"}
            maxLength={fieldLength["acn".toLowerCase()]}
          />
        </div>
        <div className="col-md-4"></div>
        <div className="col-md-4"></div>
      </div>

      <div className="d-flex px-3 py-2 bg-light mt-3">
        <h5 className="mb-0">Street Address</h5>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="Address 1"
            name="commAddress1"
            placeholder="Address 1"
            value={organizationDetails.commAddress1}
            onChange={handleFormChange}
            required={requiredFields.indexOf("commAddress1") >= 0}
            invalid={
              submitted && requiredFields.indexOf("commAddress1") >= 0
                ? true
                : false
            }
            invalidMessage={"Address 1 is required"}
            maxLength={fieldLength["commAddress1".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Address 2"
            name="commAddress2"
            placeholder="Address 2"
            value={organizationDetails.commAddress2}
            onChange={handleFormChange}
            required={requiredFields.indexOf("commAddress2") >= 0}
            invalid={
              submitted && requiredFields.indexOf("commAddress2") >= 0
                ? true
                : false
            }
            invalidMessage={"Address 2 is required"}
            maxLength={fieldLength["commAddress2".toLowerCase()]}
          />
        </div>

        <div className="col-md-4">
          <TextInputField
            label="Address 3"
            name="commAddress3"
            placeholder="Address 3"
            value={organizationDetails.commAddress3}
            onChange={handleFormChange}
            required={requiredFields.indexOf("commAddress3") >= 0}
            invalid={
              submitted && requiredFields.indexOf("commAddress3") >= 0
                ? true
                : false
            }
            invalidMessage={"Address 3 is required"}
            maxLength={fieldLength["commAddress3".toLowerCase()]}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <SearchableAddressDropDown
            label="Suburb"
            name="commCity"
            placeholder="Suburb"
            setTempSearchField={setTempSearchField}
            tempSearchField={tempSearchField}
            optionArray={postalList}
            required={requiredFields.indexOf("commCity".toLowerCase()) >= 0}
            invalid={
              submitted && requiredFields.indexOf("commCity".toLowerCase()) >= 0
                ? true
                : false
            }
            invalidMessage={"Suburb is required"}
            handleSelectSuburb={handleSelectSuburb}
            maxLength={fieldLength["commCity".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <SearchableState
            label="State"
            name="commState"
            placeholder="State"
            setTempSearchField={setTempSearchField}
            tempSearchField={tempSearchField}
            handleSelectCountryAndState={handleChangeCountryAndState}
            fieldVal={organizationDetails.commState}
            optionArray={
              requiredFields.indexOf("commState") >= 0
                ? commStates
                : [{ id: "NONE", stateName: "None" }, ...commStates]
            }
            required={requiredFields.indexOf("commState") >= 0}
            invalid={
              submitted && requiredFields.indexOf("commState") >= 0
                ? true
                : false
            }
            invalidMessage={"State is required"}
            maxLength={fieldLength["commState".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Post Code"
            name="commPostCode"
            placeholder="Post Code"
            value={organizationDetails.commPostCode}
            onChange={handleFormChange}
            required={requiredFields.indexOf("commPostCode") >= 0}
            invalid={
              submitted && requiredFields.indexOf("commPostCode") >= 0
                ? true
                : false
            }
            invalidMessage={"Post Code is required"}
            maxLength={fieldLength["commPostCode".toLowerCase()]}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <SearchableCountry
            label="Country"
            name="commCountry"
            placeholder="Country"
            setTempSearchField={setTempSearchField}
            tempSearchField={tempSearchField}
            fieldVal={organizationDetails.commCountry}
            optionArray={
              requiredFields.indexOf("commCountry") >= 0
                ? countries
                : [{ id: "NONE", countryName: "None" }, ...countries]
            }
            handleSelectCountryAndState={handleChangeCountryAndState}
            required={requiredFields.indexOf("commCountry") >= 0}
            invalid={
              submitted && requiredFields.indexOf("commCountry") >= 0
                ? true
                : false
            }
            invalidMessage={"Country is required"}
            maxLength={fieldLength["commCountry".toLowerCase()]}
          />
        </div>
        <div className="col-md-4"></div>
        <div className="col-md-4"></div>
      </div>

      <div className="d-flex algn-items-center justify-content-between px-3 py-2 bg-light mt-3">
        <h5 className="mb-0">Postal Address</h5>
        <div className="d-flex algn-items-center">
          <Input type="checkbox" onClick={handleMailingAddress} />
          <label className="mx-2 mb-0">Same as Street Address</label>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <TextInputField
            label="Address 1"
            name="mailingAddress1"
            placeholder="Address 1"
            value={organizationDetails.mailingAddress1}
            onChange={handleFormChange}
            required={requiredFields.indexOf("mailingAddress1") >= 0}
            invalid={
              submitted && requiredFields.indexOf("mailingAddress1") >= 0
                ? true
                : false
            }
            invalidMessage={"Address 1 is required"}
            maxLength={fieldLength["mailingAddress1".toLowerCase()]}
            disabled={sameAddress}
          />
        </div>

        <div className="col-md-4">
          <TextInputField
            label="Address 2"
            name="mailingAddress2"
            placeholder="Address 2"
            value={organizationDetails.mailingAddress2}
            onChange={handleFormChange}
            required={requiredFields.indexOf("mailingAddress2") >= 0}
            invalid={
              submitted && requiredFields.indexOf("mailingAddress2") >= 0
                ? true
                : false
            }
            invalidMessage={"Address 2 is required"}
            maxLength={fieldLength["mailingAddress2".toLowerCase()]}
            disabled={sameAddress}
          />
        </div>

        <div className="col-md-4">
          <TextInputField
            label="Address 3"
            name="mailingAddress3"
            placeholder="Address 3"
            value={organizationDetails.mailingAddress3}
            onChange={handleFormChange}
            invalid={
              submitted && requiredFields.indexOf("mailingAddress3") >= 0
                ? true
                : false
            }
            invalidMessage={"Address 3 is required"}
            required={requiredFields.indexOf("mailingAddress3") >= 0}
            maxLength={fieldLength["mailingAddress3".toLowerCase()]}
            disabled={sameAddress}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <SearchableAddressDropDown
            label="Suburb"
            name="mailingCity"
            placeholder="Suburb"
            setTempSearchField={setTempSearchField}
            tempSearchField={tempSearchField}
            optionArray={postalList}
            required={requiredFields.indexOf("mailingCity".toLowerCase()) >= 0}
            invalid={
              submitted &&
              requiredFields.indexOf("mailingCity".toLowerCase()) >= 0
                ? true
                : false
            }
            invalidMessage={"Suburb is required"}
            disabled={sameAddress}
            details={organizationDetails}
            sameaddress={sameAddress}
            handleSelectSuburb={handleSelectSuburb}
            maxLength={fieldLength["mailingCity".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <SearchableMailingState
            label="State"
            name="mailingState"
            placeholder="State"
            setTempSearchField={setTempSearchField}
            tempSearchField={tempSearchField}
            details={organizationDetails}
            disabled={sameAddress}
            sameaddress={sameAddress}
            handleSelectCountryAndState={handleChangeMailCountryAndState}
            fieldVal={organizationDetails.mailingState}
            optionArray={
              requiredFields.indexOf("mailingState") >= 0
                ? mailStates
                : [{ id: "NONE", stateName: "None" }, ...mailStates]
            }
            required={requiredFields.indexOf("mailingState") >= 0}
            invalid={
              submitted && requiredFields.indexOf("mailingState") >= 0
                ? true
                : false
            }
            invalidMessage={"State is required"}
            maxLength={fieldLength["mailingState".toLowerCase()]}
          />
        </div>
        <div className="col-md-4">
          <TextInputField
            label="Post Code"
            name="mailingPostCode"
            placeholder="Post Code"
            value={organizationDetails.mailingPostCode}
            onChange={handleFormChange}
            required={requiredFields.indexOf("mailingPostCode") >= 0}
            invalid={
              submitted && requiredFields.indexOf("mailingPostCode") >= 0
                ? true
                : false
            }
            invalidMessage={"Post Code is required"}
            maxLength={fieldLength["mailingPostCode".toLowerCase()]}
            disabled={sameAddress}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-4">
          <SearchableCountry
            label="Country"
            name="mailingCountry"
            placeholder="Country"
            setTempSearchField={setTempSearchField}
            tempSearchField={tempSearchField}
            details={organizationDetails}
            disabled={sameAddress}
            sameaddress={sameAddress}
            handleSelectCountryAndState={handleChangeMailCountryAndState}
            fieldVal={organizationDetails.mailingCountry}
            optionArray={
              requiredFields.indexOf("mailingCountry") >= 0
                ? countries
                : [{ id: "NONE", countryName: "None" }, ...countries]
            }
            required={requiredFields.indexOf("mailingCountry") >= 0}
            invalid={
              submitted && requiredFields.indexOf("mailingCountry") >= 0
                ? true
                : false
            }
            invalidMessage={"Country is required"}
            maxLength={fieldLength["mailingCountry".toLowerCase()]}
          />
        </div>
        <div className="col-md-4"></div>
        <div className="col-md-4"></div>
      </div>

      {/* </CustomToastWindow> */}

      <div className="row mt-4">
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            type="button"
            color="light"
            onClick={props.close}
            className="mx-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="success"
            onClick={handleSubmit}
            className="mx-1"
          >
            Save
          </Button>
        </div>
      </div>

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
              setData={() => handleCreateHelper()}
              warningData={warningData}
            />
          </ModalBody>
        </Modal>
      )}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default AddNewOrg;
