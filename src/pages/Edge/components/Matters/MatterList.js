import React, { useState, useEffect, Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  Container,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  FormGroup,
  Table,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { convertSubstring, findDisplayname } from "../../utils/utilFunc";
import {
  allStaffMember,
  getInvoiceofMatter,
  getMatterDetail,
  getMattersList,
} from "../../apis";
import LoadingPage from "../../utils/LoadingPage";

import "../../stylesheets/Matters.css";
import MatterDetail from "./MatterDetail";
import MatterBasicDetails from "./CreateMatter/BasicDetails";
import MatterCardSection from "./MatterCardSection";
import upArrow from "../../images/upArrow.svg";
import downArrow from "../../images/downArrow.svg";
import downArrowColoured from "../../images/downArrowColoured.svg";
import upArrowColoured from "../../images/upArrowColoured.svg";
import { MdFilterAlt } from "react-icons/md";
import { MdFilterAltOff } from "react-icons/md";
import Pagination from "../Pagination";
import ToggleSwitch from "../../utils/ToggleSwitch";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import TooltipWrapper from "../../../../Components/Common/TooltipWrapper";
import { toast } from "react-toastify";
import { AlertPopup } from "../customComponents/CustomComponents";
// Actions
import { resetCurrentRouterState } from "../../../../slices/thunks.js";
import {
  updateFormStatusAction,
  resetFormStatusAction,
} from "slices/layouts/reducer";

const initialFilter = {
  matterNumber: "",
  archiveNumber: "",
  instructionDate: null,
  completionDate: null,
  type: "",
  subType: "",
  letterSubject: "",
  contacts: "",
  status: "",
  sortOn: "",
  sortType: "",
  pageNo: 0,
  pageSize: 25,
  archived: false,
  myMatters: false,
};

const MatterList = () => {
  document.title = "Matters | EdgeLegal";
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentRouterState, formStatus, navigationEditForm } = useSelector(
    (state) => state.Layout
  );
  const [matterList, setMatterList] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [filterST, setFilterST] = useState([]);
  const [types, setTypes] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [filterInput, setFilterInput] = useState(initialFilter);
  const [statusList, setStatusList] = useState([]);
  const [matterDetail, setMatterDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [labelSort, setLabelSort] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showMyMatter, setShowMyMatter] = useState(false);

  const fetchMatterList = async (filters = filterInput) => {
    try {
      setLoading(true);
      const { data } = await getMattersList(filters);
      if (data.success) {
        setMatterList(data?.data?.matterList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data?.metadata?.page?.totalRecords);
      } else {
        toast.warning("There is some error occured. Please try later.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const fetchEnums = () => {
    let enumsList = JSON.parse(window.localStorage.getItem("enumList"));
    let typeList = JSON.parse(window.localStorage.getItem("matterTypeList"));

    if (typeList && typeList.length > 0) {
      setTypes(typeList);
    }
    let status = [];
    let subType = [];
    if (enumsList) {
      status =
        enumsList["MatterStatus"] && enumsList["MatterStatus"].length > 0
          ? enumsList["MatterStatus"]
          : [];
      setStatusList(status);
      subType =
        enumsList["MatterSubType"] && enumsList["MatterSubType"].length > 0
          ? enumsList["MatterSubType"]
          : [];
      setSubTypes(subType);
    }
  };

  const starter = () => {
    setLoading(true);
    fetchEnums();
    fetchMatterList();
  };

  useEffect(() => {
    starter();
  }, []);

  useEffect(() => {
    if (currentRouterState) {
      // navigate({ search: "" });
      setMatterDetail(null);
      dispatch(resetCurrentRouterState());
    }
  }, [currentRouterState]);

  useEffect(() => {
    if (navigationEditForm.isEditMode) {
      setLoading(true);
      fetchMatterDetail(navigationEditForm.currentFormValue.matterId);
    }
  }, [navigationEditForm]);

  const fetchMatterDetail = async (id) => {
    let rval = {};
    try {
      setLoading(true);

      const [matterDetails, invoiceDetails] = await Promise.all([
        getMatterDetail(id),
        getInvoiceofMatter(id),
      ]);

      if (matterDetails.data.success) {
        const res = await fetchStaffList();
        if (res === "fail") {
          toast.warning("There is some error occured. Please try later.");
          return;
        } else {
          setStaffList(res);
        }

        // add invoice list with other details
        let inv = invoiceDetails?.data?.data?.invoiceList;
        rval = matterDetails.data.data;

        rval.invoiceList = inv && inv.length > 0 ? inv : [];

        setMatterDetail(rval);
      } else {
        toast.warning("There is some error occured. Please try later.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const parseStaffList = (list) => {
    let newList = [];

    list.forEach((d) => {
      newList.push({
        display: `${d.firstName ? d.firstName : ""} ${
          d.lastName ? d.lastName : ""
        }`,
        value: d.id,
        active: d.staffActive,
      });
    });
    return newList;
  };

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const { data } = await allStaffMember({ staffActive: "" });
      let arr = [];
      if (data.success) {
        if (
          data?.data?.staffMemberList &&
          data?.data?.staffMemberList.length > 0
        ) {
          arr = parseStaffList(data?.data?.staffMemberList);
        }
      } else {
        toast.warning("There is some error occured, please try later.");
      }
      setLoading(false);
      return new Promise((resolve, reject) => resolve(arr));
    } catch (error) {
      setLoading(false);
      console.error(error);
      return new Promise((resolve, reject) => reject("fail"));
    }
  };

  const filterChange = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
  };

  const handleRefreshList = async (filters = filterInput) => {
    setLoading(true);
    try {
      setTotalRecords(0);
      const { data } = await getMattersList(filters);
      if (data.success) {
        setMatterList(data?.data?.matterList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data?.metadata?.page?.totalRecords);
      } else {
        toast.warning(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setFilterInput(initialFilter);
    setLabelSort("");
    setSortOrder("");
    setSortField("");
    setFilterST([]);
    handleRefreshList(initialFilter);
  };

  const handleSortByLabel = (field) => {
    if (labelSort !== field) {
      setLabelSort(field);
      setSortOrder("asc");
      setSortField(field);
      setFilterInput({ ...filterInput, sortOn: field, sortType: "ASC" });
      handleRefreshList({ ...filterInput, sortOn: field, sortType: "ASC" });
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(field);
      setFilterInput({ ...filterInput, sortOn: field, sortType: "DESC" });
      handleRefreshList({ ...filterInput, sortOn: field, sortType: "DESC" });
    }
  };

  const handleChangeType = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });

    let obj = types.find((t) => t.value === value);

    if (obj && obj.subType && obj.subType.length > 0) {
      setFilterST(obj.subType);
    } else {
      setFilterST([]);
    }

    handleRefreshList({ ...filterInput, [name]: value });
  };

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });

    setTimeout(() => {
      if (["type", "status", "subType"].includes(name)) {
        handleRefreshList({ ...filterInput, [name]: value });
      }
    }, 10);
  };

  const handlePreviousPage = () => {
    let pg = pageNo - 1;
    setPageNo(pg);

    handleRefreshList({ ...filterInput, pageNo: pg });
  };

  const handleNextPage = () => {
    let pg = pageNo + 1;
    setPageNo(pg);

    handleRefreshList({ ...filterInput, pageNo: pg });
  };

  const handleJumpToPage = (num) => {
    setPageNo(num - 1);
    handleRefreshList({ ...filterInput, pageNo: num - 1 });
  };

  const changeNumberOfRows = (e) => {
    setPageSize(e.target.value);
    let currSize = e.target.value;

    let tempTotalPages = Math.ceil(totalRecords / currSize);
    let tempPageNo = tempTotalPages - 1;

    if (tempPageNo < pageNo) {
      setPageNo(tempPageNo);
    } else {
      tempPageNo = pageNo;
    }

    handleRefreshList({
      ...filterInput,
      pageNo: tempPageNo,
      pageSize: currSize,
    });
  };

  const handleArchived = () => {
    if (showArchived) {
      setShowArchived(false);
      setFilterInput({ ...filterInput, archived: false });
      handleRefreshList({ ...filterInput, archived: false });
    } else {
      setShowArchived(true);
      setFilterInput({ ...filterInput, archived: true });
      handleRefreshList({ ...filterInput, archived: true });
    }
  };

  const handleMyMatter = () => {
    if (showMyMatter) {
      setShowMyMatter(false);
      setFilterInput({ ...filterInput, myMatters: false });
      handleRefreshList({ ...filterInput, myMatters: false });
    } else {
      setShowMyMatter(true);
      setFilterInput({ ...filterInput, myMatters: true });
      handleRefreshList({ ...filterInput, myMatters: true });
    }
  };

  const noOfRecords = () => {
    if (totalRecords > 0) {
      return `(${totalRecords})`;
    } else {
      return "";
    }
  };

  const listPage = () => {
    return (
      <Fragment>
        <div className="page-content">
          <Container fluid>
            <BreadCrumb title="Matter Management" pageTitle="Matter" />
            <Card>
              {/* <CardHeader>
                <MatterCardSection />
              </CardHeader> */}

              <CardHeader>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <h5 className="card-title mb-md-0">
                      {`${
                        showArchived ? `Archived Matters` : `Matters`
                      } ${noOfRecords()}`}
                    </h5>
                    {!showArchived && (
                      <Button
                        color="success"
                        type="button"
                        onClick={() => setShowAdd(true)}
                        className="mx-2"
                      >
                        <i className="ri-add-line align-bottom me-1"></i> New
                        Matter
                      </Button>
                    )}
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="mx-1">
                      <p className="mb-0">Archived Matter</p>
                      <FormGroup switch>
                        <Input
                          type="switch"
                          role="switch"
                          checked={showArchived}
                          onClick={handleArchived}
                          size="md"
                        />
                      </FormGroup>
                    </div>
                    <div className="mx-1">
                      <p className="mb-0">My Matters</p>
                      <FormGroup switch>
                        <Input
                          type="switch"
                          role="switch"
                          checked={showMyMatter}
                          onClick={handleMyMatter}
                          size="md"
                        />
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <div className="topStrip-style" style={{ display: "none" }}>
                <p className="topStrip-heading">
                  {`${
                    showArchived ? `Archived Matters` : `Matters`
                  } ${noOfRecords()}`}
                </p>
                {!showArchived && (
                  <button
                    className="custodyAddbtn"
                    onClick={() => setShowAdd(true)}
                  >
                    {" "}
                    <span className="plusdiv">+</span> New Matter
                  </button>
                )}
                <div className="mt-archived cp">
                  <div className="flx mr-r10">
                    <p className="topStrip-heading mr-r10">Archived Matter</p>
                    <ToggleSwitch
                      checked={showArchived}
                      handleFunc={handleArchived}
                      labelClick={false}
                    />
                  </div>
                  <div className="vt-sep"></div>
                  <div className="flx mr-l10">
                    <p className="topStrip-heading mr-r10">My Matters</p>
                    <ToggleSwitch
                      checked={showMyMatter}
                      handleFunc={handleMyMatter}
                      labelClick={false}
                    />
                  </div>
                </div>
              </div>
              {/************ Table header ******************** */}
              <CardBody>
                <Table responsive={true} striped={true} hover={true}>
                  <thead className="mb-2">
                    <tr>
                      <th>
                        {showArchived ? (
                          <>
                            <div
                              className="d-flex"
                              onClick={() => handleSortByLabel("archiveNumber")}
                            >
                              <label>Archive No.</label>
                              <div className="associatedContacts-label-btn labelCursor">
                                {sortOrder === "asc" &&
                                sortField === "archiveNumber" ? (
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
                                {sortOrder === "desc" &&
                                sortField === "archiveNumber" ? (
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
                            </div>
                            <Input
                              type="text"
                              name="archiveNumber"
                              placeholder="Archive Number"
                              value={filterInput.archiveNumber}
                              onChange={filterChange}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleRefreshList()
                              }
                            />
                          </>
                        ) : (
                          <>
                            <div
                              className="d-flex"
                              onClick={() => handleSortByLabel("matterNumber")}
                            >
                              <label>Matter No.</label>
                              <div className="associatedContacts-label-btn labelCursor">
                                {sortOrder === "asc" &&
                                sortField === "matterNumber" ? (
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
                                {sortOrder === "desc" &&
                                sortField === "matterNumber" ? (
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
                            </div>
                            <Input
                              type="text"
                              name="matterNumber"
                              placeholder="Matter Number"
                              value={filterInput.matterNumber}
                              onChange={filterChange}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleRefreshList()
                              }
                            />
                          </>
                        )}
                      </th>
                      <th>
                        <div className="d-flex">
                          <label>RE</label>
                        </div>
                        <Input
                          type="text"
                          name="letterSubject"
                          placeholder="RE"
                          value={filterInput.letterSubject}
                          onChange={filterChange}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleRefreshList()
                          }
                        />
                      </th>
                      <th>
                        <div
                          className="d-flex"
                          onClick={() => handleSortByLabel("type")}
                        >
                          <label>Type</label>
                          <div className="associatedContacts-label-btn labelCursor">
                            {sortOrder === "asc" && sortField === "type" ? (
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
                            {sortOrder === "desc" && sortField === "type" ? (
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
                        </div>
                        <Input
                          name="type"
                          type="select"
                          value={filterInput.type}
                          onChange={handleChangeType}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleRefreshList()
                          }
                        >
                          <option value="">All</option>
                          {types.map((item, idx) => (
                            <option key={idx} value={item.value}>
                              {item.display}
                            </option>
                          ))}
                        </Input>
                      </th>
                      <th>
                        <div
                          className="d-flex"
                          onClick={() => handleSortByLabel("subType")}
                        >
                          <label>Sub-type</label>
                          <div className="associatedContacts-label-btn labelCursor">
                            {sortOrder === "asc" && sortField === "subType" ? (
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
                            {sortOrder === "desc" && sortField === "subType" ? (
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
                        </div>
                        <Input
                          name="subType"
                          type="select"
                          value={filterInput.subType}
                          disabled={filterST.length === 0}
                          onChange={handleChangeFilter}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleRefreshList()
                          }
                        >
                          <option value="">All</option>
                          {filterST.map((item, idx) => (
                            <option key={idx} value={item.value}>
                              {item.display}
                            </option>
                          ))}
                        </Input>
                      </th>
                      <th>
                        <div
                          className="d-flex"
                          onClick={() => handleSortByLabel("status")}
                        >
                          <label>Status</label>
                          <div className="associatedContacts-label-btn labelCursor">
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
                        </div>
                        <Input
                          name="status"
                          type="select"
                          value={filterInput.status}
                          onChange={handleChangeFilter}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleRefreshList()
                          }
                        >
                          <option value="">All</option>
                          {statusList.map((item, idx) => (
                            <option key={idx} value={item.value}>
                              {item.display}
                            </option>
                          ))}
                        </Input>
                      </th>
                      <th>
                        <div
                          className="d-flex"
                          onClick={() => handleSortByLabel("contacts")}
                        >
                          <label>Contacts</label>
                          {/* <div className="associatedContacts-label-btn labelCursor">
                          {sortOrder === "asc" && sortField === "contacts" ? (
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
                          {sortOrder === "desc" && sortField === "contacts" ? (
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
                        </div> */}
                        </div>
                        <Input
                          type="text"
                          name="contacts"
                          placeholder="Contact"
                          value={filterInput.contacts}
                          onChange={filterChange}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleRefreshList()
                          }
                        />
                      </th>
                      <th>
                        <div className="d-flex justify-content-end">
                          <Button
                            type="button"
                            color="success"
                            className="mx-1"
                            onClick={() => handleRefreshList()}
                          >
                            <MdFilterAlt size={18} />
                          </Button>
                          <Button
                            type="button"
                            color="danger"
                            className="mx-1"
                            onClick={() => handleResetFilter()}
                          >
                            <MdFilterAltOff size={18} />
                          </Button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="mt-2">
                    {matterList?.map((matter, i) => (
                      <tr
                        key={i}
                        onClick={() => fetchMatterDetail(matter.id)}
                        className="pe-cursor"
                      >
                        <td>
                          <p className="mb-0">
                            {showArchived
                              ? matter.archiveNumber
                              : matter.matterNumber}
                          </p>
                        </td>
                        <td style={{ minWidth: "250px" }}>
                          <TooltipWrapper
                            id={`matterNo-${matter.id}`}
                            placement="bottom"
                            text={matter.letterSubject}
                            content={convertSubstring(
                              matter.letterSubject,
                              100
                            )}
                          ></TooltipWrapper>
                        </td>
                        <td>
                          <TooltipWrapper
                            id={`re-${matter.id}`}
                            placement="bottom"
                            text={findDisplayname(types, matter.type)}
                            content={convertSubstring(
                              findDisplayname(types, matter.type),
                              100
                            )}
                          ></TooltipWrapper>
                        </td>
                        <td>
                          <TooltipWrapper
                            id={`sub-type-${matter.id}`}
                            placement="bottom"
                            text={findDisplayname(subTypes, matter.subType)}
                            content={convertSubstring(
                              findDisplayname(subTypes, matter.subType),
                              100
                            )}
                          ></TooltipWrapper>
                        </td>
                        <td>
                          <p className="mb-0">
                            {findDisplayname(statusList, matter.status)}
                          </p>
                        </td>
                        <td>
                          <TooltipWrapper
                            id={`contact-${matter.id}`}
                            placement="bottom"
                            text={matter.contacts}
                            content={convertSubstring(matter.contacts, 100)}
                          ></TooltipWrapper>
                        </td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="mx-2">
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
                </div>
              </CardBody>

              <div className="matter-filterSec" style={{ display: "none" }}>
                <div className="matter-col ex-sm"></div>
                <div className="matter-col md">
                  <div
                    className="flx"
                    onClick={() => handleSortByLabel("matterNumber")}
                  >
                    <label>Matter No.</label>
                    <div className="associatedContacts-label-btn labelCursor">
                      {sortOrder === "asc" && sortField === "matterNumber" ? (
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
                      {sortOrder === "desc" && sortField === "matterNumber" ? (
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
                  </div>
                  <input
                    type="text"
                    name="matterNumber"
                    value={filterInput.matterNumber}
                    onChange={filterChange}
                    onKeyDown={(e) => e.key === "Enter" && handleRefreshList()}
                  />
                </div>
                <div className="matter-col xlg">
                  <div className="flx">
                    <label>RE</label>
                  </div>
                  <input
                    type="text"
                    name="letterSubject"
                    value={filterInput.letterSubject}
                    onChange={filterChange}
                    onKeyDown={(e) => e.key === "Enter" && handleRefreshList()}
                  />
                </div>
                <div className="matter-col md">
                  <div
                    className="flx"
                    onClick={() => handleSortByLabel("type")}
                  >
                    <label>Type</label>
                    <div className="associatedContacts-label-btn labelCursor">
                      {sortOrder === "asc" && sortField === "type" ? (
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
                      {sortOrder === "desc" && sortField === "type" ? (
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
                  </div>
                  <select
                    className="template-filterInput"
                    name="type"
                    value={filterInput.type}
                    onChange={handleChangeType}
                    onKeyDown={(e) => e.key === "Enter" && handleRefreshList()}
                  >
                    <option value="">All</option>
                    {types.map((t, idx) => (
                      <option key={idx} value={t.value}>
                        {t.display}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="matter-col md">
                  <div
                    className="flx"
                    onClick={() => handleSortByLabel("subType")}
                  >
                    <label>Sub-type</label>
                    <div className="associatedContacts-label-btn labelCursor">
                      {sortOrder === "asc" && sortField === "subType" ? (
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
                      {sortOrder === "desc" && sortField === "subType" ? (
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
                  </div>
                  <select
                    className="template-filterInput"
                    name="subType"
                    value={filterInput.subType}
                    disabled={filterST.length === 0}
                    onChange={handleChangeFilter}
                    onKeyDown={(e) => e.key === "Enter" && handleRefreshList()}
                  >
                    <option value="">All</option>
                    {filterST.map((t, idx) => (
                      <option key={idx} value={t.value}>
                        {t.display}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="matter-col md">
                  <div
                    className="flx"
                    onClick={() => handleSortByLabel("status")}
                  >
                    <label>Status</label>
                    <div className="associatedContacts-label-btn labelCursor">
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
                  </div>
                  <select
                    className="template-filterInput"
                    name="status"
                    value={filterInput.status}
                    onChange={handleChangeFilter}
                    onKeyDown={(e) => e.key === "Enter" && handleRefreshList()}
                  >
                    <option value="">All</option>
                    {statusList.map((t, idx) => (
                      <option key={idx} value={t.value}>
                        {t.display}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="matter-col lg">
                  <div
                    className="flx"
                    onClick={() => handleSortByLabel("contacts")}
                  >
                    <label>Contacts</label>
                    {/* <div className='associatedContacts-label-btn labelCursor'>
                {sortOrder === 'asc' && sortField === 'contacts' ? (
                  <img
                    src={upArrowColoured}
                    alt='asc'
                    className='label-btn-img-1'
                  />
                ) : (
                  <img src={upArrow} alt='asc' className='label-btn-img-1' />
                )}
                {sortOrder === 'desc' && sortField === 'contacts' ? (
                  <img
                    src={downArrowColoured}
                    alt='desc'
                    className='label-btn-img-2'
                  />
                ) : (
                  <img src={downArrow} alt='desc' className='label-btn-img-2' />
                )}
              </div> */}
                  </div>
                  <input
                    type="text"
                    name="contacts"
                    value={filterInput.contacts}
                    onChange={filterChange}
                    onKeyDown={(e) => e.key === "Enter" && handleRefreshList()}
                  />
                </div>

                {/* <div className='matter-col lg'>
            <div
              className='flx'
              onClick={() => handleSortByLabel('instructionDate')}
            >
              <label>Instruction Date</label>
              <div className='associatedContacts-label-btn labelCursor'>
                {sortOrder === 'asc' && sortField === 'instructionDate' ? (
                  <img
                    src={upArrowColoured}
                    alt='asc'
                    className='label-btn-img-1'
                  />
                ) : (
                  <img src={upArrow} alt='asc' className='label-btn-img-1' />
                )}
                {sortOrder === 'desc' && sortField === 'instructionDate' ? (
                  <img
                    src={downArrowColoured}
                    alt='desc'
                    className='label-btn-img-2'
                  />
                ) : (
                  <img src={downArrow} alt='desc' className='label-btn-img-2' />
                )}
              </div>
            </div>

            <input
              type='date'
              name='instructionDate'
              value={moment(filterInput.instructionDate).format('YYYY-MM-DD')}
              onChange={filterChange}
              onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
            />
          </div> */}
                {/* <div className='matter-col lg'>
            <div
              className='flx'
              onClick={() => handleSortByLabel('completionDate')}
            >
              <label>Completion Date</label>
              <div className='associatedContacts-label-btn labelCursor'>
                {sortOrder === 'asc' && sortField === 'completionDate' ? (
                  <img
                    src={upArrowColoured}
                    alt='asc'
                    className='label-btn-img-1'
                  />
                ) : (
                  <img src={upArrow} alt='asc' className='label-btn-img-1' />
                )}
                {sortOrder === 'desc' && sortField === 'completionDate' ? (
                  <img
                    src={downArrowColoured}
                    alt='desc'
                    className='label-btn-img-2'
                  />
                ) : (
                  <img src={downArrow} alt='desc' className='label-btn-img-2' />
                )}
              </div>
            </div>

            <input
              type='date'
              name='completionDate'
              value={moment(filterInput.completionDate).format('YYYY-MM-DD')}
              onChange={filterChange}
              onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
            />
          </div> */}
                <div className="matter-col ex-sm">
                  <button
                    className="searchButton"
                    onClick={() => handleRefreshList()}
                  >
                    <MdFilterAlt size={25} />
                  </button>
                </div>
                <div className="matter-col ex-sm">
                  <button className="searchButton" onClick={handleResetFilter}>
                    <MdFilterAltOff size={25} />
                  </button>
                </div>
              </div>

              {/************Table row section******************** */}
              <div className="matter-tableSec" style={{ display: "none" }}>
                {matterList?.map((matter, i) => (
                  <div
                    className="matter-row pe-cursor"
                    key={i}
                    onClick={() => fetchMatterDetail(matter.id)}
                  >
                    <div className="matter-col ex-sm"></div>
                    <div className="matter-col md">
                      <p>{matter.matterNumber}</p>
                    </div>
                    <div className="matter-col xlg">
                      <OverlayTrigger
                        key="bottom"
                        placement="bottom-start"
                        overlay={
                          <Tooltip id={`tooltip-bottom`}>
                            <p style={{ textAlign: "left" }}>
                              {matter.letterSubject}
                            </p>
                          </Tooltip>
                        }
                      >
                        <p className="full three-dot">{matter.letterSubject}</p>
                      </OverlayTrigger>
                    </div>
                    <div className="matter-col md">
                      <OverlayTrigger
                        key="bottom"
                        placement="bottom-start"
                        overlay={
                          <Tooltip id={`tooltip-bottom`}>
                            <p style={{ textAlign: "left" }}>
                              {findDisplayname(types, matter.type)}
                            </p>
                          </Tooltip>
                        }
                      >
                        <p className="full three-dot">
                          {findDisplayname(types, matter.type)}
                        </p>
                      </OverlayTrigger>
                    </div>
                    <div className="matter-col md">
                      <OverlayTrigger
                        key="bottom"
                        placement="bottom-start"
                        overlay={
                          <Tooltip id={`tooltip-bottom`}>
                            <p style={{ textAlign: "left" }}>
                              {findDisplayname(subTypes, matter.subType)}
                            </p>
                          </Tooltip>
                        }
                      >
                        <p className="full three-dot">
                          {findDisplayname(subTypes, matter.subType)}
                        </p>
                      </OverlayTrigger>
                    </div>
                    <div className="matter-col md">
                      <p className="full three-dot">
                        {findDisplayname(statusList, matter.status)}
                      </p>
                    </div>
                    <div className="matter-col lg">
                      <OverlayTrigger
                        key="bottom"
                        placement="bottom-start"
                        overlay={
                          <Tooltip id={`tooltip-bottom`}>
                            <p style={{ textAlign: "left" }}>
                              {matter.contacts}
                            </p>
                          </Tooltip>
                        }
                      >
                        <p>{convertSubstring(matter.contacts)}</p>
                      </OverlayTrigger>
                    </div>

                    {/* <div className='matter-col lg'>
                <p>
                  {matter.instructionDate
                    ? moment(matter.instructionDate).format('DD-MM-YYYY')
                    : ''}
                </p>
              </div>
              <div className='matter-col lg'>
                <p>
                  {matter.completionDate
                    ? moment(matter.completionDate).format('DD-MM-YYYY')
                    : ''}
                </p>
              </div> */}
                    <div className="matter-col ex-sm"></div>
                    <div className="matter-col ex-sm"></div>
                  </div>
                ))}
              </div>
              {/* <Pagination
                pageNo={pageNo}
                pageSize={pageSize}
                totalRecords={totalRecords}
                totalPages={totalPages}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                handleJumpToPage={handleJumpToPage}
                changeNumberOfRows={changeNumberOfRows}
              /> */}
              {showAdd && (
                <Modal
                  isOpen={showAdd}
                  toggle={() => {
                    if (formStatus.isFormChanged) {
                      return dispatch(
                        updateFormStatusAction({
                          key: "isShowModal",
                          value: true,
                        })
                      );
                    }
                    setShowAdd(false);
                  }}
                  backdrop="static"
                  scrollable={true}
                  size="xl"
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
                      setShowAdd(false);
                    }}
                    className="bg-light p-3"
                  >
                    Add New Matter
                  </ModalHeader>
                  <ModalBody>
                    <MatterBasicDetails
                      close={(isClose = false) => {
                        const isCloseType =
                          isClose && typeof isClose === "boolean";
                        if (formStatus.isFormChanged && !isCloseType) {
                          return dispatch(
                            updateFormStatusAction({
                              key: "isShowModal",
                              value: true,
                            })
                          );
                        }
                        setShowAdd(false);
                        dispatch(resetFormStatusAction());
                      }}
                      fetchStaffList={fetchStaffList}
                      fetchMatterList={fetchMatterList}
                    />
                  </ModalBody>
                </Modal>
              )}
              {/* {showAdd && (
                <MatterBasicDetails
                  close={() => setShowAdd(false)}
                  fetchStaffList={fetchStaffList}
                  fetchMatterList={fetchMatterList}
                />
              )} */}
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
                        setShowAdd(false);
                        formStatus.callback?.();
                        dispatch(resetFormStatusAction());
                      }}
                    />
                  </ModalBody>
                </Modal>
              )}
            </Card>
          </Container>
        </div>
      </Fragment>
    );
  };

  const handleRefresh = async (selected) => {
    await fetchMatterDetail(matterDetail.id);
  };

  const ui = () => {
    if (matterDetail) {
      return (
        <MatterDetail
          data={matterDetail}
          setMatterDetail={setMatterDetail}
          staffList={staffList}
          refreshListing={fetchMatterList}
          refresh={handleRefresh}
        />
      );
    }
    return listPage();
  };

  return (
    <Fragment>
      {ui()}
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default MatterList;
