import React, { useState, useEffect } from "react";
import "../../stylesheets/property.css";
import { TextField } from "@mui/material";
import { withStyles } from "@mui/styles";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { FiEdit2 } from "react-icons/fi";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";

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
    />
  );
};

const EditForm = (props) => {
  const {
    regDetails,
    setIsEditTrue,
    handleDeleteTempReg,
    setTempRegistered,
    setFilterRegistered,
    tempRegistered,
    index,
    fieldLength,
    requiredReg,
    formStatusNew,
    setFormStatusNew,
  } = props;
  const [chotaForm, setChotaForm] = useState(regDetails);
  const [submitted, setSubmitted] = useState(false);
  // const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    const isChanged = JSON.stringify(chotaForm) !== JSON.stringify(regDetails);
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [chotaForm, regDetails]);

  function chotaSave(e) {
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
    }

    let list = [...tempRegistered];
    list[index] = chotaForm;
    setTempRegistered(list);
    setFilterRegistered(list);
    setFormStatusNew({ isFormChanged: false, isShowModal: false });
    setIsEditTrue(false);
  }

  const deleteRegLot = () => {
    let list = [...tempRegistered];
    list.splice(index, 1);

    handleDeleteTempReg(list);
    setIsEditTrue(false);
  };

  return (
    <div>
      <div className="">
        <form>
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
                  <div className="col-4 form-group">
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
                  <div className="col-4 form-group">
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
                  <div className="col-4 form-group">
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
                  <div className="col-4 form-group mt-4">
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
                  <div className="col-4 form-group mt-4">
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
                  <div className="col-4 form-group mt-4"></div>
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
                    maxlength={fieldLength["description".toLowerCase()]}
                  />
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end p-2 border-top">
              <Button
                color="danger"
                type="button"
                onClick={deleteRegLot}
                className="mx-1"
              >
                Delete
              </Button>
              <Button
                color="warning"
                type="button"
                onClick={() => {
                  if (formStatusNew.isFormChanged) {
                    return setFormStatusNew((prev) => ({
                      ...prev,
                      isShowModal: true,
                    }));
                  }
                  setIsEditTrue(false);
                }}
                className="mx-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={chotaSave}
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
};

function NewRegisteredLot(props) {
  const {
    registeredLot,
    index,
    handleDeleteTempReg,
    setTempRegistered,
    setFilterRegistered,
    tempRegistered,
    fieldLength,
    requiredReg,
    formStatusNew,
    setFormStatusNew,
  } = props;
  const [isEditTrue, setIsEditTrue] = useState(false);
  return (
    <tr>
      <td>
        <button
          id={index}
          className="editBtn mb-0"
          type="button"
          onClick={() => {
            setIsEditTrue(true);
          }}
        >
          <FiEdit2 />
        </button>
        {isEditTrue && (
          <Modal
            isOpen={isEditTrue}
            toggle={() => {
              if (formStatusNew.isFormChanged) {
                return setFormStatusNew((prev) => ({
                  ...prev,
                  isShowModal: true,
                }));
              }
              setIsEditTrue(false);
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
                setIsEditTrue(false);
              }}
              className="bg-light p-3"
            >
              Edit Registered Lots
            </ModalHeader>
            <ModalBody>
              <EditForm
                index={index}
                setIsEditTrue={setIsEditTrue}
                tempRegistered={tempRegistered}
                setTempRegistered={setTempRegistered}
                setFilterRegistered={setFilterRegistered}
                regDetails={registeredLot}
                fieldLength={fieldLength}
                requiredReg={requiredReg}
                handleDeleteTempReg={handleDeleteTempReg}
                formStatusNew={formStatusNew}
                setFormStatusNew={setFormStatusNew}
              />
            </ModalBody>
          </Modal>
        )}
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.titleReference}</h6>
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.lotNumber}</h6>
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.section}</h6>
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.depositedPlanNumber}</h6>
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.strataPlanNumber}</h6>
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.description}</h6>
      </td>
    </tr>
  );
}

export default NewRegisteredLot;
