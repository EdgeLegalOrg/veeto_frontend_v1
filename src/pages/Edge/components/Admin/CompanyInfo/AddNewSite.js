import React, { Fragment, useState, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import { createNewSite, getAllBaseTemplates } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { ConfirmationAddressPopup } from "../../customComponents/CustomComponents";
import { toast } from "react-toastify";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import {
  TextInputField,
  SelectInputField,
  SearchableAddressDropDown,
  SearchableState,
  SearchableCountry,
} from "pages/Edge/components/InputField";

const initialData = {
  siteName: "",
  email1: "",
  phoneNumber1: "",
  phoneNumber2: "",
  faxNumber: "",
  website: "",
  disclaimer: "",
  defaultTemplateId: "",
  siteCode: "",
};

const initAcc = {
  bankName: "",
  bankAccountName: "",
  bankBSB: "",
  codeNumber: "",
  accountNumber: "",
  abn: "",
  accountType: "",
};

const initAddress = {
  address1: "",
  address2: "",
  address3: "",
  city: "",
  state: "",
  country: "",
  postCode: "",
  dxNumber: "",
  dxCity: "",
  phoneNumber1: "",
  phoneNumber2: "",
};

const AddNewSite = (props) => {
  const { setShowAdd, refreshData, accTypeList } = props;
  const [formData, setFormData] = useState(initialData);
  const [preferredAccount, setPreferredAccount] = useState(initAcc);
  const [preferredAddress, setPreferredAddress] = useState(initAddress);
  const [tempSearchField, setTempSearchField] = useState(initAddress);
  const [templateList, setTemplateList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [postalList, setPostalList] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]);
  const [fieldLength, setFieldLength] = useState([]);
  const [warningData, setWarningData] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [logoImg, setLogoImg] = useState({});

  const fetchRequired = () => {
    let arr = [];
    JSON.parse(window.localStorage.getItem("metaData"))?.site_info?.fields?.map(
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
    JSON.parse(window.localStorage.getItem("metaData"))?.site_info?.fields?.map(
      (f) => {
        allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
      }
    );
    setFieldLength(allLengths);
  };

  const setCountryAndState = () => {
    let allCountry = JSON.parse(window.localStorage.getItem("countryList"));

    let suburbList = JSON.parse(window.localStorage.getItem("postalList"));
    if (allCountry && allCountry?.length > 0) {
      setCountryList(allCountry);
      setStateList(allCountry[0].states);
      setPreferredAddress({
        ...preferredAddress,
        country: allCountry[0].countryName,
        state: allCountry?.[0]?.states?.[0]?.stateName,
      });
      setTempSearchField({
        ...tempSearchField,
        country: allCountry[0].countryName,
        state: allCountry?.[0]?.states?.[0]?.stateName,
      });
    }

    if (suburbList && suburbList?.length > 0) {
      setPostalList(suburbList);
    }
  };

  const parseList = (data) => {
    let arr = [];

    data.forEach((d) => {
      arr.push({ display: d.name, value: d.id });
    });

    setTemplateList(arr);
  };

  const fetchTemplate = async () => {
    try {
      const { data } = await getAllBaseTemplates();
      if (data.success) {
        parseList(data.data.templateList);
      } else {
        toast.error("Something went wrong in fetching templates.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setCountryAndState();
    fetchTemplate();
    fetchRequired();
    fetchFieldLength();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setPreferredAddress({ ...preferredAddress, [name]: value });
    setTempSearchField({ ...tempSearchField, [name]: value });
  };

  const handleAccChange = (e) => {
    const { name, value } = e.target;
    setPreferredAccount({ ...preferredAccount, [name]: value });
  };

  const handleSelectSuburb = (fieldName, obj) => {
    setPreferredAddress({
      ...preferredAddress,
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
  };

  const handleChangeCountryAndState = (fieldName, val) => {
    if (val === null || val === "None") {
      setPreferredAddress({
        ...preferredAddress,
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
        setPreferredAddress({
          ...preferredAddress,
          country: selectedCountry?.[0]?.countryName,
          // state: selectedCountry?.[0]?.states?.[0]?.stateName,
        });
        setTempSearchField({
          ...tempSearchField,
          country: selectedCountry?.[0]?.countryName,
          // state: selectedCountry?.[0]?.states?.[0]?.stateName,
        });
        setStateList(selectedCountry?.[0]?.states);
      }
      if (fieldName === "state") {
        setPreferredAddress({
          ...preferredAddress,
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
    let keys = Object.keys(formData);

    let updatedData = {
      ...formData,
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
      //toast.warning("Please fill all required fields");
    }
  };

  const handleSubmitEditForm = async () => {
    let updatedData = { ...formData };
    let updatedAdd = { ...tempSearchField };
    let updatedAcc = { ...preferredAccount };
    delete updatedData["templateName"];

    const dataKeys = Object.keys(updatedData);
    const addKeys = Object.keys(updatedAdd);
    const accKeys = Object.keys(updatedAcc);

    dataKeys.forEach((key) => {
      if (updatedData[key] === "" || updatedData[key] === "None") {
        updatedData = { ...updatedData, [key]: null };
      }
    });

    addKeys.forEach((key) => {
      if (updatedAdd[key] === "" || updatedAdd[key] === "None") {
        updatedAdd = { ...updatedAdd, [key]: null };
      }
    });

    accKeys.forEach((key) => {
      if (updatedAcc[key] === "" || updatedAcc[key] === "None") {
        updatedAcc = { ...updatedAcc, [key]: null };
      }
    });

    let preferredDisclaimer = {
      disclaimer: updatedData.disclaimer,
    };

    delete updatedData.disclaimer;

    let newData = {
      ...updatedData,
      preferredSiteAddress: updatedAdd,
      preferredBankAccount: updatedAcc,
      preferredDisclaimer,
    };

    let formData = new FormData();

    formData.append("siteInfoDetails", { requestId: uuidv1(), data: newData });
    formData.append("siteLogo", logoImg.file);

    try {
      setLoading(true);
      const { data } = await createNewSite(formData);
      if (data.success) {
        setShowAdd(false);
        refreshData();
      } else {
        toast.error("Something went wrong please try later.");
      }
    } catch (error) {
      toast.error("Something went wrong please try later.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (val) => {
    setFormData({
      ...formData,
      defaultTemplateId: val.value,
      templateName: val.display,
    });
  };

  const handleSelectOption = (e) => {
    const { name, value } = e.target;
    setPreferredAccount({ ...preferredAccount, [name]: value });
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
      {/* <CustomToastWindow
        closeForm={() => setShowAdd(false)}
        btn1={"Cancel"}
        btn2="Add"
        heading="Add New Site"
        gridSize="78%"
        handleFunc={handleCheckReq}
        autoClose={false}
      > */}
      <div style={{ height: "25rem", overflow: "scroll" }} className="mb-4">
        <div className="row">
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Name"
              name="siteName"
              placeholder="Name"
              value={formData.siteName}
              onChange={handleFormChange}
              required={requiredFields.indexOf("siteName") >= 0}
              invalid={
                submitted && requiredFields.indexOf("siteName") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Site name is required"}
              maxLength={fieldLength["siteName".toLowerCase()]}
            />
          </div>
          {/* <CustomTextInput
            name='title'
            label='Title'
            value={formData.title}
            onChange={handleFormChange}
            invalid={submitted &&requiredFields.indexOf('title') >= 0 ? true : false}
            maxLength={fieldLength['title'.toLowerCase()]}
          /> */}
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Site Code"
              name="siteCode"
              placeholder="Site Code"
              value={formData.siteCode}
              onChange={handleFormChange}
              required={requiredFields.indexOf("siteCode") >= 0}
              invalid={
                submitted && requiredFields.indexOf("siteCode") >= 0
                  ? true
                  : false
              }
              invalidMessage="Site code is required"
              maxLength={fieldLength["siteCode".toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Phone"
              name="phoneNumber1"
              placeholder="Phone"
              value={formData.phoneNumber1}
              onChange={handleFormChange}
              required={requiredFields.indexOf("phoneNumber1") >= 0}
              invalid={
                submitted && requiredFields.indexOf("phoneNumber1") >= 0
                  ? true
                  : false
              }
              invalidMessage="Phone number is required"
              maxLength={fieldLength["phoneNumber1".toLowerCase()]}
            />
          </div>
          {/* <CustomTextInput
            name='phoneNumber2'
            label='Mobile'
            value={formData.phoneNumber2}
            onChange={handleFormChange}
            invalid={submitted &&
              requiredFields.indexOf('phoneNumber2') >= 0 ? true : false
            }
            maxLength={fieldLength['phoneNumber2'.toLowerCase()]}
          />
          <CustomTextInput
            name='faxNumber'
            label='Fax'
            value={formData.faxNumber}
            onChange={handleFormChange}
            invalid={submitted &&requiredFields.indexOf('faxNumber') >= 0 ? true : false}
            maxLength={fieldLength['faxNumber'.toLowerCase()]}
          /> */}
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Email"
              name="email1"
              placeholder="Email"
              value={formData.email1}
              onChange={handleFormChange}
              required={requiredFields.indexOf("email1") >= 0}
              invalid={
                submitted && requiredFields.indexOf("email1") >= 0
                  ? true
                  : false
              }
              invalidMessage="Email is required"
              maxLength={fieldLength["email1".toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Website"
              name="website"
              placeholder="Website"
              value={formData.website}
              onChange={handleFormChange}
              required={requiredFields.indexOf("website") >= 0}
              invalid={
                submitted && requiredFields.indexOf("website") >= 0
                  ? true
                  : false
              }
              invalidMessage="Website is required"
              maxLength={fieldLength["website".toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <SelectInputField
              name="defaultTemplateId"
              label="Default Letter Head"
              placeholder="Default Letter Head"
              value={formData.defaultTemplateId}
              optionArray={templateList}
              setDetails={setFormData}
              details={formData}
              onSelectFunc={(val) => handleSelect(val)}
              selected={formData.defaultTemplateId}
              fieldVal={formData.templateName}
              maxLength={null}
              required={requiredFields.indexOf("defaultTemplateId") >= 0}
              invalid={
                submitted && requiredFields.indexOf("defaultTemplateId") >= 0
              }
              invalidMessage="Default Letter Head is required"
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Site Logo"
              name="siteLogo"
              placeholder="Site Logo"
              type="file"
              // value={logoImg.filename ? logoImg.filename : ''}
              onChange={handleUploadFile}
              accept="image/*"
              required={requiredFields.indexOf("siteLogo") >= 0}
              invalid={
                submitted && requiredFields.indexOf("siteLogo") >= 0
                  ? true
                  : false
              }
              invalidMessage="Please enter site logo"
              // maxLength={fieldLength['phoneNumber1'.toLowerCase()]}
            />
          </div>
          <div className="col-md-8 mt-3"></div>
        </div>

        <div>
          <div className="bg-light d-flex align-items-center justify-content-between p-3 mt-4 border">
            <h5 className="mb-0">Preferred Site Address</h5>
          </div>
          <div className="row">
            <div className="col-md-4 mt-3">
              <TextInputField
                label="Address 1"
                name="address1"
                placeholder="Address 1"
                value={preferredAddress.address1}
                onChange={handleAddressChange}
                required={requiredFields.indexOf("address1") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("address1") >= 0
                    ? true
                    : false
                }
                invalidMessage="Address 1 is required"
                // maxLength={fieldLength['address1'.toLowerCase()]}
                maxLength={null}
              />
            </div>
            <div className="col-md-4 mt-3">
              <TextInputField
                label="Address 2"
                name="address2"
                placeholder="Address 2"
                value={preferredAddress.address2}
                onChange={handleAddressChange}
                required={requiredFields.indexOf("address2") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("address2") >= 0
                    ? true
                    : false
                }
                invalidMessage="Address 2 is required"
                // maxLength={fieldLength['address2'.toLowerCase()]}
                maxLength={null}
              />
            </div>
            <div className="col-md-4 mt-3">
              <TextInputField
                label="Address 3"
                name="address3"
                placeholder="Address 3"
                value={preferredAddress.address3}
                onChange={handleAddressChange}
                required={requiredFields.indexOf("address3") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("address3") >= 0
                    ? true
                    : false
                }
                invalidMessage="Address 3 is required"
                // maxLength={fieldLength['address3'.toLowerCase()]}
                maxLength={null}
              />
            </div>
            <div className="col-md-4 mt-3">
              <SearchableAddressDropDown
                name="city"
                label="Suburb"
                placeholder="City"
                setTempSearchField={setTempSearchField}
                tempSearchField={tempSearchField}
                optionArray={postalList}
                handleSelectSuburb={handleSelectSuburb}
                fieldVal={preferredAddress.city}
                selected={`${tempSearchField.city}${tempSearchField.postCode}`}
                required={requiredFields.indexOf("city".toLowerCase()) >= 0}
                invalid={
                  submitted && requiredFields.indexOf("city".toLowerCase()) >= 0
                    ? true
                    : false
                }
                invalidMessage="City is required"
                // maxLength={fieldLength['city'.toLowerCase()]}
                maxLength={null}
              />
            </div>
            <div className="col-md-4 mt-3">
              <SearchableState
                name="state"
                label="State"
                placeholder="State"
                setTempSearchField={setTempSearchField}
                tempSearchField={tempSearchField}
                handleSelectCountryAndState={handleChangeCountryAndState}
                fieldVal={preferredAddress.state}
                selected={tempSearchField.state}
                // optionArray={
                //   requiredFields.indexOf('state') >= 0
                //     ? commStates
                //     : [{ id: 'NONE', stateName: 'None' }, ...commStates]
                // }
                optionArray={stateList}
                required={requiredFields.indexOf("state") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("state") >= 0
                    ? true
                    : false
                }
                invalidMessage="State is required"
                // maxLength={fieldLength['state'.toLowerCase()]}
                maxLength={null}
              />
            </div>
            <div className="col-md-4 mt-3">
              <TextInputField
                label="Post Code"
                name="postCode"
                placeholder="Post Code"
                value={preferredAddress.postCode}
                onChange={handleAddressChange}
                required={requiredFields.indexOf("postCode") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("postCode") >= 0
                    ? true
                    : false
                }
                invalidMessage="Post Code is required"
                // maxLength={fieldLength['postCode'.toLowerCase()]}
                maxLength={null}
              />
            </div>
            <div className="col-md-4 mt-3">
              <SearchableCountry
                name="country"
                label="Country"
                placeholder="Country"
                setTempSearchField={setTempSearchField}
                tempSearchField={tempSearchField}
                fieldVal={preferredAddress.country}
                selected={tempSearchField.country}
                // optionArray={
                //   requiredFields.indexOf('commCountry') >= 0
                //     ? countries
                //     : [{ id: 'NONE', countryName: 'None' }, ...countries]
                // }
                optionArray={countryList}
                handleSelectCountryAndState={handleChangeCountryAndState}
                required={requiredFields.indexOf("country") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("country") >= 0
                    ? true
                    : false
                }
                invalidMessage="Country is required"
                // maxLength={fieldLength['country'.toLowerCase()]}
                maxLength={null}
              />
            </div>
            <div className="col-md-4 mt-3" />
            <div className="col-md-4 mt-3" />
          </div>
        </div>

        <div>
          <div className="bg-light d-flex align-items-center justify-content-between p-3 mt-4 border">
            <h5 className="mb-0">Preferred Bank Account</h5>
          </div>
          <div className="row">
            <div className="col-md-4 mt-3">
              <TextInputField
                label="Bank Name"
                name="bankName"
                placeholder="Bank Name"
                value={preferredAccount.bankName}
                onChange={handleAccChange}
                required={requiredFields.indexOf("bankName") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("bankName") >= 0
                    ? true
                    : false
                }
                invalidMessage="Bank Name is required"
                // maxLength={fieldLength['companyName'.toLowerCase()]}
              />
            </div>
            <div className="col-md-4 mt-3">
              <TextInputField
                label="Account Name"
                name="bankAccountName"
                placeholder="Account Name"
                value={preferredAccount.bankAccountName}
                onChange={handleAccChange}
                required={requiredFields.indexOf("bankAccountName") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("bankAccountName") >= 0
                    ? true
                    : false
                }
                invalidMessage="Account Name is required"
                // maxLength={fieldLength['companyName'.toLowerCase()]}
              />
            </div>
            <div className="col-md-4 mt-3">
              <TextInputField
                label="BSB"
                name="bankBSB"
                placeholder="BSB"
                value={preferredAccount.bankBSB}
                onChange={handleAccChange}
                required={requiredFields.indexOf("bankBSB") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("bankBSB") >= 0
                    ? true
                    : false
                }
                invalidMessage="BSB is required"
                // maxLength={fieldLength['companyName'.toLowerCase()]}
              />
            </div>
            <div className="col-md-4 mt-3">
              <TextInputField
                label="Account Number"
                name="accountNumber"
                placeholder="Account Number"
                value={preferredAccount.accountNumber}
                onChange={handleAccChange}
                required={requiredFields.indexOf("accountNumber") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("accountNumber") >= 0
                    ? true
                    : false
                }
                invalidMessage="Account Number is required"
                // maxLength={fieldLength['companyName'.toLowerCase()]}
              />
            </div>
            <div className="col-md-4 mt-3">
              <TextInputField
                type="select"
                label="Code Number"
                name="accountType"
                placeholder="Account Type"
                optionArray={accTypeList.map((item) => ({
                  label: item.display,
                  value: item.value,
                }))}
                value={preferredAccount.accountType}
                onChange={handleSelectOption}
                required={requiredFields.indexOf("accountType") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("accountType") >= 0
                    ? true
                    : false
                }
                invalidMessage="Account Type is required"
              />
            </div>
            <div className="col-md-4 mt-3"></div>
          </div>
        </div>

        <div>
          <div className="bg-light d-flex align-items-center justify-content-between p-3 mt-4 border">
            <h5 className="mb-0">Preferred Tax Disclaimer</h5>
          </div>
          {/* <div className='customToast-inputDiv'>
          <CustomTextInput
            multiline
            width='83%'
            name='comments'
            label='Comments'
            value={formData.comments}
            onChange={handleFormChange}
            // invalid={submitted &&requiredFields.indexOf('email1') >= 0 ? true : false}
            // maxLength={fieldLength['email1'.toLowerCase()]}
          />
        </div> */}
          <div className="row">
            <div className="col-md-6 mt-3">
              <TextInputField
                label="Tax Invoice Disclaimer"
                type="textarea"
                multiline
                maxRows={3}
                name="disclaimer"
                placeholder="Tax Invoice Disclaimer"
                value={formData.disclaimer}
                onChange={handleFormChange}
                required={requiredFields.indexOf("disclaimer") >= 0}
                invalid={
                  submitted && requiredFields.indexOf("disclaimer") >= 0
                    ? true
                    : false
                }
                invalidMessage="Disclaimer is required"
                maxLength={fieldLength["disclaimer".toLowerCase()]}
              />
            </div>
            <div className="col-md-6 mt-3"></div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button
          className="mx-1"
          color="danger"
          onClick={() => setShowAdd(false)}
        >
          Cancel
        </Button>
        <Button
          className="mx-1"
          color="success"
          onClick={() => handleCheckReq()}
        >
          Add
        </Button>
      </div>

      {/* </CustomToastWindow> */}

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

      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default AddNewSite;
