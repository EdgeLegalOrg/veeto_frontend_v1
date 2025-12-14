import React, { useState, useEffect } from "react";
import "../../../stylesheets/contacts.css";
import {
  ConfirmationPersonPopup,
  ConfirmationAddressPopup,
} from "../../customComponents/CustomComponents";
import { addStaff } from "../../../apis";
import { Fragment } from "react";
import { toast } from "react-toastify";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import { convertSubstring } from "../../../utils/utilFunc";
import {
  TextInputField,
  SearchableDropDown,
} from "pages/Edge/components/InputField";

const initialData = {
  role: "",
  companyId: "",
  salutation: "",
  firstName: "",
  middleName: "",
  lastName: "",
  phoneNumber1: "",
  phoneNumber2: "",
  mobilePhoneNumber: "",
  emailId1: "",
  dateOfBirth: "",
  comments: "",
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

function AddNewStaff(props) {
  const { allCountries, postalList, refresh } = props;
  const [staffDetails, setStaffDetails] = useState(initialData);
  const [otherDetails, setOtherDetails] = useState({
    siteId: "",
  });
  const [countries, setCountries] = useState([]);
  const [commStates, setCommStates] = useState([]);
  const [mailStates, setMailStates] = useState([]);
  const [boolVal, setBoolVal] = useState(false);
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

  useEffect(() => {
    const setCountriesAndStates = () => {
      setCountries(allCountries);
      setCommStates(allCountries[0].states);
      setMailStates(allCountries[0].states);
      setStaffDetails({
        ...staffDetails,
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

  const handleCreateStaff = async (formData) => {
    try {
      const { data } = await addStaff(formData);
      setStaffDetails(initialData);
      setCompleteData(null);
      props.close();
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddStaff = async () => {
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
    handleCreateStaff(formData);
  };

  const handleSubmit = async () => {
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
            tempSearchField?.commCity !== ""
          ) {
            content.push(tempSearchField?.commCity);
          }
          if (
            !requiredFields.includes("commPostCode") &&
            tempSearchField?.commPostCode !== ""
          ) {
            content.push(tempSearchField?.commPostCode);
          }
          if (
            !requiredFields.includes("commState") &&
            tempSearchField?.commState !== ""
          ) {
            content.push(tempSearchField?.commState);
          }
          if (
            !requiredFields.includes("commCountry") &&
            tempSearchField?.commCountry !== ""
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
            tempSearchField?.mailingCity !== ""
          ) {
            content.push(tempSearchField?.mailingCity);
          }
          if (
            !requiredFields.includes("mailingPostCode") &&
            tempSearchField?.mailingPostCode !== ""
          ) {
            content.push(tempSearchField?.mailingPostCode);
          }
          if (
            !requiredFields.includes("mailingState") &&
            tempSearchField?.mailingState !== ""
          ) {
            content.push(tempSearchField?.mailingState);
          }
          if (
            !requiredFields.includes("mailingCountry") &&
            tempSearchField?.mailingCountry !== ""
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

    handleAddStaff();
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
        closeForm={props.close}
        btn1={"Cancel"}
        btn2="Add"
        heading="Add New Staff"
        handleFunc={handleSubmit}
        autoClose={false}
      > */}
      <div className="mb-4">
        <div className="row">
          <div className="col-md-4 mt-3">
            <SearchableDropDown
              label="Salutation"
              labelId="salutation-sample"
              name="salutation"
              placeholder="Salutation"
              value={staffDetails.salutation}
              selected={staffDetails.salutation}
              fieldVal={staffDetails.salutation ?? ""}
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
              invalid={
                submitted && requiredFields.indexOf("salutation") >= 0
                  ? true
                  : false
              }
              invalidMessage="Salutation is required"
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="First Name"
              name="firstName"
              placeholder="First Name"
              value={staffDetails.firstName}
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
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Middle Name"
              name="middleName"
              placeholder="Middle Name"
              value={staffDetails.middleName}
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
          </div>{" "}
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Last Name"
              name="lastName"
              placeholder="Last Name"
              value={staffDetails.lastName}
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
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Home Phone"
              name="phoneNumber1"
              placeholder="Home Phone"
              value={staffDetails.phoneNumber1}
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
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Work Phone"
              name="phoneNumber2"
              placeholder="Work Phone"
              value={staffDetails.phoneNumber2}
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
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Mobile Number"
              name="mobilePhoneNumber"
              placeholder="Mobile Number"
              state={staffDetails.mobilePhoneNumber}
              onChange={handleFormChange}
              required={requiredFields.indexOf("mobilePhoneNumber") >= 0}
              invalid={
                submitted && requiredFields.indexOf("mobilePhoneNumber") >= 0
                  ? true
                  : false
              }
              invalidMessage="Mobile Number is required"
              maxLength={fieldLength["mobilePhoneNumber".toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Email 1"
              name="emailId1"
              placeholder="Email 1"
              value={staffDetails.emailId1}
              onChange={handleFormChange}
              required={requiredFields.indexOf("emailId1") >= 0}
              invalid={
                submitted && requiredFields.indexOf("emailId1") >= 0
                  ? true
                  : false
              }
              invalidMessage="Email 1 is required"
              maxLength={fieldLength["emailId1".toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              placeholder="Date of Birth"
              value={convertSubstring(staffDetails.dateOfBirth)}
              onChange={handleFormChange}
              required={requiredFields.indexOf("dateOfBirth") >= 0}
              invalid={
                submitted && requiredFields.indexOf("dateOfBirth") >= 0
                  ? true
                  : false
              }
              invalidMessage="Date of Birth is required"
            />
          </div>
          <div className="col-md-12 mt-3">
            <TextInputField
              type="textarea"
              label="Comments"
              name="comments"
              placeholder="Comments"
              value={staffDetails.comments}
              onChange={handleFormChange}
              required={requiredFields.indexOf("comments") >= 0}
              invalid={
                submitted && requiredFields.indexOf("comments") >= 0
                  ? true
                  : false
              }
              invalidMessage="Comments is required"
              maxLength={fieldLength["comments".toLowerCase()]}
            />
          </div>
          <div className="col-md-8 mt-3"></div>
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button className="mx-1" color="danger" onClick={() => props.close()}>
          Cancel
        </Button>
        <Button className="mx-1" color="success" onClick={() => handleSubmit()}>
          Add
        </Button>
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
              createPerson={() => handleCreateStaff(completeData)}
            />
          </ModalBody>
        </Modal>
      )}
      {confirmAddress && (
        <Modal
          isOpen={showWarning}
          toggle={() => setShowWarning(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setShowWarning(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <ConfirmationAddressPopup
              closeForm={() => setConfirmAddress(false)}
              setData={handleAddStaff}
              warningData={warningData}
            />
          </ModalBody>
        </Modal>
      )}
    </Fragment>
  );
}

export default AddNewStaff;
