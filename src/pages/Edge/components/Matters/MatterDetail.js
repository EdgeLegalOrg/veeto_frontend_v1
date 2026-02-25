import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Card,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import MatterBasic from "./MatterBasic";
import MatterContacts from "./MatterContacts";
import PropertyList from "./Property/PropertyList";
import DetailSection from "./FamilyLaw/DetailSection";
import EstateList from "./EstateTab/EstateList";
import LeaseList from "./Lease/LeaseList";
import ConveyanceList from "./ConveyancingTab/ConveyanceList";
import AttachmentList from "./Attachments/AttachmentList";
import LoadingPage from "../../utils/LoadingPage";
import MatterTabList from "./MatterTabList";
import BusinessTab from "./Business/BusinessTab";
import { FaFileSignature } from "react-icons/fa";
import { GrClose } from "react-icons/gr";
import { AiOutlineClose } from "react-icons/ai";
import PrecedentTreeContainer from "../PrecedentTree/PrecedentTreeContainer";
import { editMatter } from "../../apis";
import TimeBillingList from "./TimeBilling/TimeBillingList";
import GeneralDetails from "./GeneralDetails/GeneralDetails";
import InvoiceList from "./InvoiceTab/InvoiceList";
import AddNewInvoice from "./InvoiceTab/AddNewInvoice";
import MarriageDefactoDetail from "./MarriageDefacto/MarriageDefactoDetail";
import { settlementApplicable } from "../../utils/Constant";
import SettlementDetails from "./SettlementTab/SettlementDetails";
import EditInvoice from "./InvoiceTab/EditInvoice";
import { AlertPopup } from "../customComponents/CustomComponents";

//file directory import
import FileDirectoryModal from "./../FileDirectory/index";
import { toast } from "react-toastify";
import {
  updateFormStatusAction,
  resetFormStatusAction,
  resetNavigationEditFormAction,
} from "slices/layouts/reducer";
import ChecklistTab from "./CheckListTab";
import ArchiveModal from "./ArchiveModal";
import { checkHasPermission } from "pages/Edge/utils/utilFunc";
import {
  ARCHIVEUNARCHIVEMATTER,
  UNARCHIVEMATTER,
} from "pages/Edge/utils/RightConstants";
import { useRouteHistory } from "../../../../contexts/RouteHistoryContext";

