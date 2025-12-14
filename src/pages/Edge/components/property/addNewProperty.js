import React, { useState, useEffect } from "react";
import "../../stylesheets/property.css";
import axios from "axios";
import NewRegisteredLots from "./NewRegisteredLots.js";
import NewUnregisteredLots from "./NewUnregisteredLots";

import url from "../../config.js";
import { v1 as uuidv1 } from "uuid";
import { useCookies } from "react-cookie";
import AddRegisteredLots from "./AddRegisteredLots";
import AddUnregisteredLots from "./AddUnregisteredLots";
import { FormControl, InputLabel, Select, TextField } from "@mui/material";

const initialRegLot = {
  depositedPlanNumber: "",
  description: "",
  lotNumber: "",
  section: "",
  strataPlanNumber: "",
  titleReference: "",
};

const initialUnRegLot = {
  description: "",
  lot: "",
  partOfLot: "",
  plan: "",
  section: "",
};

const CustomTextInput = (props) => {
  return (
    <TextField
      {...props}
      style={{
        width: 200,
        height: 40,
        marginRight: 7,
        marginLeft: 9,
        marginTop: "1rem",
        outline: "none",
      }}
      InputLabelProps={{
        style: {
          fontSize: 14,
          fontFamily: "inherit",
          color: "rgb(94, 94, 94)",
          marginLeft: 10,
        },
      }}
      inputProps={{
        style: {
          fontSize: 14,
          fontFamily: "inherit",
          color: "rgb(94, 94, 94)",
          marginLeft: 10,
        },
      }}
      type="text"
      required={props.required}
    />
  );
};

