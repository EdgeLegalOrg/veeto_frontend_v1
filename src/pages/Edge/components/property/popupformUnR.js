import React, { useState, useEffect, useMemo } from "react";
// import axios from 'axios';
// import url from '../../config.js';
// import { useCookies } from 'react-cookie';
import { v1 as uuidv1 } from "uuid";
import { TextField } from "@mui/material";
import { withStyles } from "@mui/styles";
import { Button } from "reactstrap";
import { editPropertyDetails } from "../../apis";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";
import "../../stylesheets/property.css";

const CssTextField = withStyles({
  root: {
    "& label.Mui-focused": {
      color: "#1890FF",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#1890FF",
    },
  },
})(TextField);

const CustomTextInput = (props) => {
  return (
    <CssTextField
      {...props}
      label={
        props.value && props.value?.length === props.maxLength
          ? `${props.label} (Maximum limit reached)`
          : props.label
      }
      style={{
        width: 180,
        height: 40,
        marginRight: 7,
        marginLeft: 9,
        marginBottom: 10,
        // marginTop: '1rem',
        outline: "none",
      }}
      InputLabelProps={{
        style: {
          fontSize: 14,
          fontFamily: "inherit",
          // color: 'rgb(94, 94, 94)',
          color: `${
            props.value && props.value?.length === props.maxLength ? "red" : ""
          }`,
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
        maxLength: props.maxLength,
      }}
      type="text"
      invalid={submitted && props.required}
    />
  );
};

function PopupFormUnR(props) {
  const {
    modalId,
    // addBtn,
    tempUnregistered,
    // setTempUnregistered,
    specifiedDetails,
    isAddTrue,
    setBoolVal,
    setIsPopUForm,
    fetchPropertyData,
    requiredUnreg,
    fieldLength,
    formStatusNew,
    setFormStatusNew,
  } = props;

  // const [cookies, setCookie, removeCookie] = useCookies(['token']);
  // const loggedInToken = cookies.token;
  const initialFormState = {
    lot: "",
    partOfLot: "",
    section: "",
    plan: "",
    description: "",
  };
  const [chotaFormUn, setChotaFormUn] = useState(initialFormState);

  const [disableButton, setDisableButton] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isChanged = useMemo(() => {
    return JSON.stringify(chotaFormUn) !== JSON.stringify(initialFormState);
  }, [chotaFormUn, initialFormState]);

  useEffect(() => {
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [isChanged]);

  function chotaSave(e) {
    e.preventDefault();

    if (
      requiredUnreg.indexOf("lot".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("partOfLot".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("section".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("plan".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("description".toLowerCase()) >= 0
    ) {
      return setSubmitted(true);
    }

    setDisableButton(true);
    const dataToBeSent = {
      ...specifiedDetails,
      unregisteredProperties: [...tempUnregistered, chotaFormUn],
    };
    // axios
    //   .put(
    //     `${url}/api/property`,
    //     {
    //       requestId: '1123445',
    //       data: dataToBeSent,
    //     },
    //     {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${loggedInToken}`,
    //       },
    //     },
    //     {
    //       withCredentials: true,
    //     }
    //   )
    editPropertyDetails({
      requestId: uuidv1(),
      data: dataToBeSent,
    })
      .then((response) => {
        // window.location.reload();
        // setBoolVal(false);
        setDisableButton(false);
        fetchPropertyData(specifiedDetails.id);
        setFormStatusNew({ isFormChanged: false, isShowModal: false });
        setIsPopUForm(false);
      })
      .catch((err) => {
        console.error(err);
        setDisableButton(false);
      });
  }

  return (
    <div className="">
      <div className="">
        <form onSubmit={chotaSave}>
          <div className="">
            <div
              className="modal-header"
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 16px",
              }}
            >
              <h5
                style={{ marginRight: "10%", color: "#fff" }}
                className="modal-title"
                id="staticBackdropLabel"
              >
                Unregistered Lots
              </h5>
            </div>
            <div className="">
              <div style={{ padding: "12px" }}>
                <div className="row">
                  <div className="col-4">
                    <TextInputField
                      label="Lot No."
                      name="lot"
                      placeholder="Lot No."
                      value={chotaFormUn.lot}
                      onChange={(e) => {
                        setChotaFormUn({
                          ...chotaFormUn,
                          lot: e.target.value,
                        });
                      }}
                      required={requiredUnreg.indexOf("lot".toLowerCase()) >= 0}
                      invalid={
                        submitted &&
                        requiredUnreg.indexOf("lot".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
                      maxLength={fieldLength["lot".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4">
                    <TextInputField
                      label="Part of lot"
                      name="partOfLot"
                      placeholder="Part of lot"
                      value={chotaFormUn.partOfLot}
                      onChange={(e) => {
                        setChotaFormUn({
                          ...chotaFormUn,
                          partOfLot: e.target.value,
                        });
                      }}
                      required={
                        requiredUnreg.indexOf("partOfLot".toLowerCase()) >= 0
                      }
                      invalid={
                        submitted &&
                        requiredUnreg.indexOf("partOfLot".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
                      maxLength={fieldLength["partOfLot".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4">
                    <TextInputField
                      label="Section"
                      name="section"
                      placeholder="Section"
                      value={chotaFormUn.section}
                      onChange={(e) => {
                        setChotaFormUn({
                          ...chotaFormUn,
                          section: e.target.value,
                        });
                      }}
                      required={
                        requiredUnreg.indexOf("section".toLowerCase()) >= 0
                      }
                      invalid={
                        submitted &&
                        requiredUnreg.indexOf("section".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
                      maxLength={fieldLength["section".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4 mt-4" style={{ marginTop: "15px" }}>
                    <TextInputField
                      label="Plan No."
                      name="plan"
                      placeholder="Plan No."
                      value={chotaFormUn.plan}
                      onChange={(e) => {
                        setChotaFormUn({
                          ...chotaFormUn,
                          plan: e.target.value,
                        });
                      }}
                      required={
                        requiredUnreg.indexOf("plan".toLowerCase()) >= 0
                      }
                      invalid={
                        submitted &&
                        requiredUnreg.indexOf("plan".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
                      maxLength={fieldLength["plan".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4 mt-4"></div>
                  <div className="col-4 mt-4"></div>
                </div>
                <div
                  className="mt-4 form-group"
                  style={{
                    padding: "0 15px",
                  }}
                >
                  <TextInputField
                    label="Description"
                    type="textarea"
                    value={
                      chotaFormUn.description ? chotaFormUn.description : ""
                    }
                    placeholder={`Description ${
                      requiredUnreg.indexOf("description") >= 0 ? "*" : ""
                    }`}
                    onChange={(e) => {
                      setChotaFormUn({
                        ...chotaFormUn,
                        description: e.target.value,
                      });
                    }}
                    required={
                      requiredUnreg.indexOf("description".toLowerCase()) >= 0
                    }
                    invalid={
                      submitted &&
                      requiredUnreg.indexOf("description".toLowerCase()) >= 0
                        ? true
                        : false
                    }
                    invalidMessage="This field is required"
                    maxLength={fieldLength["description".toLowerCase()]}
                    rows="3"
                    cols="55"
                  />
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end p-2 border-top">
              {/* <button className="propertyPageBtns">Delete</button> */}
              <Button
                color="warning"
                // data-bs-toggle='modal'
                // data-bs-target={`#staticBackdrop${modalId}`}
                // aria-label='Close'
                disabled={disableButton}
                type="button"
                onClick={() => {
                  if (formStatusNew.isFormChanged) {
                    return setFormStatusNew((prev) => ({
                      ...prev,
                      isShowModal: true,
                    }));
                  }
                  setIsPopUForm(false);
                }}
                className="mx-1"
              >
                Cancel
              </Button>
              {isAddTrue === true && (
                <Button color="danger" type="button" className="mx-1">
                  Delete
                </Button>
              )}
              <Button
                // data-bs-toggle='modal'
                // data-bs-target={`#staticBackdrop${modalId}`}
                disabled={disableButton}
                color="success"
                type="submit"
                className="mx-1"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PopupFormUnR;