const MatterDetail = (props) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { back, navigate } = useRouteHistory();

  const { staffList, refresh, refreshListing } = props;
  const [data, setData] = useState(props.data);
  const [selected, setSelected] = useState("");
  const [displayTab, setDisplayTab] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extraButtons, setExtraButtons] = useState(null);
  const { formStatus, navigationEditForm } = useSelector(
    (state) => state.Layout
  );

  //file directory popup state
  const [modal, setModal] = useState({
    name: "",
    type: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const childRef = useRef(null);

  //file directory modal function
  const handleModalOpen = (item) => {
    if (formStatus.isFormChanged) {
      return dispatch(
        updateFormStatusAction({
          key: "isShowModal",
          value: true,
          callback: () => {
            setModalOpen(true);
            setModal(item);
          },
        })
      );
    }
    setModalOpen(true);
    setModal(item);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (props.data) {
      fetchTabs(props.data);
      // setData(props.data);
    }
  }, [props.data]);

  useEffect(() => {
    if (navigationEditForm.isEditMode) {
      setSelected(
        navigationEditForm.currentFormValue.tab === "matters"
          ? "BASIC"
          : navigationEditForm.currentFormValue.tab
      );
      // if (["CONTACTS"].includes(navigationEditForm.currentFormValue.tab)) {
      //   dispatch(resetNavigationEditFormAction());
      // }
    }
  }, [navigationEditForm]);

  const fetchTabs = (arg) => {
    setLoading(true);
    let tabList = JSON.parse(window.localStorage.getItem("matterTabs"));
    let tabToDisplay = [];
    if (tabList && tabList.length > 0) {
      tabToDisplay = tabList.filter(
        (tab) => tab.type === arg.type && tab.subType === arg.subType
      );
    }

    if (tabToDisplay && tabToDisplay.length > 0) {
      let arr = Object.keys(tabToDisplay[0].tabsToDisplay);
      arr = ["CHECKLIST", ...arr];
      setDisplayTab(arr);
    }

    setData(arg);
    setLoading(false);
  };

  const getClass = (val) => {
    if (val === selected) {
      return "selected";
    }

    return "";
  };

  const selectTab = (val) => {
    if (formStatus.isFormChanged) {
      return dispatch(
        updateFormStatusAction({
          key: "isShowModal",
          value: true,
          callback: () => setSelected(val),
        })
      );
    }
    setSelected(val);
    setExtraButtons(null);
  };

  const handleRefresh = (listRefresh = false) => {
    dispatch(resetFormStatusAction());
    refresh(selected);
    if (listRefresh) {
      refreshListing();
    }
  };

  const handleArchive = async () => {
    if (formStatus.isFormChanged) {
      return dispatch(
        updateFormStatusAction({ key: "isShowModal", value: true })
      );
    }

    if (!data.flagArchived) {
      childRef.current.openFundAlert();
    } else {
      try {
        setLoading(true);
        let formData = { ...data, flagArchived: !data.flagArchived };
        const res = await editMatter(formData);
        if (res.data && res.data.success) {
          // props.setMatterDetail(null);
          handleRefresh(true);
        } else {
          toast.warning("Something went wrong, please try later.");
        }
        setLoading(false);
      } catch (error) {
        toast.warning("Something went wrong, please try later.");
        console.error(error);
        setLoading(false);
      }
    }
  };

  const displaySection = () => {
    switch (selected) {
      case "CONTACTS":
        return (
          <MatterContacts
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "INVOICES":
        return (
          <InvoiceList
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "TIME_BILLING":
        return (
          <TimeBillingList
            staffList={staffList}
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "CONVEYANCE":
        return (
          <ConveyanceList
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "BUSINESS_SALE_PURCHASE":
        return (
          <BusinessTab
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "PROPERTY":
        return (
          <PropertyList
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "FAMILY_LAW":
        return (
          <DetailSection
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "ESTATE":
        return (
          <EstateList
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "LEASE":
        return (
          <LeaseList
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "ATTACHMENTS":
        return (
          <AttachmentList
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "BASIC":
        return (
          <GeneralDetails
            data={data}
            refresh={handleRefresh}
            staffList={staffList}
            refreshListing={refreshListing}
            setExtraButtons={setExtraButtons}
          />
        );
      case "MARRIAGE_DEFACTO":
        return (
          <MarriageDefactoDetail
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      case "CHECKLIST":
        return (
          <ChecklistTab
            data={data}
            refresh={handleRefresh}
            setExtraButtons={setExtraButtons}
          />
        );
      default:
        return <></>;
    }
  };

  const isArchiveDisable = () => {
    if (data && data.status === "COMPLETE" && !data.isOutstanding) {
      return false;
    } else {
      return true;
    }
  };

  const handleSettlementTab = () => {
    if (formStatus.isFormChanged) { 
      return dispatch(
        updateFormStatusAction({
          key: "isShowModal",
          value: true,
          callback: () => navigate({ search: "?settlement=true" }),
        })
      );
    }
    navigate({
      search: "?settlement=true",
    });
  };

  const showSettlement = () => {
    if (
      data &&
      data.type &&
      settlementApplicable &&
      settlementApplicable.includes(data.type)
    ) {
      return (
        <Button color="success" className="mx-2" onClick={handleSettlementTab}>
          Settlement Figures
        </Button>
      );
    } else {
      return <></>;
    }
  };

  const showArchiveButton = () => {
    if (!data.flagArchived && checkHasPermission(ARCHIVEUNARCHIVEMATTER)) {
      return (
        <Button
          color="success"
          className="mx-2"
          disabled={isArchiveDisable()}
          onClick={handleArchive}
        >
          Archive
        </Button>
      );
    } else if (data.flagArchived && checkHasPermission(UNARCHIVEMATTER)) {
      return (
        <Button
          color="success"
          className="mx-2"
          disabled={isArchiveDisable()}
          onClick={handleArchive}
        >
          Un-Archive
        </Button>
      );
    } else {
      return null;
    }
  };

  const matterDetailSec = () => {
    return (
      <>
        <div className="d-flex align-items-center border py-2">
          <h5 className="mb-0 mx-4">General Matter Information</h5>
          {[
            {
              name: "Precedents",
              type: "NORMAL",
            },
            {
              name: "Forms",
              type: "FORM",
            },
          ].map((item) => (
            <Button
              key={item.name}
              color="success"
              className="mx-2"
              onClick={() => handleModalOpen(item)}
            >
              {item.name}
            </Button>
          ))}
          {/* <Button color='success' className='mx-2' disabled>
            Export
          </Button> */}
          {showArchiveButton()}
          {showSettlement()}
          <Button
            color="danger"
            className="mx-2"
            onClick={() => {
              if (formStatus.isFormChanged) {
                return dispatch(
                  updateFormStatusAction({
                    key: "isShowModal",
                    value: true,
                    callback: () => {
                      navigate({
                        search: "",
                      });
                      props.setMatterDetail(null);
                    },
                  })
                );
              }

              if (navigationEditForm.isEditMode) {
                if (
                  navigationEditForm.currentFormValue?.original === "Matters"
                ) {
                  dispatch(resetNavigationEditFormAction());
                  props.setMatterDetail(null);
                } else {
                  back();
                }
                return;
              }

              props.setMatterDetail(null);
            }}
          >
            <AiOutlineClose size={18} />
          </Button>
        </div>
        <MatterBasic
          data={data}
          staffList={staffList}
          refresh={handleRefresh}
        />
        <FileDirectoryModal
          matterData={data}
          modal={modal}
          setModal={setModal}
          isOpen={modalOpen}
          onClose={handleModalClose}
        />

        {/***********Type Section Tab***** */}
        <MatterTabList
          selected={selected}
          setSelected={setSelected}
          selectTab={selectTab}
          getClass={getClass}
          list={displayTab}
          data={data}
          extraButtons={extraButtons}
        />
        {displaySection()}
      </>
    );
  };

  const ui = () => {
    if (location.search && location.search.includes("addInvoice=true")) {
      return <AddNewInvoice data={data} refresh={handleRefresh} />;
    } else if (
      location.search &&
      location.search.includes("editInvoice=true")
    ) {
      let invoiceData = location.state;
      return (
        <EditInvoice
          data={data}
          invoiceData={invoiceData}
          refresh={handleRefresh}
        />
      );
    } else if (location.search && location.search.includes("settlement=true")) {
      return <SettlementDetails />;
    } else {
      return matterDetailSec();
    }
  };

  const matterNum = () => {
    if (data) {
      return `Matter #: ${data?.matterNumber} ${
        data.letterSubject ? ` - ${data.letterSubject}` : ""
      }`;
    }

    return "";
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Card>
          <div className="d-flex align-items-center m-2">
            <div className="">
              <FaFileSignature className="matter-icon" />
            </div>
            <h5 className="mb-0">{matterNum()}</h5>
          </div>
          <div className="">{ui()}</div>
          {loading && <LoadingPage />}
        </Card>
      </Container>
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
                  updateFormStatusAction({ key: "isShowModal", value: false })
                );
              }}
              btn1={"No"}
              btn2="Yes"
              handleFunc={() => {
                if (navigationEditForm.isEditMode) {
                  back();
                  return;
                }
                formStatus.callback?.();
                dispatch(resetFormStatusAction());
              }}
            />
          </ModalBody>
        </Modal>
      )}
      <ArchiveModal
        ref={childRef}
        staffList={staffList}
        refresh={handleRefresh}
        data={props.data}
      />
    </div>
  );
};

export default MatterDetail;
