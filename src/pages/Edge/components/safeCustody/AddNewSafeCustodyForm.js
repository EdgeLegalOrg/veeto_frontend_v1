import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { createSafecustody } from "../../apis";
import { v1 as uuidv1 } from "uuid";
import "../../stylesheets/AddNewSafeCustodyForm.css";
import { toast } from "react-toastify";
import { TextInputField } from "pages/Edge/components/InputField";
import { updateFormStatusAction } from "slices/layouts/reducer";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";

const AddNewSafeCustodyForm = (props) => {
  const { closeForm, renderAllSafeCustody, setSelectedCustody } = props;
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const [disableButton, setDisableButton] = useState(false);
  const [showPacketNumber, setShowPacketNumber] = useState(false);
  const [createdPacketNumber, setCreatedPacketNumber] = useState("");
  const [createdPacketId, setCreatedPacketId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isChanged = useMemo(() => {
    return !!comment?.trim();
  }, [comment]);

  useEffect(() => {
    dispatch(
      updateFormStatusAction({
        key: "isFormChanged",
        value: isChanged,
      })
    );
  }, [isChanged]);

  const handleSubmit = async () => {
    // if (!comment?.trim()) {
    //   return setSubmitted(true);
    // }
    setDisableButton(true);
    try {
      const { data } = await createSafecustody({
        requestId: uuidv1(),
        data: {
          comments: comment,
        },
      });
      if (data.success) {
        setCreatedPacketNumber(data.data.packetNumber);
        setCreatedPacketId(data.data.id);
        setShowPacketNumber(true);
        setDisableButton(false);
      } else {
        toast.warning(
          "There is some problem from server side, please try later."
        );
        setDisableButton(false);
        //redirect to error page
      }
    } catch (err) {
      console.error(err);
      toast.warning(
        "There is some problem from server side, please try later."
      );
      setDisableButton(false);
    }
  };

  const goToSafecustody = () => {
    setSelectedCustody(createdPacketId);
    closeForm(true);
    renderAllSafeCustody();
    setDisableButton(false);
  };

  return (
    <>
      {!showPacketNumber ? (
        <div className="">
          {/* <div className="confirmation-header">
            <h2 className="confirmation-heading">Add New Safecustody</h2>
            <button
              className="close-form-btn"
              onClick={closeForm}
              disabled={disableButton}
              type="button"
            >
              {" "}
              <img
                src={closeBtn}
                alt="close-btn"
              />
            </button>
          </div> */}
          <div className="p-4">
            <TextInputField
              label="Comment"
              type="textarea"
              rows="3"
              cols="55"
              value={comment}
              placeholder="Comment"
              onChange={(e) => setComment(e.target.value)}
              // required={true}
              // invalid={submitted && !comment?.trim()}
              // invalidMessage="Please enter comment"
            />
          </div>
          <div className="d-flex align-items-center justify-content-end p-2 border-top">
            <Button
              className="mx-1"
              onClick={closeForm}
              disabled={disableButton}
              type="button"
              color="danger"
            >
              Cancel
            </Button>
            <Button
              className="mx-1"
              onClick={handleSubmit}
              disabled={disableButton}
              type="button"
              color="success"
            >
              Add
            </Button>
          </div>
        </div>
      ) : (
        <Modal
          isOpen={true}
          // toggle={() => { }}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            // toggle={() => {

            // }}
            className="bg-light p-3"
          >
            New Safecustody packet Created
          </ModalHeader>
          <ModalBody>
            <div className="confirmation-para">
              <p>{`You have created a new safecustody packet - ${createdPacketNumber}`}</p>
            </div>
            <div className="confirmation-buttonDiv">
              <Button
                color="success"
                onClick={goToSafecustody}
                type="button"
                className="mx-1"
              >
                Okay
              </Button>
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default AddNewSafeCustodyForm;
