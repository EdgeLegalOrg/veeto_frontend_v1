import React, { useState, useEffect, Fragment } from "react";
import "../../../stylesheets/contacts.css";
import {
  ConfirmationPersonPopup,
  ConfirmationAddressPopup,
  CustomToastWindow,
  AlertPopup,
} from "../../customComponents/CustomComponents";
import { editStaffDetails } from "../../../apis";
import { toast } from "react-toastify";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { formatDateFunc } from "../../../utils/utilFunc";
import { TextInputField, SearchableDropDown } from "../../InputField";

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

function UpdateStaffDetails(props) {
  const { allCountries, postalList, refresh, memberDetails } = props;
  const [staffDetails, setStaffDetails] = useState(memberDetails);
  const [otherDetails, setOtherDetails] = useState({
    // companyId: '',
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchFieldLength = () => {
    let allLengths = {};

    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.staff_member?.fields?.map((f) => {
      allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
    });
    setFieldLength(allLengths);
  };

  const fetchRequired = () => {
    let arr = [];

    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.staff_member?.fields?.map((f) => {
      if (f.mandatory) {
        arr.push(f.fieldName);
      }
    });
    setRequiredFields(arr);
  };

  useEffect(async () => {
    const setCountriesAndStates = () => {
      setCountries(allCountries);
      setCommStates(allCountries[0].states);
      setMailStates(allCountries[0].states);
      setStaffDetails(memberDetails);
      setTempSearchField(memberDetails);
      setTempSearchField({
        commCity: memberDetails.commCity,
        commState: memberDetails.commState,
        commPostCode: memberDetails.commPostCode,
        commCountry: memberDetails.commCountry,
        mailingCity: memberDetails.mailingCity,
        mailingState: memberDetails.mailingState,
        mailingPostCode: memberDetails.mailingPostCode,
        mailingCountry: memberDetails.mailingCountry,
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
        // companyId: userDetails?.organizationId,
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
    setStaffDetails({ ...staffDetails, [name]: e.target.value });
  };

  const handleChangeUpdate = (propName, val) => {
    setStaffDetails({ ...staffDetails, [propName]: val });
  };

  const handleChangeCountryAndState = (fieldName, val) => {
    if (val === null || val === "None") {
      setStaffDetails({
        ...staffDetails,
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
        setStaffDetails({
          ...staffDetails,
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
        setStaffDetails({
          ...staffDetails,
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
      setStaffDetails({
        ...staffDetails,
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
        setStaffDetails({
          ...staffDetails,
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
        setStaffDetails({
          ...staffDetails,
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
      setStaffDetails({
        ...staffDetails,
        mailingAddress1: staffDetails.commAddress1,
        mailingAddress2: staffDetails.commAddress2,
        mailingAddress3: staffDetails.commAddress3,
        mailingCity: tempSearchField.commCity,
        mailingState: tempSearchField.commState,
        mailingPostCode: tempSearchField.commPostCode,
        mailingCountry: tempSearchField.commCountry,
      });
      setTempSearchField({
        ...tempSearchField,
        mailingAddress1: staffDetails.commAddress1,
        mailingAddress2: staffDetails.commAddress2,
        mailingAddress3: staffDetails.commAddress3,
        mailingCity: tempSearchField.commCity,
        mailingState: tempSearchField.commState,
        mailingPostCode: tempSearchField.commPostCode,
        mailingCountry: tempSearchField.commCountry,
      });
    }
    if (sameAddress === true) {
      setSameAddress(false);
      setStaffDetails({
        ...staffDetails,
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

  const handleUpdateStaff = async (formData) => {
    try {
      setDisabled(true);
      const { data } = await editStaffDetails(formData);
      if (data.success) {
        refresh(formData.id);
      } else {
        setShowAlert(true);
        setAlertMsg(
          data?.error?.message
            ? data.error.message
            : "Something went wrong please try later."
        );
      }
      setStaffDetails(initialData);
      setCompleteData(null);
      props.close();
      setDisabled(false);
    } catch (error) {
      setDisabled(false);
      console.error(error);
    }
  };

  const handleUpdateHelper = async () => {
    const keys = Object.keys(staffDetails);
    let staffData = {};
    keys.forEach((key) => {
      if (
        staffDetails[key] === "" ||
        (staffDetails[key] && staffDetails[key] === "None") ||
        staffDetails[key === "NONE"]
      ) {
        staffData = { ...staffData, [key]: null };
      } else {
        staffData = { ...staffData, [key]: staffDetails[key] };
      }
    });

    let allFilled = true;

    let needToFill = [];

    keys.forEach((k) => {
      if (requiredFields.includes(k) && !staffDetails[k]) {
        needToFill.push(k);
        allFilled = false;
      }
    });

    if (!allFilled) {
      setSubmitted(true);
      // toast.warning(
      //   `Please fill required fields. i.e. ${needToFill.join(", ")}`
      // );
      return;
    }

    var formData = {
      siteId: otherDetails.siteId,
      ...staffData,
    };
    handleUpdateStaff(formData);
  };

  const handleSubmit = async () => {
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

    handleUpdateHelper();
  };

  const handleSelectSuburb = (fieldName, obj) => {
    const selectedCountry = allCountries.filter(
      (country) => country.countryName === obj.country
    );

    setCommStates(selectedCountry[0].states);
    setMailStates(selectedCountry[0].states);

    if (fieldName === "commCity") {
      setStaffDetails({
        ...staffDetails,
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
      setStaffDetails({
        ...staffDetails,
        mailingPostCode: obj.postCode,
        mailingCity: obj.locality,
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
      <CustomToastWindow
        closeForm={props.close}
        btn1={"Cancel"}
        btn2="Update"
        heading="Update Staff Details"
        handleFunc={handleSubmit}
        autoClose={false}
      >
        <div>
          <div className="inputtDiv">
            {/* <SearchableDropDown
              label='Gender'
              labelId='gender-sample'
              name='gender'
              value={staffDetails.gender ? staffDetails.gender : ''}
              setDetails={setStaffDetails}
              details={staffDetails}
              fieldVal={staffDetails.gender ? staffDetails.gender : ''}
              selected={staffDetails.gender ? staffDetails.gender : ''}
              update={true}
              handleUpdate={handleChangeUpdate}
              optionArray={['Male', 'Female', 'Other']}
              required={requiredFields.indexOf('gender') >= 0 ? true : false}
              maxLength={fieldLength['gender'.toLowerCase()]}
            /> */}
            <SearchableDropDown
              label="Salutation"
              labelId="salutation-sample"
              name="salutation"
              value={staffDetails.salutation ? staffDetails.salutation : ""}
              fieldVal={staffDetails.salutation ? staffDetails.salutation : ""}
              selected={staffDetails.salutation ? staffDetails.salutation : ""}
              update={true}
              handleUpdate={handleChangeUpdate}
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
              setDetails={setStaffDetails}
              details={staffDetails}
              maxLength={fieldLength["salutation".toLowerCase()]}
              required={
                requiredFields.indexOf("salutation") >= 0 ? true : false
              }
            />
            <TextInputField
              name="firstName"
              label="First Name"
              value={staffDetails.firstName}
              onChange={handleFormChange}
              required={requiredFields.indexOf("firstName") >= 0 ? true : false}
              maxLength={fieldLength["firstName".toLowerCase()]}
            />
            <TextInputField
              name="middleName"
              label="Middle Name"
              value={staffDetails.middleName}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf("middleName") >= 0 ? true : false
              }
              maxLength={fieldLength["middleName".toLowerCase()]}
            />
            <TextInputField
              name="lastName"
              label="Last Name"
              value={staffDetails.lastName}
              onChange={handleFormChange}
              required={requiredFields.indexOf("lastName") >= 0 ? true : false}
              maxLength={fieldLength["lastName".toLowerCase()]}
            />
            <TextInputField
              name="phoneNumber1"
              label="Home Phone"
              value={staffDetails.phoneNumber1}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf("phoneNumber1") >= 0 ? true : false
              }
              maxLength={fieldLength["phoneNumber1".toLowerCase()]}
            />
            <TextInputField
              name="phoneNumber2"
              label="Work Phone"
              value={staffDetails.phoneNumber2}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf("phoneNumber2") >= 0 ? true : false
              }
              maxLength={fieldLength["phoneNumber2".toLowerCase()]}
            />
            {/* <TextInputField
              name='faxNumber'
              label='Fax'
              value={staffDetails.faxNumber}
              onChange={handleFormChange}
              required={requiredFields.indexOf('faxNumber') >= 0 ? true : false}
              maxLength={fieldLength['faxNumber'.toLowerCase()]}
            /> */}
            <TextInputField
              name="mobilePhoneNumber"
              label="Mobile Number"
              value={staffDetails.mobilePhoneNumber}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf("mobilePhoneNumber") >= 0 ? true : false
              }
              maxLength={fieldLength["mobilePhoneNumber".toLowerCase()]}
            />
            {/* <TextInputField
              name='website'
              label='Website'
              value={staffDetails.website}
              onChange={handleFormChange}
              required={requiredFields.indexOf('website') >= 0 ? true : false}
              maxLength={fieldLength['website'.toLowerCase()]}
            /> */}
            <TextInputField
              name="emailId1"
              label="Email 1"
              value={staffDetails.emailId1}
              onChange={handleFormChange}
              required={requiredFields.indexOf("emailId1") >= 0 ? true : false}
              maxLength={fieldLength["emailId1".toLowerCase()]}
            />
            {/* <TextInputField
              name='emailId2'
              label='Email 2'
              value={staffDetails.emailId2}
              onChange={handleFormChange}
              required={requiredFields.indexOf('emailId2') >= 0 ? true : false}
              maxLength={fieldLength['emailId2'.toLowerCase()]}
            /> */}
            {/* <TextInputField
              name='placeOfBirth'
              label='Place of Birth'
              value={staffDetails.placeOfBirth}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('placeOfBirth') >= 0 ? true : false
              }
              maxLength={fieldLength['placeOfBirth'.toLowerCase()]}
            /> */}
            <TextInputField
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              value={staffDetails.dateOfBirth}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf("dateOfBirth") >= 0 ? true : false
              }
              // maxLength={fieldLength['dateOfBirth'.toLowerCase()]}
            />
            {/* <TextInputField
              name='countryOfBirth'
              label='Country of Birth'
              value={staffDetails.countryOfBirth}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('countryOfBirth') >= 0 ? true : false
              }
              maxLength={fieldLength['countryOfBirth'.toLowerCase()]}
            />
            <TextInputField
              name='nationality'
              label='Nationality'
              value={staffDetails.nationality}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('nationality') >= 0 ? true : false
              }
              maxLength={fieldLength['nationality'.toLowerCase()]}
            /> */}
            {/* <TextInputField
              name='passportNumber'
              label='Passport No.'
              value={staffDetails.passportNumber}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('passportNumber') >= 0 ? true : false
              }
              maxLength={fieldLength['passportNumber'.toLowerCase()]}
            /> */}
            {/* <TextInputField
              name='occupation'
              label='Occupation'
              value={staffDetails.occupation}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('occupation') >= 0 ? true : false
              }
              maxLength={fieldLength['occupation'.toLowerCase()]}
            /> */}
            *
            <TextInputField
              name="practiceCertNumber"
              label="Practicing Certificate No."
              value={staffDetails.practiceCertNumber}
              onChange={handleFormChange}
            />
            <TextInputField
              name="comments"
              label="Comments"
              value={staffDetails.comments}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf("personComments") >= 0 ? true : false
              }
              maxLength={fieldLength["personComments".toLowerCase()]}
            />
          </div>
          {/* <div className='labelll'>
            <h3>Street Address</h3>
          </div>
          <div className='inputtDiv'>
            <TextInputField
              name='commAddress1'
              label='Address 1'
              value={staffDetails.commAddress1}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('commAddress1') >= 0 ? true : false
              }
              maxLength={fieldLength['commAddress1'.toLowerCase()]}
            />
            <TextInputField
              name='commAddress2'
              label='Address 2'
              value={staffDetails.commAddress2}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('commAddress2') >= 0 ? true : false
              }
              maxLength={fieldLength['commAddress2'.toLowerCase()]}
            />
            <TextInputField
              name='commAddress3'
              label='Address 3'
              value={staffDetails.commAddress3}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('commAddress3') >= 0 ? true : false
              }
              maxLength={fieldLength['commAddress3'.toLowerCase()]}
            />
            <SearchableAddressDropDown
              name='commCity'
              label='Suburb'
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              optionArray={postalList}
              fieldVal={staffDetails.commCity}
              selected={`${tempSearchField.commCity}${tempSearchField.commPostCode}`}
              required={
                requiredFields.indexOf('commCity'.toLowerCase()) >= 0
                  ? true
                  : false
              }
              handleSelectSuburb={handleSelectSuburb}
              maxLength={fieldLength['commCity'.toLowerCase()]}
            />
            <TextInputField
              type='text'
              name='commPostCode'
              label='Post Code'
              value={staffDetails.commPostCode}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('commPostCode') >= 0 ? true : false
              }
              maxLength={fieldLength['commPostCode'.toLowerCase()]}
            />

            <SearchableState
              name='commState'
              label='State'
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              handleSelectCountryAndState={handleChangeCountryAndState}
              fieldVal={staffDetails.commState ?? ''}
              selected={tempSearchField.commState}
              optionArray={
                requiredFields.indexOf('commState') >= 0
                  ? commStates
                  : [{ id: 'NONE', stateName: 'None' }, ...commStates]
              }
              required={requiredFields.indexOf('commState') >= 0 ? true : false}
              maxLength={fieldLength['commState'.toLowerCase()]}
            />
            <SearchableCountry
              name='commCountry'
              label='Country'
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              fieldVal={staffDetails.commCountry}
              selected={tempSearchField.commCountry}
              optionArray={
                requiredFields.indexOf('commCountry') >= 0
                  ? countries
                  : [{ id: 'NONE', countryName: 'None' }, ...countries]
              }
              handleSelectCountryAndState={handleChangeCountryAndState}
              required={
                requiredFields.indexOf('commCountry') >= 0 ? true : false
              }
              maxLength={fieldLength['commCountry'.toLowerCase()]}
            />
          </div>
          <div className='labelll'>
            <h3>Postal Address</h3>
            <input
              style={{
                marginLeft: '58%',
                marginRight: '5px',
                height: '15px',
                width: '15px',
              }}
              type='checkbox'
              onClick={handleMailingAddress}
            />
            <label>Same as Street Address</label>
          </div>
          <div className='inputtDiv'>
            <TextInputField
              name='mailingAddress1'
              label='Address 1'
              disabled={sameAddress}
              value={staffDetails.mailingAddress1}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('mailingAddress1') >= 0 ? true : false
              }
              maxLength={fieldLength['mailingAddress1'.toLowerCase()]}
            />
            <TextInputField
              name='mailingAddress2'
              label='Address 2'
              disabled={sameAddress}
              value={staffDetails.mailingAddress2}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('mailingAddress2') >= 0 ? true : false
              }
              maxLength={fieldLength['mailingAddress2'.toLowerCase()]}
            />
            <TextInputField
              name='mailingAddress3'
              label='Address 3'
              value={staffDetails.mailingAddress3}
              disabled={sameAddress}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('mailingAddress3') >= 0 ? true : false
              }
              maxLength={fieldLength['mailingAddress3'.toLowerCase()]}
            />
            <SearchableAddressDropDown
              name='mailingCity'
              label='Suburb'
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              optionArray={postalList}
              details={staffDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              fieldVal={staffDetails.mailingCity}
              selected={`${tempSearchField.mailingCity}${tempSearchField.mailingPostCode}`}
              required={
                requiredFields.indexOf('mailingCity'.toLowerCase()) >= 0
                  ? true
                  : false
              }
              handleSelectSuburb={handleSelectSuburb}
              maxLength={fieldLength['mailingCity'.toLowerCase()]}
            />

            <TextInputField
              name='mailingPostCode'
              label='Post Code'
              type='text'
              value={staffDetails.mailingPostCode ?? ''}
              disabled={sameAddress}
              onChange={handleFormChange}
              required={
                requiredFields.indexOf('mailingPostCode') >= 0 ? true : false
              }
              maxLength={fieldLength['mailingPostCode'.toLowerCase()]}
            />
            <SearchableState
              name='mailingState'
              label='State'
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              details={staffDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              handleSelectCountryAndState={handleChangeMailCountryAndState}
              fieldVal={staffDetails.mailingState}
              selected={tempSearchField.mailingState}
              optionArray={
                requiredFields.indexOf('mailingState') >= 0
                  ? mailStates
                  : [{ id: 'NONE', stateName: 'None' }, ...mailStates]
              }
              required={
                requiredFields.indexOf('mailingState') >= 0 ? true : false
              }
              maxLength={fieldLength['mailingState'.toLowerCase()]}
            />
            <SearchableCountry
              name='mailingCountry'
              label='Country'
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              details={staffDetails}
              disabled={sameAddress}
              sameaddress={sameAddress}
              handleSelectCountryAndState={handleChangeMailCountryAndState}
              fieldVal={staffDetails.mailingCountry}
              selected={tempSearchField.mailingCountry}
              // optionArray={mailStates}
              optionArray={
                requiredFields.indexOf('mailingCountry') >= 0
                  ? countries
                  : [{ id: 'NONE', countryName: 'None' }, ...countries]
              }
              required={
                requiredFields.indexOf('mailingCountry') >= 0 ? true : false
              }
              maxLength={fieldLength['mailingCountry'.toLowerCase()]}
            />
          </div> */}
        </div>
      </CustomToastWindow>
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
              createPerson={() => handleUpdateStaff(completeData)}
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
              setData={handleUpdateHelper}
              warningData={warningData}
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
              handleFunc={() => refresh(memberDetails.id)}
            />
          </ModalBody>
        </Modal>
      )}
    </Fragment>
  );
}

export default UpdateStaffDetails;
