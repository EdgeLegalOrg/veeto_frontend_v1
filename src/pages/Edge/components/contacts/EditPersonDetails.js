import React, { useState, useEffect } from "react";
import { formatDateFunc } from "../../utils/utilFunc";
import { useDispatch } from "react-redux";
import "../../stylesheets/contacts.css";
import { Input } from "reactstrap";
import {
  TextInputField,
  SelectInputField,
  SearchableDropDown,
  SearchableCountry,
  SearchableState,
  SearchableAddressDropDown,
  SearchableRoleDropDown,
  SearchableCompanyDropDown,
} from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";

const initialData = {
  role: "",
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

// const searchField = {
//   commCity: '',
//   commState: '',
//   commPostCode: '',
//   commCountry: '',
//   mailingCity: '',
//   mailingState: '',
//   mailingPostCode: '',
//   mailingCountry: '',
// };

function EditPersonDetails(props) {
  const {
    contactDetails,
    allCountries,
    setUpdatedData,
    updatedData,
    companyList,
    roles,
    postalList,
    tempSearchField,
    setTempSearchField,
    isLoading,
    submitted,
    disabled,
  } = props;
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
  // const [tempSearchField, setTempSearchField] = useState(searchField);
  const [fieldLength, setFieldLength] = useState({});
  const [requiredFields, setRequiredFields] = useState([]);

  useEffect(() => {
    const isChanged =
      JSON.stringify(tempPersonDetails) !== JSON.stringify(personDetails);
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [tempPersonDetails, personDetails]);

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

  const fetchFieldLength = () => {
    let allLengths = {};

    JSON.parse(window.localStorage.getItem("metaData"))?.person?.fields?.map(
      (f) => {
        allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
      }
    );
    setFieldLength(allLengths);
  };

  const setEarlyStates = () => {
    setPersonDetails(contactDetails);
    setTempPersonDetails(contactDetails);
    setCountries(allCountries);

    setTempSearchField({
      ...tempSearchField,
      commCity: contactDetails.commCity,
      commCountry: contactDetails.commCountry,
      commState: contactDetails.commState,
      commPostCode: contactDetails.commPostCode,
      mailingCity: contactDetails.mailingCity,
      mailingCountry: contactDetails.mailingCountry,
      mailingState: contactDetails.mailingState,
      mailingPostCode: contactDetails.mailingPostCode,
    });

    let countryArray = allCountries.filter(
      (country) => country.countryName === contactDetails.commCountry
    );
    let mailCountry = allCountries.filter(
      (country) => country.countryName === contactDetails.mailingCountry
    );

    setCommStates(countryArray?.length > 0 ? countryArray[0].states : []);

    setMailStates(mailCountry?.length > 0 ? mailCountry[0].states : []);
    // setPersonDetails({...personDetails, commCountry: contactDetails.commCountry, comm})
  };

  useEffect(() => {
    setEarlyStates();
    fetchFieldLength();
    fetchRequired();
    if (!boolVal && !isLoading) {
      const userDetails = JSON.parse(
        window.localStorage.getItem("userDetails")
      );

      setOtherDetails({
        ...otherDetails,
        companyId: userDetails?.organizationId,
        siteId: userDetails?.siteId ? userDetails?.siteId : 1, // this will change later
      });
      setUpdatedData({
        ...updatedData,
        companyId: userDetails?.organizationId,
        siteId: userDetails?.siteId ? userDetails?.siteId : 1,
        person: {
          ...contactDetails,
        },
      });

      setBoolVal(true);
    }
  }, [boolVal, isLoading]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    if (name === "mailingPostCode" || name === "commPostCode") {
      setTempSearchField({ ...tempSearchField, [name]: e.target.value });
    }
    setPersonDetails({ ...personDetails, [name]: e.target.value });
    setUpdatedData({
      ...updatedData,
      person: {
        ...updatedData.person,
        [name]: e.target.value,
      },
    });
  };

  const handleChangeUpdate = (propName, val) => {
    setUpdatedData({
      ...updatedData,
      person: {
        ...updatedData.person,
        [propName]: val,
      },
    });
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
      setUpdatedData({
        ...updatedData,
        person: {
          ...updatedData.person,
          commCity: obj.locality,
          commPostCode: obj.postCode,
          commCountry: obj.country,
          commState: obj.state,
        },
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
      setUpdatedData({
        ...updatedData,
        person: {
          ...updatedData.person,
          mailingCity: obj.locality,
          mailingPostCode: obj.postCode,
          mailingCountry: obj.country,
          mailingState: obj.state,
        },
      });
    }
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
      setUpdatedData({
        ...updatedData,
        person: {
          ...updatedData.person,
          commCountry: null,
          commState: null,
        },
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
        setUpdatedData({
          ...updatedData,
          person: {
            ...updatedData.person,
            commCountry: selectedCountry[0].countryName,
            // commState: selectedCountry[0].states[0].stateName,
          },
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
        setUpdatedData({
          ...updatedData,
          person: {
            ...updatedData.person,
            commState: val,
          },
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
      setUpdatedData({
        ...updatedData,
        person: {
          ...updatedData.person,
          mailingCountry: null,
          mailingState: null,
        },
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
        setUpdatedData({
          ...updatedData,
          person: {
            ...updatedData.person,
            mailingCountry: selectedCountry[0].countryName,
            // mailingState: selectedCountry[0].states[0].stateName,
          },
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
        setUpdatedData({
          ...updatedData,
          person: {
            ...updatedData.person,
            mailingState: val,
          },
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
      setUpdatedData({
        ...updatedData,
        person: {
          ...updatedData.person,
          mailingAddress1: personDetails.commAddress1,
          mailingAddress2: personDetails.commAddress2,
          mailingAddress3: personDetails.commAddress3,
          mailingCity: tempSearchField.commCity,
          mailingState: tempSearchField.commState,
          mailingPostCode: tempSearchField.commPostCode,
          mailingCountry: tempSearchField.commCountry,
        },
      });
    }
    // if (sameAddress === true) {
    //   setSameAddress(false);
    //   setPersonDetails({
    //     ...personDetails,
    //     mailingAddress1: '',
    //     mailingAddress2: '',
    //     mailingAddress3: '',
    //     mailingCity: '',
    //     mailingState: '',
    //     mailingPostCode: '',
    //     mailingCountry: '',
    //   });
    //   setTempSearchField({
    //     ...tempSearchField,
    //     mailingAddress1: '',
    //     mailingAddress2: '',
    //     mailingAddress3: '',
    //     mailingCity: '',
    //     mailingState: '',
    //     mailingPostCode: '',
    //     mailingCountry: '',
    //   });
    //   setUpdatedData({
    //     ...updatedData,
    //     person: {
    //       ...updatedData.person,
    //       mailingAddress1: '',
    //       mailingAddress2: '',
    //       mailingAddress3: '',
    //       mailingCity: '',
    //       mailingState: '',
    //       mailingPostCode: '',
    //       mailingCountry: '',
    //     },
    //   });
    // }
    if (sameAddress === true) {
      setSameAddress(false);
      setPersonDetails({
        ...personDetails,
        mailingAddress1: contactDetails.mailingAddress1,
        mailingAddress2: contactDetails.mailingAddress2,
        mailingAddress3: contactDetails.mailingAddress3,
        mailingCity: contactDetails.mailingCity,
        mailingState: contactDetails.mailingState,
        mailingPostCode: contactDetails.mailingPostCode,
        mailingCountry: contactDetails.mailingCountry,
      });
      setTempSearchField({
        ...tempSearchField,
        mailingAddress1: contactDetails.commAddress1,
        mailingAddress2: contactDetails.commAddress2,
        mailingAddress3: contactDetails.commAddress3,
        mailingCity: contactDetails.commCity,
        mailingState: contactDetails.commState,
        mailingPostCode: contactDetails.commPostCode,
        mailingCountry: contactDetails.commCountry,
      });
      setUpdatedData({
        ...updatedData,
        person: {
          ...updatedData.person,
          mailingAddress1: contactDetails.mailingAddress1,
          mailingAddress2: contactDetails.mailingAddress2,
          mailingAddress3: contactDetails.mailingAddress3,
          mailingCity: contactDetails.mailingCity,
          mailingState: contactDetails.mailingState,
          mailingPostCode: contactDetails.mailingPostCode,
          mailingCountry: contactDetails.mailingCountry,
        },
      });
    }
  };

  const findCompanyName = (id) => {
    const company = companyList.filter((c) => c.contactId === id);
    const company_name = company?.length > 0 ? company[0].organisation : "";
    return company_name;
  };

  return (
    <div className="">
      <div className="row mt-3">
        <div className="col-md-3">
          <SearchableRoleDropDown
            label="Role"
            labelId="role-sample"
            name="role"
            placeholder="Role"
            selected={personDetails.role}
            fieldVal={personDetails.role ?? ""}
            optionArray={
              requiredFields.indexOf("role") >= 0
                ? roles
                : [{ id: 0, roleName: "None" }, ...roles]
            }
            value={personDetails.role ?? ""}
            setDetails={setPersonDetails}
            update={true}
            handleUpdate={handleChangeUpdate}
            details={personDetails}
            maxLength={fieldLength["role".toLowerCase()]}
            invalid={
              submitted && requiredFields.indexOf("role") >= 0 ? true : false
            }
            invalidMessage={"Role is required"}
            disabled={disabled}
          />
        </div>
        <div className="col-md-3">
          <SearchableDropDown
            label="Gender"
            labelId="gender-sample"
            name="gender"
            placeholder="Gender"
            value={personDetails.gender}
            fieldVal={personDetails.gender}
            setDetails={setPersonDetails}
            details={personDetails}
            update={true}
            handleUpdate={handleChangeUpdate}
            optionArray={["Male", "Female", "Other"]}
            invalid={
              submitted && requiredFields.indexOf("gender") >= 0 ? true : false
            }
            invalidMessage="Gender is required"
            maxLength={fieldLength["gender".toLowerCase()]}
            disabled={disabled}
          />
        </div>
        <div className="col-md-3">
          <SearchableDropDown
            label="Salutation"
            labelId="salutation-sample"
            name="salutation"
            placeholder="Salutation"
            value={personDetails.salutation}
            fieldVal={personDetails.salutation}
            setDetails={setPersonDetails}
            details={personDetails}
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
            invalid={
              submitted && requiredFields.indexOf("salutation") >= 0
                ? true
                : false
            }
            invalidMessage="Salutation is required"
            maxLength={fieldLength["salutation".toLowerCase()]}
            disabled={disabled}
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
            disabled={disabled}
          />
        </div>
      </div>
      <div className="row mt-2">
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
            disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
          />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-3">
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
            invalidMessage="Fax is required"
            maxLength={fieldLength["faxNumber".toLowerCase()]}
            disabled={disabled}
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
            invalidMessage="Mobile Number is required"
            maxLength={fieldLength["mobilePhoneNumber".toLowerCase()]}
            disabled={disabled}
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
              submitted && requiredFields.indexOf("website") >= 0 ? true : false
            }
            invalidMessage="Website is required"
            maxLength={fieldLength["website".toLowerCase()]}
            disabled={disabled}
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
            invalidMessage="Email 1 is required"
            maxLength={fieldLength["emailId1".toLowerCase()]}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-3">
          <SearchableCompanyDropDown
            label="Company"
            name="organisationId"
            placeholder="Company"
            value={personDetails.organisationId}
            setDetails={setPersonDetails}
            details={personDetails}
            update={true}
            handleUpdate={handleChangeUpdate}
            fieldVal={findCompanyName(personDetails.organisationId)}
            required={requiredFields.indexOf("organisationId") >= 0}
            invalid={
              submitted && requiredFields.indexOf("organisationId") >= 0
                ? true
                : false
            }
            invalidMessage="Company is required"
            optionArray={
              requiredFields.indexOf("role") >= 0
                ? companyList
                : [{ contactId: 0, firstName: "None" }, ...companyList]
            }
            maxLength={
              fieldLength["firstName".toLowerCase()] +
              fieldLength["lastName".toLowerCase()]
            }
            disabled={disabled}
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
            invalidMessage="Email 2 is required"
            maxLength={fieldLength["emailId2".toLowerCase()]}
            disabled={disabled}
          />
        </div>
        <div className="col-md-3">
          <TextInputField
            label="Place Of Birth"
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
            invalidMessage="Place of Birth is required"
            maxLength={fieldLength["placeOfBirth".toLowerCase()]}
            disabled={disabled}
          />
        </div>
        <div className="col-md-3">
          <TextInputField
            label="Date Of Birth"
            type="date"
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
            invalidMessage="Date of Birth is required"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-3">
          <TextInputField
            label="Country Of Birth"
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
            invalidMessage="Country of Birth is required"
            disabled={disabled}
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
            invalidMessage="National is required"
            maxLength={fieldLength["nationality".toLowerCase()]}
            disabled={disabled}
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
            invalidMessage="Passport Number is required"
            maxLength={fieldLength["passportNumber".toLowerCase()]}
            disabled={disabled}
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
            invalidMessage="Occupation is required"
            maxLength={fieldLength["occupation".toLowerCase()]}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="row mt-3">
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
            invalidMessage="Comments is required"
            maxLength={fieldLength["personComments".toLowerCase()]}
            disabled={disabled}
          />
        </div>
        <div className="col-md-3" />
        <div className="col-md-3" />
        <div className="col-md-3" />
      </div>
      <div
        className="bg-light d-flex align-items-center px-3 py-2 my-3"
        style={{ width: "100%" }}
      >
        <h5 className="mb-0">Street Address</h5>
      </div>
      <div className="row">
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
            invalidMessage="Address 1 is required"
            maxLength={fieldLength["commAddress1".toLowerCase()]}
            disabled={disabled}
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
            invalidMessage="Address 2 is required"
            maxLength={fieldLength["commAddress2".toLowerCase()]}
            disabled={disabled}
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
            invalidMessage="Address 3 is required"
            maxLength={fieldLength["commAddress3".toLowerCase()]}
            disabled={disabled}
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
              submitted && requiredFields.indexOf("commCity".toLowerCase()) >= 0
                ? true
                : false
            }
            invalidMessage="Suburb is required"
            handleSelectSuburb={handleSelectSuburb}
            maxLength={fieldLength["commCity".toLowerCase()]}
            disabled={disabled}
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
            invalidMessage="State is required"
            maxLength={fieldLength["commState".toLowerCase()]}
            disabled={disabled}
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
            invalidMessage="Post Code is required"
            maxLength={fieldLength["commPostCode".toLowerCase()]}
            disabled={disabled}
          />
        </div>
        <div className="col-md-3">
          <SearchableCountry
            label="Country"
            name="commCountry"
            placeholder="Country"
            setTempSearchField={setTempSearchField}
            tempSearchField={tempSearchField}
            selected={tempSearchField.commCountry}
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
            invalidMessage="Country is required"
            maxLength={fieldLength["commCountry".toLowerCase()]}
            disabled={disabled}
          />
        </div>
        <div className="col-md-3" />
      </div>
      <div
        className="bg-light d-flex align-items-center justify-content-between px-3 py-3 my-3"
        style={{ width: "100%" }}
      >
        <h5 className="mb-0">Postal Address</h5>
        <div className="d-flex align-items-center justify-content-center">
          <Input
            className="mx-2"
            onClick={handleMailingAddress}
            type="checkbox"
            disabled={disabled}
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
            value={personDetails.mailingAddress1}
            onChange={handleFormChange}
            required={requiredFields.indexOf("mailingAddress1") >= 0}
            invalid={
              submitted && requiredFields.indexOf("mailingAddress1") >= 0
                ? true
                : false
            }
            invalidMessage="Address 1 is required"
            maxLength={fieldLength["mailingAddress1".toLowerCase()]}
            disabled={sameAddress || disabled}
          />
        </div>
        <div className="col-md-3">
          <TextInputField
            label="Address 2"
            name="mailingAddress2"
            placeholder="Address 2"
            value={personDetails.mailingAddress2}
            onChange={handleFormChange}
            required={requiredFields.indexOf("mailingAddress2") >= 0}
            invalid={
              submitted && requiredFields.indexOf("mailingAddress2") >= 0
                ? true
                : false
            }
            invalidMessage="Address 2 is required"
            maxLength={fieldLength["mailingAddress2".toLowerCase()]}
            disabled={sameAddress || disabled}
          />
        </div>
        <div className="col-md-3">
          <TextInputField
            label="Address 3"
            name="mailingAddress3"
            placeholder="Address 3"
            value={personDetails.mailingAddress3}
            onChange={handleFormChange}
            required={requiredFields.indexOf("mailingAddress3") >= 0}
            invalid={
              submitted && requiredFields.indexOf("mailingAddress3") >= 0
                ? true
                : false
            }
            invalidMessage="Address 3 is required"
            maxLength={fieldLength["mailingAddress3".toLowerCase()]}
            disabled={sameAddress || disabled}
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
            disabled={sameAddress || disabled}
            sameaddress={sameAddress}
            required={requiredFields.indexOf("mailingCity") >= 0}
            invalid={
              submitted &&
              requiredFields.indexOf("mailingCity".toLowerCase()) >= 0
                ? true
                : false
            }
            invalidMessage="Suburb is required"
            maxLength={fieldLength["mailingCity".toLowerCase()]}
            handleSelectSuburb={handleSelectSuburb}
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
            details={personDetails}
            disabled={sameAddress || disabled}
            sameaddress={sameAddress}
            handleSelectCountryAndState={handleChangeMailCountryAndState}
            selected={tempSearchField.mailingState}
            fieldVal={personDetails.mailingState ?? ""}
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
            invalidMessage="State is required"
            maxLength={fieldLength["mailingState".toLowerCase()]}
          />
        </div>
        <div className="col-md-3">
          <TextInputField
            label="Post Code"
            name="mailingPostCode"
            placeholder="Post Code"
            value={personDetails.mailingPostCode}
            onChange={handleFormChange}
            required={requiredFields.indexOf("mailingPostCode") >= 0}
            invalid={
              submitted && requiredFields.indexOf("mailingPostCode") >= 0
                ? true
                : false
            }
            invalidMessage="Post Code is required"
            maxLength={fieldLength["mailingPostCode".toLowerCase()]}
            disabled={disabled}
          />
        </div>
        <div className="col-md-3">
          <SearchableCountry
            name="mailingCountry"
            label="Country"
            placeholder="Country"
            setTempSearchField={setTempSearchField}
            tempSearchField={tempSearchField}
            details={personDetails}
            disabled={sameAddress || disabled}
            sameaddress={sameAddress}
            handleSelectCountryAndState={handleChangeMailCountryAndState}
            selected={tempSearchField.mailingCountry}
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
            invalidMessage="Country is required"
            maxLength={fieldLength["mailingCountry".toLowerCase()]}
          />
        </div>
        <div className="col-md-3"></div>
      </div>
    </div>
  );
}

export default EditPersonDetails;