function AddNewProperty(props) {
  const { modalId, isEditTrue, setIsEditTrue, setBoolVal, allCountries } =
    props;
  const [buildingName, setBuildingName] = useState("");
  const [unit, setUnit] = useState("");
  const [streetNo, setStreetNo] = useState("");
  const [street, setStreet] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");
  const [postCode, setPostCode] = useState("");
  const [country, setCountry] = useState("");
  const [current, setCurrent] = useState("general");
  const [tempRegistered, setTempRegistered] = useState([]);
  const [tempUnregistered, setTempUnregistered] = useState([]);

  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const loggedInToken = cookies.token;
  const [isBool, setIsBool] = useState(false);
  const [states, setStates] = useState([]);
  const [requiredGeneral, setRequiredGeneral] = useState([]);
  const [requiredRegistered, setRequiredRegistered] = useState([]);
  const [requiredUnregistered, setRequiredUnregistered] = useState([]);

  const fetchRequired = () => {
    let general = [];
    JSON.parse(window.localStorage.getItem("metaData"))?.property?.fields?.map(
      (f) => {
        if (f.mandatory) {
          general.push(f.fieldName.toLowerCase());
        }
      }
    );
    setRequiredGeneral(general);
    let reg = [];
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.registered_property?.fields?.map((f) => {
      if (f.mandatory) {
        reg.push(f.fieldName.toLowerCase());
      }
    });
    setRequiredRegistered(reg);
    let unreg = [];
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.unregistered_property?.fields?.map((f) => {
      if (f.mandatory) {
        unreg.push(f.fieldName.toLowerCase());
      }
    });
    setRequiredUnregistered(unreg);
  };

  useEffect(async () => {
    if (!isBool && allCountries?.length !== 0) {
      fetchRequired();
      setCountry(allCountries[0].id);
      setStates(allCountries[0].states);
      setState(allCountries[0].states[0].id);
      setIsBool(true);
    }
  }, [isBool, loggedInToken, allCountries]);

  const handleSetInitial = () => {
    setBuildingName("");
    setUnit("");
    setStreetNo("");
    setStreet("");
    setSuburb("");
    setState("");
    setPostCode("");
    setCountry("");
    setCurrent("general");
    setTempRegistered([]);
    setTempUnregistered([]);
    setIsBool(false);
  };

  const handleChangeCountry = (e) => {
    const index = e.target.value;
    const selectedCountry = allCountries[index];
    setCountry(selectedCountry.id);
    setStates(selectedCountry.states);
    setState(selectedCountry.states[0].id);
  };

  const checkAllGeneral = () => (country !== "" && state !== "" ? true : false);

  function renderRegisteredLots() {
    return tempRegistered?.map((registeredLot, ind) => {
      return (
        <NewRegisteredLots
          modal={9}
          registeredLot={registeredLot}
          setTempRegistered={setTempRegistered}
          tempRegistered={tempRegistered}
          index={ind}
        />
      );
    });
  }

  function renderUnregisteredLots() {
    return tempUnregistered?.map((unregisteredLot, ind) => {
      return (
        <NewUnregisteredLots
          modal={10}
          unregisteredLot={unregisteredLot}
          setTempUnregistered={setTempUnregistered}
          tempUnregistered={tempUnregistered}
          index={ind}
        />
      );
    });
  }

  function renderGeneral() {
    return (
      <div className="generalDiv">
        <div className="row ">
          <div className="col-4">
            <CustomTextInput
              name="buildingName"
              label="Building Name"
              value={buildingName}
              onChange={(e) => {
                setBuildingName(e.target.value);
              }}
              required={
                requiredGeneral.indexOf("buildingName".toLowerCase()) >= 0
                  ? true
                  : false
              }
            />
          </div>
          <div className="col-4">
            <CustomTextInput
              name="unit"
              label="Unit"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
              }}
              required={
                requiredGeneral.indexOf("unit".toLowerCase()) >= 0
                  ? true
                  : false
              }
            />
          </div>
          <div className="col-4">
            <CustomTextInput
              name="streetNo"
              label="Street No"
              value={streetNo}
              onChange={(e) => {
                setStreetNo(e.target.value);
              }}
              required={
                requiredGeneral.indexOf("streetNo".toLowerCase()) >= 0
                  ? true
                  : false
              }
            />
          </div>
          <div className="col-4">
            <CustomTextInput
              name="street"
              label="Street"
              value={street}
              onChange={(e) => {
                setStreet(e.target.value);
              }}
              required={
                requiredGeneral.indexOf("street".toLowerCase()) >= 0
                  ? true
                  : false
              }
            />
          </div>
          <div className="col-4">
            <CustomTextInput
              name="suburb"
              label="Suburb"
              value={suburb}
              onChange={(e) => {
                setSuburb(e.target.value);
              }}
              required={
                requiredGeneral.indexOf("suburb".toLowerCase()) >= 0
                  ? true
                  : false
              }
            />
          </div>
          <div className="col-4">
            <CustomTextInput
              name="postCode"
              label="Post Code"
              value={postCode}
              onChange={(e) => {
                setPostCode(e.target.value);
              }}
              required={
                requiredGeneral.indexOf("postCode".toLowerCase()) >= 0
                  ? true
                  : false
              }
            />
          </div>
          <div className="col-4 rowWise">
            <FormControl
              style={{
                width: 200,
                height: 50,
                marginRight: 7,
                marginLeft: 9,
                marginBottom: 10,
                marginTop: "1.2rem",
                outline: "none",
              }}
              required={
                requiredGeneral.indexOf("state".toLowerCase()) >= 0
                  ? true
                  : false
              }
            >
              <InputLabel
                id="demo-simple-select-helper-label"
                style={{
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: "rgb(94, 94, 94)",
                  marginLeft: 9,
                }}
              >
                State
              </InputLabel>
              <Select
                native
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                style={{
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: "rgb(94, 94, 94)",
                }}
                inputProps={{
                  style: {
                    fontSize: 14,
                    fontFamily: "inherit",
                    color: "rgb(94, 94, 94)",
                    padding: 5,
                  },
                }}
                name="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option
                  aria-label="State"
                  selected
                  disabled
                  style={{ display: "none" }}
                  value=""
                />
                {states.map((s) => (
                  <option value={s.id} key={s.id} selected={state === s.id}>
                    {s.stateName}
                  </option>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="col-4 rowWise">
            <FormControl
              style={{
                width: 200,
                height: 50,
                marginRight: 7,
                marginLeft: 9,
                marginBottom: 10,
                marginTop: "1.2rem",
                outline: "none",
              }}
              required={
                requiredGeneral.indexOf("country".toLowerCase()) >= 0
                  ? true
                  : false
              }
            >
              <InputLabel
                id="demo-simple-select-helper-label"
                style={{
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: "rgb(94, 94, 94)",
                  marginLeft: 9,
                }}
              >
                Country
              </InputLabel>
              <Select
                native
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                style={{
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: "rgb(94, 94, 94)",
                }}
                inputProps={{
                  style: {
                    fontSize: 14,
                    fontFamily: "inherit",
                    color: "rgb(94, 94, 94)",
                    padding: 5,
                  },
                }}
                name="country"
                value={country}
                onChange={handleChangeCountry}
              >
                <option
                  aria-label="Country"
                  selected
                  disabled
                  style={{ display: "none" }}
                  value=""
                />
                {allCountries.map((c, index) => (
                  <option value={index} key={c.id} selected={country === c.id}>
                    {c.countryName}
                  </option>
                ))}
              </Select>
            </FormControl>
            {/**<input
              type='text'
              value={state}
              onChange={(e) => {
                setState(e.target.value);
              }}
            /> */}
          </div>
        </div>
      </div>
    );
  }

  function renderAttachedLots() {
    return (
      <div>
        <div className="2">
          <div className="bg-light d-flex align-items-center justify-content-between p-2">
            <h5 className="mb-0">Add/Edit Registered Lots</h5>
            <button
              className="propertyPageBtns"
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop4"
              onClick={() => {
                setIsEditTrue(false);
              }}
            >
              + Add
            </button>
            <AddRegisteredLots
              modalId={4}
              tempRegistered={tempRegistered}
              setTempRegistered={setTempRegistered}
              reg={requiredRegistered}
            />
          </div>
          <div className="propertyPagesubHeads">
            <div className="row">
              <div className="col-1">
                <h6>Edit</h6>
              </div>
              <div className="col-2">
                <h6>Title Ref</h6>
                {/*<input type='text'></input> */}
              </div>
              <div className="col-1">
                <h6>LotNo.</h6>
                {/*<input type='text'></input> */}
              </div>
              <div className="col-1">
                <h6>Section</h6>
                {/*<input type='text'></input> */}
              </div>
              <div className="col-3">
                <h6>Deposited Plan No.</h6>
                {/*<input type='text'></input> */}
              </div>
              <div className="col-2">
                <h6>Strata Plan</h6>
                {/*<input type='text'></input> */}
              </div>
              <div className="col-2">
                <h6>Description</h6>
                {/*<input type='text'></input> */}
              </div>
            </div>
            <div className="lotsScrollDiv">{renderRegisteredLots()}</div>
          </div>
        </div>
        <div className="3">
          <div className="bg-light d-flex align-items-center justify-content-between p-2">
            <h5 className="mb-0">Add/Edit Unregistered Lots</h5>
            <button
              className="propertyPageBtns"
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop5"
            >
              + Add
            </button>
            <AddUnregisteredLots
              modalId={5}
              tempUnregistered={tempUnregistered}
              setTempUnregistered={setTempUnregistered}
              unreg={requiredUnregistered}
            />
          </div>
          <div className="propertyPagesubHeads">
            <div className="row">
              <div className="col-1">
                <h6>Edit</h6>
              </div>
              <div className="col-2">
                <h6>LotNo.</h6>
                {/*<input type='text'></input> */}
              </div>
              <div className="col-2">
                <h6>Part of Lot</h6>
                {/*<input type='text'></input> */}
              </div>
              <div className="col-1">
                <h6>Section</h6>
                {/*<input type='text'></input> */}
              </div>
              <div className="col-3">
                <h6>Plan Number</h6>
                {/*<input type='text'></input> */}
              </div>
              <div className="col-3">
                <h6>Description</h6>
                {/*<input type='text'></input> */}
              </div>
            </div>
            <div className="lotsScrollDiv">{renderUnregisteredLots()}</div>
          </div>
        </div>
      </div>
    );
  }

  function onSave() {
    const data = {
      buildingName: buildingName,
      unit: unit,
      streetNo: streetNo,
      street: street,
      suburb: suburb,
      state: state,
      postCode: postCode,
      country: country,
      registeredProperties: tempRegistered,
      unregisteredProperties: tempUnregistered,
    };

    axios
      .post(
        `${url}/api/property`,
        {
          requestId: uuidv1(),
          data: data,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loggedInToken}`,
          },
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        handleSetInitial();
        setBoolVal(false);
      });
  }

  return (
    <div
      className="modal fade"
      id="staticBackdrop3"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content popupNewProperty">
          <div className="modal-header">
            <h5 className="modal-title white" id="staticBackdropLabel">
              Add New Property
            </h5>
            <p
              style={{ cursor: "pointer" }}
              data-bs-dismiss="modal"
              onClick={handleSetInitial}
            >
              &#10006;
            </p>
          </div>
          <div className="newPropertyBtnTray">
            <div>
              <button
                className={
                  current === "general"
                    ? "newPropertyMainBtns newPropertyMainBtnsClicked"
                    : "newPropertyMainBtns"
                }
                onClick={() => {
                  setCurrent("general");
                }}
              >
                General
              </button>
              <button
                disabled={!checkAllGeneral()}
                className={
                  current === "attached"
                    ? "newPropertyMainBtns newPropertyMainBtnsClicked"
                    : "newPropertyMainBtns"
                }
                onClick={() => {
                  setCurrent("attached");
                }}
              >
                Attached Lots
              </button>
            </div>
            <div
              style={{
                width: "180px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              {current === "general" ? (
                <button
                  disabled={!checkAllGeneral()}
                  onClick={() => {
                    setCurrent("attached");
                  }}
                  className="propertyPageBtns"
                >
                  Next
                </button>
              ) : (
                <button
                  data-bs-dismiss="modal"
                  className="propertyPageBtns"
                  onClick={() => {
                    onSave();
                  }}
                >
                  Save
                </button>
              )}
              <button
                className="propertyPageBtns"
                data-bs-dismiss="modal"
                onClick={handleSetInitial}
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="modal-body">
            {current === "general" ? renderGeneral() : renderAttachedLots()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddNewProperty;
