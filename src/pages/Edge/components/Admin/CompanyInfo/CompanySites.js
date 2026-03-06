import React, { Fragment, useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { BiEditAlt } from "react-icons/bi";
import {
  Button,
  Input,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { getSiteById, updateSiteInfo } from "../../../apis";
import downArrow from "../../../images/downArrow.svg";
import downArrowColoured from "../../../images/downArrowColoured.svg";
import upArrow from "../../../images/upArrow.svg";
import upArrowColoured from "../../../images/upArrowColoured.svg";
import ToggleSwitch from "../../../utils/ToggleSwitch";

import { toast } from "react-toastify";
import "../../../stylesheets/CompanyInfoPage.css";
import LoadingPage from "../../../utils/LoadingPage";
import { convertSubstring, formatDateFunc } from "../../../utils/utilFunc";
import AddNewSite from "./AddNewSite";
import EditSiteInfo from "./EditSiteInfo";
import TooltipWrapper from "../../../../../Components/Common/TooltipWrapper";
import { v1 as uuidv1 } from "uuid";
import { AiOutlineClose } from "react-icons/ai";
import { MdFilterAltOff } from "react-icons/md";

const filterFields = {
  siteName: "",
  website: "",
  email1: "",
  postCode: "",
  siteCode: "",
};

const CompanySites = (props) => {
  const { siteList, refreshData } = props;
  const [filterInput, setFilterInput] = useState(filterFields);
  const [filteredData, setFilteredData] = useState(siteList);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [labelSort, setLabelSort] = useState("");
  const [accTypeList, setAccTypeList] = useState([]);

  const fetchEnumList = () => {
    let obj = JSON.parse(window.localStorage.getItem("enumList"));
    if (obj && obj.BankAccountType && obj?.BankAccountType?.length > 0) {
      setAccTypeList(obj.BankAccountType);
    }
  };

  useEffect(() => {
    setFilteredData(props.siteList);
    fetchEnumList();
  }, [props.siteList]);

  const handleActiveStatus = async (obj) => {
    let newObj = {
      ...obj,
      activeStatus: !obj.activeStatus,
    };

    let formInfoData = new FormData();

    formInfoData.append(
      "siteInfoDetails",
      JSON.stringify({
        requestId: uuidv1(),
        data: newObj,
      })
    );

    try {
      const { data } = await updateSiteInfo(formInfoData);
      if (data.success) {
        refreshData();
      } else {
        toast.error("Something went wrong, please try later");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const { data } = await getSiteById(id);
      if (data.success) {
        setSelectedSite(data.data);
        setShowEdit(true);
      } else {
        toast.error("Something went wrong please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const filterData = (obj) => {
    const newData = siteList?.filter(
      (data) =>
        (obj["siteCode"] !== ""
          ? data["siteCode"]
              ?.toLowerCase()
              ?.includes(obj["siteCode"]?.toLowerCase())
          : true) &&
        (obj["siteName"] !== ""
          ? data["siteName"]
              ?.toLowerCase()
              ?.includes(obj["siteName"]?.toLowerCase())
          : true) &&
        (obj["website"] !== ""
          ? data["website"]
              ?.toLowerCase()
              ?.includes(obj["website"]?.toLowerCase())
          : true) &&
        (obj["email1"] !== ""
          ? data["email1"]
              ?.toLowerCase()
              ?.includes(obj["email1"]?.toLowerCase())
          : true)
    );
    setFilteredData(newData);
  };

  const handleFilter = (e) => {
    const { name } = e.target;
    setFilterInput({ ...filterInput, [name]: e.target.value });
    filterData({ ...filterInput, [name]: e.target.value });
  };

  const sortFunc = (sorton) => {
    let newArray = [];
    if (labelSort !== sorton) {
      setLabelSort(sorton);
      setSortOrder("asc");
      setSortField(sorton);
      newArray = filteredData.sort((a, b) => {
        if (a[sorton] === b[sorton]) {
          return 0;
        }

        if (a[sorton] === "" || a[sorton] === null) {
          return 1;
        }
        if (b[sorton] === "" || b[sorton] === null) {
          return -1;
        }

        return (a[sorton] ? a[sorton].toLowerCase() : "") <
          (b[sorton] ? b[sorton].toLowerCase() : "")
          ? -1
          : 1;
      });
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(sorton);
      newArray = filteredData.sort((a, b) => {
        if (a[sorton] === b[sorton]) {
          return 0;
        }

        if (a[sorton] === "" || a[sorton] === null) {
          return 1;
        }
        if (b[sorton] === "" || b[sorton] === null) {
          return -1;
        }

        return (a[sorton] ? a[sorton].toLowerCase() : "") <
          (b[sorton] ? b[sorton].toLowerCase() : "")
          ? 1
          : -1;
      });
    }
    setFilteredData(newArray);
  };

  const handleResetFilter = () => {
    setFilterInput(filterFields);
    setSortField("");
    setSortOrder("");
    setLabelSort("");
    setFilteredData(siteList);
  };

  return (
    <Fragment>
      <div className="bg-light d-flex align-items-center justify-content-between p-2">
        <h5 className="mb-0">Company Sites</h5>
        <Button
          color="success"
          onClick={() => setShowAdd(true)}
          className="d-flex"
        >
          <span className="plusdiv">+</span> Add
        </Button>
      </div>

      <Table responsive={true} striped={true} hover={true}>
        <thead className="mb-2">
          <tr>
            <th className="align-top">
              <p>Edit</p>
            </th>
            <th className="align-top">
              <p>Active Status</p>
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("siteCode")}
              >
                <p>Site Code</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "siteCode" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "siteCode" ? (
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
                name="siteCode"
                onChange={handleFilter}
                autoComplete="off"
                placeholder="Site Code"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("siteName")}
              >
                <p>Site Name</p>
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
                    <img
                      src={downArrow}
                      alt="desc"
                      className="label-btn-img-2"
                    />
                  )}
                </div>
              </div>
              <Input
                name="siteName"
                onChange={handleFilter}
                autoComplete="off"
                placeholder="Site Name"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("website")}
              >
                <p>Website</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "website" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "website" ? (
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
                name="website"
                onChange={handleFilter}
                autoComplete="off"
                placeholder="Website"
              />
            </th>
            <th>
              <div
                className="d-flex justify-content-start"
                onClick={() => sortFunc("email1")}
              >
                <p>Email</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "email1" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "email1" ? (
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
                name="email1"
                onChange={handleFilter}
                autoComplete="off"
                placeholder="Email"
              />
            </th>
            <th className="align-top">
              <p>Date Active</p>
            </th>
            <th className="align-top">
              <p>Date Deactivated</p>
            </th>
            <th>
              <div className="d-flex justify-content-end">
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
        <tbody>
          {filteredData?.map((site) => (
            <tr
              key={site.siteId}
              onClick={() => handleEdit(site.siteId)}
              className="pe-cursor"
            >
              <td>
                <button
                  className="companySites-editBtn mb-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(site.siteId);
                  }}
                >
                  <BiEditAlt className="companySites-editIcon" />
                </button>
              </td>
              <td>
                <ToggleSwitch
                  checked={site.activeStatus}
                  handleFunc={() => handleActiveStatus(site)}
                />
              </td>
              <td>
                <p className="mb-0">{site.siteCode ? site.siteCode : ""}</p>
              </td>
              <td>
                <p className="mb-0">{site.siteName ? site.siteName : ""}</p>
              </td>
              <td>
                <p className="mb-0">{site.website ? site.website : ""}</p>
              </td>
              <td>
                {/* <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p
                        style={{ textAlign: "left" }}
                        className="mb-0"
                      >
                        {site.email1 ? site.email1 : ""}
                      </p>
                    </Tooltip>
                  }
                > */}
                <p className="mb-0">
                  <TooltipWrapper
                    id={`email-${site.siteId}`}
                    placement="bottom"
                    text={site.email1}
                    content={site.email1}
                  ></TooltipWrapper>
                </p>
                {/* </OverlayTrigger> */}
              </td>
              {/* <div className='companySites-row-lg'>
                <p>{site.city ? site.city : 'city'}</p>
              </div> */}
              {/* <div className='companySites-row-md'>
                <p>{site.postCode ? site.postCode : 'postname'}</p>
              </div> */}
              <td>
                <p className="mb-0">
                  {site.activatedDate ? formatDateFunc(site.activatedDate) : ""}
                </p>
              </td>
              <td>
                <p className="mb-0">
                  {site.deactivatedDate
                    ? formatDateFunc(site.deactivatedDate)
                    : ""}
                </p>
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="companySites-tableContainer" style={{ display: "none" }}>
        <div className="companySites-tableDiv">
          <div className="companySites-tableHeader">
            <div className="companySites-tableCol-sm">
              <p>Edit</p>
            </div>
            <div className="companySites-tableCol-sm">
              <p>Active Status</p>
            </div>
            <div className="companySites-tableCol-md">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("siteCode")}
              >
                <p>Site Code</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "siteCode" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "siteCode" ? (
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
                className="companySites-inputFilter"
                name="siteCode"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("siteName")}
              >
                <p>Site Name</p>
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
                className="companySites-inputFilter"
                name="siteName"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("website")}
              >
                <p>Website</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "website" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "website" ? (
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
                className="companySites-inputFilter"
                name="website"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            <div className="companySites-tableCol-lg">
              <div
                className="companySites-labelDiv"
                onClick={() => sortFunc("email1")}
              >
                <p>Email</p>
                <div className="associatedContacts-label-btn">
                  {sortOrder === "asc" && sortField === "email1" ? (
                    <img
                      src={upArrowColoured}
                      alt="asc"
                      className="label-btn-img-1"
                    />
                  ) : (
                    <img src={upArrow} alt="asc" className="label-btn-img-1" />
                  )}
                  {sortOrder === "desc" && sortField === "email1" ? (
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
                className="companySites-inputFilter"
                name="email1"
                onChange={handleFilter}
                autoComplete="off"
              />
            </div>
            {/* <div className='companySites-tableCol-lg'>
              <div className='companySites-labelDiv'>
                <p>Suburb</p>
              </div>
              <input
                type='text'
                className='companySites-inputFilter'
                name='city'
                onChange={handleFilter}
              />
            </div> */}
            {/* <div className='companySites-tableCol-md'>
              <div className='companySites-labelDiv'>
                <p>Post Code</p>
              </div>
              <input
                type='text'
                className='companySites-inputFilter'
                name='postCode'
                onChange={handleFilter}
              />
            </div> */}
            <div className="companySites-tableCol-md">
              <div className="companySites-labelDiv">
                <p>Date Active</p>
              </div>
              {/* <input type='text' className='companySites-inputFilter' /> */}
            </div>
            <div className="companySites-tableCol-lg">
              <div className="companySites-labelDiv">
                <p>Date Deactivated</p>
              </div>
              {/* <input type='text' className='companySites-inputFilter' /> */}
            </div>
          </div>
          {filteredData?.map((site) => (
            <div
              className="companySites-rowDiv pe-cursor"
              key={site.siteId}
              onClick={() => handleEdit(site.siteId)}
            >
              <div className="companySites-row-sm">
                <button
                  className="companySites-editBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(site.siteId);
                  }}
                >
                  <BiEditAlt className="companySites-editIcon" />
                </button>
              </div>
              <div className="companySites-row-sm">
                {" "}
                <ToggleSwitch
                  checked={site.activeStatus}
                  handleFunc={() => handleActiveStatus(site)}
                />{" "}
              </div>
              <div className="companySites-row-md">
                <p>{site.siteCode ? site.siteCode : ""}</p>
              </div>
              <div className="companySites-row-lg">
                <p>{site.siteName ? site.siteName : ""}</p>
              </div>
              <div className="companySites-row-lg">
                <p>{site.website ? site.website : ""}</p>
              </div>
              <div className="companySites-row-lg">
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p style={{ textAlign: "left" }}>
                        {site.email1 ? site.email1 : ""}
                      </p>
                    </Tooltip>
                  }
                >
                  <p>{convertSubstring(site.email1)}</p>
                </OverlayTrigger>
              </div>
              {/* <div className='companySites-row-lg'>
                <p>{site.city ? site.city : 'city'}</p>
              </div> */}
              {/* <div className='companySites-row-md'>
                <p>{site.postCode ? site.postCode : 'postname'}</p>
              </div> */}
              <div className="companySites-row-md">
                <p>
                  {site.activatedDate ? formatDateFunc(site.activatedDate) : ""}
                </p>
              </div>
              <div className="companySites-row-lg">
                <p>
                  {site.deactivatedDate
                    ? formatDateFunc(site.deactivatedDate)
                    : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showAdd && (
        <Modal
          isOpen={showAdd}
          toggle={() => setShowAdd(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setShowAdd(false)}
            className="bg-light p-3"
          >
            Add New Site
          </ModalHeader>
          <ModalBody>
            <AddNewSite
              setShowAdd={setShowAdd}
              refreshData={refreshData}
              accTypeList={accTypeList}
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
            Edit New Site
          </ModalHeader>
          <ModalBody>
            <EditSiteInfo
              setShowEdit={setShowEdit}
              selectedSite={selectedSite}
              refreshData={refreshData}
              accTypeList={accTypeList}
            />
          </ModalBody>
        </Modal>
      )}

      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default CompanySites;
