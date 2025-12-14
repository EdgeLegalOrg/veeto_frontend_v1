import React, { Fragment, useState, useEffect } from "react";
import { Button } from "reactstrap";
import DetailSection from "./DetailSection";
import AddAttachments from "./AddAttachments";
import AttachmentSection from "./AttachmentSection";
import SafeCustodySection from "./SafeCustodySection";
import "../../../stylesheets/ManageStaffPage.css";
import {
  deleteStaffAttach,
  editStaffAttach,
  uploadStaffAttach,
} from "../../../apis";
import { AlertPopup } from "../../customComponents/CustomComponents";
import LoadingPage from "../../../utils/LoadingPage";
import EditAttachment from "./EditAttachment";
import { editStaffDetails } from "../../../apis";
import { toast } from "react-toastify";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

const StaffMemberDetails = (props) => {
  const {
    memberDetails,
    setMemberDetails,
    handleClose,
    handleToggleState,
    fetchMember,
    fetchMemberDetails,
  } = props;

  const [showAttach, setShowAttach] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedAttach, setSelectedAttach] = useState([]);
  const [deletePop, setDeletePop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [requiredFields, setRequiredFields] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const handleRefresh = (id) => {
    fetchMemberDetails(id);
    setTimeout(() => {
      fetchMember();
    }, 10);
  };

  const fetchRequired = () => {
    let arr = [];
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.staff_member?.fields?.map((f) => {
      if (f.mandatory) {
        arr.push(f.fieldName);
      }
    });
    setRequiredFields(arr);
  };

  useEffect(() => {
    fetchRequired();
  }, []);

  const handleUpdateStaff = async () => {
    const keys = Object.keys(memberDetails);
    let staffData = {};
    keys.forEach((key) => {
      if (
        memberDetails[key] === "" ||
        (memberDetails[key] && memberDetails[key] === "None") ||
        memberDetails[key === "NONE"]
      ) {
        staffData = { ...staffData, [key]: null };
      } else {
        staffData = { ...staffData, [key]: memberDetails[key] };
      }
    });

    let allFilled = true;

    let needToFill = [];

    keys.forEach((k) => {
      if (requiredFields.includes(k) && !memberDetails[k]) {
        needToFill.push(k);
        allFilled = false;
      }
    });
    if (!allFilled) {
      setSubmitted(true);
      return;
    }
    try {
      const { data } = await editStaffDetails(memberDetails);
      if (data.success) {
        handleRefresh(memberDetails.id);
      } else {
        setAlert(true);
        setAlertMsg(
          data?.error?.message
            ? data.error.message
            : "Something went wrong please try later."
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddAttach = async (obj) => {
    try {
      setLoading(true);
      const { data } = await uploadStaffAttach(obj);
      if (data.success) {
        setShowAttach(false);
        handleRefresh(memberDetails.id);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong, please check console.");
      setLoading(false);
      console.error(error);
    }
  };

  const handleEdit = async (d) => {
    try {
      setLoading(true);
      const { data } = await editStaffAttach(d);
      if (data.success) {
        setShowEdit(false);
        handleRefresh(memberDetails.id);
        setTimeout(() => {
          setSelectedAttach([]);
        }, 10);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong, please check console.");
      setLoading(false);
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      let ids = selectedAttach.join(",");
      const { data } = await deleteStaffAttach(ids);
      if (data.success) {
        handleRefresh(memberDetails.id);
        setSelectedAttach([]);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong, please check console.");
      setLoading(false);
      console.error(error);
    }
  };

  const deleteAlert = (d) => {
    setSelectedAttach(d);
    setDeletePop(true);
  };

  const editPop = (d) => {
    setSelectedAttach([...selectedAttach, d]);
    setShowEdit(true);
  };

  const updateDetails = () => {
    console.error("hello");
  };

  return (
    <Fragment>
      <div className="">
        <div className="bg-light d-flex align-items-center justify-content-between p-2">
          <h5 className="mb-0">Staff Details</h5>
          <div className="d-flex">
            <Button
              className="mx-1"
              onClick={handleToggleState}
              color="success"
            >
              {memberDetails?.staffActive ? "De-activate" : "Activate"}
            </Button>
            <Button
              className="mx-1"
              onClick={handleUpdateStaff}
              color="success"
            >
              Update
            </Button>
            <Button className="mx-1" onClick={handleClose} color="success">
              Close
            </Button>
          </div>
        </div>
        {/* <div className="topStrip-style">
          <p className="topStrip-heading">Staff Details</p>
          <button
            className="custodyAddbtn"
            onClick={handleToggleState}
          >
            {memberDetails?.staffActive ? "De-activate" : "Activate"}
          </button>
          <button
            className="custodyAddbtn"
            onClick={handleUpdateStaff}
          >
            Update
          </button>
          <button
            className="custodyAddbtn"
            onClick={handleClose}
          >
            Close
          </button>
        </div> */}
        {/* <div className='staff-headerBtnsDiv'>
          <button
            className={`staff-headerBtn ${
              selected === 'details' && 'staff-selectedBtn'
            }`}
            onClick={() => handleChangeSelect('details')}
          >
            DETAILS
          </button>
          <button
            className={`staff-headerBtn ${
              selected === 'attach' && 'staff-selectedBtn'
            }`}
            onClick={() => handleChangeSelect('attach')}
          >
            ATTACHMENTS
          </button>
          <button
            className={`staff-headerBtn hide ${
              selected === 'safecustody' && 'staff-selectedBtn'
            }`}
            onClick={() => handleChangeSelect('safecustody')}
          >
            SAFE CUSTODY
          </button>
        </div> */}
        <div className="mb-4">
          <DetailSection
            refresh={handleRefresh}
            memberDetails={memberDetails}
            setMemberDetails={setMemberDetails}
            showAlert={alert}
            alertMsg={alertMsg}
            setShowAlert={setAlert}
            submitted={submitted}
          />
        </div>
        <div className="mb-4">
          <AttachmentSection
            setShowAttach={setShowAttach}
            details={memberDetails}
            handleDelete={deleteAlert}
            handleEdit={editPop}
            selectedAttach={selectedAttach}
          />
        </div>
        {/* <div id='staff-custody' className='staff-detailSection'>
          <SafeCustodySection />
        </div> */}
      </div>
      <div>
        {showAttach && (
          <Modal
            isOpen={showAttach}
            toggle={() => setShowAttach(false)}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader
              toggle={() => setShowAttach(false)}
              className="bg-light p-3"
            >
              Add Attachment
            </ModalHeader>
            <ModalBody>
              <AddAttachments
                close={() => setShowAttach(false)}
                add={handleAddAttach}
                staffId={memberDetails.id}
              />
            </ModalBody>
          </Modal>
        )}
        {showEdit && (
          <Modal
            isOpen={showEdit}
            toggle={() => setShowEdit(false)}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader
              toggle={() => setShowEdit(false)}
              className="bg-light p-3"
            >
              Edit Attachment
            </ModalHeader>
            <ModalBody>
              <EditAttachment
                close={() => setShowEdit(false)}
                edit={handleEdit}
                staffId={memberDetails.id}
                selected={selectedAttach[0]}
              />
            </ModalBody>
          </Modal>
        )}
        {deletePop && (
          <Modal
            isOpen={deletePop}
            toggle={() => setDeletePop(false)}
            backdrop="static"
            scrollable={true}
            size="md"
            centered
          >
            <ModalHeader
              toggle={() => setDeletePop(false)}
              className="bg-light p-3"
            >
              Confirm Your Action
            </ModalHeader>
            <ModalBody>
              <AlertPopup
                message="Are you sure you want to delete the record?"
                heading="Confirm Your Action"
                closeForm={() => setDeletePop(false)}
                btn1={"No"}
                btn2="Yes"
                handleFunc={handleDelete}
              />
            </ModalBody>
          </Modal>
        )}
        {loading && <LoadingPage />}
      </div>
    </Fragment>
  );
};

export default StaffMemberDetails;
