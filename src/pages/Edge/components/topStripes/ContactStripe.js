import React, { Fragment, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import LoadingPage from "../../utils/LoadingPage";
import AddPerson from "../contacts/addPerson";
import AddOrganization from "../contacts/addOrganization";
import { AlertPopup } from "../customComponents/CustomComponents";
import { fetchAllContactsFromDb } from "../../apis";
import {
  updateFormStatusAction,
  resetFormStatusAction,
} from "slices/layouts/reducer";
import "../../stylesheets/stripes.css";

function ContactStripe(props) {
  const { changeBool } = props;
  const dispatch = useDispatch();
  const { formStatus } = useSelector((state) => state.Layout);
  const [personList, setPersonList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [peopleShow, setPeopleShow] = useState(false);
  const [orgShow, setOrgShow] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const handleOpenPerson = async () => {
    setDisabled(true);
    setIsLoading(true);
    try {
      const { data } = await fetchAllContactsFromDb("ORGANISATION");
      setCompanyList(data.data.contactLists);
      setIsLoading(false);
      setDisabled(false);
      showAddPeople();
    } catch (error) {
      console.error(error);
      setDisabled(false);
      setIsLoading(false);
    }
  };

  const handleOpenOrg = async () => {
    setIsLoading(true);
    setDisabled(true);
    try {
      const { data } = await fetchAllContactsFromDb("PERSON");
      setPersonList(data.data.contactLists);
      setIsLoading(false);
      showOrgModal();
      setDisabled(false);
    } catch (error) {
      console.error(error);
      setDisabled(false);
      setIsLoading(false);
    }
  };

  const showAddPeople = () => {
    setPeopleShow(true);
  };
  const showOrgModal = () => {
    setOrgShow(true);
  };

  function handleClose(isClose = false) {
    const isCloseType = isClose && typeof isClose === "boolean";
    if (formStatus.isFormChanged && !isCloseType) {
      return dispatch(
        updateFormStatusAction({ key: "isShowModal", value: true })
      );
    }
    setOrgShow(false);
    setPeopleShow(false);
  }

  return (
    <div className="d-flex align-items-center justify-content-between">
      <h5 className="card-title mb-3 mb-md-0 flex-grow-1">Contacts</h5>
      <div
        style={{
          display: "flex",
        }}
      >
        <Button
          color="success"
          onClick={handleOpenPerson}
          disabled={disabled}
          className="btn-label mx-1"
        >
          <i className="ri-user-add-line label-icon align-middle fs-16 me-2"></i>
          Person
        </Button>
        <Button
          onClick={handleOpenOrg}
          disabled={disabled}
          color="success"
          className="btn-label mx-1"
        >
          <i className="ri-user-add-line label-icon align-middle fs-16 me-2"></i>{" "}
          Organisation
        </Button>
        <Button
          onClick={props.handleDelete}
          disabled={disabled}
          color="danger"
          className="btn-icon"
        >
          <i className="ri-delete-bin-5-line" />
        </Button>
      </div>
      {isLoading ? (
        <LoadingPage />
      ) : (
        <Fragment>
          <Modal
            size="lg"
            centered
            scrollable={true}
            isOpen={peopleShow}
            toggle={handleClose}
          >
            <ModalHeader toggle={handleClose} className="bg-light p-3">
              Add Person Details
            </ModalHeader>
            <ModalBody>
              <AddPerson
                close={handleClose}
                allCountries={JSON.parse(
                  window.localStorage.getItem("countryList")
                )}
                postalList={JSON.parse(
                  window.localStorage.getItem("postalList")
                )}
                roleList={JSON.parse(window.localStorage.getItem("roleList"))}
                companyList={companyList}
                refresh={changeBool}
              />
            </ModalBody>
          </Modal>
          <Modal
            size="lg"
            isOpen={orgShow}
            toggle={handleClose}
            scrollable={true}
            centered
          >
            <ModalHeader toggle={handleClose} className="bg-light p-3">
              Add Organisation Details
            </ModalHeader>
            <ModalBody>
              <AddOrganization
                close={handleClose}
                allCountries={JSON.parse(
                  window.localStorage.getItem("countryList")
                )}
                postalList={JSON.parse(
                  window.localStorage.getItem("postalList")
                )}
                roleList={JSON.parse(window.localStorage.getItem("roleList"))}
                refresh={changeBool}
                personList={personList}
              />
            </ModalBody>
          </Modal>
        </Fragment>
      )}
      {formStatus.isShowModal && (
        <Modal
          isOpen={formStatus.isShowModal}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader className="bg-light p-3">
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              message="You have unsaved data in your form are you sure you want to
                        discard the changes?"
              closeForm={() => {
                dispatch(
                  updateFormStatusAction({
                    key: "isShowModal",
                    value: false,
                  })
                );
              }}
              btn1={"No"}
              btn2="Yes"
              handleFunc={() => {
                setOrgShow(false);
                setPeopleShow(false);
                formStatus.callback?.();
                dispatch(resetFormStatusAction());
              }}
            />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}

export default ContactStripe;
