import React, { useState, useEffect, useMemo } from "react";
import closeBtn from "../../images/close-white-btn.svg";
import { TextField } from "@mui/material";
import { withStyles } from "@mui/styles";
import { v1 as uuidv1 } from "uuid";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { editPropertyDetails, deleteUnregisteredLot } from "../../apis";
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
      required={submitted && props.required}
    />
  );
};

const ConfirmationPopup = (props) => {
  const {
    unregDetails,
    closePopup,
    setIsEditTrue,
    refreshData,
    setDisableButton,
  } = props;
  const handleDelete = () => {
    deleteUnregisteredLot(unregDetails.id)
      .then((response) => {
        // window.location.reload();
        // setBoolVal(false);
        refreshData();
        setDisableButton(false);
        setIsEditTrue(false);
        closePopup();
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
            onClick={() => {
              closePopup();
              setDisableButton(false);
            }}
            type="button"
            className="mx-1"
          >
            No
          </Button>
          <Button
            color="success"
            onClick={handleDelete}
            type="button"
            className="mx-1"
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

function EditUnRegFormPopup(props) {
  const {
    setIsEditTrue,
    unregDetails,
    specifiedDetails,
    fetchPropertyData,
    requiredUnreg,
    fieldLength,
    setShowAlert,
    setAlertMsg,
    formStatusNew,
    setFormStatusNew,
  } = props;
  const [chotaFormUn, setChotaFormUn] = useState(unregDetails);
  const [openConfirm, setOpenConfirm] = useState(false);
  // const [cookies, setCookie, removeCookie] = useCookies(['token']);
  // const loggedInToken = cookies.token;

  const isChanged = useMemo(() => {
    return JSON.stringify(chotaFormUn) !== JSON.stringify(unregDetails);
  }, [chotaFormUn, unregDetails]);

  useEffect(() => {
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [isChanged]);

  const [disableButton, setDisableButton] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function chotaSave(e) {
    e.preventDefault();

    if (
      requiredUnreg.indexOf("lot".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("partOfLot".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("section".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("plan".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("description".toLowerCase()) >= 0
    ) {
      setSubmitted(true);
    }

    setDisableButton(true);
    const dataToBeSent = {
      ...specifiedDetails,
      unregisteredProperties: [{ id: unregDetails.id, ...chotaFormUn }],
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
                      value={chotaFormUn?.lot}
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
                      invalidMessage="Please enter lot number"
                      maxLength={fieldLength["lot".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4">
                    <TextInputField
                      label="Part of lot"
                      name="partOfLot"
                      placeholder="Part of lot"
                      value={chotaFormUn?.partOfLot}
                      onChange={(e) => {
                        setChotaFormUn({
                          ...chotaFormUn,
                          partOfLot: e.target.value,
                        });
                      }}
                      required={
                        submitted &&
                        requiredUnreg.indexOf("partOfLot".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      maxLength={fieldLength["partOfLot".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4">
                    <TextInputField
                      label="Section"
                      name="section"
                      placeholder="Section"
                      value={chotaFormUn?.section}
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
                      invalidMessage="Please enter section"
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
                      invalidMessage="Please enter plan number"
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
                    value={chotaFormUn.description}
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
                    invalidMessage="Please enter description"
                    maxLength={fieldLength["description".toLowerCase()]}
                    rows="3"
                    cols="55"
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
              unregDetails={unregDetails}
              setIsEditTrue={setIsEditTrue}
              setDisableButton={setDisableButton}
              refreshData={() => fetchPropertyData(specifiedDetails.id)}
            />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

export default EditUnRegFormPopup;
