import React, { useState, useEffect, Fragment } from "react";
import { addNewAddress } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { ConfirmationAddressPopup } from "../../customComponents/CustomComponents";
import { toast } from "react-toastify";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import {
  TextInputField,
  SearchableState,
  SearchableCountry,
  SearchableAddressDropDown,
} from "pages/Edge/components/InputField";

const initialData = {
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

const AddNewAddress = (props) => {
  const { setShowForm, refresh } = props;
  const [formData, setFormData] = useState(initialData);
  const [tempSearchField, setTempSearchField] = useState(initialData);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [postalList, setPostalList] = useState([]);
  const [warningData, setWarningData] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requiredFields, setrequiredFields] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const setCountryAndState = () => {
    let allCountry = JSON.parse(window.localStorage.getItem("countryList"));

    let suburbList = JSON.parse(window.localStorage.getItem("postalList"));
    if (allCountry && allCountry?.length > 0) {
      setCountryList(allCountry);
      setStateList(allCountry[0].states);
      setFormData({
        ...formData,
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

  useEffect(() => {
    setCountryAndState();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setTempSearchField({ ...tempSearchField, [name]: value });
  };

  const handleSelectSuburb = (fieldName, obj) => {
    setFormData({
      ...formData,
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
      setFormData({
        ...formData,
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
        setFormData({
          ...formData,
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
        setFormData({
          ...formData,
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
    // let keys = Object.keys(formData);

    // let updatedData = {
    //   ...formData,
    //   ...tempSearchField,
    // };

    let allFilled = true;

    // keys?.forEach((k) => {
    //   if (
    //     requiredFields.includes(k) &&
    //     (updatedData[k] === '' || updatedData[k] === null)
    //   ) {
    //     allFilled = false;
    //     return;
    //   }
    // });

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

        if (tempSearchField?.city) {
          content.push(tempSearchField?.city);
        }
        if (tempSearchField?.state) {
          content.push(tempSearchField?.state);
        }
        if (tempSearchField?.country) {
          content.push(tempSearchField?.country);
        }
        if (tempSearchField?.postCode) {
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
      handleSubmitAddForm();
    } else {
      setSubmitted(true);
      // toast.warning("Please fill all required fields");
    }
  };

  const handleSubmitAddForm = async () => {
    let updatedData = { ...formData, ...tempSearchField };

    const keys = Object.keys(updatedData);

    keys.forEach((key) => {
      if (updatedData[key] === "" || updatedData[key] === "None") {
        updatedData = { ...updatedData, [key]: null };
      }
    });
    try {
      setLoading(true);
      const { data } = await addNewAddress(updatedData);
      if (data.success) {
        setShowForm(false);
        refresh();
      } else {
        toast.error("Something went wrong please try later.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShowForm(false);
      toast.error("Something went wrong please check console.");
      console.error(error);
    }
  };

  return (
    <Fragment>
      {/* <CustomToastWindow
        closeForm={() => setShowForm(false)}
        btn1={"Cancel"}
        btn2="Add"
        heading="Add new Address"
        handleFunc={handleCheckReq}
        autoClose={false}
        style={{ height: "auto" }}
      > */}
      <div className="mb-4">
        <div className="row">
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Address 1"
              name="address1"
              placeholder="Address 1"
              value={formData.address1}
              onChange={handleFormChange}
              required={requiredFields.indexOf("address1") >= 0}
              invalid={
                submitted && requiredFields.indexOf("address1") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Address 1 is required"}
              // maxLength={fieldLength['companyName'.toLowerCase()]}
            />
          </div>{" "}
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Address 2"
              name="address2"
              placeholder="Address 2"
              value={formData.address2}
              onChange={handleFormChange}
              required={requiredFields.indexOf("address2") >= 0}
              invalid={
                submitted && requiredFields.indexOf("address2") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Address 2 is required"}
              // maxLength={fieldLength['companyName'.toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Address 3"
              name="address3"
              placeholder="Address 3"
              value={formData.address3}
              onChange={handleFormChange}
              required={requiredFields.indexOf("address3") >= 0}
              invalid={
                submitted && requiredFields.indexOf("address3") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Address 3 is required"}
              // maxLength={fieldLength['companyName'.toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Phone Number"
              name="phoneNumber1"
              placeholder="Phone Number"
              value={formData.phoneNumber1}
              onChange={handleFormChange}
              required={requiredFields.indexOf("phoneNumber1") >= 0}
              invalid={
                submitted && requiredFields.indexOf("phoneNumber1") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Phone Number is required"}
              // maxLength={fieldLength['companyName'.toLowerCase()]}
            />
          </div>
          {/* <CustomTextInput
            name='phoneNumber2'
            label='Mobile Number'
            value={formData.phoneNumber2}
            onChange={handleFormChange}
            // invalid={submitted &&
            //   requiredFields.indexOf('companyName') >= 0 ? true : false
            // }
            // maxLength={fieldLength['companyName'.toLowerCase()]}
          /> */}
          {/* <CustomTextInput
            name='dxNumber'
            label='DX Number'
            value={formData.dxNumber}
            onChange={handleFormChange}
            // invalid={submitted &&
            //   requiredFields.indexOf('companyName') >= 0 ? true : false
            // }
            // maxLength={fieldLength['companyName'.toLowerCase()]}
          /> */}
          {/* <CustomTextInput
            name='dxCity'
            label='Dx City'
            value={formData.dxCity}
            onChange={handleFormChange}
            // invalid={submitted &&
            //   requiredFields.indexOf('companyName') >= 0 ? true : false
            // }
            // maxLength={fieldLength['companyName'.toLowerCase()]}
          /> */}
          <div className="col-md-4 mt-3">
            <SearchableAddressDropDown
              name="city"
              label="City"
              placeholder="City"
              fieldVal={formData.city}
              selected={`${tempSearchField.city}${tempSearchField.postCode}`}
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              optionArray={postalList}
              handleSelectSuburb={handleSelectSuburb}
              required={requiredFields.indexOf("city") >= 0}
              invalid={
                submitted && requiredFields.indexOf("city") >= 0 ? true : false
              }
              invalidMessage={"City is required"}
              // maxLength={fieldLength['city'.toLowerCase()]}
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
              fieldVal={formData.state ?? ""}
              selected={tempSearchField.state}
              // optionArray={
              //   requiredFields.indexOf('state') >= 0
              //     ? commStates
              //     : [{ id: 'NONE', stateName: 'None' }, ...commStates]
              // }
              optionArray={stateList}
              required={requiredFields.indexOf("state") >= 0}
              invalid={
                submitted && requiredFields.indexOf("state") >= 0 ? true : false
              }
              invalidMessage={"State is required"}
              // invalid={submitted &&requiredFields.indexOf('state') >= 0 ? true : false}
              // maxLength={fieldLength['state'.toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextInputField
              label="Post Code"
              name="postCode"
              placeholder="Post Code"
              value={formData.postCode}
              onChange={handleFormChange}
              required={requiredFields.indexOf("postCode") >= 0}
              invalid={
                submitted && requiredFields.indexOf("postCode") >= 0
                  ? true
                  : false
              }
              invalidMessage={"Post Code is required"}
              // invalid={submitted &&
              //   requiredFields.indexOf('companyName') >= 0 ? true : false
              // }
              // maxLength={fieldLength['companyName'.toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3">
            <SearchableCountry
              name="country"
              label="Country"
              placeholder="Country"
              setTempSearchField={setTempSearchField}
              tempSearchField={tempSearchField}
              fieldVal={formData.country ?? ""}
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
              invalidMessage={"Country is required"}
              // invalid={submitted &&requiredFields.indexOf('country') >= 0 ? true : false}
              // maxLength={fieldLength['country'.toLowerCase()]}
            />
          </div>
          <div className="col-md-4 mt-3"></div>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button
          className="mx-1"
          color="danger"
          onClick={() => setShowForm(false)}
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
              setData={handleSubmitAddForm}
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

export default AddNewAddress;
