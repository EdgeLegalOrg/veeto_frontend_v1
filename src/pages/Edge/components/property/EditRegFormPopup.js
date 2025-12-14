import React, { useState, useEffect, useMemo } from "react";
// import axios from 'axios';
// import url from '../../config.js';
// import { useCookies } from 'react-cookie';
import { v1 as uuidv1 } from "uuid";
import closeBtn from "../../images/close-white-btn.svg";
import { TextField } from "@mui/material";
import { withStyles } from "@mui/styles";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { editPropertyDetails, deleteRegisteredLot } from "../../apis";
import { TextInputField } from "pages/Edge/components/InputField";
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

const ConfirmationPopup = (props) => {
  const {
    regDetails,
    closePopup,
    setIsEditTrue,
    refreshData,
    setDisableButton,
  } = props;
  const handleDelete = () => {
    deleteRegisteredLot(regDetails.id)
      .then((response) => {
        // window.location.reload();
        closePopup();
        setDisableButton(false);
        setIsEditTrue(false);
        // setBoolVal(false);
        refreshData();
      })
      .catch((err) => {
        console.error(err);
        setDisableButton(false);
      });
  };

  return (
    <div>
      <div>
        <div
          className="confirmation-header"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
          }}
        >
          <h2 className="confirmation-heading mb-0" style={{ color: "#fff" }}>
            Confirm Your Action
          </h2>
          <button
            className="close-form-btn"
            onClick={() => {
              closePopup();
              setDisableButton(false);
            }}
            type="button"
          >
            {" "}
            <img src={closeBtn} alt="close-btn" />
          </button>
        </div>
        <div className="p-4">
          <p>Are you sure you want to delete the record?</p>
        </div>
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            color="danger"
            type="button"
            onClick={() => {
              closePopup();
              setDisableButton(false);
            }}
            className="mx-1"
          >
            No
          </Button>
          <Button
            color="success"
            type="button"
            onClick={handleDelete}
            className="mx-1"
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

function EditRegFormPopup(props) {
  const {
    regDetails,
    setIsEditTrue,
    specifiedDetails,
    setBoolVal,
    fetchPropertyData,
    requiredReg,
    fieldLength,
    setAlertMsg,
    setShowAlert,
    formStatusNew,
    setFormStatusNew,
  } = props;
  const [chotaForm, setChotaForm] = useState(regDetails);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isChanged = useMemo(() => {
    return JSON.stringify(chotaForm) !== JSON.stringify(regDetails);
  }, [chotaForm, regDetails]);

  useEffect(() => {
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [isChanged]);

  const requiredFields = JSON.parse(
    window.localStorage.getItem("metaData")
  )?.registered_property?.fields?.filter((f) => {
    if (f.mandatory) {
      return f.fieldName;
    }
  });

  async function chotaSave(e) {
    e.preventDefault();
    if (
      requiredReg.indexOf("titleReference".toLowerCase()) >= 0 ||
      requiredReg.indexOf("lotNumber".toLowerCase()) >= 0 ||
      requiredReg.indexOf("section".toLowerCase()) >= 0 ||
      requiredReg.indexOf("depositedPlanNumber".toLowerCase()) >= 0 ||
      requiredReg.indexOf("strataPlanNumber".toLowerCase()) >= 0 ||
      requiredReg.indexOf("description".toLowerCase()) >= 0
    ) {
      setSubmitted(true);
      return;
    }

    setDisableButton(true);
    const dataToBeSent = {
      ...specifiedDetails,
      registeredProperties: [{ id: regDetails.id, ...chotaForm }],
    };

    try {
      const { data } = await editPropertyDetails({
        requestId: uuidv1(),
        data: dataToBeSent,
      });

      if (data.success) {
        fetchPropertyData(specifiedDetails.id);
      } else {
        setShowAlert(true);
        setAlertMsg(data?.error?.message);
      }
      setDisableButton(false);
      setFormStatusNew({ isFormChanged: false, isShowModal: false });
      setIsEditTrue(false);
    } catch (error) {
      setDisableButton(false);
      console.error(error);
    }
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
                    rows="3"
                    cols="55"
                    value={chotaForm.description}
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
              <Button
                disabled={disableButton}
                color="danger"
                onClick={() => {
                  setDisableButton(true);
                  setOpenConfirm(true);
                }}
                type="button"
                className="mx-1"
              >
                Delete
              </Button>
              <Button
                disabled={disableButton}
                color="warning"
                onClick={() => {
                  if (formStatusNew.isFormChanged) {
                    return setFormStatusNew((prev) => ({
                      ...prev,
                      isShowModal: true,
                    }));
                  }
                  setIsEditTrue(false);
                }}
                type="button"
                className="mx-1"
              >
                Cancel
              </Button>
              <Button
                disabled={disableButton}
                type="submit"
                color="success"
                className="mx-1"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
      {openConfirm && (
        <Modal
          isOpen={openConfirm}
          toggle={() => setOpenConfirm(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setOpenConfirm(false)}
            // style={{ background: "inherit", color: "inherit" }}
            // className="border-bottom"
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <ConfirmationPopup
              closePopup={() => setOpenConfirm(false)}
              regDetails={regDetails}
              setBoolVal={setBoolVal}
              setIsEditTrue={setIsEditTrue}
              refreshData={() => fetchPropertyData(specifiedDetails.id)}
              setDisableButton={setDisableButton}
            />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

export default EditRegFormPopup;
