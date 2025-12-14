import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import "../../stylesheets/contacts.css";
import { Input } from "reactstrap";
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
  role: "",
  subType: "",
  legalName: "",
  name: "",
  title: "",
  phoneNumber1: "",
  phoneNumber2: "",
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

function EditOrgDetails(props) {
  const {
    contactDetails,
    allCountries,
    setUpdatedData,
    updatedData,
    postalList,
    personList,
    roleList,
    tempSearchField,
    setTempSearchField,
    isLoading,
    disabled,
  } = props;
  const dispatch = useDispatch();
  const [organizationDetails, setOrganizationDetails] = useState(initialData);
  const [tempOrganizationDetails, setTempOrganizationDetails] =
    useState(initialData);
  const [sameAddress, setSameAddress] = useState(false);
  const [countries, setCountries] = useState(allCountries);
  const [commStates, setCommStates] = useState([]);
  const [mailStates, setMailStates] = useState([]);
  const [otherDetails, setOtherDetails] = useState({
    companyId: "",
    siteId: "",
  });

  const [boolVal, setBoolVal] = useState(false);
  const [requiredFields, setRequiredFields] = useState([]);
  const [fieldLength, setFieldLength] = useState({});
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

  const setEarlyStates = () => {
    setOrganizationDetails(contactDetails);
    setTempOrganizationDetails(contactDetails);
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
  };

  useEffect(() => {
    setEarlyStates();
    fetchRequired();
    fetchFieldLength();
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
        organisation: {
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
    setOrganizationDetails({ ...organizationDetails, [name]: e.target.value });
    setUpdatedData({
      ...updatedData,
      organisation: {
        ...updatedData.organisation,
        [name]: e.target.value,
      },
    });
  };

  const handleChangeUpdate = (propName, val) => {
    setUpdatedData({
      ...updatedData,
      organisation: {
        ...updatedData.organisation,
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
      setUpdatedData({
        ...updatedData,
        organisation: {
          ...updatedData.organisation,
          commCity: obj.locality,
          commPostCode: obj.postCode,
          commCountry: obj.country,
          commState: obj.state,
        },
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
      setUpdatedData({
        ...updatedData,
        organisation: {
          ...updatedData.organisation,
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
      setOrganizationDetails({
        ...organizationDetails,
        commState: val,
        commCountry: val,
      });
      setTempSearchField({
        ...tempSearchField,
        commCountry: val,
        commState: val,
      });
      setUpdatedData({
        ...updatedData,
        organisation: {
          ...updatedData.organisation,
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
        setUpdatedData({
          ...updatedData,
          organisation: {
            ...updatedData.organisation,
            commCountry: selectedCountry[0].countryName,
            // commState: selectedCountry[0].states[0].stateName,
          },
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
        setUpdatedData({
          ...updatedData,
          organisation: {
            ...updatedData.organisation,
            commState: val,
          },
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
      setUpdatedData({
        ...updatedData,
        organisation: {
          ...updatedData.organisation,
          mailingCountry: null,
          mailingState: null,
        },
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
        setUpdatedData({
          ...updatedData,
          organisation: {
            ...updatedData.organisation,
            mailingCountry: selectedCountry[0].countryName,
            // mailingState: selectedCountry[0].states[0].stateName,
          },
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
        setUpdatedData({
          ...updatedData,
          organisation: {
            ...updatedData.organisation,
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
      setUpdatedData({
        ...updatedData,
        organisation: {
          ...updatedData.organisation,
          mailingAddress1: organizationDetails.commAddress1,
          mailingAddress2: organizationDetails.commAddress2,
          mailingAddress3: organizationDetails.commAddress3,
          mailingCity: tempSearchField.commCity,
          mailingState: tempSearchField.commState,
          mailingPostCode: tempSearchField.commPostCode,
          mailingCountry: tempSearchField.commCountry,
        },
      });
    }
    if (sameAddress === true) {
      setSameAddress(false);
      setOrganizationDetails({
        ...organizationDetails,
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
        organisation: {
          ...updatedData.organisation,
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

  const findPersonName = (id) => {
    const person = personList.find((p) => p.contactId === id);
    return person ? `${person.firstName} ${person.lastName}` : "";
  };

  return (
    <div className="">
      <div className="mx-2">
        <div>
          <p className="my-3 mx-3">
            Organisation Type {requiredFields.indexOf("role") >= 0 ? "*" : ""}
          </p>
          <div className="d-flex align-items-center my-3 mx-3">
            <div className="d-flex align-items-center">
              <Input
                type="radio"
                name="role"
                value="Bussiness/Partnership"
                onChange={handleFormChange}
                checked={organizationDetails.role === "Bussiness/Partnership"}
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
              />
              <span className="mx-2">Trust</span>
            </div>
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-md-3">
            <TextInputField
              label="Legal Name"
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
              invalidMessage={"Legal Name is required"}
              maxLength={fieldLength["legalName".toLowerCase()]}
              disabled={disabled}
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
              setDetails={(data) => {
                setOrganizationDetails(data);
                setUpdatedData({
                  ...updatedData,
                  organisation: data,
                });
              }}
              details={organizationDetails}
              optionArray={
                requiredFields.indexOf("role") >= 0
                  ? roleList
                  : [{ id: "NONE", roleName: "None" }, ...roleList]
              }
              required={requiredFields.indexOf("subType") >= 0}
              invalid={
                submitted && requiredFields.indexOf("subType") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Role is required"}
              maxLength={fieldLength["subType".toLowerCase()]}
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
            />
          </div>

          <div className="col-md-3">
            <SearchableRepresentativeDropDown
              name="representativeId"
              label="Representative"
              placeholder="Representative"
              selected={organizationDetails.representativeId}
              setOrganizationDetails={(data) => {
                setOrganizationDetails(data);
                setUpdatedData({
                  ...updatedData,
                  organisation: data,
                });
              }}
              organizationDetails={organizationDetails}
              optionArray={personList}
              required={requiredFields.indexOf("representativeId") >= 0}
              invalid={
                submitted && requiredFields.indexOf("representativeId") >= 0
                  ? true
                  : false
              }
              fieldVal={findPersonName(organizationDetails.representativeId)}
              invalidMessage={"Representative is required"}
              maxLength={fieldLength["representativeId".toLowerCase()]}
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
            />
          </div>
          <div className="col-md-3" />
          <div className="col-md-3" />
          <div className="col-md-3" />
        </div>
        <div
          className="bg-light d-flex align-items-center px-3 py-2 my-2"
          style={{ width: "100%" }}
        >
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
            />
          </div>
          <div className="col-md-3" />
        </div>
        <div
          className="bg-light d-flex align-items-center justify-content-between px-3 py-3 my-2"
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
              disabled={sameAddress || disabled}
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
              disabled={sameAddress || disabled}
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
              disabled={sameAddress || disabled}
            />
          </div>
          <div className="col-md-3">
            <SearchableAddressDropDown
              name="mailingCity"
              label="Suburb"
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
              disabled={sameAddress || disabled}
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
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              details={organizationDetails}
              disabled={sameAddress || disabled}
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
              disabled={sameAddress || disabled}
            />
          </div>
          <div className="col-md-3">
            <SearchableCountry
              name="mailingCountry"
              label="Country"
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              details={organizationDetails}
              disabled={sameAddress || disabled}
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
      </div>
    </div>
  );
}

export default EditOrgDetails;
