import React, { useState } from "react";
import "../../stylesheets/property.css";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { FiEdit2 } from "react-icons/fi";
import EditRegFormPopup from "./EditRegFormPopup";
import { convertSubstring } from "../../utils/utilFunc";

function RegisteredLot(props) {
  const {
    registeredLot,
    idx,
    specifiedDetails,
    setBoolVal,
    fetchPropertyData,
    requiredReg,
    fieldLength,
    setShowAlert,
    setAlertMsg,
    isPopEditRForm: isEditTrue,
    setIsPopEditRForm: setIsEditTrue,
    formStatusNew,
    setFormStatusNew,
  } = props;
  // const [selectedLot, setSelectedLot] = useState([]);
  return (
    <tr>
      <td>
        <button
          id={idx}
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
              // style={{ background: "inherit", color: "inherit" }}
              // className="border-bottom"
              className="bg-light p-3"
            >
              Registered Lots
            </ModalHeader>
            <ModalBody>
              <EditRegFormPopup
                setIsEditTrue={setIsEditTrue}
                regDetails={registeredLot}
                specifiedDetails={specifiedDetails}
                setBoolVal={setBoolVal}
                fetchPropertyData={fetchPropertyData}
                requiredReg={requiredReg}
                fieldLength={fieldLength}
                setAlertMsg={setAlertMsg}
                setShowAlert={setShowAlert}
                formStatusNew={formStatusNew}
                setFormStatusNew={setFormStatusNew}
              />
            </ModalBody>
          </Modal>
        )}
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.lotNumber}</h6>
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.section}</h6>
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.titleReference}</h6>
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.depositedPlanNumber}</h6>
      </td>
      <td>
        <h6 className="mb-0">{registeredLot?.strataPlanNumber}</h6>
      </td>
      <td>
        <h6 className="mb-0">
          {convertSubstring(registeredLot?.description, 20)}
        </h6>
      </td>
    </tr>
  );
}

export default RegisteredLot;
