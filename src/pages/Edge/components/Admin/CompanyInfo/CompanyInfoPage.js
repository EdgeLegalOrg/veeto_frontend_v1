import React, { useState, useEffect, Fragment } from "react";
import {
  Container,
  Card,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import {
  ConfirmationAddressPopup,
  AlertPopup,
} from "../../customComponents/CustomComponents";
import LoadingPage from "../../../utils/LoadingPage";
import { API_BASE_URL, getCompanyInfo, updateCompanyInfo } from "../../../apis";
import "../../../stylesheets/CompanyInfoPage.css";
import CompanySites from "./CompanySites";
import { toast } from "react-toastify";
import {
  TextInputField,
  SearchableCountry,
  SearchableState,
  SearchableAddressDropDown,
} from "pages/Edge/components/InputField";
import { v1 as uuidv1 } from "uuid";

const initialData = {
  companyName: "",
  title: "",
  phoneNumber1: "",
  phoneNumber2: "",
  faxNumber: "",
  website: "",
  email1: "",
  email2: "",
  city: "",
  state: "",
  country: "",
  postCode: "",
  address1: "",
  address2: "",
  address3: "",
};

function CompanyInfoPage(props) {
  document.title = "Company Details | EdgeLegal";
  const [companyData, setCompanyData] = useState(initialData);
  const [tempSearchField, setTempSearchField] = useState(initialData);

  const [stateList, setStateList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [postalList, setPostalList] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]);
  const [fieldLength, setFieldLength] = useState([]);
  const [siteList, setSiteList] = useState([]);
  const [warningData, setWarningData] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [logoImg, setLogoImg] = useState({});
  const [editLogo, setEditLogo] = useState(false);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const { data } = await getCompanyInfo();
      if (data.success) {
        setSiteList(data.data.siteInfoList);
        setTempSearchField(data.data);
        setCompanyData(data.data);
      } else {
        toast.error("Something went wrong, please try later");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const fetchRequired = () => {
    let arr = [];
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.company_info?.fields?.map((f) => {
      if (f.mandatory) {
        arr.push(f.fieldName);
      }
    });
    setRequiredFields(arr);
  };

  const fetchFieldLength = () => {
    let allLengths = {};
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.company_info?.fields?.map((f) => {
      allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
    });
    setFieldLength(allLengths);
  };

  const setCountryAndState = () => {
    let allCountry = JSON.parse(window.localStorage.getItem("countryList"));

    let suburbList = JSON.parse(window.localStorage.getItem("postalList"));
    if (allCountry && allCountry?.length > 0) {
      setCountryList(allCountry);
      setStateList(allCountry?.[0]?.states);
    }

    if (suburbList && suburbList?.length > 0) {
      setPostalList(suburbList);
    }
  };

  useEffect(() => {
    fetchRequired();
    fetchFieldLength();
    setCountryAndState();
    fetchCompanyData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setCompanyData({ ...companyData, [name]: value });
    setTempSearchField({ ...tempSearchField, [name]: value });
  };

  const handleSelectSuburb = (fieldName, obj) => {
    setCompanyData({
      ...companyData,
      city: obj.locality,
      country: obj.country,
      state: obj.state,
      postCode: obj.postCode,
    });

    setTempSearchField({
      ...tempSearchField,
      city: obj.locality,
      country: obj.country,
      state: obj.state,
      postCode: obj.postCode,
    });

    const selectedCountry = countryList.filter(
      (country) => country.countryName === obj.country
    );
    setStateList(selectedCountry[0].states);
  };

  const handleChangeCountryAndState = (fieldName, val) => {
    if (val === null || val === "None") {
      setCompanyData({
        ...companyData,
        country: null,
        state: null,
      });
      setTempSearchField({
        ...tempSearchField,
        country: val,
        state: val,
      });
      setStateList([]);
    } else {
      if (fieldName === "country") {
        const selectedCountry = countryList.filter(
          (country) => country.countryName === val
        );
        setCompanyData({
          ...companyData,
          country: selectedCountry[0].countryName,
          state: selectedCountry[0].states[0].stateName,
        });
        setTempSearchField({
          ...tempSearchField,
          country: selectedCountry[0].countryName,
          state: selectedCountry[0].states[0].stateName,
        });
        setStateList(selectedCountry[0].states);
      }
      if (fieldName === "state") {
        setCompanyData({
          ...companyData,
          state: val,
        });
        setTempSearchField({
          ...tempSearchField,
          state: val,
        });
      }
    }
  };

  const handleCheckReq = () => {
    setLoading(true);
    let keys = Object.keys(companyData);

    let updatedData = {
      ...companyData,
      ...tempSearchField,
    };

    let allFilled = true;

    keys?.forEach((k) => {
      if (
        requiredFields.includes(k) &&
        (updatedData[k] === "" || updatedData[k] === null)
      ) {
        allFilled = false;
        return;
      }
    });

    if (allFilled) {
      let checkAddress = false;
      let existInList = true;

      postalList.forEach((info) => {
        if (
          (tempSearchField?.city !== ""
            ? info.locality?.toUpperCase() ===
              tempSearchField?.city?.toUpperCase()
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
          checkAddress = true;
        }
      });
      if (!checkAddress) {
        existInList = false;
        let content = [];

        if (tempSearchField?.city !== "") {
          content.push(tempSearchField?.city);
        }
        if (tempSearchField?.state !== "") {
          content.push(tempSearchField?.state);
        }
        if (tempSearchField?.country !== "") {
          content.push(tempSearchField?.country);
        }
        if (tempSearchField?.postCode !== "") {
          content.push(tempSearchField?.postCode);
        }
        if (content?.length > 0) {
          setWarningData(content);
        } else {
          existInList = true;
        }
      }

      if (!existInList) {
        setLoading(false);
        return setShowWarning(true);
      }
      handleSubmitEditForm();
    } else {
      setSubmitted(true);
      // toast.warning("Please fill all required fields");
    }
  };

  const handleSubmitEditForm = async () => {
    setLoading(true);

    let updatedData = { ...companyData, ...tempSearchField };

    const keys = Object.keys(updatedData);

    keys.forEach((key) => {
      if (updatedData[key] === "" || updatedData[key] === "None") {
        updatedData = { ...updatedData, [key]: null };
      }
    });

    const newData = { requestId: uuidv1(), data: updatedData };
    let newFormData = new FormData();

    newFormData.append("companyInfoDetails", JSON.stringify(newData));
    newFormData.append("companyLogo", logoImg?.file || null);

    try {
      const { data } = await updateCompanyInfo(newFormData);
      if (!data.success) {
        setShowAlert(true);
        setAlertMsg(data?.error?.message);
      }
      await fetchCompanyData();
    } catch (error) {
      console.error(error);
    } finally {
      setEditLogo(false);
      setLoading(false);
    }
  };

  const handleUploadFile = (e) => {
    e.preventDefault();
    let file = e.target.files[0];
    setLogoImg({
      ...logoImg,
      file: file,
      filename: file.name,
    });
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Company Details" pageTitle="Admin" />
          <Card>
            <div className="bg-light d-flex align-items-center justify-content-between p-2">
              <h5 className="mb-0">Company Details</h5>
              <Button color="success" onClick={handleCheckReq}>
                Save
              </Button>
            </div>
            <div>
              <div className="row">
                <div className="col-md-3 my-2">
                  <TextInputField
                    label="Name"
                    name="companyName"
                    placeholder="Name"
                    value={companyData.companyName}
                    onChange={handleFormChange}
                    required={requiredFields.indexOf("companyName") >= 0}
                    invalid={
                      submitted && requiredFields.indexOf("companyName") >= 0
                        ? true
                        : false
                    }
                    invalidMessage={"Company Name is required"}
                    maxLength={fieldLength["companyName".toLowerCase()]}
                  />
                  {/* <CustomTextInput
                name='title'
                label='Title'
                value={companyData.title}
                onChange={handleFormChange}
                required={requiredFields.indexOf('title') >= 0 ? true : false}
                maxLength={fieldLength['title'.toLowerCase()]}
              /> */}
                </div>
                <div className="col-md-3 my-2">
                  <TextInputField
                    label="Phone"
                    name="phoneNumber1"
                    placeholder="Phone"
                    value={companyData.phoneNumber1}
                    onChange={handleFormChange}
                    required={requiredFields.indexOf("phoneNumber1") >= 0}
                    invalid={
                      submitted && requiredFields.indexOf("phoneNumber1") >= 0
                        ? true
                        : false
                    }
                    invalidMessage={"Phone Number is required"}
                    maxLength={fieldLength["phoneNumber1".toLowerCase()]}
                  />
                  {/* <CustomTextInput
                name='phoneNumber2'
                label='Mobile'
                value={companyData.phoneNumber2}
                onChange={handleFormChange}
                required={
                  requiredFields.indexOf('phoneNumber2') >= 0 ? true : false
                }
                maxLength={fieldLength['phoneNumber2'.toLowerCase()]}
              /> */}
                  {/* <CustomTextInput
                name='faxNumber'
                label='Fax'
                value={companyData.faxNumber}
                onChange={handleFormChange}
                required={
                  requiredFields.indexOf('faxNumber') >= 0 ? true : false
                }
                maxLength={fieldLength['faxNumber'.toLowerCase()]}
              /> */}
                </div>
                <div className="col-md-3 my-2">
                  <TextInputField
                    label="Email"
                    name="email1"
                    placeholder="Email"
                    value={companyData.email1}
                    onChange={handleFormChange}
                    required={requiredFields.indexOf("email1") >= 0}
                    invalid={
                      submitted && requiredFields.indexOf("email1") >= 0
                        ? true
                        : false
                    }
                    invalidMessage={"Email is required"}
                    maxLength={fieldLength["email1".toLowerCase()]}
                  />
                </div>
                <div className="col-md-3 my-2">
                  <TextInputField
                    label="Website"
                    name="website"
                    placeholder="Website"
                    value={companyData.website}
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
                <div className="col-md-3 my-2">
                  <TextInputField
                    label="Address 1"
                    name="address1"
                    placeholder="Address 1"
                    value={companyData.address1}
                    onChange={handleFormChange}
                    required={requiredFields.indexOf("address1") >= 0}
                    invalid={
                      submitted && requiredFields.indexOf("address1") >= 0
                        ? true
                        : false
                    }
                    invalidMessage={"Address is required"}
                    maxLength={fieldLength["address1".toLowerCase()]}
                  />
                </div>
                <div className="col-md-3 my-2">
                  <TextInputField
                    label="Address 2"
                    name="address2"
                    placeholder="Address 2"
                    value={companyData.address2}
                    onChange={handleFormChange}
                    required={requiredFields.indexOf("address2") >= 0}
                    invalid={
                      submitted && requiredFields.indexOf("address2") >= 0
                        ? true
                        : false
                    }
                    invalidMessage={"Address is required"}
                    maxLength={fieldLength["address2".toLowerCase()]}
                  />
                </div>
                <div className="col-md-3 my-2">
                  <TextInputField
                    label="Address 3"
                    name="address3"
                    placeholder="Address 3"
                    value={companyData.address3}
                    onChange={handleFormChange}
                    required={requiredFields.indexOf("address3") >= 0}
                    invalid={
                      submitted && requiredFields.indexOf("address3") >= 0
                        ? true
                        : false
                    }
                    invalidMessage={"Address is required"}
                    maxLength={fieldLength["address3".toLowerCase()]}
                  />
                </div>
                <div className="col-md-3 my-2">
                  <SearchableAddressDropDown
                    name="city"
                    label="City"
                    placeholder="City"
                    fieldVal={
                      companyData.city === null ? "None" : companyData.city
                    }
                    selected={
                      companyData.city === null
                        ? "None"
                        : `${tempSearchField.city}${tempSearchField.postCode}`
                    }
                    setTempSearchField={setTempSearchField}
                    tempSearchField={tempSearchField}
                    optionArray={postalList}
                    handleSelectSuburb={handleSelectSuburb}
                    required={requiredFields.indexOf("city") >= 0}
                    invalid={
                      submitted && requiredFields.indexOf("city") >= 0
                        ? true
                        : false
                    }
                    invalidMessage={"City is required"}
                    maxLength={fieldLength["city".toLowerCase()]}
                  />
                </div>
                <div className="col-md-3 my-2">
                  <SearchableState
                    name="state"
                    label="State"
                    placeholder="State"
                    setTempSearchField={setTempSearchField}
                    tempSearchField={tempSearchField}
                    handleSelectCountryAndState={handleChangeCountryAndState}
                    fieldVal={
                      companyData.state === null ? "None" : companyData.state
                    }
                    selected={
                      tempSearchField.state === null
                        ? "None"
                        : tempSearchField.state
                    }
                    // optionArray={
                    //   requiredFields.indexOf('commState') >= 0
                    //     ? commStates
                    //     : [{ id: 'NONE', stateName: 'None' }, ...commStates]
                    // }
                    optionArray={[
                      { id: "NONE", stateName: "None" },
                      ...stateList,
                    ]}
                    required={requiredFields.indexOf("state") >= 0}
                    invalid={
                      submitted && requiredFields.indexOf("state") >= 0
                        ? true
                        : false
                    }
                    invalidMessage={"State is required"}
                    maxLength={fieldLength["state".toLowerCase()]}
                  />
                </div>
                <div className="col-md-3 my-2">
                  <TextInputField
                    label="Post Code"
                    name="postCode"
                    placeholder="Post Code"
                    value={
                      companyData.postCode === null
                        ? "None"
                        : companyData.postCode
                    }
                    onChange={handleFormChange}
                    required={requiredFields.indexOf("postCode") >= 0}
                    invalid={
                      submitted && requiredFields.indexOf("postCode") >= 0
                        ? true
                        : false
                    }
                    invalidMessage={"Post Code is required"}
                    maxLength={fieldLength["postCode".toLowerCase()]}
                  />
                </div>
                <div className="col-md-3 my-2">
                  <SearchableCountry
                    name="country"
                    label="Country"
                    placeholder="Country"
                    setTempSearchField={setTempSearchField}
                    tempSearchField={tempSearchField}
                    fieldVal={
                      companyData.country === null
                        ? "None"
                        : companyData.country
                    }
                    selected={
                      tempSearchField.country === null
                        ? "None"
                        : tempSearchField.country
                    }
                    // optionArray={
                    //   requiredFields.indexOf('commCountry') >= 0
                    //     ? countries
                    //     : [{ id: 'NONE', countryName: 'None' }, ...countries]
                    // }
                    optionArray={[
                      { id: "NONE", countryName: "None" },
                      ...countryList,
                    ]}
                    handleSelectCountryAndState={handleChangeCountryAndState}
                    required={requiredFields.indexOf("country") >= 0}
                    invalid={
                      submitted && requiredFields.indexOf("country") >= 0
                        ? true
                        : false
                    }
                    invalidMessage={"Country is required"}
                    maxLength={fieldLength["country".toLowerCase()]}
                  />
                </div>

                {companyData.logoPath && !editLogo ? (
                  <div className="col-md-3 my-2">
                    <div className="d-flex justify-content-between">
                      <label>Site logo</label>{" "}
                      <span
                        className="text-primary pe-cursor"
                        onClick={() => setEditLogo(true)}
                      >
                        Edit
                      </span>
                    </div>
                    <div
                      className="w-100 p-1 "
                      style={{
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                      }}
                    >
                      <img
                        className="w-100"
                        src={`${API_BASE_URL}${companyData.logoPath}`}
                        alt="logo"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="col-md-3 my-2 position-relative">
                    <TextInputField
                      label="Company Logo"
                      name="logoPath"
                      placeholder="Company logo"
                      type="file"
                      // value={logoImg.filename ? logoImg.filename : ''}
                      onChange={handleUploadFile}
                      accept="image/*"
                      required={requiredFields.indexOf("logoPath") >= 0}
                      invalid={
                        submitted && requiredFields.indexOf("logoPath") >= 0
                          ? true
                          : false
                      }
                      invalidMessage="Please enter company logo"
                      // maxLength={fieldLength['phoneNumber1'.toLowerCase()]}
                    />
                    {companyData.logoPath && editLogo && (
                      <span
                        className="position-absolute text-primary pe-cursor"
                        onClick={() => setEditLogo(false)}
                        style={{ top: 0, right: "14px" }}
                      >
                        Cancel
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <CompanySites
                  siteList={siteList}
                  refreshData={fetchCompanyData}
                />
              </div>
            </div>
            {showWarning && (
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
                    setData={handleSubmitEditForm}
                    warningData={warningData}
                    closeForm={() => setShowWarning(false)}
                  />
                </ModalBody>
              </Modal>
            )}
            {showAlert && (
              <Modal
                isOpen={openAlert}
                toggle={() => setOpenAlert(false)}
                backdrop="static"
                scrollable={true}
                size="md"
                centered
              >
                <ModalHeader
                  toggle={() => setOpenAlert(false)}
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
                    handleFunc={fetchCompanyData}
                  />
                </ModalBody>
              </Modal>
            )}
            {loading && <LoadingPage />}
          </Card>
        </Container>
      </div>
    </Fragment>
  );
}

export default CompanyInfoPage;
