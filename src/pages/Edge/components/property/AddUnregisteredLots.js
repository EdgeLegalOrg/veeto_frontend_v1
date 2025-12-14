import React, { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { withStyles } from "@mui/styles";
import { Button } from "reactstrap";
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
        width: "90%",
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

function AddUnregisteredLots(props) {
  const {
    modalId,
    tempUnregistered,
    setTempUnregistered,
    filterUnregistered,
    setFilterUnregistered,
    isAddTrue,
    unreg,
    close,
    fieldLength,
    formStatusNew,
    setFormStatusNew,
  } = props;
  const initialFormState = {
    lot: "",
    partOfLot: "",
    section: "",
    plan: "",
    description: "",
  };
  const [chotaFormUn, setChotaFormUn] = useState(initialFormState);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const isChanged =
      JSON.stringify(chotaFormUn) !== JSON.stringify(initialFormState);
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [chotaFormUn]);

  function chotaSave(e) {
    e.preventDefault();
    if (
      unreg.indexOf("lot".toLowerCase()) >= 0 ||
      unreg.indexOf("partOfLot".toLowerCase()) >= 0 ||
      unreg.indexOf("section".toLowerCase()) >= 0 ||
      unreg.indexOf("plan".toLowerCase()) >= 0 ||
      unreg.indexOf("description".toLowerCase()) >= 0
    ) {
      setSubmitted(true);
      return;
    }
    setTempUnregistered([...tempUnregistered, chotaFormUn]);
    setFilterUnregistered([...filterUnregistered, chotaFormUn]);
    setChotaFormUn({
      lot: "",
      partOfLot: "",
      section: "",
      plan: "",
      description: "",
    });
    setFormStatusNew({ isFormChanged: false, isShowModal: false });
    close();
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
              <div className="addNewLots-buttonDiv" style={{ width: "24%" }}>
                <Button type="submit" color="success">
                  Save
                </Button>
                {/* <button className="propertyPageBtns">Delete</button> */}
                <Button
                  type="button"
                  color="light"
                  onClick={() => {
                    if (formStatusNew.isFormChanged) {
                      return setFormStatusNew((prev) => ({
                        ...prev,
                        isShowModal: true,
                      }));
                    }
                    close();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
            <div className="">
              <div style={{ padding: "12px" }}>
                <div className="row">
                  <div className="col-4 form-group">
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
                      required={unreg.indexOf("lot".toLowerCase()) >= 0}
                      invalid={
                        submitted && unreg.indexOf("lot".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
                      maxLength={fieldLength["lot".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4 form-group">
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
                      required={unreg.indexOf("partOfLot".toLowerCase()) >= 0}
                      invalid={
                        submitted &&
                        unreg.indexOf("partOfLot".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
                      maxLength={fieldLength["partOfLot".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4 form-group">
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
                      required={unreg.indexOf("section".toLowerCase()) >= 0}
                      invalid={
                        submitted && unreg.indexOf("section".toLowerCase()) >= 0
                          ? true
                          : false
                      }
                      invalidMessage="This field is required"
                      maxLength={fieldLength["section".toLowerCase()]}
                    />
                  </div>
                  <div
                    className="col-4 form-group mt-4"
                    style={{ margin: "10px 0" }}
                  >
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
                      required={unreg.indexOf("plan".toLowerCase()) >= 0}
                      invalid={
                        submitted && unreg.indexOf("plan".toLowerCase()) >= 0
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
                    value={chotaFormUn.description}
                    placeholder="Description"
                    onChange={(e) => {
                      setChotaFormUn({
                        ...chotaFormUn,
                        description: e.target.value,
                      });
                    }}
                    rows="3"
                    cols="55"
                    required={unreg.indexOf("description".toLowerCase()) >= 0}
                    invalid={
                      submitted &&
                      unreg.indexOf("description".toLowerCase()) >= 0
                        ? true
                        : false
                    }
                    maxlength={fieldLength["description".toLowerCase()]}
                  />
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end p-2 border-top">
              {/* <button className="propertyPageBtns">Delete</button> */}
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
              <Button type="submit" color="success" className="mx-1">
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUnregisteredLots;
