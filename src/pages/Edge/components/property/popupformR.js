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
import { set } from "lodash";

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

function PopupForm(props) {
  const {
    modalId,
    tempRegistered,
    setTempRegistered,
    specifiedDetails,
    isAddTrue,
    setBoolVal,
    setIsPopRForm,
    fetchPropertyData,
    requiredReg,
    fieldLength,
    formStatusNew,
    setFormStatusNew,
  } = props;
  const initialFormState = {
    titleReference: "",
    lotNumber: "",
    depositedPlanNumber: "",
    strataPlanNumber: "",
    section: "",
    description: "",
  };
  const [chotaForm, setChotaForm] = useState(initialFormState);

  const isChanged = useMemo(() => {
    return JSON.stringify(chotaForm) !== JSON.stringify(initialFormState);
  }, [chotaForm, initialFormState]);

  useEffect(() => {
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [isChanged]);

  const [disableButton, setDisableButton] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // const [cookies, setCookie, removeCookie] = useCookies(['token']);
  // const loggedInToken = cookies.token;

  function chotaSave(e) {
    e.preventDefault();
    if (
      requiredReg.indexOf("titleReference".toLowerCase()) >= 0 ||
      requiredReg.indexOf("lotNumber".toLowerCase()) >= 0 ||
      requiredReg.indexOf("depositedPlanNumber".toLowerCase()) >= 0 ||
      requiredReg.indexOf("strataPlanNumber".toLowerCase()) >= 0 ||
      requiredReg.indexOf("section".toLowerCase()) >= 0 ||
      requiredReg.indexOf("description".toLowerCase()) >= 0
    ) {
      return setSubmitted(true);
    }

    setDisableButton(true);
    const dataToBeSent = {
      ...specifiedDetails,
      registeredProperties: [...tempRegistered, chotaForm],
    };

    editPropertyDetails({
      requestId: uuidv1(),
      data: dataToBeSent,
    })
      .then((response) => {
        fetchPropertyData(specifiedDetails.id);
        setDisableButton(false);
        setFormStatusNew({ isFormChanged: false, isShowModal: false });
        setIsPopRForm(false);
      })
      .catch((err) => {
        console.error(err);
        setDisableButton(false);
      });
  }
  return (
    <div>
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
                Registered Lots
              </h5>
            </div>
            <div className="">
              <div style={{ padding: "12px" }}>
                <div className="row">
                  <div className="col-4">
                    <TextInputField
                      label="Title Reference"
                      name="titleReference"
                      placeholder="Title Reference"
                      value={chotaForm?.titleReference}
                      onChange={(e) => {
                        setChotaForm({
                          ...chotaForm,
                          titleReference: e.target.value,
                        });
                      }}
                      required={
                        requiredReg.indexOf("titleReference".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalid={
                        submitted &&
                        requiredReg.indexOf("titleReference".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This is a required field"
                      maxLength={fieldLength["titleReference".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4">
                    <TextInputField
                      label="Lot No."
                      name="lotNumber"
                      placeholder="Lot No."
                      value={chotaForm?.lotNumber}
                      onChange={(e) => {
                        setChotaForm({
                          ...chotaForm,
                          lotNumber: e.target.value,
                        });
                      }}
                      required={
                        requiredReg.indexOf("lotNumber".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalid={
                        submitted &&
                        requiredReg.indexOf("lotNumber".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This is a required field"
                      maxLength={fieldLength["lotNumber".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4">
                    <TextInputField
                      label="Section"
                      name="section"
                      placeholder="Section"
                      value={chotaForm?.section}
                      onChange={(e) => {
                        setChotaForm({
                          ...chotaForm,
                          section: e.target.value,
                        });
                      }}
                      required={
                        requiredReg.indexOf("section".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalid={
                        submitted &&
                        requiredReg.indexOf("section".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This is a required field"
                      maxLength={fieldLength["section".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4 mt-4">
                    <TextInputField
                      label="Deposited Plan No."
                      name="depositedPlanNumber"
                      placeholder="Deposited Plan No."
                      value={chotaForm?.depositedPlanNumber}
                      onChange={(e) => {
                        setChotaForm({
                          ...chotaForm,
                          depositedPlanNumber: e.target.value,
                        });
                      }}
                      required={
                        requiredReg.indexOf(
                          "depositedPlanNumber".toLowerCase()
                        ) >= 0
                          ? true
                          : false
                      }
                      invalid={
                        submitted &&
                        requiredReg.indexOf(
                          "depositedPlanNumber".toLowerCase()
                        ) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This is a required field"
                      maxLength={
                        fieldLength["depositedPlanNumber".toLowerCase()]
                      }
                    />
                  </div>
                  <div className="col-4 mt-4">
                    <TextInputField
                      label="Strata Plan No."
                      name="strataPlanNumber"
                      placeholder="Strata Plan No."
                      value={chotaForm?.strataPlanNumber}
                      onChange={(e) => {
                        setChotaForm({
                          ...chotaForm,
                          strataPlanNumber: e.target.value,
                        });
                      }}
                      required={
                        requiredReg.indexOf("strataPlanNumber".toLowerCase()) >=
                        0
                          ? true
                          : false
                      }
                      invalid={
                        submitted &&
                        requiredReg.indexOf("strataPlanNumber".toLowerCase()) >=
                          0
                          ? true
                          : false
                      }
                      invalidMessage="This is a required field"
                      maxLength={fieldLength["strataPlanNumber".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4"></div>
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
                    rows="3"
                    cols="55"
                    value={chotaForm.description ? chotaForm.description : ""}
                    placeholder={`Description ${
                      requiredReg.indexOf("description") >= 0 ? "*" : ""
                    }`}
                    onChange={(e) => {
                      setChotaForm({
                        ...chotaForm,
                        description: e.target.value,
                      });
                    }}
                    required={
                      requiredReg.indexOf("description".toLowerCase()) >= 0
                        ? true
                        : false
                    }
                    invalid={
                      submitted &&
                      requiredReg.indexOf("description".toLowerCase()) >= 0
                        ? true
                        : false
                    }
                    invalidMessage="This is a required field"
                    maxLength={fieldLength["description".toLowerCase()]}
                  />
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end p-2 border-top">
              {isAddTrue === true && (
                <Button color="danger" type="button" className="mx-1">
                  Delete
                </Button>
              )}
              <Button
                color="warning"
                disabled={disableButton}
                onClick={() => {
                  if (formStatusNew.isFormChanged) {
                    return setFormStatusNew((prev) => ({
                      ...prev,
                      isShowModal: true,
                    }));
                  }
                  setIsPopRForm(false);
                }}
                type="button"
                className="mx-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={disableButton}
                color="success"
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

export default PopupForm;
