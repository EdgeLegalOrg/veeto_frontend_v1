import React, { useState, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Table,
  Modal,
  ModalBody,
  ModalHeader,
  Input,
} from "reactstrap";
import AddRegisteredLots from "./AddRegisteredLots";
import AddUnregisteredLots from "./AddUnregisteredLots";
import NewRegisteredLots from "./NewRegisteredLots.js";
import NewUnregisteredLots from "./NewUnregisteredLots";
import {
  CustomTextInput,
  ConfirmationAddressPopup,
  AlertPopup,
} from "../customComponents/CustomComponents";
import { addNewProperty } from "../../apis";
import "../../stylesheets/contacts.css";
import TableContainer from "../../../../Components/Common/TableContainer";
import { toast } from "react-toastify";
import {
  TextInputField,
  SearchableAddressDropDown,
  SearchableCountry,
  SearchableState,
} from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";

const initialData = {
  buildingName: "",
  unit: "",
  streetNo: "",
  street: "",
  suburb: "",
  state: "",
  postCode: "",
  country: "",
};

const filterRegisterFields = {
  depositedPlanNumber: "",
  description: "",
  lotNumber: "",
  strataPlanNumber: "",
  titleReference: "",
  section: "",
};

const filterUnregisterFields = {
  partOfLot: "",
  description: "",
  lot: "",
  plan: "",
  section: "",
};

const searchField = {
  suburb: "",
  state: "",
  postCode: "",
  country: "",
};

