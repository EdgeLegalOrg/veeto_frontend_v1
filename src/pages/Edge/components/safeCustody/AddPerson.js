import React, { useState, useEffect } from "react";
import "../../stylesheets/contacts.css";
import { useDispatch } from "react-redux";
import { v1 as uuidv1 } from "uuid";
import { Button, Input, Modal, ModalBody, ModalHeader } from "reactstrap";
import { createContact, checkPersonExist } from "../../apis";
import {
  ConfirmationPersonPopup,
  ConfirmationAddressPopup,
} from "../customComponents/CustomComponents";
import { formatDateFunc } from "../../utils/utilFunc";
import {
  SearchableDropDown,
  SearchableCountry,
  SearchableState,
  SearchableAddressDropDown,
  SearchableRoleDropDown,
  SearchableCompanyDropDown,
  TextInputField,
} from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";

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

function AddPerson(props) {
  const { allCountries, postalList, roleList, refresh, companyList } = props;
  const dispatch = useDispatch();
  const [personDetails, setPersonDetails] = useState(initialData);
  const [tempPersonDetails, setTempPersonDetails] = useState(initialData);
  const [otherDetails, setOtherDetails] = useState({
    companyId: "",
    siteId: "",
  });
  const [sameAddress, setSameAddress] = useState(false);
  const [countries, setCountries] = useState([]);
  const [commStates, setCommStates] = useState([]);
  const [mailStates, setMailStates] = useState([]);
  const [boolVal, setBoolVal] = useState(false);
  const [date, setDate] = useState(false);
  const [fieldLength, setFieldLength] = useState({});
  const [requiredFields, setRequiredFields] = useState([]);
  const [warningMsg, setWarningMsg] = useState("");
  const [existingPerson, setExistingPerson] = useState([]);
  const [warningExist, setWarningExist] = useState(false);
  const [completeData, setCompleteData] = useState(null);
  const [tempSearchField, setTempSearchField] = useState(searchField);
  const [confirmAddress, setConfirmAddress] = useState(false);
  const [warningData, setWarningData] = useState([]);
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

    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.person?.fields?.forEach((f) => {
      if (f.mandatory) {
        arr.push(f.fieldName);
      }
    });

    setRequiredFields(arr);
  };

  useEffect(() => {
    const isChanged =
      JSON.stringify(tempPersonDetails) !== JSON.stringify(personDetails);
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [tempPersonDetails, personDetails]);

  useEffect(() => {
    const setCountriesAndStates = () => {
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
      setTempPersonDetails({
        ...tempPersonDetails,
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

    if (!boolVal) {
      fetchRequired();
      fetchFieldLength();
      setCountriesAndStates();
      const userDetails = JSON.parse(
        window.localStorage.getItem("userDetails")
      );
      setOtherDetails({
        ...otherDetails,
        companyId: userDetails?.organizationId,
        siteId: userDetails.siteId,
      });
      setBoolVal(true);
    }
  }, [boolVal]);

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
        const selectedCountry = allCountries.filter(
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
        const selectedCountry = allCountries.filter(
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
    try {
      const { data } = await createContact({
        requestId: uuidv1(),
        data: formData,
      });
      setPersonDetails(initialData);
      setCompleteData(null);
      props.close(true);
      refresh(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddNewPerson = async () => {
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
      companyId: otherDetails.companyId,
      siteId: otherDetails.siteId,
      person: personData,
    };
    try {
      const { data } = await checkPersonExist(personData);
      if (!data.success) {
        setWarningMsg(data.error.message);
        setExistingPerson(data.data.personList);
        setWarningExist(true);
        setCompleteData(formData);
      } else {
        handleCreatePerson(formData);
      }
    } catch (err) {
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
    const hasInalid = checkFields(personDetails, requiredFields);
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

          if (content?.length > 0) {
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
          if (content?.length > 0) {
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

    handleAddNewPerson();
  };

  const handleSelectSuburb = (fieldName, obj) => {
    const selectedCountry = allCountries.filter(
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
    <div className="">
      <form onSubmit={handleSubmit}>
        <div className="row mt-4">
          <div className="col-md-3">
            <SearchableRoleDropDown
              label="Role"
              valueKey="roleName"
              name="role"
              placeholder="Role"
              value={personDetails.role}
              selected={personDetails.role}
              fieldVal={personDetails.role ?? ""}
              setDetails={setPersonDetails}
              details={personDetails}
              optionArray={
                requiredFields.indexOf("role") >= 0
                  ? roleList
                  : [{ id: 0, roleName: "None" }, ...roleList]
              }
              invalid={
                submitted && requiredFields.indexOf("role") >= 0 ? true : false
              }
              invalidMessage="Please select a role"
              maxLength={fieldLength["role".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
            <SearchableDropDown
              label="Gender"
              labelId="gender-sample"
              name="gender"
              placeholder="Gender"
              value={personDetails.gender}
              setDetails={setPersonDetails}
              details={personDetails}
              fieldVal={personDetails.gender ?? ""}
              optionArray={["Male", "Female", "Other"]}
              invalid={
                submitted && requiredFields.indexOf("gender") >= 0
                  ? true
                  : false
              }
              invalidMessage="Please select gender"
              maxLength={fieldLength["gender".toLowerCase()]}
              required={requiredFields.indexOf("gender") >= 0}
            />
          </div>
          <div className="col-md-3">
            <SearchableDropDown
              label="Salutation"
              labelId="salutation-sample"
              name="salutation"
              placeholder="Salutation"
              value={personDetails.salutation}
              fieldVal={personDetails.salutation ?? ""}
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
              invalidMessage="Please select a salutation"
              required={requiredFields.indexOf("salutation") >= 0}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="First Name is required"
              maxLength={fieldLength["firstName".toLowerCase()]}
            />
          </div>
          <div className="mt-4" />
          <div className="col-md-3">
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
              invalidMessage="Middle Name is required"
              maxLength={fieldLength["middleName".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Last Name is required"
              maxLength={fieldLength["lastName".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Home Phone is required"
              maxLength={fieldLength["phoneNumber1".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Work Phone is required"
              maxLength={fieldLength["phoneNumber2".toLowerCase()]}
            />
          </div>
          <div className="mt-4" />
          <div className="col-md-3">
            <TextInputField
              label="Fax Number"
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
              invalidMessage="Please enter a valid fax number"
              maxLength={fieldLength["faxNumber".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Mobile Number"
              name="mobilePhoneNumber"
              placeholder="Mobile Number"
              state={personDetails.mobilePhoneNumber}
              onChange={handleFormChange}
              required={requiredFields.indexOf("mobilePhoneNumber") >= 0}
              invalid={
                submitted && requiredFields.indexOf("mobilePhoneNumber") >= 0
                  ? true
                  : false
              }
              invalidMessage="Please enter a valid mobile number"
              maxLength={fieldLength["mobilePhoneNumber".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid website"
              maxLength={fieldLength["website".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid email"
              maxLength={fieldLength["emailId1".toLowerCase()]}
            />
          </div>
          <div className="mt-4" />
          <div className="col-md-3">
            <SearchableCompanyDropDown
              label="Company"
              name="companyId"
              // type='number'
              placeholder="Company"
              value={personDetails.companyId}
              setDetails={setPersonDetails}
              details={personDetails}
              required={requiredFields.indexOf("companyId") >= 0}
              invalid={
                submitted && requiredFields.indexOf("companyId") >= 0
                  ? true
                  : false
              }
              invalidMessage="Please select a company"
              optionArray={
                requiredFields.indexOf("role") >= 0
                  ? companyList
                  : [{ contactId: 0, companyName: "None" }, ...companyList]
              }
              maxLength={fieldLength["companyId".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid email"
              maxLength={fieldLength["emailId2".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid place of birth"
              maxLength={fieldLength["placeOfBirth".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Date of Birth"
              type="date"
              // autoFocus='on'
              name="dateOfBirth"
              placeholder="Date of Birth"
              value={personDetails.dateOfBirth}
              onChange={handleFormChange}
              required={requiredFields.indexOf("dateOfBirth") >= 0}
              invalid={
                submitted && requiredFields.indexOf("dateOfBirth") >= 0
                  ? true
                  : false
              }
              invalidMessage="Please enter a valid date"
            />
          </div>
          <div className="mt-4" />
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid country"
              maxLength={fieldLength["countryOfBirth".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Please enter Nationality"
              maxLength={fieldLength["nationality".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Passport Number"
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
              invalidMessage="Please enter a valid passport number"
              maxLength={fieldLength["passportNumber".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid occupation"
              maxLength={fieldLength["occupation".toLowerCase()]}
            />
          </div>
          <div className="mt-4" />
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid comment"
              maxLength={fieldLength["personComments".toLowerCase()]}
            />
          </div>
          <div className="col-md-3" />
          <div className="col-md-3" />
          <div className="col-md-3" />
          <div className="mt-4" />
        </div>
        <div className="bg-light d-flex align-items-center px-3 py-2">
          <h5 className="mb-0">Street Address</h5>
        </div>
        <div className="row mt-4">
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid address"
              maxLength={fieldLength["commAddress1".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid address"
              maxLength={fieldLength["commAddress2".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid address"
              maxLength={fieldLength["commAddress3".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
            <SearchableAddressDropDown
              name="commCity"
              label="Suburb"
              placeholder="Suburb"
              selected={`${tempSearchField.commCity}${tempSearchField.commPostCode}`}
              fieldVal={personDetails.commCity ?? ""}
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              optionArray={postalList}
              required={requiredFields.indexOf("commCity") >= 0}
              invalid={
                submitted &&
                requiredFields.indexOf("commCity".toLowerCase()) >= 0
                  ? true
                  : false
              }
              invalidMessage="Please select a suburb"
              handleSelectSuburb={handleSelectSuburb}
              maxLength={fieldLength["commCity".toLowerCase()]}
            />
          </div>
          <div className="mt-4" />
          <div className="col-md-3">
            <SearchableState
              name="commState"
              label="State"
              placeholder="State"
              selected={tempSearchField.commState}
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              handleSelectCountryAndState={handleChangeCountryAndState}
              fieldVal={personDetails.commState ?? ""}
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
              invalidMessage="Please select a state"
              maxLength={fieldLength["commState".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Post Code"
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
              invalidMessage="Please enter a valid post code"
              maxLength={fieldLength["commPostCode".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
            <SearchableCountry
              name="commCountry"
              label="Country"
              selected={tempSearchField.commCountry}
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              fieldVal={personDetails.commCountry ?? ""}
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
              invalidMessage="Please select a country"
              maxLength={fieldLength["commCountry".toLowerCase()]}
            />
          </div>
          <div className="col-md-3" />
          <div className="mb-4" />
        </div>
        <div className="bg-light d-flex align-items-center justify-content-between px-3 py-3 my-2">
          <h5 className="mb-0">Postal Address</h5>
          <div className="d-flex align-items-center justify-content-center">
            <Input
              className="mx-2"
              type="checkbox"
              onClick={handleMailingAddress}
            />
            <label className="mb-0">Same as Street Address</label>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid address"
              maxLength={fieldLength["mailingAddress1".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid address"
              maxLength={fieldLength["mailingAddress2".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
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
              invalidMessage="Please enter a valid address"
              maxLength={fieldLength["mailingAddress3".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
            <SearchableAddressDropDown
              name="mailingCity"
              label="Suburb"
              placeholder="Suburb"
              selected={`${tempSearchField.mailingCity}${tempSearchField.mailingPostCode}`}
              fieldVal={personDetails.mailingCity ?? ""}
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              optionArray={postalList}
              details={personDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              required={requiredFields.indexOf("mailingCity") >= 0}
              invalid={
                submitted &&
                requiredFields.indexOf("mailingCity".toLowerCase()) >= 0
                  ? true
                  : false
              }
              invalidMessage="Please select a suburb"
              handleSelectSuburb={handleSelectSuburb}
              maxLength={fieldLength["mailingCity".toLowerCase()]}
            />
          </div>
          <div className="mt-4" />
          <div className="col-md-3">
            <SearchableState
              name="mailingState"
              label="State"
              placeholder="State"
              selected={tempSearchField.mailingState}
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              details={personDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              handleSelectCountryAndState={handleChangeMailCountryAndState}
              fieldVal={personDetails.mailingState ?? ""}
              // optionArray={mailStates}
              optionArray={
                requiredFields.indexOf("mailingState") >= 0
                  ? mailStates
                  : [{ id: "NONE", stateName: "None" }, ...mailStates]
              }
              // disabled={true}
              // value={personDetails.mailingState}
              // onChange={handleFormChange}
              required={requiredFields.indexOf("mailingState") >= 0}
              invalid={
                submitted && requiredFields.indexOf("mailingState") >= 0
                  ? true
                  : false
              }
              invalidMessage="Please select a state"
              maxLength={fieldLength["mailingState".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
            <TextInputField
              label="Post Code"
              name="mailingPostCode"
              placeholder="Post Code"
              value={personDetails.mailingPostCode}
              disabled={sameAddress}
              onChange={handleFormChange}
              required={requiredFields.indexOf("mailingPostCode") >= 0}
              invalid={
                submitted && requiredFields.indexOf("mailingPostCode") >= 0
                  ? true
                  : false
              }
              invalidMessage="Please enter a valid post code"
              maxLength={fieldLength["mailingPostCode".toLowerCase()]}
            />
          </div>
          <div className="col-md-3">
            <SearchableCountry
              name="mailingCountry"
              label="Country"
              placeholder="Country"
              selected={tempSearchField.mailingCountry}
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              details={personDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              handleSelectCountryAndState={handleChangeMailCountryAndState}
              fieldVal={personDetails.mailingCountry ?? ""}
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
              invalidMessage="Please select a country"
              maxLength={fieldLength["mailingCountry".toLowerCase()]}
            />
          </div>
          <div className="col-md-3" />
          <div className="mb-4" />
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
          <Button color="success" type="submit" className="mx-1">
            Add
          </Button>
        </div>
      </form>
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
              setData={handleAddNewPerson}
              warningData={warningData}
            />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

export default AddPerson;
