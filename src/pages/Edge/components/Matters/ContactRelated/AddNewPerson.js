import React, { useState, useEffect, Fragment } from "react";
import { Button, Input, Modal, ModalBody, ModalHeader } from "reactstrap";
import {
  ConfirmationPersonPopup,
  ConfirmationAddressPopup,
} from "../../customComponents/CustomComponents";
import { v1 as uuidv1 } from "uuid";

import LoadingPage from "../../../utils/LoadingPage";
import { checkPersonExist, createContact } from "../../../apis";
import { toast } from "react-toastify";
import {
  TextInputField,
  SearchableDropDown,
  SearchableCountry,
  SearchableState,
  SearchableAddressDropDown,
  SearchableMailingState,
  SearchableRoleDropDown,
  SearchableCompanyDropDown,
} from "pages/Edge/components/InputField";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";

const initialData = {
  role: "",
  companyId: "",
  gender: "",
  salutation: "",
  firstName: "",
  middleName: "",
  lastName: "",
  phoneNumber1: "",
  phoneNumber2: "",
  faxNumber: "",
  mobilePhoneNumber: "",
  website: "",
  emailId1: "",
  emailId2: "",
  dateOfBirth: "",
  placeOfBirth: "",
  countryOfBirth: "",
  nationality: "",
  passportNumber: "",
  occupation: "",
  practiceCertNumber: "",
  personComments: "",
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
  flagDeactivated: "",
  deactivatedOn: "",
  deactivatedBy: "",
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

function AddNewPerson(props) {
  const [personDetails, setPersonDetails] = useState(initialData);
  const [sameAddress, setSameAddress] = useState(false);

  const [companyList, setCompanyList] = useState([]);
  const [countries, setCountries] = useState([]);
  const [postalList, setPostalList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [fieldLength, setFieldLength] = useState({});
  const [requiredFields, setRequiredFields] = useState([]);

  const [commStates, setCommStates] = useState([]);
  const [mailStates, setMailStates] = useState([]);

  const [warningMsg, setWarningMsg] = useState("");
  const [existingPerson, setExistingPerson] = useState([]);
  const [warningExist, setWarningExist] = useState(false);
  const [completeData, setCompleteData] = useState(null);
  const [tempSearchField, setTempSearchField] = useState(searchField);
  const [confirmAddress, setConfirmAddress] = useState(false);
  const [warningData, setWarningData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchFieldLength = () => {
    let allLengths = {};

    JSON.parse(window.localStorage.getItem("metaData"))?.person?.fields?.map(
      (f) => {
        allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
      }
    );
    setFieldLength(allLengths);
  };

  const fetchRequired = () => {
    let arr = [];

    JSON.parse(window.localStorage.getItem("metaData"))?.person?.fields?.map(
      (f) => {
        if (f.mandatory) {
          arr.push(f.fieldName);
        }
      }
    );
    setRequiredFields(arr);
  };

  const setCountriesAndStates = () => {
    let allCountries = JSON.parse(window.localStorage.getItem("countryList"));
    if (allCountries && allCountries.length > 0) {
      setCountries(allCountries);
      setCommStates(allCountries[0].states);
      setMailStates(allCountries[0].states);

      setPersonDetails({
        ...personDetails,
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
    setCompanyList(props.companyList);
  }, [props.companyList]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    if (name === "mailingPostCode" || name === "commPostCode") {
      setTempSearchField({ ...tempSearchField, [name]: e.target.value });
    }
    setPersonDetails({ ...personDetails, [name]: e.target.value });
  };

  const handleChangeCountryAndState = (fieldName, val) => {
    if (val === null || val === "None") {
      setPersonDetails({
        ...personDetails,
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
        setPersonDetails({
          ...personDetails,
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
        setPersonDetails({
          ...personDetails,
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
      setPersonDetails({
        ...personDetails,
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
        setPersonDetails({
          ...personDetails,
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
        setPersonDetails({
          ...personDetails,
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
      setPersonDetails({
        ...personDetails,
        mailingAddress1: personDetails.commAddress1,
        mailingAddress2: personDetails.commAddress2,
        mailingAddress3: personDetails.commAddress3,
        mailingCity: tempSearchField.commCity,
        mailingState: tempSearchField.commState,
        mailingPostCode: tempSearchField.commPostCode,
        mailingCountry: tempSearchField.commCountry,
      });
      setTempSearchField({
        ...tempSearchField,
        mailingAddress1: personDetails.commAddress1,
        mailingAddress2: personDetails.commAddress2,
        mailingAddress3: personDetails.commAddress3,
        mailingCity: tempSearchField.commCity,
        mailingState: tempSearchField.commState,
        mailingPostCode: tempSearchField.commPostCode,
        mailingCountry: tempSearchField.commCountry,
      });
    }
    if (sameAddress === true) {
      setSameAddress(false);
      setPersonDetails({
        ...personDetails,
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

  const handleCreatePerson = async (formData) => {
    const userDetails = JSON.parse(window.localStorage.getItem("userDetails"));

    try {
      setLoading(true);
      const { data } = await createContact({
        requestId: uuidv1(),
        data: {
          companyId: userDetails?.organizationId,
          siteId: userDetails.siteId,
          person: {
            ...formData,
          },
        },
      });
      if (!data.success) {
        toast.warning("Something went wrong, please try later");
      }
      setPersonDetails(initialData);
      setCompleteData(null);
      props.close();
      // refresh(false);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.warning("Something went wrong, please check console");
      console.error(error);
    }
  };

  const handleCheckPersonExist = async (formData) => {
    try {
      setLoading(true);
      const { data } = await checkPersonExist(formData);
      if (!data.success) {
        setWarningMsg(data.error.message);
        setExistingPerson(data.data.personList);
        setWarningExist(true);
        setCompleteData(formData);
      } else {
        handleCreatePerson(formData);
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  const handleCreateHelper = async () => {
    const keys = Object.keys(personDetails);

    let personData = { ...personDetails, ...tempSearchField };
    keys.forEach((key) => {
      if (
        personData[key] === "" ||
        (personData[key] &&
          typeof personData[key] === "string" &&
          personData[key]?.toLowerCase() === "none")
      ) {
        personData = { ...personData, [key]: null };
      }
    });
    var formData = {
      ...personData,
    };

    handleCheckPersonExist(formData);
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
    let existInList = true;
    const hasInalid = checkFields(personDetails, requiredFields);
    if (hasInalid) {
      setSubmitted(true);
      return;
    }

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
            ? info.postCode.toString() ===
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
            ? info.postCode.toString() ===
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

  const handleSelectSuburb = (fieldName, obj) => {
    const selectedCountry = countries.filter(
      (country) => country.countryName === obj.country
    );

    setCommStates(selectedCountry[0].states);
    setMailStates(selectedCountry[0].states);

    if (fieldName === "commCity") {
      setPersonDetails({
        ...personDetails,
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
      setPersonDetails({
        ...personDetails,
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

  return (
    <Fragment>
      {/* <CustomToastWindow
        closeForm={props.close}
        btn1={"Cancel"}
        btn2="Add"
        heading="Add New Person"
        handleFunc={handleSubmit}
        autoClose={false}
        gridSize={"75%"}
      > */}
      <div className="mx-2">
        <div className="row mt-3">
          <div className="col-md-4">
            <SearchableRoleDropDown
              label="Role"
              placeholder="Role"
              labelId="role-sample"
              name="role"
              value={personDetails.role}
              fieldVal={personDetails.role}
              setDetails={setPersonDetails}
              details={personDetails}
              optionArray={
                requiredFields.indexOf("role") >= 0
                  ? roleList
                  : [{ id: 0, roleName: "None" }, ...roleList]
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
            <SearchableDropDown
              label="Gender"
              placeholder="Gender"
              labelId="gender-sample"
              name="gender"
              value={personDetails.gender}
              setDetails={setPersonDetails}
              details={personDetails}
              fieldVal={personDetails.gender}
              optionArray={["Male", "Female", "Other"]}
              required={requiredFields.indexOf("gender") >= 0}
              invalid={
                submitted && requiredFields.indexOf("gender") >= 0
                  ? true
                  : false
              }
              maxLength={fieldLength["gender".toLowerCase()]}
              invalidMessage="Gender is required"
            />
          </div>
          <div className="col-md-4">
            <SearchableDropDown
              label="Salutation"
              placeholder="Salutation"
              labelId="salutation-sample"
              name="salutation"
              value={personDetails.salutation}
              fieldVal={personDetails.salutation}
              optionArray={
                requiredFields.indexOf("gender") >= 0
                  ? [
                      "Mr",
                      "Ms",
                      "Mrs",
                      "Dr",
                      "Prof",
                      "Sir",
                      "Master",
                      "Lady",
                      "Reverand",
                    ]
                  : [
                      "None",
                      "Mr",
                      "Ms",
                      "Mrs",
                      "Dr",
                      "Prof",
                      "Sir",
                      "Master",
                      "Lady",
                      "Reverand",
                    ]
              }
              setDetails={setPersonDetails}
              details={personDetails}
              maxLength={fieldLength["salutation".toLowerCase()]}
              invalid={
                submitted && requiredFields.indexOf("salutation") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Salutation is required"}
              required={requiredFields.indexOf("salutation") >= 0}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-4">
            <TextInputField
              label="First Name"
              name="firstName"
              placeholder="First Name"
              value={personDetails.firstName}
              onChange={handleFormChange}
              required={requiredFields.indexOf("firstName") >= 0}
              invalid={
                submitted && requiredFields.indexOf("firstName") >= 0
                  ? true
                  : false
              }
              invalidMessage={"First Name is required"}
              maxLength={fieldLength["firstName".toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="Middle Name"
              name="middleName"
              placeholder="Middle Name"
              value={personDetails.middleName}
              onChange={handleFormChange}
              required={requiredFields.indexOf("middleName") >= 0}
              invalid={
                submitted && requiredFields.indexOf("middleName") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Middle Name is required"}
              maxLength={fieldLength["middleName".toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="Last Name"
              name="lastName"
              placeholder="Last Name"
              value={personDetails.lastName}
              onChange={handleFormChange}
              required={requiredFields.indexOf("lastName") >= 0}
              invalid={
                submitted && requiredFields.indexOf("lastName") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Last Name is required"}
              maxLength={fieldLength["lastName".toLowerCase()]}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-4">
            <TextInputField
              label="Home Phone"
              name="phoneNumber1"
              placeholder="Home Phone"
              value={personDetails.phoneNumber1}
              onChange={handleFormChange}
              required={requiredFields.indexOf("phoneNumber1") >= 0}
              invalid={
                submitted && requiredFields.indexOf("phoneNumber1") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Home Phone is required"}
              maxLength={fieldLength["phoneNumber1".toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="Work Phone"
              name="phoneNumber2"
              placeholder="Work Phone"
              value={personDetails.phoneNumber2}
              onChange={handleFormChange}
              required={requiredFields.indexOf("phoneNumber2") >= 0}
              invalid={
                submitted && requiredFields.indexOf("phoneNumber2") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Work Phone is required"}
              maxLength={fieldLength["phoneNumber2".toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="Fax"
              name="faxNumber"
              placeholder="Fax"
              value={personDetails.faxNumber}
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
        </div>

        <div className="row mt-3">
          <div className="col-md-4">
            <TextInputField
              label="Mobile Number"
              name="mobilePhoneNumber"
              placeholder="Mobile Number"
              value={personDetails.mobilePhoneNumber}
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
          <div className="col-md-4">
            <TextInputField
              label="Website"
              name="website"
              placeholder="Website"
              value={personDetails.website}
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
          <div className="col-md-4">
            <TextInputField
              label="Email 1"
              name="emailId1"
              placeholder="Email 1"
              value={personDetails.emailId1}
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
              value={personDetails.emailId2}
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
          <div className="col-md-4">
            <SearchableCompanyDropDown
              label="Company"
              placeholder="Company"
              name="companyId"
              // type='number'
              value={personDetails.companyId}
              setDetails={setPersonDetails}
              details={personDetails}
              optionArray={
                requiredFields.indexOf("role") >= 0
                  ? companyList
                  : [{ contactId: 0, companyName: "None" }, ...companyList]
              }
              required={requiredFields.indexOf("companyId") >= 0}
              invalid={
                submitted && requiredFields.indexOf("companyId") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Company is required"}
              maxLength={fieldLength["companyId".toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="Place of Birth"
              name="placeOfBirth"
              placeholder="Place of Birth"
              value={personDetails.placeOfBirth}
              onChange={handleFormChange}
              required={requiredFields.indexOf("placeOfBirth") >= 0}
              invalid={
                submitted && requiredFields.indexOf("placeOfBirth") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Place of Birth is required"}
              maxLength={fieldLength["placeOfBirth".toLowerCase()]}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-4">
            <TextInputField
              label="Date of Birth"
              name="dateOfBirth"
              placeholder="Date of Birth"
              type="date"
              value={personDetails.dateOfBirth}
              onChange={handleFormChange}
              required={requiredFields.indexOf("dateOfBirth") >= 0}
              invalid={
                submitted && requiredFields.indexOf("dateOfBirth") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Date of Birth is required"}

              // maxLength={fieldLength['dateOfBirth'.toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="Country of Birth"
              name="countryOfBirth"
              placeholder="Country of Birth"
              value={personDetails.countryOfBirth}
              onChange={handleFormChange}
              required={requiredFields.indexOf("countryOfBirth") >= 0}
              invalid={
                submitted && requiredFields.indexOf("countryOfBirth") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Country of Birth is required"}
              maxLength={fieldLength["countryOfBirth".toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="National"
              name="nationality"
              placeholder="Nationality"
              value={personDetails.nationality}
              onChange={handleFormChange}
              required={requiredFields.indexOf("nationality") >= 0}
              invalid={
                submitted && requiredFields.indexOf("nationality") >= 0
                  ? true
                  : false
              }
              invalidMessage={"nationality is required"}
              maxLength={fieldLength["nationality".toLowerCase()]}
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-4">
            <TextInputField
              label="Passport No."
              name="passportNumber"
              placeholder="Passport No."
              value={personDetails.passportNumber}
              onChange={handleFormChange}
              required={requiredFields.indexOf("passportNumber") >= 0}
              invalid={
                submitted && requiredFields.indexOf("passportNumber") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Passport No. is required"}
              maxLength={fieldLength["passportNumber".toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="Occupation"
              name="occupation"
              placeholder="Occupation"
              value={personDetails.occupation}
              onChange={handleFormChange}
              required={requiredFields.indexOf("occupation") >= 0}
              invalid={
                submitted && requiredFields.indexOf("occupation") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Occupation is required"}
              maxLength={fieldLength["occupation".toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="Comments"
              name="personComments"
              placeholder="Comments"
              value={personDetails.personComments}
              onChange={handleFormChange}
              required={requiredFields.indexOf("personComments") >= 0}
              invalid={
                submitted && requiredFields.indexOf("personComments") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Comments is required"}
              maxLength={fieldLength["personComments".toLowerCase()]}
            />
          </div>
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
              value={personDetails.commAddress1}
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
              value={personDetails.commAddress2}
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
              value={personDetails.commAddress3}
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
              fieldVal={personDetails.commCity}
              required={requiredFields.indexOf("commCity") >= 0}
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

          <div className="col-md-4">
            <SearchableState
              label="State"
              name="commState"
              placeholder="State"
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              handleSelectCountryAndState={handleChangeCountryAndState}
              fieldVal={personDetails.commState}
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
              type="text"
              name="commPostCode"
              placeholder="Post Code"
              value={personDetails.commPostCode}
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
              fieldVal={personDetails.commCountry}
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
              disabled={sameAddress}
              value={personDetails.mailingAddress1}
              onChange={handleFormChange}
              required={requiredFields.indexOf("mailingAddress1") >= 0}
              invalid={
                submitted && requiredFields.indexOf("mailingAddress1") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Address 1 is required"}
              maxLength={fieldLength["mailingAddress1".toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="Address 2"
              name="mailingAddress2"
              placeholder="Address 2"
              disabled={sameAddress}
              value={personDetails.mailingAddress2}
              onChange={handleFormChange}
              required={requiredFields.indexOf("mailingAddress2") >= 0}
              invalid={
                submitted && requiredFields.indexOf("mailingAddress2") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Address 2 is required"}
              maxLength={fieldLength["mailingAddress2".toLowerCase()]}
            />
          </div>
          <div className="col-md-4">
            <TextInputField
              label="Address 3"
              name="mailingAddress3"
              placeholder="Address 3"
              value={personDetails.mailingAddress3}
              disabled={sameAddress}
              onChange={handleFormChange}
              required={requiredFields.indexOf("mailingAddress3") >= 0}
              invalid={
                submitted && requiredFields.indexOf("mailingAddress3") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Address 3 is required"}
              maxLength={fieldLength["mailingAddress3".toLowerCase()]}
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
              details={personDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              fieldVal={personDetails.mailingCity}
              required={requiredFields.indexOf("mailingCity") >= 0}
              invalid={
                submitted &&
                requiredFields.indexOf("mailingCity".toLowerCase()) >= 0
                  ? true
                  : false
              }
              invalidMessage={"Suburb is required"}
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
              details={personDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              handleSelectCountryAndState={handleChangeMailCountryAndState}
              fieldVal={personDetails.mailingState}
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
              type="text"
              value={personDetails.mailingPostCode}
              disabled={sameAddress}
              onChange={handleFormChange}
              required={requiredFields.indexOf("mailingPostCode") >= 0}
              invalid={
                submitted && requiredFields.indexOf("mailingPostCode") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Post Code is required"}
              maxLength={fieldLength["mailingPostCode".toLowerCase()]}
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
              details={personDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              handleSelectCountryAndState={handleChangeMailCountryAndState}
              fieldVal={personDetails.mailingCountry}
              // optionArray={mailStates}
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
      </div>

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

      {/* </CustomToastWindow> */}

      {warningExist && (
        <Modal
          isOpen={warningExist}
          toggle={() => {
            setWarningExist(false);
            setCompleteData(null);
          }}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => {
              setWarningExist(false);
              setCompleteData(null);
            }}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <ConfirmationPersonPopup
              closeForm={() => {
                setWarningExist(false);
                setCompleteData(null);
              }}
              message={warningMsg}
              personList={existingPerson}
              createPerson={() => handleCreatePerson(completeData)}
            />
          </ModalBody>
        </Modal>
      )}
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
}

export default AddNewPerson;
