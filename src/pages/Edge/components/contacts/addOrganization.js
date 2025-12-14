import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import "../../stylesheets/contacts.css";
import { createContact } from "../../apis";
import { v1 as uuidv1 } from "uuid";
import { Button, Input, Modal, ModalHeader, ModalBody } from "reactstrap";
import {
  TextInputField,
  SearchableAddressDropDown,
  SearchableRoleDropDown,
  SearchableState,
  SearchableCountry,
  SearchableRepresentativeDropDown,
} from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";

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

function AddOrganization(props) {
  const { allCountries, refresh, postalList, roleList, personList } = props;
  const dispatch = useDispatch();
  const [organizationDetails, setOrganizationDetails] = useState(initialData);
  const [tempOrganizationDetails, setTempOrganizationDetails] =
    useState(initialData);
  const [sameAddress, setSameAddress] = useState(false);
  const [countries, setCountries] = useState([]);
  const [commStates, setCommStates] = useState([]);
  const [mailStates, setMailStates] = useState([]);
  const [otherDetails, setOtherDetails] = useState({
    companyId: "",
    siteId: "",
  });
  const [boolVal, setBoolVal] = useState(false);
  const [fieldLength, setFieldLength] = useState({});
  const [requiredFields, setRequiredFields] = useState([]);
  const [tempSearchField, setTempSearchField] = useState(searchField);
  const [confirmAddress, setConfirmAddress] = useState(false);
  const [warningData, setWarningData] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const isChanged =
      JSON.stringify(tempOrganizationDetails) !==
      JSON.stringify(organizationDetails);
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [tempOrganizationDetails, organizationDetails]);

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

  useEffect(() => {
    const setCountriesAndStates = () => {
      setCountries(allCountries);
      setCommStates(allCountries[0].states);
      setMailStates(allCountries[0].states);
      setOrganizationDetails({
        ...organizationDetails,
        commCountry: allCountries[0].countryName,
        commState: allCountries[0].states[0].stateName,
        mailingCountry: allCountries[0].countryName,
        mailingState: allCountries[0].states[0].stateName,
      });
      setTempOrganizationDetails({
        ...tempOrganizationDetails,
        commCountry: allCountries[0].countryName,
        commState: allCountries[0].states[0].stateName,
        mailingCountry: allCountries[0].countryName,
        mailingState: allCountries[0].states[0].stateName,
      });
      setTempSearchField({
        ...tempSearchField,
        commCountry: allCountries[0].countryName,
        commState: allCountries[0].states[0].stateName,
        mailingCountry: allCountries[0].countryName,
        mailingState: allCountries[0].states[0].stateName,
      });
    };

    setCountriesAndStates();

    if (!boolVal) {
      fetchRequired();
      fetchFieldLength();
      const userDetails = JSON.parse(
        window.localStorage.getItem("userDetails")
      );
      setOtherDetails({
        ...otherDetails,
        companyId: userDetails?.organizationId,
        siteId: userDetails?.siteId ? userDetails?.siteId : 1, // this will change later
      });
      setBoolVal(true);
    }
  }, [boolVal]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    if (name === "legalName") {
      setOrganizationDetails({
        ...organizationDetails,
        [name]: e.target.value,
        name: e.target.value,
      });
    }
    if (name === "mailingPostCode" || name === "commPostCode") {
      setTempSearchField({ ...tempSearchField, [name]: e.target.value });
    }
    setOrganizationDetails({ ...organizationDetails, [name]: e.target.value });
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
        const selectedCountry = allCountries.filter(
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
        const selectedCountry = allCountries.filter(
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

  const handleSelectSuburb = (fieldName, obj) => {
    const selectedCountry = allCountries.filter(
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

  const handleAddNewOrg = async () => {
    const keys = Object.keys(organizationDetails);
    let orgData = { ...organizationDetails, ...tempSearchField };
    keys.forEach((key) => {
      if (
        organizationDetails[key] === "None" ||
        organizationDetails[key] === "none" ||
        organizationDetails[key] === ""
      ) {
        orgData = { ...orgData, [key]: null };
      } else {
        orgData = { ...orgData, [key]: organizationDetails[key] };
      }
    });
    var formData = {
      companyId: otherDetails.companyId,
      siteId: otherDetails.siteId,
      organisation: orgData,
    };
    try {
      setDisabled(true);
      const { data } = await createContact({
        requestId: uuidv1(),
        data: formData,
      });
      setOrganizationDetails(initialData);
      props.close(true);
      refresh(false);
      setDisabled(false);
    } catch (err) {
      setDisabled(false);
      console.error(err);
    }
  };

  function checkFields(obj, fields) {
    for (const field of fields) {
      if (!obj.hasOwnProperty(field) || obj[field] === "") {
        return true;
      }
    }
    return false;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newRequiredFields = requiredFields.filter((field) => field !== "id");
    const hasInalid = checkFields(organizationDetails, newRequiredFields);
    if (hasInalid) {
      setSubmitted(true);
      return;
    }
    let existInList = true;
    setDisabled(true);
    if (existInList) {
      let checkForComm = false;
      let checkForMailing = false;
      postalList.forEach((info) => {
        if (
          (tempSearchField?.commCity
            ? info.locality?.toUpperCase() ===
              tempSearchField?.commCity?.toUpperCase()
            : true) &&
          (tempSearchField?.commPostCode
            ? info.postCode?.toString() ===
              tempSearchField?.commPostCode?.toString()
            : true) &&
          (tempSearchField?.commState
            ? info.state?.toUpperCase() ===
              tempSearchField?.commState?.toUpperCase()
            : true) &&
          (tempSearchField?.commCountry
            ? info.country?.toUpperCase() ===
              tempSearchField?.commCountry?.toUpperCase()
            : true)
        ) {
          checkForComm = true;
        }
        if (
          (tempSearchField?.mailingCity
            ? info.locality?.toUpperCase() ===
              tempSearchField?.mailingCity?.toUpperCase()
            : true) &&
          (tempSearchField.mailingPostCode
            ? info.postCode?.toString() ===
              tempSearchField?.mailingPostCode?.toString()
            : true) &&
          (tempSearchField?.mailingState
            ? info.state?.toUpperCase() ===
              tempSearchField?.mailingState?.toUpperCase()
            : true) &&
          (tempSearchField?.mailingCountry
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
            !requiredFields.includes("commState") &&
            tempSearchField?.commState
          ) {
            content.push(tempSearchField?.commState);
          }
          if (
            !requiredFields.includes("commPostCode") &&
            tempSearchField?.commPostCode
          ) {
            content.push(tempSearchField?.commPostCode);
          }
          if (
            !requiredFields.includes("commCountry") &&
            tempSearchField?.commCountry
          ) {
            content.push(tempSearchField?.commCountry);
          }

          if (content?.length > 0) {
            setWarningData(content);
          } else {
            setDisabled(false);
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
          if (content?.length > 0) {
            setWarningData(content);
          } else {
            setDisabled(false);
            existInList = true;
          }
        }
      }
    }

    if (!existInList) {
      setDisabled(false);
      return setConfirmAddress(true);
    }
    handleAddNewOrg();
  };

  return (
    <div className="">
      {/* <div
        className="titleDiv"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
        }}
      >
        <h2 className="mb-0">Add Organisation Details</h2>
        <p
          className="mb-0"
          style={{ cursor: "pointer" }}
          onClick={props.close}
        >
          &#10006;
        </p>
      </div> */}
      <form onSubmit={handleSubmit}>
        <p className="mx-3 m-2 my-3">
          Organisation Type {requiredFields.indexOf("role") >= 0 ? "*" : ""}
        </p>
        <div className="d-flex align-items-center mx-3 my-3">
          <div className="d-flex align-items-center">
            <Input
              type="radio"
              name="role"
              value="Bussiness/Partnership"
              onChange={handleFormChange}
              checked={organizationDetails.role === "Bussiness/Partnership"}
            />
            <span className="mx-2">Bussiness/Partnership</span>
          </div>
          <div className="d-flex align-items-center">
            <Input
              type="radio"
              name="role"
              value="Company"
              onChange={handleFormChange}
              checked={organizationDetails.role === "Company"}
            />
            <span className="mx-2">Company</span>
          </div>
          <div className="d-flex align-items-center">
            <Input
              type="radio"
              name="role"
              value="Government Department"
              onChange={handleFormChange}
              checked={organizationDetails.role === "Government Department"}
            />
            <span className="mx-2">Government Department</span>
          </div>
          <div className="d-flex align-items-center">
            <Input
              type="radio"
              name="role"
              value="Trust"
              onChange={handleFormChange}
              checked={organizationDetails.role === "Trust"}
            />
            <span className="mx-2">Trust</span>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-3">
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
          <div className="col-md-3">
            <SearchableRoleDropDown
              name="subType"
              label="Role"
              labelId="subType-sample"
              placeholder="Role"
              valueKey="roleName"
              value={organizationDetails.subType}
              selected={organizationDetails.subType}
              fieldVal={organizationDetails.subType ?? ""}
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
          <div className="col-md-3">
            <TextInputField
              label="Title"
              name="title"
              placeholder="Title"
              value={organizationDetails.title}
              onChange={handleFormChange}
              required={requiredFields.indexOf("title") >= 0}
              invalid={
                submitted && requiredFields.indexOf("title") >= 0 ? true : false
              }
              invalidMessage={"Title is required"}
              maxLength={fieldLength["title".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
        </div>
        <div className="row mt-2">
          <div className="col-md-3">
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
          <div className="col-md-3">
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
          <div className="col-md-3">
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
          <div className="col-md-3">
            <TextInputField
              label="Website"
              name="website"
              placeholder="Website"
              value={organizationDetails.website}
              onChange={handleFormChange}
              required={requiredFields.indexOf("website") >= 0}
              invalid={
                submitted && requiredFields.indexOf("website") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Website is required"}
              maxLength={fieldLength["website".toLowerCase()]}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
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
          <div className="col-md-3">
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
          {/* <CustomTextInput
            name='dxNumber'
            label='DX Number'
            value={organizationDetails.dxNumber}
            onChange={handleFormChange}
            invalid={submitted &&requiredFields.indexOf('dxNumber') >= 0 ? true : false}
            maxLength={fieldLength['dxNumber'.toLowerCase()]}
          />
          <CustomTextInput
            name='dxCity'
            label='DX City'
            value={organizationDetails.dxCity}
            onChange={handleFormChange}
            invalid={submitted &&requiredFields.indexOf('dxCity') >= 0 ? true : false}
            maxLength={fieldLength['dxCity'.toLowerCase()]}
          /> */}
          <div className="col-md-3">
            <SearchableRepresentativeDropDown
              name="representativeId"
              label="Representative"
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
          <div className="col-md-3">
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
          <div className="col-md-3">
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
          <div className="col-md-3" />
          <div className="col-md-3" />
          <div className="col-md-3" />
        </div>
        <div className="bg-light d-flex align-items-center px-3 py-2 my-2">
          <h5 className="mb-0">Street Address</h5>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
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
          <div className="col-md-3">
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
          <div className="col-md-3">
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
          <div className="col-md-3">
            <SearchableAddressDropDown
              name="commCity"
              label="Suburb"
              placeholder="Suburb"
              selected={`${tempSearchField.commCity}${tempSearchField.commPostCode}`}
              fieldVal={organizationDetails.commCity ?? ""}
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              optionArray={postalList}
              required={requiredFields.indexOf("commCity".toLowerCase()) >= 0}
              invalid={
                submitted &&
                requiredFields.indexOf("commCity".toLowerCase()) >= 0
                  ? true
                  : false
              }
              invalidMessage={"Suburb is required"}
              handleSelectSuburb={handleSelectSuburb}
              maxLength={fieldLength["commCity".toLowerCase()]}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <SearchableState
              name="commState"
              label="State"
              placeholder="State"
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              handleSelectCountryAndState={handleChangeCountryAndState}
              selected={tempSearchField.commState}
              fieldVal={organizationDetails.commState ?? ""}
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
          <div className="col-md-3">
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
          <div className="col-md-3">
            <SearchableCountry
              name="commCountry"
              label="Country"
              placeholder="Country"
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              selected={tempSearchField.commCountry}
              fieldVal={organizationDetails.commCountry ?? ""}
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
          <div className="col-md-3" />
        </div>
        <div className="bg-light d-flex align-items-center justify-content-between px-3 py-3 my-2">
          <h5 className="mb-0">Postal Address</h5>
          <div className="d-flex align-items-center justify-content-center">
            <Input
              className="mx-2"
              onClick={handleMailingAddress}
              type="checkbox"
            />
            <label className="mb-0">Same as Street Address</label>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3">
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
          <div className="col-md-3">
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
          <div className="col-md-3">
            <TextInputField
              label="Address 3"
              name="mailingAddress3"
              placeholder="Address 3"
              value={organizationDetails.mailingAddress3}
              onChange={handleFormChange}
              required={requiredFields.indexOf("mailingAddress3") >= 0}
              invalid={
                submitted && requiredFields.indexOf("mailingAddress3") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Address 3 is required"}
              maxLength={fieldLength["mailingAddress3".toLowerCase()]}
              disabled={sameAddress}
            />
          </div>
          <div className="col-md-3">
            <SearchableAddressDropDown
              name="mailingCity"
              label="Suburb"
              placeholder="Suburb"
              selected={`${tempSearchField.mailingCity}${tempSearchField.mailingPostCode}`}
              fieldVal={organizationDetails.mailingCity ?? ""}
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              optionArray={postalList}
              required={
                requiredFields.indexOf("mailingCity".toLowerCase()) >= 0
              }
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
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <SearchableState
              name="mailingState"
              label="State"
              placeholder="State"
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              details={organizationDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              handleSelectCountryAndState={handleChangeMailCountryAndState}
              selected={tempSearchField.mailingState}
              fieldVal={organizationDetails.mailingState ?? ""}
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
          <div className="col-md-3">
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
          <div className="col-md-3">
            <SearchableCountry
              name="mailingCountry"
              label="Country"
              placeholder="Country"
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              details={organizationDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              handleSelectCountryAndState={handleChangeMailCountryAndState}
              fieldVal={organizationDetails.mailingCountry ?? ""}
              selected={tempSearchField.mailingCountry}
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
          <div className="col-md-3" />
        </div>
        <div
          className="bg-light mt-2"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            padding: "8px 16px",
          }}
        >
          <Button
            onClick={props.close}
            color="danger"
            type="button"
            className="mx-1"
          >
            Cancel
          </Button>
          <Button
            color="success"
            type="submit"
            disabled={disabled}
            className="mx-1"
          >
            Add
          </Button>
        </div>
      </form>
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
              setData={handleAddNewOrg}
              warningData={warningData}
            />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

export default AddOrganization;
