import React, { Fragment, useState, useEffect } from "react";
import {
  Container,
  Card,
  CardBody,
  Table,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import {
  createRole,
  getRoles,
  particularRole,
  updateRole,
  deleteRole,
} from "../../../apis";
import upArrow from "../../../images/upArrow.svg";
import downArrow from "../../../images/downArrow.svg";
import downArrowColoured from "../../../images/downArrowColoured.svg";
import upArrowColoured from "../../../images/upArrowColoured.svg";
import { MdFilterAltOff, MdSearch } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import RoleType from "./RoleType";
import LoadingPage from "../../../utils/LoadingPage";
import { AlertPopup } from "../../customComponents/CustomComponents";

import "../../../stylesheets/ManageRolePage.css";
import Pagination from "../../Pagination";
import { toast } from "react-toastify";

const initialData = {
  roleName: "",
  description: "",
};

const initialFilter = {
  roleName: "",
  description: "",
  sortOn: "",
  sortType: "",
  pageNo: 0,
  pageSize: 25,
};

const ManageRolePage = () => {
  document.title = "Roles | EdgeLegal";
  const [labelSort, setLabelSort] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [sortField, setSortField] = useState("");
  const [purpose, setPurpose] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [formData, setFormData] = useState(initialData);
  const [roleList, setRoleList] = useState([]);
  const [filterInput, setFilterInput] = useState(initialFilter);
  const [rightList, setRightList] = useState([]);
  const [selectedRights, setSelectedRights] = useState([]);
  const [boolVal, setBoolVal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const handleClearFilter = () => {
    setFilterInput(initialFilter);

    setTimeout(() => {
      handleRefresh(initialFilter);
    }, 10);
  };

  const fetchRightList = () => {
    let contentList = window.localStorage.getItem("rightList");
    if (contentList) {
      setRightList(JSON.parse(contentList));
    }
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data } = await getRoles(filterInput);
      if (data.success) {
        setRoleList(data.data.applicationRoleList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data.metadata.page.totalRecords);
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const fetchParticularRole = async (id) => {
    setLoading(true);
    try {
      const { data } = await particularRole(id);
      if (data.success) {
        setFormData(data.data);
        let newList = [];
        data?.data?.applicationRightDetailsList?.forEach((right) => {
          newList.push(right.id);
        });
        setSelectedRights(newList);
        handleUpdateRole();
      } else {
        toast.error("Some error occured! Please try later");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!boolVal) {
      fetchRoles();
      fetchRightList();
      setBoolVal(true);
    }
  }, [boolVal]);

  const handleRightSide = () => {
    const rightSide = document.querySelector("#role-right");
    const leftSide = document.querySelector("#role-left");
    rightSide.classList.remove("role-hide");
    rightSide.classList.add("role-show");
    leftSide.style.width = "58%";
  };

  const handleCloseRight = () => {
    setPurpose("");
    setFormData(initialData);
    setSelectedRights([]);
    const rightSide = document.querySelector("#role-right");
    const leftSide = document.querySelector("#role-left");
    rightSide.classList.remove("role-show");
    rightSide.classList.add("role-hide");
    leftSide.style.width = "100%";
  };

  const handleRefresh = async (filters = filterInput) => {
    setLoading(true);
    setFilterInput({ ...filterInput, ...filters });
    try {
      const { data } = await getRoles(filters);
      if (data.success) {
        setRoleList(data.data.applicationRoleList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data?.metadata?.page?.totalRecords);
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleSortByLabel = (field) => {
    if (labelSort !== field) {
      setLabelSort(field);
      setSortOrder("asc");
      setSortField(field);
      handleRefresh({ ...filterInput, sortOn: field, sortType: "ASC" });
    } else {
      setLabelSort("");
      setSortOrder("desc");
      setSortField(field);
      handleRefresh({ ...filterInput, sortOn: field, sortType: "DESC" });
    }
  };

  const handleAddRole = () => {
    setPurpose("add");
    setFormData(initialData);
    setSelectedRights([]);
    handleRightSide();
  };

  const handleUpdateRole = () => {
    setPurpose("update");
    handleRightSide();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    let newRights = [];

    selectedRights.forEach((r) => {
      newRights.push({ id: r });
    });

    let roleData = {
      ...formData,
      applicationRightDetailsList: newRights,
    };

    try {
      if (purpose === "add") {
        const { data } = await createRole(roleData);
        if (data.success) {
          handleCloseRight();
          fetchRoles();
        } else {
          toast.error(
            "There is some problem from server side, please try later."
          );
        }
      }
      // when purpose===update
      else {
        const { data } = await updateRole(roleData);
        if (data.success) {
          // fetchParticularRole(roleData.id);
          fetchRoles();
        } else {
          toast.error(
            "There is some problem from server side, please try later."
          );
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleOpenAlert = () => {
    setOpenAlert(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    const id = formData.id;
    try {
      const { data } = await deleteRole(id);
      if (data.success) {
        handleCloseRight();
        fetchRoles();
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
  };

  const handlePreviousPage = () => {
    let pg = pageNo - 1;
    setPageNo(pg);

    handleRefresh({ ...filterInput, pageNo: pg });
  };

  const handleNextPage = () => {
    let pg = pageNo + 1;
    setPageNo(pg);

    handleRefresh({ ...filterInput, pageNo: pg });
  };

  const handleJumpToPage = (num) => {
    setPageNo(num - 1);
    handleRefresh({ ...filterInput, pageNo: num - 1 });
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

    handleRefresh({ ...filterInput, pageNo: tempPageNo, pageSize: currSize });
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Roles" pageTitle="Admin" />
          <Card>
            <div className="bg-light d-flex align-items-center justify-content-between p-2">
              <h5 className="mb-0">Roles</h5>
              <Button
                color="success"
                onClick={handleAddRole}
                className="d-flex"
              >
                <span className="plusdiv">+</span> Add
              </Button>
            </div>

            <div className="role-containerDiv">
              <div id="role-left" className="role-leftDiv">
                <Table responsive={true} striped={true} hover={true}>
                  <thead className="mb-2">
                    <tr>
                      <th>
                        <div
                          className="d-flex justify-content-between"
                          onClick={() => handleSortByLabel("roleName")}
                        >
                          <p>Role Name</p>
                          <div className="associatedContacts-label-btn labelCursor">
                            {sortOrder === "asc" && sortField === "roleName" ? (
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
                            sortField === "roleName" ? (
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
                          name="roleName"
                          placeholder="Role Name"
                          value={filterInput.roleName}
                          onChange={handleChangeFilter}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleRefresh()
                          }
                        />
                      </th>
                      <th>
                        <div
                          className="d-flex justify-content-between"
                          onClick={() => handleSortByLabel("description")}
                        >
                          <p>Description</p>
                          <div className="associatedContacts-label-btn labelCursor">
                            {sortOrder === "asc" &&
                            sortField === "description" ? (
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
                            sortField === "description" ? (
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
                          name="description"
                          placeholder="Description"
                          value={filterInput.description}
                          onChange={handleChangeFilter}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleRefresh()
                          }
                        />
                      </th>
                      <th className="align-bottom">
                        <div className="d-flex justify-content-end">
                          <Button
                            type="button"
                            color="success"
                            className="mx-1"
                            onClick={handleRefresh}
                          >
                            <MdSearch size={18} />
                          </Button>
                          <Button
                            type="button"
                            color="danger"
                            className="mx-1"
                            onClick={handleClearFilter}
                          >
                            <MdFilterAltOff size={18} />
                          </Button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleList.map((role) => (
                      <tr
                        key={role.id}
                        onClick={() => fetchParticularRole(role.id)}
                        className="pe-cursor"
                      >
                        <td>
                          <p className="mb-0">{`${role.roleName}`}</p>
                        </td>
                        <td>
                          <p className="mb-0">{`${role.description}`}</p>
                        </td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {roleList.length > 0 && (
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
                {/* <div className="topStrip-style">
                  <p className="topStrip-heading">Roles</p>
                  <button
                    className="custodyAddbtn"
                    onClick={handleAddRole}
                  >
                    <span className="plusdiv">+</span> Add
                  </button>
                </div> */}
                <div className="role-filterDiv" style={{ display: "none" }}>
                  <div className="role-nameDiv">
                    <div
                      className="role-label"
                      onClick={() => handleSortByLabel("roleName")}
                    >
                      <p>Role Name</p>
                      <div className="associatedContacts-label-btn labelCursor">
                        {sortOrder === "asc" && sortField === "roleName" ? (
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
                        {sortOrder === "desc" && sortField === "roleName" ? (
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
                    <div className="role-filterInputDiv">
                      <input
                        className="role-filterInput"
                        type="text"
                        value={filterInput.roleName}
                        name="roleName"
                        onChange={handleChangeFilter}
                        onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                      />
                    </div>
                  </div>
                  <div className="role-descDiv">
                    <div
                      className="role-label"
                      onClick={() => handleSortByLabel("description")}
                    >
                      <p>Description</p>
                      <div className="associatedContacts-label-btn labelCursor">
                        {sortOrder === "asc" && sortField === "description" ? (
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
                        {sortOrder === "desc" && sortField === "description" ? (
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
                    <div className="role-filterInputDiv">
                      <input
                        className="role-filterInput"
                        type="text"
                        value={filterInput.description}
                        name="description"
                        onChange={handleChangeFilter}
                        onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                      />
                    </div>
                  </div>
                  <div className="role-searchIconDiv">
                    <button className="searchButton" onClick={handleRefresh}>
                      <MdSearch size={25} />
                    </button>
                  </div>
                  <div className="role-searchIconDiv">
                    <button
                      className="searchButton"
                      onClick={handleClearFilter}
                    >
                      <AiOutlineClose size={25} />
                    </button>
                  </div>
                </div>
                <div className="role-listContainer" style={{ display: "none" }}>
                  {roleList.map((role) => (
                    <div
                      className="role-listDiv pe-cursor"
                      key={role.id}
                      onClick={() => fetchParticularRole(role.id)}
                    >
                      <p className="role-namePara">{`${role.roleName} `}</p>
                      <p className="role-descPara">{`${role.description} `}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: "none" }}>
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
              </div>

              <div id="role-right" className="role-hide">
                <div className="bg-light p-2 d-flex border">
                  <Button
                    className="mx-1"
                    onClick={handleSaveRole}
                    color="success"
                  >
                    Save
                  </Button>
                  {purpose === "update" && (
                    <Button
                      className="mx-1"
                      onClick={handleOpenAlert}
                      color="danger"
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    className="mx-1"
                    onClick={handleCloseRight}
                    color="warning"
                  >
                    Cancel
                  </Button>
                </div>
                <div className="role-rightContainer border">
                  <div className="role-createDiv">
                    <div className="role-createContent createSmall">
                      <span>Name</span>
                      <Input
                        type="text"
                        name="roleName"
                        placeholder="Role Name"
                        bsSize="sm"
                        value={formData.roleName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="role-createContent createLarge">
                      <span>Description</span>
                      <Input
                        type="text"
                        name="description"
                        placeholder="Role Name"
                        bsSize="sm"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="role-typeDiv">
                    <RoleType
                      rightList={rightList}
                      handleChange={handleChange}
                      formData={formData}
                      selectedRights={selectedRights}
                      setSelectedRights={setSelectedRights}
                    />
                  </div>
                </div>
              </div>
            </div>

            {loading && <LoadingPage />}

            {openAlert && (
              <Modal
                isOpen={openAlert}
                toggle={() => setOpenAlert(false)}
                backdrop="static"
                scrollable={true}
                size="md"
                centered
              >
                <ModalHeader
                  toggle={() => setOpenAlert(false)}
                  className="bg-light p-3"
                >
                  Confirm Your Action
                </ModalHeader>
                <ModalBody>
                  <AlertPopup
                    message="Are you sure you want to delete the record?"
                    heading="Confirm Your Action"
                    closeForm={() => setOpenAlert(false)}
                    btn1={"No"}
                    btn2="Yes"
                    handleFunc={handleDelete}
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

export default ManageRolePage;
