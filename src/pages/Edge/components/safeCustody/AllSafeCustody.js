import React, { useState, useEffect, Fragment } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "../../stylesheets/safeCustody.css";
import { MdSearch } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import closeBtn from "../../images/close-white-btn.svg";
import AddNewSafeCustodyForm from "./AddNewSafeCustodyForm";
import { FormControl, InputLabel, Select, Box } from "@mui/material";

import upArrow from "../../images/upArrow.svg";
import downArrow from "../../images/downArrow.svg";
import downArrowColoured from "../../images/downArrowColoured.svg";
import upArrowColoured from "../../images/upArrowColoured.svg";
import SafeStripe from "../topStripes/SafeStripe";
import LoadingPage from "../../utils/LoadingPage";
import Pagination from "../Pagination";
import RenderSafeCustody from "./safeCustody";
import {
  allSafecustody,
  deleteSafecustody,
  validateSafecustody,
} from "../../apis";
import { convertSubstring } from "../../utils/utilFunc";
import { toast } from "react-toastify";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Button,
  Table,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import TooltipWrapper from "../../../../Components/Common/TooltipWrapper";
import { AlertPopup } from "../customComponents/CustomComponents";
// Actions
import { resetCurrentRouterState } from "../../../../slices/thunks.js";
import {
  TextInputField,
  SelectInputField,
} from "pages/Edge/components/InputField";
import {
  updateFormStatusAction,
  resetFormStatusAction,
  resetNavigationEditFormAction,
} from "slices/layouts/reducer";

const filterFields = {
  companyName: "",
  packetNumber: "",
  siteName: "",
  status: "",
  comment: "",
};

const ConfirmationPopup = (props) => {
  const { closeForm, setBoolVal, selected, setSelected, renderAllSafeCustody } =
    props;
  const [disableButton, setDisableButton] = useState(false);
  const handleDeleteCustody = () => {
    setDisableButton(true);
    let safeCustodyPackets = [];
    selected.forEach((packet) =>
      safeCustodyPackets.push({ id: parseInt(packet) })
    );
    deleteSafecustody({
      data: {
        safeCustodyPackets: safeCustodyPackets,
      },
    })
      .then((res) => {
        renderAllSafeCustody();
        setDisableButton(false);
        closeForm();
        setSelected([]);
      })
      .catch((err) => {
        setDisableButton(false);
        console.error(err);
      });
  };

  const handleValidate = async () => {
    try {
      let ids = selected.join(",");
      setDisableButton(true);
      const { data } = await validateSafecustody(ids);
      if (!data.success) {
        toast.error(
          data?.error?.message
            ? data.error.message
            : "Something Went wrong! Please try later."
        );
        closeForm();
        setDisableButton(false);
      } else {
        handleDeleteCustody();
      }
    } catch (error) {
      setDisableButton(false);
      toast.error("Something Went wrong! Please try later.");
      console.error(error);
    }
  };

  return (
    <div>
      <div className="p-4">
        <p>Are you sure you want to delete the record?</p>
      </div>
      <div className="d-flex align-items-center justify-content-end p-2 border-top">
        <Button
          color="danger"
          onClick={closeForm}
          type="button"
          disabled={disableButton}
          className="mx-1"
        >
          No
        </Button>
        <Button
          color="success"
          onClick={handleValidate}
          type="button"
          disabled={disableButton}
          className="mx-1"
        >
          Yes
        </Button>
      </div>
    </div>
  );
};