function AddProperty(props) {
  const {
    setIsEditTrue,
    setBoolVal,
    allCountries,
    postalList,
    requiredGeneral,
    requiredRegistered,
    requiredUnregistered,
    fieldLength,
  } = props;
  const dispatch = useDispatch();
  const { formStatus } = useSelector((state) => state.Layout);
  const [propertyDetails, setPropertyDetails] = useState(initialData);
  const [tempPropertyDetails, setTempPropertyDetails] = useState(initialData);
  const [tempSearchField, setTempSearchField] = useState(searchField);
  const [tempRegistered, setTempRegistered] = useState([]);
  const [filterRegistered, setFilterRegistered] = useState([]);
  const [filterUnregistered, setFilterUnregistered] = useState([]);
  const [tempUnregistered, setTempUnregistered] = useState([]);
  const [filterRegisterInput, setFilterRegisterInput] =
    useState(filterRegisterFields);
  const [filterUnregisterInput, setFilterUnregisterInput] = useState(
    filterUnregisterFields
  );
  const [states, setStates] = useState([]);
  const [isBool, setIsBool] = useState(false);
  const [addReg, setAddReg] = useState(false);
  const [addUnreg, setAddUnreg] = useState(false);
  const [isEnable, setIsEnable] = useState(true);
  const [confirmAddress, setConfirmAddress] = useState(false);
  const [warningData, setWarningData] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [formStatusNew, setFormStatusNew] = useState({
    isFormChanged: false,
    isShowModal: false,
  });

  useEffect(() => {
    if (!isBool && allCountries.length !== 0) {
      setPropertyDetails({
        ...propertyDetails,
        country: allCountries[0].countryName,
        state: allCountries[0].states[0].stateName,
      });
      setTempPropertyDetails({
        ...tempPropertyDetails,
        country: allCountries[0].countryName,
        state: allCountries[0].states[0].stateName,
      });
      setStates(allCountries[0].states);
      setTempSearchField({
        ...tempSearchField,
        country: allCountries[0].countryName,
        state: allCountries[0].states[0].stateName,
      });
      setIsBool(true);
    }
  }, [isBool, allCountries]);

  useEffect(() => {
    let isChanged =
      JSON.stringify(propertyDetails) !== JSON.stringify(tempPropertyDetails);
    if (tempRegistered?.length || tempUnregistered?.length) {
      isChanged = true;
    }
    dispatch(
      updateFormStatusAction({ key: "isFormChanged", value: isChanged })
    );
  }, [
    propertyDetails,
    tempPropertyDetails,
    tempRegistered?.length,
    tempUnregistered?.length,
  ]);

  const handleFormChange = (e) => {
    const { name } = e.target;
    if (name === "postCode") {
      setTempSearchField({ ...tempSearchField, [name]: e.target.value });
    }
    setPropertyDetails({ ...propertyDetails, [name]: e.target.value });
  };

  const handleSelectSuburb = (fieldName, obj) => {
    const selectedCountry = allCountries.filter(
      (country) => country.countryName === obj.country
    );

    setStates(selectedCountry[0].states);

    setPropertyDetails({
      ...propertyDetails,
      suburb: obj.locality,
      postCode: obj.postCode,
      country: obj.country,
      state: obj.state,
    });
    setTempSearchField({
      ...tempSearchField,
      suburb: obj.locality,
      postCode: obj.postCode,
      country: obj.country,
      state: obj.state,
    });
  };

  const handleChangeCountryAndState = (fieldName, val) => {
    if (fieldName === "country") {
      const selectedCountry = allCountries.filter(
        (country) => country.countryName === val
      );
      setPropertyDetails({
        ...propertyDetails,
        country: selectedCountry[0].countryName,
      });
      setTempSearchField({
        ...tempSearchField,
        country: selectedCountry[0].countryName,
      });
      setStates(selectedCountry[0].states);
    }
    if (fieldName === "state") {
      setPropertyDetails({
        ...propertyDetails,
        state: val,
      });
      setTempSearchField({
        ...tempSearchField,
        state: val,
      });
    }
  };

  const handleNewProperty = async () => {
    setIsEnable(false);
    const formData = {
      ...propertyDetails,
      suburb: tempSearchField.suburb,
      state: tempSearchField.state,
      country: tempSearchField.country,
      postCode: tempSearchField.postCode,
      registeredProperties: tempRegistered,
      unregisteredProperties: tempUnregistered,
    };

    try {
      const { data } = await addNewProperty({
        requestId: uuidv1(),
        data: formData,
      });
      setPropertyDetails(initialData);
      setIsEnable(true);
      if (props.setBoolVal) {
        setBoolVal(false);
      }

      if (props.refreshList) {
        props.refreshList();
      }

      props.close();
    } catch (err) {
      setIsEnable(true);
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const keyArray = Object.keys(propertyDetails);

    let bool = true;

    keyArray.forEach((key) => {
      if (requiredGeneral.indexOf(key) >= 0 && propertyDetails[key] === "") {
        bool = false;
      }
    });

    if (!bool) {
      return setSubmitted(true);
    }

    let existInList = true;

    if (existInList) {
      let checkSuburb = false;
      postalList.forEach((info) => {
        if (
          (tempSearchField?.suburb !== ""
            ? info.locality?.toUpperCase() ===
              tempSearchField?.suburb?.toUpperCase()
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
          checkSuburb = true;
        }
      });
      if (!checkSuburb) {
        existInList = false;
        let content = [];
        // setWarningData([
        //   ...warningData,
        //   tempSearchField?.suburb,
        //   tempSearchField?.postCode,
        //   tempSearchField?.state,
        //   tempSearchField?.country,
        // ]);
        if (
          !requiredGeneral.includes("suburb") &&
          tempSearchField?.suburb !== ""
        ) {
          content.push(tempSearchField?.suburb);
        }
        if (
          !requiredGeneral.includes("state") &&
          tempSearchField?.state !== ""
        ) {
          content.push(tempSearchField?.state);
        }
        if (
          !requiredGeneral.includes("country") &&
          tempSearchField?.country !== ""
        ) {
          content.push(tempSearchField?.country);
        }
        if (
          !requiredGeneral.includes("postCode") &&
          tempSearchField?.postCode !== ""
        ) {
          content.push(tempSearchField?.postCode);
        }
        if (content?.length > 0) {
          setWarningData(content);
        } else {
          existInList = true;
        }
      }
    }

    if (!existInList) {
      return setConfirmAddress(true);
    }

    handleNewProperty();
  };

  const filterRegisterData = (obj) => {
    const newData = tempRegistered?.filter(
      (data) =>
        (data["description"]
          ? data["description"]
              ?.toLowerCase()
              .includes(obj["description"]?.toLowerCase())
          : true) &&
        (data["lotNumber"]
          ? data["lotNumber"]
              ?.toLowerCase()
              .includes(obj["lotNumber"]?.toLowerCase())
          : true) &&
        (data["depositedPlanNumber"]
          ? data["depositedPlanNumber"]
              ?.toLowerCase()
              .includes(obj["depositedPlanNumber"]?.toLowerCase())
          : true) &&
        (data["planNumber"]
          ? data["planNumber"]
              ?.toLowerCase()
              .includes(obj["planNumber"]?.toLowerCase())
          : true) &&
        (data["strataPlanNumber"]
          ? data["strataPlanNumber"]
              .toLowerCase()
              .includes(obj["strataPlanNumber"].toLowerCase())
          : true) &&
        (data["section"]
          ? data["section"].toLowerCase().includes(obj["section"].toLowerCase())
          : true) &&
        (data["section"]
          ? data["titleReference"]
              .toLowerCase()
              .includes(obj["titleReference"].toLowerCase())
          : true)
    );
    setFilterRegistered(newData);
  };

  const handleFilterRegister = (e) => {
    const { name } = e.target;
    setFilterRegisterInput({ ...filterRegisterInput, [name]: e.target.value });
    filterRegisterData({ ...filterRegisterInput, [name]: e.target.value });
  };

  const handleDeleteTempReg = (list) => {
    setTempRegistered(list);
    setFilterRegistered(list);
    setFilterRegisterInput(filterRegisterFields);
  };

  const handleDeleteTempUnreg = (list) => {
    setTempUnregistered(list);
    setFilterUnregistered(list);
    setFilterUnregisterInput(filterUnregisterFields);
  };

  const filterUnregisterData = (obj) => {
    const newData = tempUnregistered?.filter(
      (data) =>
        (data["description"]
          ? data["description"]
              ?.toLowerCase()
              .includes(obj["description"]?.toLowerCase())
          : true) &&
        (data["lot"]
          ? data["lot"]?.toLowerCase().includes(obj["lot"]?.toLowerCase())
          : true) &&
        (data["plan"]
          ? data["plan"]?.toLowerCase().includes(obj["plan"]?.toLowerCase())
          : true) &&
        (data["partOfLot"]
          ? data["partOfLot"]
              .toLowerCase()
              .includes(obj["partOfLot"].toLowerCase())
          : true) &&
        (data["section"]
          ? data["section"].toLowerCase().includes(obj["section"].toLowerCase())
          : true)
    );
    setFilterUnregistered(newData);
  };

  const handleFilterUnregister = (e) => {
    const { name } = e.target;
    setFilterUnregisterInput({
      ...filterUnregisterInput,
      [name]: e.target.value,
    });
    filterUnregisterData({ ...filterUnregisterInput, [name]: e.target.value });
  };

  function renderRegisteredLots() {
    if (filterRegistered?.length === 0) {
      return (
        <td colSpan={7} style={{ textAlign: "center" }}>
          <p>No records to display</p>
        </td>
      );
    } else {
      return filterRegistered?.map((registeredLot, ind) => {
        return (
          <NewRegisteredLots
            key={ind}
            modal={9}
            registeredLot={registeredLot}
            setTempRegistered={setTempRegistered}
            setFilterRegistered={setFilterRegistered}
            handleDeleteTempReg={handleDeleteTempReg}
            tempRegistered={tempRegistered}
            fieldLength={fieldLength}
            requiredReg={requiredRegistered}
            index={ind}
            formStatusNew={formStatusNew}
            setFormStatusNew={setFormStatusNew}
          />
        );
      });
    }
  }

  function renderUnregisteredLots() {
    if (filterUnregistered?.length === 0) {
      return (
        <td colSpan={6} style={{ textAlign: "center" }}>
          <p>No records to display</p>
        </td>
      );
    } else {
      return filterUnregistered?.map((unregisteredLot, ind) => {
        return (
          <NewUnregisteredLots
            key={ind}
            modal={10}
            unregisteredLot={unregisteredLot}
            setTempUnregistered={setTempUnregistered}
            setFilterUnregistered={setFilterUnregistered}
            tempUnregistered={tempUnregistered}
            fieldLength={fieldLength}
            requiredUnreg={requiredUnregistered}
            handleDeleteTempUnreg={handleDeleteTempUnreg}
            index={ind}
            formStatusNew={formStatusNew}
            setFormStatusNew={setFormStatusNew}
          />
        );
      });
    }
  }

  return (
    <div className="">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="row mt-4">
            <div className="col-md-3">
              <TextInputField
                label="Building Name"
                placeholder="Building Name"
                name="buildingName"
                value={propertyDetails.buildingName}
                onChange={handleFormChange}
                required={
                  requiredGeneral.indexOf("buildingName".toLowerCase()) >= 0
                }
                invalid={
                  submitted &&
                  requiredGeneral.indexOf("buildingName".toLowerCase()) >= 0
                    ? true
                    : false
                }
                invalidMessage="Building Name is required"
                maxLength={fieldLength["buildingName".toLowerCase()]}
              />
            </div>
            <div className="col-md-3">
              <TextInputField
                label="Unit"
                placeholder="Unit"
                name="unit"
                value={propertyDetails.unit}
                onChange={handleFormChange}
                required={requiredGeneral.indexOf("unit".toLowerCase()) >= 0}
                invalid={
                  submitted &&
                  requiredGeneral.indexOf("unit".toLowerCase()) >= 0
                    ? true
                    : false
                }
                invalidMessage="Unit is required"
                maxLength={fieldLength["unit".toLowerCase()]}
              />
            </div>
            <div className="col-md-3">
              <TextInputField
                label="Street No."
                placeholder="Street No."
                name="streetNo"
                value={propertyDetails.streetNo}
                onChange={handleFormChange}
                required={
                  requiredGeneral.indexOf("streetNo".toLowerCase()) >= 0
                }
                invalid={
                  submitted &&
                  requiredGeneral.indexOf("streetNo".toLowerCase()) >= 0
                    ? true
                    : false
                }
                invalidMessage="Street No. is required"
                maxLength={fieldLength["streetNo".toLowerCase()]}
              />
            </div>
            <div className="col-md-3">
              <TextInputField
                label="Street"
                name="street"
                placeholder="Street"
                value={propertyDetails.street}
                onChange={handleFormChange}
                required={requiredGeneral.indexOf("street".toLowerCase()) >= 0}
                invalid={
                  submitted &&
                  requiredGeneral.indexOf("street".toLowerCase()) >= 0
                    ? true
                    : false
                }
                invalidMessage="Street is required"
                maxLength={fieldLength["street".toLowerCase()]}
              />
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-md-3">
              <SearchableAddressDropDown
                name="suburb"
                label="Suburb"
                placeholder="Suburb"
                selected={`${tempSearchField.suburb}${tempSearchField.postCode}`}
                fieldVal={propertyDetails.suburb ?? ""}
                // onChange={handleFormChange}
                setTempSearchField={setTempSearchField}
                tempSearchField={tempSearchField}
                optionArray={postalList}
                required={requiredGeneral.indexOf("suburb".toLowerCase()) >= 0}
                invalid={
                  submitted &&
                  requiredGeneral.indexOf("suburb".toLowerCase()) >= 0
                    ? true
                    : false
                }
                invalidMessage="Suburb is required"
                handleSelectSuburb={handleSelectSuburb}
                maxLength={fieldLength["suburb".toLowerCase()]}
              />
            </div>
            <div className="col-md-3">
              <SearchableState
                name="state"
                label="State"
                placeholder="State"
                setTempSearchField={setTempSearchField}
                tempSearchField={tempSearchField}
                handleSelectCountryAndState={handleChangeCountryAndState}
                selected={tempSearchField?.state}
                fieldVal={propertyDetails.state ?? ""}
                optionArray={states}
                required={requiredGeneral.indexOf("state".toLowerCase()) >= 0}
                invalid={
                  submitted &&
                  requiredGeneral.indexOf("state".toLowerCase()) >= 0
                    ? true
                    : false
                }
                invalidMessage="State is required"
                maxLength={fieldLength["state".toLowerCase()]}
              />
            </div>
            <div className="col-md-3">
              <TextInputField
                label="Post Code"
                name="postCode"
                placeholder="Post Code"
                value={propertyDetails.postCode}
                onChange={handleFormChange}
                required={
                  requiredGeneral.indexOf("postCode".toLowerCase()) >= 0
                }
                invalid={
                  submitted &&
                  requiredGeneral.indexOf("postCode".toLowerCase()) >= 0
                    ? true
                    : false
                }
                invalidMessage="Post Code is required"
                maxLength={fieldLength["postCode".toLowerCase()]}
              />
            </div>
            <div className="col-md-3">
              <SearchableCountry
                name="country"
                label="Country"
                placeholder="Country"
                setTempSearchField={setTempSearchField}
                tempSearchField={tempSearchField}
                // value={propertyDetails.country}
                selected={tempSearchField.country}
                fieldVal={propertyDetails.country ?? ""}
                optionArray={allCountries}
                handleSelectCountryAndState={handleChangeCountryAndState}
                required={requiredGeneral.indexOf("country".toLowerCase()) >= 0}
                invalid={
                  submitted &&
                  requiredGeneral.indexOf("country".toLowerCase()) >= 0
                    ? true
                    : false
                }
                invalidMessage="Country is required"
                maxLength={fieldLength["country".toLowerCase()]}
              />
            </div>
          </div>
        </div>

        <div className="registered-section">
          <div className="bg-light d-flex align-items-center justify-content-between p-2">
            <h5 className="mb-0">Add/Edit Registered Lots</h5>
            <Button
              color="success"
              type="button"
              onClick={() => setAddReg(true)}
            >
              + Add
            </Button>
          </div>
          <Table responsive={true} striped={true} hover={true}>
            <thead>
              <tr>
                <th>
                  <h6>Edit</h6>
                </th>
                <th>
                  <h6>Title Ref</h6>
                  <Input
                    type="text"
                    name="titleReference"
                    onChange={handleFilterRegister}
                    value={filterRegisterInput.titleReference}
                    placeholder="Title Ref"
                  />
                </th>
                <th>
                  <h6>Lot No.</h6>
                  <Input
                    type="text"
                    name="lotNumber"
                    onChange={handleFilterRegister}
                    value={filterRegisterInput.lotNumber}
                    placeholder="Lot No."
                  />
                </th>
                <th>
                  <h6>Section</h6>
                  <Input
                    type="text"
                    name="section"
                    onChange={handleFilterRegister}
                    value={filterRegisterInput.section}
                    placeholder="Section"
                  />
                </th>
                <th>
                  <h6>Deposited Plan No.</h6>
                  <Input
                    type="text"
                    name="depositedPlanNumber"
                    onChange={handleFilterRegister}
                    value={filterRegisterInput.depositedPlanNumber}
                    placeholder="Deposited Plan No."
                  />
                </th>
                <th>
                  <h6>Strata Plan</h6>
                  <Input
                    type="text"
                    name="strataPlanNumber"
                    onChange={handleFilterRegister}
                    value={filterRegisterInput.strataPlanNumber}
                    placeholder="Strata Plan"
                  />
                </th>
                <th>
                  <h6>Description</h6>
                  <Input
                    type="text"
                    name="description"
                    onChange={handleFilterRegister}
                    value={filterRegisterInput.description}
                    placeholder="Description"
                  />
                </th>
              </tr>
            </thead>
            <tbody>{renderRegisteredLots()}</tbody>
          </Table>
        </div>
        <div className="unregistered-section">
          <div className="bg-light d-flex align-items-center justify-content-between p-2">
            <h5 className="mb-0">Add/Edit Unregistered Lots</h5>
            <Button
              color="success"
              onClick={() => setAddUnreg(true)}
              type="button"
            >
              + Add
            </Button>
          </div>
          <Table responsive={true} striped={true} hover={true}>
            <thead>
              <tr>
                <th>
                  <h6>Edit</h6>
                </th>
                <th>
                  <h6>Lot No.</h6>
                  <Input
                    type="text"
                    name="lot"
                    onChange={handleFilterUnregister}
                    value={filterUnregisterInput.lot}
                    placeholder="Lot No."
                  />
                </th>
                <th>
                  <h6>Part of Lot</h6>
                  <Input
                    type="text"
                    name="partOfLot"
                    onChange={handleFilterUnregister}
                    value={filterUnregisterInput.partOfLot}
                    placeholder="Part of Lot"
                  />
                </th>
                <th>
                  <h6>Section</h6>
                  <Input
                    type="text"
                    name="section"
                    onChange={handleFilterUnregister}
                    value={filterUnregisterInput.section}
                    placeholder="Section"
                  />
                </th>
                <th>
                  <h6>Plan Number</h6>
                  <Input
                    type="text"
                    name="plan"
                    onChange={handleFilterUnregister}
                    value={filterUnregisterInput.plan}
                    placeholder="Plan Number"
                  />
                </th>
                <th>
                  <h6>Description</h6>
                  <Input
                    type="text"
                    name="description"
                    onChange={handleFilterUnregister}
                    value={filterUnregisterInput.description}
                    placeholder="Description"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="">{renderUnregisteredLots()}</tbody>
          </Table>
        </div>
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            onClick={() => {
              if (formStatus.isFormChanged) {
                return dispatch(
                  updateFormStatusAction({
                    key: "isShowModal",
                    value: true,
                  })
                );
              }
              props.close();
            }}
            color="light"
            disabled={!isEnable}
            type="button"
            className="mx-1"
          >
            Cancel
          </Button>
          <Button
            color="success"
            type="submit"
            disabled={!isEnable}
            className="mx-1"
          >
            Save
          </Button>
        </div>
      </form>
      {addReg && (
        <Modal
          isOpen={addReg}
          toggle={() => {
            if (formStatusNew.isFormChanged) {
              return setFormStatusNew((prev) => ({
                ...prev,
                isShowModal: true,
              }));
            }
            setAddReg(false);
          }}
          backdrop="static"
          centered
          size="lg"
        >
          <ModalHeader
            toggle={() => {
              if (formStatusNew.isFormChanged) {
                return setFormStatusNew((prev) => ({
                  ...prev,
                  isShowModal: true,
                }));
              }
              setAddReg(false);
            }}
            // style={{ background: "inherit", color: "inherit" }}
            // className="border-bottom pb-2"
            className="bg-light p-3"
          >
            Registered Lots
          </ModalHeader>
          <ModalBody>
            <AddRegisteredLots
              tempRegistered={tempRegistered}
              filterRegistered={filterRegistered}
              setFilterRegistered={setFilterRegistered}
              setTempRegistered={setTempRegistered}
              reg={requiredRegistered}
              fieldLength={fieldLength}
              close={() => setAddReg(false)}
              formStatusNew={formStatusNew}
              setFormStatusNew={setFormStatusNew}
            />
          </ModalBody>
        </Modal>
      )}
      {addUnreg && (
        <Modal
          isOpen={addUnreg}
          toggle={() => {
            if (formStatusNew.isFormChanged) {
              return setFormStatusNew((prev) => ({
                ...prev,
                isShowModal: true,
              }));
            }
            setAddUnreg(false);
          }}
          backdrop="static"
          centered
          size="lg"
        >
          <ModalHeader
            toggle={() => {
              if (formStatusNew.isFormChanged) {
                return setFormStatusNew((prev) => ({
                  ...prev,
                  isShowModal: true,
                }));
              }
              setAddUnreg(false);
            }}
            // style={{ background: "inherit", color: "inherit" }}
            // className="border-bottom pb-2"
            className="bg-light p-3"
          >
            Unregistered Lots
          </ModalHeader>
          <ModalBody>
            <AddUnregisteredLots
              tempUnregistered={tempUnregistered}
              setTempUnregistered={setTempUnregistered}
              filterUnregistered={filterUnregistered}
              setFilterUnregistered={setFilterUnregistered}
              unreg={requiredUnregistered}
              fieldLength={fieldLength}
              close={() => setAddUnreg(false)}
              formStatusNew={formStatusNew}
              setFormStatusNew={setFormStatusNew}
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
              setData={handleNewProperty}
              warningData={warningData}
            />
          </ModalBody>
        </Modal>
      )}
      {formStatusNew.isShowModal && (
        <Modal
          isOpen={formStatusNew.isShowModal}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader className="bg-light p-3">
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              message="You have unsaved data in your form are you sure you want to
                        discard the changes?"
              closeForm={() => {
                setFormStatusNew((prev) => ({ ...prev, isShowModal: false }));
              }}
              btn1={"No"}
              btn2="Yes"
              handleFunc={() => {
                setFormStatusNew({ isFormChanged: false, isShowModal: false });
                setAddReg(false);
                setAddUnreg(false);
              }}
            />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

export default AddProperty;
