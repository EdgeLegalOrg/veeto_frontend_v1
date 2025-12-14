import React, { useState, useEffect, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { v1 as uuidv1 } from "uuid";
import {
  Button,
  Table,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import classnames from "classnames";
import PersonDetail from "./PersonDetail";
import OrganisationDetail from "./OrganisationDetail";
import Matter from "./matters";
import Attachid from "./attachid";
import LoadingPage from "../../utils/LoadingPage";
import {
  ConfirmationAddressPopup,
  AlertPopup,
} from "../customComponents/CustomComponents";
import {
  editContact,
  getSafeCustodyOfContact,
  getContactAttachments,
  getContactDetails,
  fetchAllContactsFromDb,
} from "../../apis";
import "../../stylesheets/SingleContact.css";
import { toast } from "react-toastify";
import {
  updateFormStatusAction,
  resetFormStatusAction,
  resetNavigationEditFormAction,
} from "slices/layouts/reducer";
import Safecustody from "./Safecustody";
import { checkHasPermission } from "pages/Edge/utils/utilFunc";
import { UPDATECONTACT } from "pages/Edge/utils/RightConstants";
import { useRouteHistory } from "contexts/RouteHistoryContext";

const searchField = {
  commCity: "",
  commState: "",
  commPostCode: "",
  commCountry: "",
  mailingCity: "",
  mailingState: "",
  mailingPostCode: "",
  mailingCountry: "",
};

function SingleContact(props) {
  const { setSelectedContact, refreshList } = props;
  const dispatch = useDispatch();
  const { formStatus, navigationEditForm } = useSelector(
    (state) => state.Layout
  );
  const { back, navigate } = useRouteHistory();

  const [personList, setPersonList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [currScreen, setCurrScreen] = useState("details");
  const [editPerson, setEditPerson] = useState(false);
  const [editOrg, setEditOrg] = useState(false);
  const [contactType, setContactType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [tempSearchField, setTempSearchField] = useState(searchField);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // const aboutProps = props?.location?.aboutProps
  //   ? props?.location?.aboutProps
  //   : false;

  const aboutProps = props?.contact ? props?.contact : false;

  if (!aboutProps) {
    navigate("/Contacts");
  }

  const [contactDetails, setContactDetails] = useState({});
  const [custodyDetails, setCustodyDetails] = useState([]);
  const [contactAttachments, setContactAttachments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [postalList, setPostalList] = useState([]);
  const [boolVal, setBoolVal] = useState(false);
  const [enableButtons, setEnableButtons] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [warningData, setWarningData] = useState([]);

  const canUpdateContact = checkHasPermission(UPDATECONTACT);

  const handleOpenPerson = async () => {
    setIsLoading(true);
    try {
      const { data } = await fetchAllContactsFromDb("ORGANISATION");
      if (data.success) {
        setCompanyList(data.data.contactLists);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        setSelectedContact(null);
        navigate("/Contacts");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error("There is some problem from server side, please try later.");
      setSelectedContact(null);
      navigate("/Contacts");
    }
  };

  const handleOpenOrg = async () => {
    setIsLoading(true);
    try {
      const { data } = await fetchAllContactsFromDb("PERSON");
      if (data.success) {
        setPersonList(data.data.contactLists);
        setIsLoading(false);
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
        setSelectedContact(null);
        navigate("/Contacts");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error("There is some problem from server side, please try later.");
      setSelectedContact(null);
      navigate("/Contacts");
    }
  };

  useEffect(() => {
    if (navigationEditForm.isEditMode) {
      setCurrScreen(
        (navigationEditForm.currentFormValue?.tab === "CONTACTS"
          ? "details"
          : navigationEditForm.currentFormValue?.tab) || "details"
      );
      // if (navigationEditForm.currentFormValue?.tab !== "CONTACTS") {
      //   dispatch(resetNavigationEditFormAction());
      // }
    }
  }, [navigationEditForm]);

  useEffect(() => {
    const fetchCountries = () => {
      setCountries(JSON.parse(window.localStorage.getItem("countryList")));
    };
    const fetchRoles = () => {
      setRoleList(JSON.parse(window.localStorage.getItem("roleList")));
    };
    const fetchPostalList = () => {
      setPostalList(JSON.parse(window.localStorage.getItem("postalList")));
    };
    if (!boolVal) {
      setIsLoading(true);
      fetchPostalList();
      fetchRoles();
      fetchCountries();
      if (aboutProps.contactType === "ORGANISATION") {
        handleOpenOrg();
        getContactDetails(aboutProps.contactId, "org")
          .then((response) => {
            if (response.data.success) {
              setContactType("org");
              setContactDetails(response.data.data);
              setEnableButtons(true);
              // setIsLoading(false);
            } else {
              setIsLoading(false);
              toast.error(
                "There is some problem from server side, please try later."
              );
              setSelectedContact(null);
              navigate("/Contacts");
            }
          })
          .catch((err) => {
            console.error("error", err);
            setIsLoading(false);
            toast.error(
              "There is some problem from server side, please try later."
            );
            setSelectedContact(null);
            navigate("/Contacts");
          });
      } else if (aboutProps.contactType === "PERSON") {
        handleOpenPerson();
        getContactDetails(aboutProps.contactId, "person")
          .then((response) => {
            if (response.data.success) {
              setContactDetails(response.data.data);
              setContactType("person");
              setEnableButtons(true);
              // setIsLoading(false);
            } else {
              setIsLoading(false);
              toast.error(
                "There is some problem from server side, please try later."
              );
              setSelectedContact(null);
              navigate("/Contacts");
            }
          })
          .catch((err) => {
            console.error(err);
            setIsLoading(false);
            toast.error(
              "There is some problem from server side, please try later."
            );
            setSelectedContact(null);
            navigate("/Contacts");
          });
      }
      setBoolVal(true);
    }
  }, [boolVal]);

  useEffect(() => {
    if (currScreen === "attachid") {
      fetchAttachments();
    }
  }, [currScreen]);

  const fetchContactDetails = async () => {
    setIsLoading(true);
    try {
      if (aboutProps.contactType === "ORGANISATION") {
        const { data } = await getContactDetails(aboutProps.contactId, "org");
        if (data.success) {
          setContactType("org");
          setContactDetails(data.data);
        } else {
          toast.error("Something went wrong, please try later.");
          setSelectedContact(null);
          window.location.reload();
        }
        setIsLoading(false);
      } else if (aboutProps.contactType === "PERSON") {
        const { data } = await getContactDetails(
          aboutProps.contactId,
          "person"
        );
        if (data.success) {
          setContactDetails(data.data);
          setContactType("person");
        } else {
          toast.error("Something went wrong, please try later.");
          window.location.reload();
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong, please check console.");
      setIsLoading(false);
    }
  };

  // const handleOpen = () => {
  //   if (contactType === 'org') {
  //     setEditOrg(true);
  //   }
  //   if (contactType === 'person') {
  //     setEditPerson(true);
  //   }
  // };

  const handleClose = () => {
    if (contactType === "org") {
      setEditOrg(false);
    }
    if (contactType === "person") {
      setEditPerson(false);
    }
  };

  const handleRenderSafecustody = () => {
    getSafeCustodyOfContact(aboutProps.contactId, aboutProps.contactType)
      .then((response) => {
        setCustodyDetails(
          response.data.data.custodyPacketContactList &&
            response.data.data.custodyPacketContactList?.length > 0
            ? response.data.data.custodyPacketContactList
            : []
        );
        setCurrScreen("safe custody");
      })
      .catch((err) => console.error(err));
  };

  const fetchAttachments = () => {
    setIsLoading(true);
    getContactAttachments(aboutProps.contactId, aboutProps.contactType)
      .then((response) => {
        setContactAttachments(response.data.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
      });
  };

  const handleContactAttachments = () => {
    getContactAttachments(aboutProps.contactId, aboutProps.contactType)
      .then((response) => {
        setContactAttachments(response.data.data);
        setCurrScreen("attachid");
      })
      .catch((err) => console.error(err));
  };

  function renderDetails() {
    if (contactType === "person") {
      return (
        <div>
          <PersonDetail
            contactDetails={contactDetails}
            changeBool={setBoolVal}
            allCountries={countries}
            setUpdatedData={setUpdatedData}
            updatedData={updatedData}
            companyList={companyList}
            roles={roleList}
            postalList={postalList}
            tempSearchField={tempSearchField}
            setTempSearchField={setTempSearchField}
            isLoading={isLoading}
            submitted={submitted}
            disabled={!canUpdateContact}
          />
        </div>
      );
    }
    if (contactType === "org") {
      return (
        <div>
          <OrganisationDetail
            contactDetails={contactDetails}
            changeBool={setBoolVal}
            allCountries={countries}
            setUpdatedData={setUpdatedData}
            updatedData={updatedData}
            postalList={postalList}
            personList={personList}
            roles={roleList}
            tempSearchField={tempSearchField}
            setTempSearchField={setTempSearchField}
            isLoading={isLoading}
            disabled={!canUpdateContact}
          />
        </div>
      );
    }
  }

  const handleEditInfo = async (e) => {
    e.preventDefault();
    setDisabled(true);
    let requiredFields = [];
    let allFilled = true;
    if (contactType === "person") {
      const person = JSON.parse(window.localStorage.getItem("metaData"))?.person
        ?.fields;
      person?.map((f) => {
        if (f.mandatory) {
          requiredFields.push(f.fieldName);
        }
      });
      requiredFields.forEach((e) => {
        if (updatedData.person[e] === null || updatedData.person[e] === "") {
          allFilled = false;
        }
      });
    } else {
      const organisation = JSON.parse(window.localStorage.getItem("metaData"))
        ?.organisation?.fields;
      organisation?.map((f) => {
        if (f.mandatory) {
          requiredFields.push(f.fieldName);
        }
      });
      requiredFields.forEach((e) => {
        if (
          updatedData.organisation[e] === null ||
          updatedData.organisation[e] === ""
        ) {
          allFilled = false;
        }
      });
    }
    if (allFilled) {
      let existInList = true;

      if (existInList) {
        let checkForComm = false;
        let checkForMailing = false;
        postalList.forEach((info) => {
          if (
            (tempSearchField?.commCity
              ? info.locality?.toUpperCase() ===
                tempSearchField?.commCity?.toUpperCase()
              : true) &&
            (tempSearchField?.commPostCode
              ? info.postCode?.toString() ===
                tempSearchField?.commPostCode?.toString()
              : true) &&
            (tempSearchField?.commState
              ? info.state?.toUpperCase() ===
                tempSearchField?.commState?.toUpperCase()
              : true) &&
            (tempSearchField?.commCountry
              ? info.country?.toUpperCase() ===
                tempSearchField?.commCountry?.toUpperCase()
              : true)
          ) {
            checkForComm = true;
          }
          if (
            (tempSearchField?.mailingCity
              ? info.locality?.toUpperCase() ===
                tempSearchField?.mailingCity?.toUpperCase()
              : true) &&
            (tempSearchField.mailingPostCode
              ? info.postCode?.toString() ===
                tempSearchField?.mailingPostCode?.toString()
              : true) &&
            (tempSearchField?.mailingState
              ? info.state?.toUpperCase() ===
                tempSearchField?.mailingState?.toUpperCase()
              : true) &&
            (tempSearchField?.mailingCountry
              ? info.country?.toUpperCase() ===
                tempSearchField?.mailingCountry?.toUpperCase()
              : true)
          ) {
            checkForMailing = true;
          }
        });
        if (!checkForComm || !checkForMailing) {
          existInList = false;
          let content = [];
          if (!checkForComm) {
            if (
              !requiredFields.includes("commCity") &&
              tempSearchField?.commCity !== "" &&
              tempSearchField?.commCity !== null
            ) {
              content.push(tempSearchField?.commCity);
            }
            if (
              !requiredFields.includes("commState") &&
              tempSearchField?.commState !== "" &&
              tempSearchField?.commState !== null
            ) {
              content.push(tempSearchField?.commState);
            }
            if (
              !requiredFields.includes("commCountry") &&
              tempSearchField?.commCountry !== "" &&
              tempSearchField?.commCountry !== null
            ) {
              content.push(tempSearchField?.commCountry);
            }
            if (
              !requiredFields.includes("commPostCode") &&
              tempSearchField?.commPostCode !== "" &&
              tempSearchField?.commPostCode !== null
            ) {
              content.push(tempSearchField?.commPostCode);
            }
            if (content?.length > 0) {
              setWarningData(content);
            } else {
              existInList = true;
            }
          } else {
            if (
              !requiredFields.includes("mailingCity") &&
              tempSearchField?.mailingCity !== "" &&
              tempSearchField?.mailingCity !== null
            ) {
              content.push(tempSearchField?.mailingCity);
            }
            if (
              !requiredFields.includes("mailingPostCode") &&
              tempSearchField?.mailingPostCode !== "" &&
              tempSearchField?.mailingPostCode !== null
            ) {
              content.push(tempSearchField?.mailingPostCode);
            }
            if (
              !requiredFields.includes("mailingState") &&
              tempSearchField?.mailingState !== "" &&
              tempSearchField?.mailingState !== null
            ) {
              content.push(tempSearchField?.mailingState);
            }
            if (
              !requiredFields.includes("mailingCountry") &&
              tempSearchField?.mailingCountry !== "" &&
              tempSearchField?.mailingCountry !== null
            ) {
              content.push(tempSearchField?.mailingCountry);
            }
            if (content?.length > 0) {
              setWarningData(content);
            } else {
              existInList = true;
            }
          }
          setDisabled(false);
        }
      }
      if (!existInList) {
        return setShowWarning(true);
      }
      handleSubmitEditForm();
    } else {
      toast.error("Please fill all required fields");
      setSubmitted(true);
      setDisabled(false);
    }
  };

  const handleSubmitEditForm = async () => {
    const keys = Object.keys(updatedData);
    let updatedInfo = {};
    setDisabled(true);
    keys.forEach((key) => {
      if (updatedData[key] === "" || updatedData[key] === "None") {
        updatedInfo = { ...updatedInfo, [key]: null };
      } else {
        updatedInfo = { ...updatedInfo, [key]: updatedData[key] };
      }
    });

    if (contactType === "person") {
      updatedInfo = {
        ...updatedInfo,
        person: { ...updatedInfo.person, ...tempSearchField },
      };
      setUpdatedData({
        ...updatedData,
        person: { ...updatedData.person, ...tempSearchField },
      });
    } else {
      updatedInfo = {
        ...updatedInfo,
        organisation: { ...updatedInfo.organisation, ...tempSearchField },
      };
      setUpdatedData({
        ...updatedData,
        organisation: { ...updatedData.organisation, ...tempSearchField },
      });
    }

    try {
      const { data } = await editContact({
        requestId: uuidv1(),
        data: updatedInfo,
      });
      if (data?.success) {
        fetchContactDetails();
        refreshList(false);
        setDisabled(false);
      } else {
        setShowAlert(true);
        setAlertMsg(data?.error?.message);
        setDisabled(false);
      }
    } catch (err) {
      setDisabled(false);
      console.error(err);
    }
  };

  function renderSafeCustody() {
    return (
      <Safecustody aboutProps={aboutProps} contactDetails={props.contact} />
    );
  }
  function renderMatters() {
    return (
      <div>
        <Matter contactDetails={props.contact} />
      </div>
    );
  }
  function renderAttachId() {
    return (
      <div>
        <Attachid
          details={aboutProps}
          handleContactAttachments={handleContactAttachments}
          attach={contactAttachments}
          fetchAttachments={fetchAttachments}
        />
      </div>
    );
  }

  const closeBtn = () => {
    if (props.source && props.source.route && props.source.details) {
      return (
        <Button
          onClick={() => {
            if (formStatus.isFormChanged) {
              return dispatch(
                updateFormStatusAction({
                  key: "isShowModal",
                  value: true,
                  callback: () => {
                    navigate({
                      pathname: props.source.route,
                      aboutProps: {
                        selectedId: props.source.details,
                      },
                    });
                  },
                })
              );
            }
            navigate({
              pathname: props.source.route,
              aboutProps: {
                selectedId: props.source.details,
              },
            });
          }}
          color="danger"
          className="mx-1"
        >
          Close
        </Button>
      );
    } else {
      return (
        <Button
          color="danger"
          className="mx-1"
          onClick={() => {
            if (formStatus.isFormChanged) {
              return dispatch(
                updateFormStatusAction({
                  key: "isShowModal",
                  value: true,
                  callback: () => {
                    if (navigationEditForm.isEditMode) {
                      return back();
                    }
                    setSelectedContact(null);
                  },
                })
              );
            }
            if (navigationEditForm.isEditMode) {
              if (
                navigationEditForm.currentFormValue?.original === "Contacts"
              ) {
                dispatch(resetNavigationEditFormAction());
                setSelectedContact(null);
              } else {
                back();
              }

              return;
            }
            setSelectedContact(null);
          }}
        >
          Close
        </Button>
      );
    }
  };

  const showUpdateButton = () => {
    if (canUpdateContact) {
      return (
        <Button
          onClick={handleEditInfo}
          disabled={disabled}
          color="success"
          className="mx-1"
        >
          Update
        </Button>
      );
    } else {
      return null;
    }
  };

  return (
    <div>
      <div className="">
        <div className="d-flex align-items-center justify-content-between m-2 p-2">
          <h5 className="mb-0">Contacts</h5>
          <div className="d-flex flex-items-end">
            {contactType !== "" && enableButtons !== false && (
              <Fragment>
                {showUpdateButton()}
                {closeBtn()}
              </Fragment>
            )}
          </div>
        </div>
        <div className="row py-2">
          <div className="col-md-12">
            <Nav tabs className="nav nav-tabs nav-tabs-custom nav-success">
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({
                    active: currScreen === "details",
                  })}
                  onClick={() => {
                    if (formStatus.isFormChanged) {
                      return dispatch(
                        updateFormStatusAction({
                          key: "isShowModal",
                          value: true,
                          callback: () => setCurrScreen("details"),
                        })
                      );
                    }
                    setCurrScreen("details");
                  }}
                >
                  Details
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({
                    active: currScreen === "matters",
                  })}
                  onClick={() => {
                    if (formStatus.isFormChanged) {
                      return dispatch(
                        updateFormStatusAction({
                          key: "isShowModal",
                          value: true,
                          callback: () => setCurrScreen("matters"),
                        })
                      );
                    }
                    setCurrScreen("matters");
                  }}
                >
                  Matters
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({
                    active: currScreen === "safe custody",
                  })}
                  onClick={() => {
                    if (formStatus.isFormChanged) {
                      return dispatch(
                        updateFormStatusAction({
                          key: "isShowModal",
                          value: true,
                          callback: () => setCurrScreen("safe custody"),
                        })
                      );
                    }
                    setCurrScreen("safe custody");
                  }}
                >
                  Safe Custody
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({
                    active: currScreen === "attachid",
                  })}
                  onClick={() => {
                    if (formStatus.isFormChanged) {
                      return dispatch(
                        updateFormStatusAction({
                          key: "isShowModal",
                          value: true,
                          callback: () => setCurrScreen("attachid"),
                        })
                      );
                    }
                    setCurrScreen("attachid");
                  }}
                >
                  Attach Id
                </NavLink>
              </NavItem>
            </Nav>
          </div>

          {/* <TabContent
            activeTab={currScreen}
            className="text-muted"
          >
            <TabPane
              tabId="details"
              id="details"
            ></TabPane>
          </TabContent> */}

          {/* <Button
            disabled={!enableButtons}
            className={
              currScreen === "details"
                ? "safe-custody-btns safe-custody-btns-clicked"
                : "safe-custody-btns"
            }
            onClick={() => setCurrScreen("details")}
            
          >
            Details
          </Button>
          <Button
            disabled={!enableButtons}
            className={
              currScreen === "matters"
                ? "safe-custody-btns safe-custody-btns-clicked"
                : "safe-custody-btns"
            }
            onClick={() => {
              setCurrScreen("matters");
            }}
            
          >
            Matters
          </Button>
          <Button
            disabled={!enableButtons}
            className={
              currScreen === "safe custody"
                ? "safe-custody-btns safe-custody-btns-clicked"
                : "safe-custody-btns"
            }
            onClick={handleRenderSafecustody}
            
          >
            Safe Custody
          </Button>
          <Button
            disabled={!enableButtons}
            className={
              currScreen === "attachid"
                ? "safe-custody-btns safe-custody-btns-clicked"
                : "safe-custody-btns"
            }
            onClick={handleContactAttachments}
            
          >
            Attach Id
          </Button> */}
        </div>

        {currScreen === "details" && !isLoading && renderDetails()}
        {currScreen === "matters" && !isLoading && renderMatters()}
        {currScreen === "safe custody" && !isLoading && renderSafeCustody()}
        {currScreen === "attachid" && !isLoading && renderAttachId()}
      </div>
      {isLoading && <LoadingPage />}
      {showWarning && (
        <Modal
          isOpen={showWarning}
          toggle={() => setShowWarning(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setShowWarning(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <ConfirmationAddressPopup
              setData={handleSubmitEditForm}
              warningData={warningData}
              closeForm={() => setShowWarning(false)}
            />
          </ModalBody>
        </Modal>
      )}
      {showAlert && (
        <Modal
          isOpen={showAlert}
          toggle={() => setShowAlert(false)}
          backdrop="static"
          scrollable={true}
          size="md"
          centered
        >
          <ModalHeader
            toggle={() => setShowAlert(false)}
            className="bg-light p-3"
          >
            Confirm Your Action
          </ModalHeader>
          <ModalBody>
            <AlertPopup
              closeForm={() => setShowAlert(false)}
              message={alertMsg}
              btn1={"Close"}
              btn2={"Refresh"}
              handleFunc={fetchContactDetails}
            />
          </ModalBody>
        </Modal>
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

export default SingleContact;