function AllSafeCustody(props) {
  document.title = "Safe Custody | EdgeLegal";
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentRouterState, formStatus, navigationEditForm } = useSelector(
    (state) => state.Layout
  );
  const custodyId = props.location?.aboutProps
    ? props.location.aboutProps?.selectedId
    : "";

  const aboutProps = props.location?.aboutProps
    ? props.location.aboutProps
    : null;

  const [filteredData, setFilteredData] = useState([]);
  const [filterInput, setFilterInput] = useState(filterFields);
  const [safeCustodyPackets, setSafeCustodyPackets] = useState([]);
  const [safeCustodyStatus, setSafeCustodyStatus] = useState("ALL");
  const [newCustodyForm, setNewCustodyForm] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [boolVal, setBoolVal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selected, setSelected] = useState([]);
  const [labelSort, setLabelSort] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCustody, setSelectedCustody] = useState(custodyId);

  useEffect(() => {
    if (!boolVal) {
      setIsLoading(true);
      allSafecustody({
        ...filterInput,
        pageNo: pageNo,
        pageSize: pageSize,
        sortField: sortField,
        sortOrder: sortOrder.toUpperCase(),
        safeCustodyStatus: safeCustodyStatus,
      })
        .then((response) => {
          if (response.data.success) {
            setSafeCustodyPackets(response.data?.data?.safeCustodyPackets);
            setFilteredData(response.data?.data?.safeCustodyPackets);
            setTotalPages(response.data.metadata.page.totalPages);
            setTotalRecords(response.data.metadata.page.totalRecords);
            setIsLoading(false);
          } else {
            setIsLoading(false);
            toast.error(
              "There is some problem from server side, please try later."
            );
            //redirect to error page
          }
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        });
    }
  }, [boolVal]);

  useEffect(() => {
    if (currentRouterState) {
      setSelectedCustody("");
      dispatch(resetCurrentRouterState());
    }
  }, [currentRouterState]);

  useEffect(() => {
    if (navigationEditForm.isEditMode) {
      setSelectedCustody(navigationEditForm.editFormValue.safeCustodyPacketId);
    }
  }, [navigationEditForm]);

  const handleClearFilter = () => {
    setFilterInput(filterFields);
    setTimeout(() => {
      handleFilterSubmit(filterFields);
    }, 10);
  };

  const renderAllSafeCustody = () => {
    setIsLoading(true);
    allSafecustody({
      ...filterInput,
      pageNo: pageNo,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
      safeCustodyStatus: safeCustodyStatus,
    })
      .then((response) => {
        if (response.data.success) {
          setSafeCustodyPackets(response.data?.data?.safeCustodyPackets);
          setFilteredData(response.data?.data?.safeCustodyPackets);
          setTotalPages(response.data.metadata.page.totalPages);
          setTotalRecords(response.data.metadata.page.totalRecords);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      });
  };

  const handleDeleteCustody = () => {
    setShowConfirm(true);
  };

  function getSafeCustody(e) {
    const currentStatus = e.target.value;
    setPageNo(0);
    setSafeCustodyStatus(currentStatus);
    allSafecustody({
      ...filterInput,
      pageNo: 0,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
      status: currentStatus,
      safeCustodyStatus: currentStatus,
    })
      .then((response) => {
        if (response.data.success) {
          setSafeCustodyPackets(response.data?.data?.safeCustodyPackets);
          setFilteredData(response.data?.data?.safeCustodyPackets);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        }
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      });
  }

  const handleFilterSubmit = (filters = filterInput) => {
    setPageNo(0);
    setIsLoading(true);
    allSafecustody({
      ...filters,
      pageNo: 0,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
      safeCustodyStatus: safeCustodyStatus,
    })
      .then((response) => {
        if (response.data.success) {
          setSafeCustodyPackets(response.data?.data?.safeCustodyPackets);
          setFilteredData(response.data?.data?.safeCustodyPackets);
          setTotalPages(response.data.metadata.page.totalPages);
          setTotalRecords(response.data.metadata.page.totalRecords);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      });
  };

  const handleFilter = (e) => {
    const { name } = e.target;
    setFilterInput({ ...filterInput, [name]: e.target.value });
    setTimeout(() => {
      if (name === "status") {
        handleFilterSubmit({ ...filterInput, [name]: e.target.value });
      }
    }, 10);
  };

  const handleSortSubmit = (field, sortType) => {
    setIsLoading(true);
    allSafecustody({
      ...filterInput,
      pageNo: pageNo,
      pageSize: pageSize,
      sortField: field,
      sortOrder: sortType.toUpperCase(),
      safeCustodyStatus: safeCustodyStatus,
    })
      .then((response) => {
        if (response.data.success) {
          setSafeCustodyPackets(response.data?.data?.safeCustodyPackets);
          setFilteredData(response.data?.data?.safeCustodyPackets);
          setTotalPages(response.data.metadata.page.totalPages);
          setTotalRecords(response.data.metadata.page.totalRecords);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      });
  };

  const handleSortByLabel = (field) => {
    if (labelSort !== field) {
      setLabelSort(field);
      setSortOrder("asc");
      setSortField(field);
      handleSortSubmit(field, "asc");
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(field);
      handleSortSubmit(field, "desc");
    }
  };

  const handleSelectToDelete = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected?.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredData?.map((row) => row.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  // to check whether the property is selected or not
  const isSelected = (id) => selected.indexOf(id) !== -1;

  const changeNumberOfRows = (e) => {
    setIsLoading(true);
    setPageSize(e.target.value);
    let currSize = e.target.value;

    let tempTotalPages = Math.ceil(totalRecords / currSize);
    let tempPageNo = tempTotalPages - 1;

    if (tempPageNo < pageNo) {
      setPageNo(tempPageNo);
    } else {
      tempPageNo = pageNo;
    }

    allSafecustody({
      ...filterInput,
      pageNo: tempPageNo,
      pageSize: e.target.value,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
      safeCustodyStatus: safeCustodyStatus,
    })
      .then((response) => {
        if (response.data.success) {
          setSafeCustodyPackets(response.data?.data?.safeCustodyPackets);
          setFilteredData(response.data?.data?.safeCustodyPackets);
          setTotalPages(response.data.metadata.page.totalPages);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      });
  };

  const handleNextPage = () => {
    setIsLoading(true);
    let pg = pageNo + 1;
    setPageNo(pg);
    allSafecustody({
      ...filterInput,
      pageNo: pg,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
      safeCustodyStatus: safeCustodyStatus,
    })
      .then((response) => {
        if (response.data.success) {
          setSafeCustodyPackets(response.data?.data?.safeCustodyPackets);
          setFilteredData(response.data?.data?.safeCustodyPackets);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      });
  };

  const handlePreviousPage = () => {
    setIsLoading(true);
    let pg = pageNo - 1;
    setPageNo(pg);
    allSafecustody({
      ...filterInput,
      pageNo: pg,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
      safeCustodyStatus: safeCustodyStatus,
    })
      .then((response) => {
        if (response.data.success) {
          setSafeCustodyPackets(response.data?.data?.safeCustodyPackets);
          setFilteredData(response.data?.data?.safeCustodyPackets);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      });
  };

  const handleJumpToPage = (num) => {
    setIsLoading(true);
    setPageNo(num - 1);

    allSafecustody({
      ...filterInput,
      pageNo: num - 1,
      pageSize: pageSize,
      sortField: sortField,
      sortOrder: sortOrder.toUpperCase(),
      safeCustodyStatus: safeCustodyStatus,
    })
      .then((response) => {
        if (response.data.success) {
          setSafeCustodyPackets(response.data?.data?.safeCustodyPackets);
          setFilteredData(response.data?.data?.safeCustodyPackets);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error(
            "There is some problem from server side, please try later."
          );
          //redirect to error page
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        toast.error(
          "There is some problem from server side, please try later."
        );
        //redirect to error page
      });
  };

  function renderSafeSelectTop() {
    return (
      <>
        <SafeStripe
          addCustody={() => setNewCustodyForm(true)}
          handleDeleteCustody={handleDeleteCustody}
          selected={selected}
        />
        <div className="d-flex align-items-center justify-content-between my-4">
          <div className="d-flex align-items-center">
            <h6 className="my-3 mr-2">Status</h6>
            <Input
              type="select"
              value={safeCustodyStatus}
              onChange={(e) => {
                getSafeCustody(e);
              }}
              placeholder="Files"
              className="mx-2 my-3"
              style={{ width: "25%" }}
            >
              <option value={"ALL"} selected={safeCustodyStatus === "ALL"}>
                All
              </option>
              <option
                value={"ACTIVE"}
                selected={safeCustodyStatus === "ACTIVE"}
              >
                Active
              </option>
              <option
                value={"INACTIVE"}
                selected={safeCustodyStatus === "INACTIVE"}
              >
                Inactive
              </option>
              <option
                value={"UPLIFTED"}
                selected={safeCustodyStatus === "UPLIFTED"}
              >
                Uplifted
              </option>
            </Input>
            <TextInputField
              type="text"
              containerClassName="my-3"
              className="mx-1"
              placeholder="Search by packet no., Contact name, Address, Document name"
            ></TextInputField>
          </div>
          <div className="d-flex">
            <Button color="success" className="mx-2">
              Filter
            </Button>
            <Button color="warning" className="mx-2">
              Clear
            </Button>
            <Button color="success" className="mx-2">
              More
            </Button>
          </div>
        </div>
        {newCustodyForm && (
          <Modal
            isOpen={newCustodyForm}
            toggle={() => {
              if (formStatus.isFormChanged) {
                return dispatch(
                  updateFormStatusAction({
                    key: "isShowModal",
                    value: true,
                  })
                );
              }
              setNewCustodyForm(false);
            }}
            backdrop="static"
            scrollable={true}
            size="lg"
            centered
          >
            <ModalHeader
              toggle={() => {
                if (formStatus.isFormChanged) {
                  return dispatch(
                    updateFormStatusAction({
                      key: "isShowModal",
                      value: true,
                    })
                  );
                }
                setNewCustodyForm(false);
              }}
              className="bg-light p-3"
            >
              Add New Safe Custody
            </ModalHeader>
            <ModalBody>
              <AddNewSafeCustodyForm
                closeForm={(isClose = false) => {
                  const isCloseType = isClose && typeof isClose === "boolean";
                  if (formStatus.isFormChanged && !isCloseType) {
                    return dispatch(
                      updateFormStatusAction({
                        key: "isShowModal",
                        value: true,
                      })
                    );
                  }
                  setNewCustodyForm(false);
                }}
                renderAllSafeCustody={renderAllSafeCustody}
                setSelectedCustody={setSelectedCustody}
              />
            </ModalBody>
          </Modal>
        )}
      </>
    );
  }

  function renderSafeSelect() {
    return (
      <div>
        <Table responsive={true} striped={true} hover={true}>
          <thead className="mb-2">
            <tr>
              <th>
                <Input
                  type="checkbox"
                  checked={
                    filteredData?.length > 0 &&
                    selected?.length === filteredData?.length
                  }
                  onChange={handleSelectAllClick}
                />
              </th>

              <th>
                <label
                  className="associatedContacts-label labelCursor"
                  onClick={() => handleSortByLabel("packetNumber")}
                >
                  Packet No.
                  <div className="associatedContacts-label-btn">
                    {sortOrder === "asc" && sortField === "packetNumber" ? (
                      <img
                        src={upArrowColoured}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    ) : (
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    )}
                    {sortOrder === "desc" && sortField === "packetNumber" ? (
                      <img
                        src={downArrowColoured}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    ) : (
                      <img
                        src={downArrow}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    )}
                  </div>
                </label>
                <Input
                  type="text"
                  value={filterInput.packetNumber}
                  name="packetNumber"
                  onChange={handleFilter}
                  onKeyDown={(e) => e.key === "Enter" && handleFilterSubmit()}
                  placeholder="Packet No."
                />
              </th>
              <th>
                <label
                  className="associatedContacts-label labelCursor"
                  onClick={() => handleSortByLabel("companyName")}
                >
                  Contacts
                  <div className="associatedContacts-label-btn">
                    {sortOrder === "asc" && sortField === "companyName" ? (
                      <img
                        src={upArrowColoured}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    ) : (
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    )}
                    {sortOrder === "desc" && sortField === "companyName" ? (
                      <img
                        src={downArrowColoured}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    ) : (
                      <img
                        src={downArrow}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    )}
                  </div>
                </label>
                <Input
                  type="text"
                  name="companyName"
                  value={filterInput.companyName}
                  onChange={handleFilter}
                  onKeyDown={(e) => e.key === "Enter" && handleFilterSubmit()}
                  placeholder="Contacts"
                />
              </th>
              <th>
                <label
                  className="associatedContacts-label labelCursor"
                  onClick={() => handleSortByLabel("status")}
                >
                  Status
                  <div className="associatedContacts-label-btn">
                    {sortOrder === "asc" && sortField === "status" ? (
                      <img
                        src={upArrowColoured}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    ) : (
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    )}
                    {sortOrder === "desc" && sortField === "status" ? (
                      <img
                        src={downArrowColoured}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    ) : (
                      <img
                        src={downArrow}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    )}
                  </div>
                </label>
                <Input
                  type="select"
                  name="status"
                  onChange={handleFilter}
                  value={filterInput.status}
                  onKeyDown={(e) => e.key === "Enter" && handleFilterSubmit()}
                  placeholder="Status"
                >
                  <option value="">ALL</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="UPLIFTED">UPLIFTED</option>
                </Input>
              </th>
              <th>
                <label
                  className="associatedContacts-label labelCursor"
                  onClick={() => handleSortByLabel("comments")}
                >
                  Comments
                  <div className="associatedContacts-label-btn">
                    {sortOrder === "asc" && sortField === "comments" ? (
                      <img
                        src={upArrowColoured}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    ) : (
                      <img
                        src={upArrow}
                        alt="asc"
                        className="label-btn-img-1"
                      />
                    )}
                    {sortOrder === "desc" && sortField === "comments" ? (
                      <img
                        src={downArrowColoured}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    ) : (
                      <img
                        src={downArrow}
                        alt="desc"
                        className="label-btn-img-2"
                      />
                    )}
                  </div>
                </label>
                <Input
                  type="text"
                  name="comment"
                  value={filterInput.comment}
                  onChange={handleFilter}
                  onKeyDown={(e) => e.key === "Enter" && handleFilterSubmit()}
                  placeholder="Comments"
                />
              </th>
              <th>
                <div className="d-flex justify-content-end">
                  <Button
                    className="d-flex mx-1"
                    type="button"
                    onClick={handleFilterSubmit}
                    color="success"
                  >
                    <MdSearch size={18} />
                  </Button>
                  <Button
                    className="d-flex mx-1"
                    type="button"
                    onClick={handleClearFilter}
                    color="danger"
                  >
                    <AiOutlineClose size={18} />
                  </Button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.length === 0 ? (
              <tr style={{ textAlign: "center" }}>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  <p>No records to display</p>
                </td>
              </tr>
            ) : (
              <Fragment>
                {filteredData?.map((packet, index) => {
                  if (index % 2 === 0)
                    return (
                      <tr key={packet.id} className="pe-cursor">
                        <td>
                          <Input
                            type="checkbox"
                            checked={isSelected(packet.id)}
                            onChange={() => {
                              handleSelectToDelete(packet.id);
                            }}
                          />
                        </td>

                        <td onClick={() => setSelectedCustody(packet.id)}>
                          <h6 className="mb-0">{packet.packetNumber}</h6>
                        </td>
                        <td onClick={() => setSelectedCustody(packet.id)}>
                          <TooltipWrapper
                            id={`contacts-${packet.id}`}
                            placement="bottom"
                            text={packet.contacts ? packet.contacts : ""}
                            content={convertSubstring(packet.contacts, 47)}
                          ></TooltipWrapper>
                        </td>
                        <td onClick={() => setSelectedCustody(packet.id)}>
                          <h6 className="mb-0">{packet.status}</h6>
                        </td>
                        <td onClick={() => setSelectedCustody(packet.id)}>
                          <TooltipWrapper
                            id={`comments-${packet.id}`}
                            placement="bottom"
                            text={packet?.comments ? packet?.comments : ""}
                            content={convertSubstring(packet?.comments, 47)}
                          ></TooltipWrapper>
                        </td>
                        <td onClick={() => setSelectedCustody(packet.id)}></td>
                        <td onClick={() => setSelectedCustody(packet.id)}></td>
                      </tr>
                    );
                  else {
                    return (
                      <tr key={packet.id} className="pe-cursor">
                        <td>
                          <Input
                            type="checkbox"
                            checked={isSelected(packet.id)}
                            onChange={() => {
                              handleSelectToDelete(packet.id);
                            }}
                          />
                        </td>

                        <td onClick={() => setSelectedCustody(packet.id)}>
                          <h6 className="mb-0">{packet.packetNumber}</h6>
                        </td>
                        <td onClick={() => setSelectedCustody(packet.id)}>
                          <TooltipWrapper
                            id={`contacts-${packet.id}`}
                            placement="bottom"
                            text={packet.contacts ? packet.contacts : ""}
                            content={convertSubstring(packet.contacts, 47)}
                          ></TooltipWrapper>
                        </td>
                        <td onClick={() => setSelectedCustody(packet.id)}>
                          <h6 className="mb-0">{packet.status}</h6>
                        </td>
                        <td onClick={() => setSelectedCustody(packet.id)}>
                          <TooltipWrapper
                            id={`comments-${packet.id}`}
                            placement="bottom"
                            text={packet?.comments ? packet?.comments : ""}
                            content={convertSubstring(packet?.comments, 47)}
                          ></TooltipWrapper>
                        </td>
                        <td onClick={() => setSelectedCustody(packet.id)}></td>
                        <td onClick={() => setSelectedCustody(packet.id)}></td>
                      </tr>
                    );
                  }
                })}
              </Fragment>
            )}
          </tbody>
        </Table>
        {!isLoading && (
          <CardBody className="mt-2">
            <Pagination
              pageNo={pageNo}
              pageSize={pageSize}
              totalRecords={totalRecords}
              totalPages={totalPages}
              handlePreviousPage={handlePreviousPage}
              handleNextPage={handleNextPage}
              handleJumpToPage={handleJumpToPage}
              changeNumberOfRows={changeNumberOfRows}
            />
          </CardBody>
        )}

        <div className="row safeSelectHeads" style={{ display: "none" }}>
          <div className="col-1 alignTextDiv">
            <input
              type="checkbox"
              checked={
                filteredData?.length > 0 &&
                selected?.length === filteredData?.length
              }
              onChange={handleSelectAllClick}
            />
          </div>
          <div className="col-2 changePadding changeSize">
            <label
              className="associatedContacts-label labelCursor"
              onClick={() => handleSortByLabel("siteName")}
            >
              Location
              <div className="associatedContacts-label-btn">
                {sortOrder === "asc" && sortField === "siteName" ? (
                  <img
                    src={upArrowColoured}
                    alt="asc"
                    className="label-btn-img-1"
                  />
                ) : (
                  <img src={upArrow} alt="asc" className="label-btn-img-1" />
                )}
                {sortOrder === "desc" && sortField === "siteName" ? (
                  <img
                    src={downArrowColoured}
                    alt="desc"
                    className="label-btn-img-2"
                  />
                ) : (
                  <img src={downArrow} alt="desc" className="label-btn-img-2" />
                )}
              </div>
            </label>
            <input
              type="text"
              value={filterInput.siteName}
              name="siteName"
              className="filterTextbox"
              onChange={handleFilter}
              onKeyDown={(e) => e.key === "Enter" && handleFilterSubmit()}
            ></input>
          </div>
          <div className="col-2 changePadding changeSize">
            <label
              className="associatedContacts-label labelCursor"
              onClick={() => handleSortByLabel("packetNumber")}
            >
              Packet No.
              <div className="associatedContacts-label-btn">
                {sortOrder === "asc" && sortField === "packetNumber" ? (
                  <img
                    src={upArrowColoured}
                    alt="asc"
                    className="label-btn-img-1"
                  />
                ) : (
                  <img src={upArrow} alt="asc" className="label-btn-img-1" />
                )}
                {sortOrder === "desc" && sortField === "packetNumber" ? (
                  <img
                    src={downArrowColoured}
                    alt="desc"
                    className="label-btn-img-2"
                  />
                ) : (
                  <img src={downArrow} alt="desc" className="label-btn-img-2" />
                )}
              </div>
            </label>
            <input
              type="text"
              value={filterInput.packetNumber}
              name="packetNumber"
              className="filterTextbox"
              onChange={handleFilter}
              onKeyDown={(e) => e.key === "Enter" && handleFilterSubmit()}
            />
          </div>
          <div className="col-2 changePadding changeSize">
            <label
              className="associatedContacts-label labelCursor"
              onClick={() => handleSortByLabel("companyName")}
            >
              Contacts
              <div className="associatedContacts-label-btn">
                {sortOrder === "asc" && sortField === "companyName" ? (
                  <img
                    src={upArrowColoured}
                    alt="asc"
                    className="label-btn-img-1"
                  />
                ) : (
                  <img src={upArrow} alt="asc" className="label-btn-img-1" />
                )}
                {sortOrder === "desc" && sortField === "companyName" ? (
                  <img
                    src={downArrowColoured}
                    alt="desc"
                    className="label-btn-img-2"
                  />
                ) : (
                  <img src={downArrow} alt="desc" className="label-btn-img-2" />
                )}
              </div>
            </label>
            <input
              type="text"
              name="companyName"
              value={filterInput.companyName}
              className="filterTextbox"
              onChange={handleFilter}
              onKeyDown={(e) => e.key === "Enter" && handleFilterSubmit()}
            ></input>
          </div>
          <div className="col-2 changePadding changeSize">
            <label
              className="associatedContacts-label labelCursor"
              onClick={() => handleSortByLabel("status")}
            >
              Status
              <div className="associatedContacts-label-btn">
                {sortOrder === "asc" && sortField === "status" ? (
                  <img
                    src={upArrowColoured}
                    alt="asc"
                    className="label-btn-img-1"
                  />
                ) : (
                  <img src={upArrow} alt="asc" className="label-btn-img-1" />
                )}
                {sortOrder === "desc" && sortField === "status" ? (
                  <img
                    src={downArrowColoured}
                    alt="desc"
                    className="label-btn-img-2"
                  />
                ) : (
                  <img src={downArrow} alt="desc" className="label-btn-img-2" />
                )}
              </div>
            </label>
            <select
              className="filterTextbox"
              name="status"
              onChange={handleFilter}
              value={filterInput.status}
              onKeyDown={(e) => e.key === "Enter" && handleFilterSubmit()}
            >
              <option value="">ALL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="UPLIFTED">UPLIFTED</option>
            </select>
          </div>
          <div className="col-2 changePadding changeSize">
            <label
              className="associatedContacts-label labelCursor"
              onClick={() => handleSortByLabel("comments")}
            >
              Comment
              <div className="associatedContacts-label-btn">
                {sortOrder === "asc" && sortField === "comments" ? (
                  <img
                    src={upArrowColoured}
                    alt="asc"
                    className="label-btn-img-1"
                  />
                ) : (
                  <img src={upArrow} alt="asc" className="label-btn-img-1" />
                )}
                {sortOrder === "desc" && sortField === "comments" ? (
                  <img
                    src={downArrowColoured}
                    alt="desc"
                    className="label-btn-img-2"
                  />
                ) : (
                  <img src={downArrow} alt="desc" className="label-btn-img-2" />
                )}
              </div>
            </label>
            <input
              type="text"
              name="comment"
              value={filterInput.comment}
              className="filterTextbox"
              onChange={handleFilter}
              onKeyDown={(e) => e.key === "Enter" && handleFilterSubmit()}
            />
          </div>
          <div className="col-1 sm">
            <button
              className="searchButton"
              type="button"
              onClick={handleFilterSubmit}
            >
              <MdSearch size={25} />
            </button>
          </div>
          <div className="col-1 sm">
            <button
              className="searchButton"
              type="button"
              onClick={handleClearFilter}
            >
              <AiOutlineClose size={25} />
            </button>
          </div>
        </div>
        <div style={{ display: "none" }}>
          {filteredData?.length === 0 ? (
            <div className={`row noRecordDiv`} style={{ textAlign: "center" }}>
              <p>No records to display</p>
            </div>
          ) : (
            <Fragment>
              {filteredData?.map((packet, index) => {
                if (index % 2 === 0)
                  return (
                    <div className="all-custodydatadiv" key={packet.id}>
                      <div className="row custodyContentPadding">
                        <div className="col-1 alignDivText showCursor">
                          <Input
                            type="checkbox"
                            checked={isSelected(packet.id)}
                            onChange={() => {
                              handleSelectToDelete(packet.id);
                            }}
                          />
                        </div>
                        <div
                          className="col-2 changePadding changeSize showCursor"
                          onClick={() => setSelectedCustody(packet.id)}
                        >
                          <h6>{packet.siteName}</h6>
                        </div>
                        <div
                          className="col-2 changePadding changeSize showCursor"
                          onClick={() => setSelectedCustody(packet.id)}
                        >
                          <h6>{packet.packetNumber}</h6>
                        </div>
                        <div
                          className="col-2 changePadding changeSize showCursor"
                          onClick={() => setSelectedCustody(packet.id)}
                        >
                          <OverlayTrigger
                            key="bottom"
                            placement="bottom-start"
                            overlay={
                              <Tooltip id={`tooltip-bottom`}>
                                <p style={{ textAlign: "left" }}>
                                  {packet.contacts ? packet.contacts : ""}
                                </p>
                              </Tooltip>
                            }
                          >
                            <h6>{convertSubstring(packet.contacts, 47)}</h6>
                          </OverlayTrigger>
                        </div>
                        <div
                          className="col-2 changePadding changeSize showCursor"
                          onClick={() => setSelectedCustody(packet.id)}
                        >
                          <h6>{packet.status}</h6>
                        </div>
                        <div
                          className="col-2 changePadding changeSize showCursor"
                          onClick={() => setSelectedCustody(packet.id)}
                        >
                          <OverlayTrigger
                            key="bottom"
                            placement="bottom-start"
                            overlay={
                              <Tooltip id={`tooltip-bottom`}>
                                <p style={{ textAlign: "left" }}>
                                  {packet?.comments ? packet?.comments : ""}
                                </p>
                              </Tooltip>
                            }
                          >
                            <h6>{convertSubstring(packet?.comments, 47)}</h6>
                          </OverlayTrigger>
                        </div>
                        <div
                          className="col-1 sm"
                          onClick={() => setSelectedCustody(packet.id)}
                        ></div>
                        <div
                          className="col-1 sm"
                          onClick={() => setSelectedCustody(packet.id)}
                        ></div>
                      </div>
                    </div>
                  );
                else {
                  return (
                    <div className="all-lightcustodydatadiv" key={packet.id}>
                      <div className="row custodyContentPadding">
                        <div className="col-1 alignDivText showCursor">
                          <Input
                            type="checkbox"
                            checked={isSelected(packet.id)}
                            onChange={() => {
                              handleSelectToDelete(packet.id);
                            }}
                          />
                        </div>
                        <div
                          className="col-2 changePadding changeSize showCursor"
                          onClick={() => setSelectedCustody(packet.id)}
                        >
                          <h6>{packet.siteName}</h6>
                        </div>
                        <div
                          className="col-2 changePadding changeSize showCursor"
                          onClick={() => setSelectedCustody(packet.id)}
                        >
                          <h6>{packet.packetNumber}</h6>
                        </div>
                        <div
                          className="col-2 changePadding changeSize showCursor"
                          onClick={() => setSelectedCustody(packet.id)}
                        >
                          <OverlayTrigger
                            key="bottom"
                            placement="bottom-start"
                            overlay={
                              <Tooltip id={`tooltip-bottom`}>
                                <p style={{ textAlign: "left" }}>
                                  {packet.contacts ? packet.contacts : ""}
                                </p>
                              </Tooltip>
                            }
                          >
                            <h6>{convertSubstring(packet.contacts, 47)}</h6>
                          </OverlayTrigger>
                        </div>
                        <div
                          className="col-2 changePadding changeSize showCursor"
                          onClick={() => setSelectedCustody(packet.id)}
                        >
                          <h6>{packet.status}</h6>
                        </div>
                        <div
                          className="col-2 changePadding changeSize showCursor"
                          onClick={() => setSelectedCustody(packet.id)}
                        >
                          <OverlayTrigger
                            key="bottom"
                            placement="bottom-start"
                            overlay={
                              <Tooltip id={`tooltip-bottom`}>
                                <p style={{ textAlign: "left" }}>
                                  {packet?.comments ? packet?.comments : ""}
                                </p>
                              </Tooltip>
                            }
                          >
                            <h6>{convertSubstring(packet.comments, 47)}</h6>
                          </OverlayTrigger>
                        </div>
                        <div
                          className="col-1 sm"
                          onClick={() => setSelectedCustody(packet.id)}
                        ></div>
                        <div
                          className="col-1 sm"
                          onClick={() => setSelectedCustody(packet.id)}
                        ></div>
                      </div>
                    </div>
                  );
                }
              })}
            </Fragment>
          )}
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Safe Custody" pageTitle="safe custody" />
          <Card>
            {selectedCustody === "" || selectedCustody === null ? (
              <>
                <CardHeader>{renderSafeSelectTop()}</CardHeader>
                {renderSafeSelect()}
                {isLoading && <LoadingPage />}
                {showConfirm && (
                  <Modal
                    isOpen={showConfirm}
                    toggle={() => setShowConfirm(false)}
                    backdrop="static"
                    scrollable={true}
                    size="md"
                    centered
                  >
                    <ModalHeader
                      toggle={() => setShowConfirm(false)}
                      className="bg-light p-3"
                    >
                      Confirm Your Action
                    </ModalHeader>
                    <ModalBody>
                      <ConfirmationPopup
                        closeForm={() => setShowConfirm(false)}
                        setBoolVal={setBoolVal}
                        selected={selected}
                        setSelected={setSelected}
                        renderAllSafeCustody={renderAllSafeCustody}
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
                          setNewCustodyForm(false);
                          formStatus.callback?.();
                          dispatch(resetFormStatusAction());
                        }}
                      />
                    </ModalBody>
                  </Modal>
                )}
              </>
            ) : (
              <RenderSafeCustody
                id={selectedCustody}
                setSelectedCustody={setSelectedCustody}
                aboutProps={aboutProps}
              />
            )}
          </Card>
        </Container>
      </div>
    </Fragment>
  );
}

export default AllSafeCustody;
