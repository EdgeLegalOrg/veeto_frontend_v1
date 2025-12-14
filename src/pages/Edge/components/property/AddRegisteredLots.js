import React, { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { withStyles } from "@mui/styles";
import { Button } from "reactstrap";
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

function AddRegisteredLots(props) {
  const {
    modalId,
    tempRegistered,
    setTempRegistered,
    filterRegistered,
    setFilterRegistered,
    isAddTrue,
    reg,
    close,
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
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const isChanged =
      JSON.stringify(chotaForm) !== JSON.stringify(initialFormState);
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [chotaForm]);

  function chotaSave(e) {
    e.preventDefault();
    if (
      reg.indexOf("titleReference".toLowerCase()) >= 0 ||
      reg.indexOf("lotNumber".toLowerCase()) >= 0 ||
      reg.indexOf("section".toLowerCase()) >= 0 ||
      reg.indexOf("depositedPlanNumber".toLowerCase()) >= 0 ||
      reg.indexOf("strataPlanNumber".toLowerCase()) >= 0 ||
      reg.indexOf("description".toLowerCase()) >= 0
    ) {
      setSubmitted(true);
      return;
    }
    setTempRegistered([...tempRegistered, chotaForm]);
    setFilterRegistered([...filterRegistered, chotaForm]);
    setChotaForm({
      titleReference: "",
      lotNumber: "",
      depositedPlanNumber: "",
      strataPlanNumber: "",
      section: "",
      description: "",
    });
    setFormStatusNew({ isFormChanged: false, isShowModal: false });
    close();
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
              <div className="addNewLots-buttonDiv" style={{ width: "24%" }}>
                <Button
                  type="submit"
                  color="success"

                  // disabled={
                  //   !chotaForm.titleReference ||
                  //   !chotaForm.lotNumber ||
                  //   !chotaForm.section ||
                  //   !chotaForm.depositedPlanNumber ||
                  //   !chotaForm.strataPlanNumber
                  // }
                >
                  Save
                </Button>
                <Button type="button" color="light" onClick={close}>
                  Cancel
                </Button>
              </div>
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
                        reg.indexOf("titleReference".toLowerCase()) >= 0
                      }
                      invalid={
                        submitted &&
                        reg.indexOf("titleReference".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
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
                      required={reg.indexOf("lotNumber".toLowerCase()) >= 0}
                      invalid={
                        submitted && reg.indexOf("lotNumber".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
                      maxLength={fieldLength["lotNumber".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4 form-group">
                    <TextInputField
                      label="Section"
                      name="section"
                      placeholder="Section"
                      maxLength={fieldLength["section".toLowerCase()]}
                      value={chotaForm?.section}
                      onChange={(e) => {
                        setChotaForm({
                          ...chotaForm,
                          section: e.target.value,
                        });
                      }}
                      required={reg.indexOf("section".toLowerCase()) >= 0}
                      invalid={
                        submitted && reg.indexOf("section".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
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
                        reg.indexOf("depositedPlanNumber".toLowerCase()) >= 0
                      }
                      invalid={
                        submitted &&
                        reg.indexOf("depositedPlanNumber".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
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
                        reg.indexOf("strataPlanNumber".toLowerCase()) >= 0
                      }
                      invalid={
                        submitted &&
                        reg.indexOf("strataPlanNumber".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
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
                    placeholder="Description"
                    onChange={(e) => {
                      setChotaForm({
                        ...chotaForm,
                        description: e.target.value,
                      });
                    }}
                    required={reg.indexOf("Description".toLowerCase()) >= 0}
                    invalid={
                      submitted && reg.indexOf("Description".toLowerCase()) >= 0
                        ? true
                        : false
                    }
                    invalidMessage="This field is required"
                    maxlength={fieldLength["description".toLowerCase()]}
                  />
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end p-2 border-top">
              <Button
                type="button"
                color="danger"
                onClick={() => {
                  if (formStatusNew.isFormChanged) {
                    return setFormStatusNew((prev) => ({
                      ...prev,
                      isShowModal: true,
                    }));
                  }
                  close();
                }}
                className="mx-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="success"
                // disabled={
                //   !chotaForm.titleReference ||
                //   !chotaForm.lotNumber ||
                //   !chotaForm.section ||
                //   !chotaForm.depositedPlanNumber ||
                //   !chotaForm.strataPlanNumber
                // }
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

export default AddRegisteredLots;
