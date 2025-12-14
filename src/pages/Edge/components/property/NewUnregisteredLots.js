import React, { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import "../../stylesheets/property.css";
import { withStyles } from "@mui/styles";
import { FiEdit2 } from "react-icons/fi";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { TextInputField } from "pages/Edge/components/InputField";

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
    />
  );
};

function EditForm(props) {
  const {
    setIsEditTrue,
    unregDetails,
    setTempUnregistered,
    setFilterUnregistered,
    handleDeleteTempUnreg,
    tempUnregistered,
    index,
    fieldLength,
    requiredUnreg,
    formStatusNew,
    setFormStatusNew,
  } = props;
  const [chotaFormUn, setChotaFormUn] = useState(unregDetails);
  const [submitted, setSubmitted] = useState(false);
  // const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    const isChanged =
      JSON.stringify(chotaFormUn) !== JSON.stringify(unregDetails);
    setFormStatusNew((prev) => ({ ...prev, isFormChanged: isChanged }));
  }, [chotaFormUn, unregDetails]);

  function chotaSave(e) {
    e.preventDefault();

    if (
      requiredUnreg.indexOf("lot".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("partOfLot".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("section".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("plan".toLowerCase()) >= 0 ||
      requiredUnreg.indexOf("description".toLowerCase()) >= 0
    ) {
      setSubmitted(true);
      return;
    }

    let list = [...tempUnregistered];
    list[index] = chotaFormUn;
    setTempUnregistered(list);
    setFilterUnregistered(list);
    setFormStatusNew({ isFormChanged: false, isShowModal: false });
    setIsEditTrue(false);
  }

  const deleteUnregLot = () => {
    let list = [...tempUnregistered];
    list.splice(index, 1);
    handleDeleteTempUnreg(list);
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
                Unregistered Lots
              </h5>
            </div>
            <div className="">
              <div style={{ padding: "12px" }}>
                <div className="row">
                  <div className="col-4 form-group">
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
                      invalidMessage="This field is required"
                      maxLength={fieldLength["lot".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4 form-group">
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
                  <div className="col-4 form-group">
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
                      invalidMessage="This field is required"
                      maxLength={fieldLength["section".toLowerCase()]}
                    />
                  </div>
                  <div className="col-4 form-group mt-4">
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
                    rows="3"
                    cols="55"
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
                    maxlength={fieldLength["description".toLowerCase()]}
                  />
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end p-2 border-top">
              <Button
                color="danger"
                type="button"
                onClick={deleteUnregLot}
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
}

function NewUnregisteredLots(props) {
  const {
    unregisteredLot,
    setTempUnregistered,
    setFilterUnregistered,
    tempUnregistered,
    handleDeleteTempUnreg,
    index,
    fieldLength,
    requiredUnreg,
    formStatusNew,
    setFormStatusNew,
  } = props;
  const [isEditTrue, setIsEditTrue] = useState(false);

  return (
    <tr>
      <td>
        <button
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
              Edit Unregistered Lots
            </ModalHeader>
            <ModalBody>
              <EditForm
                index={index}
                setIsEditTrue={setIsEditTrue}
                unregDetails={unregisteredLot}
                tempUnregistered={tempUnregistered}
                setTempUnregistered={setTempUnregistered}
                setFilterUnregistered={setFilterUnregistered}
                fieldLength={fieldLength}
                requiredUnreg={requiredUnreg}
                handleDeleteTempUnreg={handleDeleteTempUnreg}
                formStatusNew={formStatusNew}
                setFormStatusNew={setFormStatusNew}
              />
            </ModalBody>
          </Modal>
        )}
      </td>
      <td>
        <h6 className="mb-0">{unregisteredLot?.lot}</h6>
      </td>
      <td>
        <h6 className="mb-0">{unregisteredLot?.partOfLot}</h6>
      </td>
      <td>
        <h6 className="mb-0">{unregisteredLot?.section}</h6>
      </td>
      <td>
        <h6 className="mb-0">{unregisteredLot?.plan}</h6>
      </td>
      <td>
        <h6 className="mb-0">{unregisteredLot?.description}</h6>
      </td>
    </tr>
  );
}

export default NewUnregisteredLots;
