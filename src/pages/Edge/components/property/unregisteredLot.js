import React, { useState } from "react";
import "../../stylesheets/property.css";
import { FiEdit2 } from "react-icons/fi";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import EditUnRegFormPopup from "./EditUnRegFormPopup";
import { convertSubstring } from "../../utils/utilFunc";

function UnregisteredLot(props) {
  const {
    unregisteredLot,
    specifiedDetails,
    setBoolVal,
    index,
    fetchPropertyData,
    requiredUnreg,
    fieldLength,
    setShowAlert,
    setAlertMsg,
    formStatusNew,
    setFormStatusNew,
    isPopEditUForm: isEditTrue,
    setIsPopEditUForm: setIsEditTrue,
  } = props;

  return (
    <tr>
      <td>
        <button
          className="editBtn mb-0"
          onClick={() => {
            setIsEditTrue(true);
          }}
          type="button"
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
            scrollable={true}
            size="lg"
            centered
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
              Unregistered Lots
            </ModalHeader>
            <ModalBody>
              <EditUnRegFormPopup
                setIsEditTrue={setIsEditTrue}
                unregDetails={unregisteredLot}
                specifiedDetails={specifiedDetails}
                setBoolVal={setBoolVal}
                fetchPropertyData={fetchPropertyData}
                requiredUnreg={requiredUnreg}
                fieldLength={fieldLength}
                setShowAlert={setShowAlert}
                setAlertMsg={setAlertMsg}
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
        <h6 className="mb-0">
          {convertSubstring(unregisteredLot?.description, 20)}
        </h6>
      </td>
    </tr>
  );
}

export default UnregisteredLot;
