import React, { Fragment, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Container, Card, CardBody, Table, Button, Input } from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import {
  getAllBaseTemplates,
  getAllUsers,
  getCompanyInfo,
  getRoles,
  getUserDetail,
  updateUserInfo,
  userRoleDetails,
} from "../../../apis";
import { BsArchiveFill } from "react-icons/bs";
import { HiLockClosed, HiLockOpen, HiPlus } from "react-icons/hi";
import { AiOutlineMail } from "react-icons/ai";
import UserTable from "./UserTable";
import AddNewUser from "./AddNewUser";
import UpdateUser from "./UpdateUser";
import Pagination from "../../Pagination";
import LoadingPage from "../../../utils/LoadingPage";
import userIcon from "../../../images/userIcon.JPG";
import yellowContact from "../../../images/yellowContact.JPG";
import briefCase from "../../../images/briefCase.JPG";
import "../../../stylesheets/ManageUserPage.css";
import { toast } from "react-toastify";
// Actions
import { resetCurrentRouterState } from "../../../../../slices/thunks";

const initialFilter = {
  userName: "",
  firstName: "",
  lastName: "",
  locked: false,
  sortOn: "",
  sortType: "",
  pageNo: 0,
  pageSize: 25,
};

const ManageUserPage = () => {
  document.title = "User Security | EdgeLegal";
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentRouterState } = useSelector((state) => state.Layout);
  const [purpose, setPurpose] = useState("");
  const [userList, setUserList] = useState([]);
  const [siteList, setSiteList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [filterInput, setFilterInput] = useState(initialFilter);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedUser, setSelectedUser] = useState([]);
  const [userDetail, setUserDetail] = useState(null);
  const [linkedRoles, setLinkedRoles] = useState([]);
  const [updateUserDetail, setUpdateUserDetail] = useState(null);
  const [templateList, setTemplateList] = useState([]);

  const parseList = (data) => {
    let arr = [];

    data.forEach((d) => {
      arr.push({ display: d.name, value: d.id });
    });

    setTemplateList(arr);
  };

  const fetchTemplate = async () => {
    try {
      const { data } = await getAllBaseTemplates();
      if (data.success) {
        parseList(data.data.templateList);
      } else {
        toast.error("Something went wrong in fetching templates.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSiteList = async () => {
    try {
      const { data } = await getCompanyInfo();
      if (data.success) {
        let sites = data?.data?.siteInfoList;
        if (sites && sites?.length > 0) {
          let arr = [];
          sites.forEach((s) => {
            if (s.activeStatus) {
              arr.push({ display: s.siteName, value: s.siteId });
            }
          });
          setSiteList(arr);
        }
      } else {
        toast.error("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await getRoles();
      if (data.success) {
        let roles = data?.data?.applicationRoleList;
        if (roles && roles?.length > 0) {
          let arr = [];
          roles.forEach((r) => {
            arr.push({ display: r.roleName, value: r.id });
          });
          setRoleList(arr);
        }
      } else {
        toast.error("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers(filterInput);
      if (data.success) {
        setUserList(data.data.userLoginList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data.metadata.page.totalRecords);
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPageData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSiteList(),
        fetchRoles(),
        fetchUsers(),
        fetchTemplate(),
      ]);
    } catch (error) {
      console.error("error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  useEffect(() => {
    if (currentRouterState) {
      handleCloseRight();
      dispatch(resetCurrentRouterState());
    }
  }, [currentRouterState]);

  const handleRightSide = () => {
    const rightSide = document.querySelector("#user-right");
    const leftSide = document.querySelector("#user-left");
    rightSide.classList.remove("user-hide");
    rightSide.classList.add("user-show");
    leftSide.style.width = "65%";
    leftSide.style.overflowX = "auto";
  };

  const handleCloseRight = () => {
    setPurpose("");
    const rightSide = document.querySelector("#user-right");
    const leftSide = document.querySelector("#user-left");
    rightSide.classList.remove("user-show");
    rightSide.classList.add("user-hide");
    leftSide.style.width = "100%";

    setLinkedRoles([]);
    setUpdateUserDetail(null);
  };

  const handleAddRole = () => {
    setPurpose("add");
    handleRightSide();
  };

  const handleUpdateRole = async (id, hardRefresh = false) => {
    try {
      if (!hardRefresh) {
        handleCloseRight();
      }
      setLoading(true);
      const { data } = await getUserDetail(id);
      const res = await userRoleDetails(id);
      setUserDetail(data);
      setUpdateUserDetail(res.data.data);
      setLinkedRoles(res?.data?.data?.siteRoleList);
      setTimeout(() => {
        setPurpose("update");
        handleRightSide();
      }, 10);
      setLoading(false);
    } catch (error) {
      handleCloseRight();
      setLoading(false);
      console.error(error);
    }
  };

  const handleRefreshList = async (filters = filterInput) => {
    setLoading(true);
    setFilterInput({ ...filterInput, ...filters });
    try {
      const { data } = await getAllUsers(filters);
      if (data.success) {
        setUserList(data.data.userLoginList);
        setTotalPages(data.metadata.page.totalPages);
        setTotalRecords(data?.metadata?.page?.totalRecords);
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

  const handleLockStatus = async (status) => {
    if (selectedUser?.length === 1) {
      setLoading(true);
      let obj = userList.find((d) => d.id === selectedUser[0]);
      try {
        const { data } = await updateUserInfo({ ...obj, locked: status });
        if (data.success) {
          handleRefreshList();
        } else {
          toast.error("Something went wrong please try later.");
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    } else {
      toast.warning("Select one user at a time.");
    }
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="User Security" pageTitle="Admin" />
          <Card>
            <div className="bg-light d-flex align-items-center justify-content-between p-2">
              <div className="d-flex align-items-center">
                <div className="user-pageIconDiv">
                  <img
                    src={userIcon}
                    className="user-pageIcon-big"
                    alt="pageicon"
                  />
                </div>
                <div className="">
                  <p className="mb-0">User Security</p>
                  <p className="mb-0">Users</p>
                </div>
              </div>
            </div>
            <div className="user-pageHeadContainer" style={{ display: "none" }}>
              <div className="user-pageIconDiv">
                <img
                  src={userIcon}
                  className="user-pageIcon-big"
                  alt="pageicon"
                />
              </div>
              <div className="user-pageNameDiv">
                <p className="user-pageName-1">User Security</p>
                <p className="user-pageName-2">Users</p>
              </div>
              {/* <button className="user-pageIconBtn">
                <img
                  src={yellowContact}
                  alt="active-user"
                  className="user-pageIcon"
                />
              </button>
              <button className="user-pageIconBtn user-iconBorder">
                <img
                  src={briefCase}
                  alt="archive-user"
                  className="user-pageIcon"
                />
              </button> */}
            </div>
            <div className="user-containerDiv">
              <div id="user-left" className="user-leftDiv">
                <div className="bg-light d-flex align-items-center justify-content-end border p-2">
                  <Button
                    className="d-flex mx-1"
                    onClick={handleAddRole}
                    color="success"
                  >
                    <HiPlus className="user-btnIcon" />
                    Add User
                  </Button>
                  {/* <button
                    className="user-headerBtn"
                    disabled={selectedUser?.length === 0}
                  >
                    <BsArchiveFill className="user-btnIcon" />
                    Archive User
                  </button> */}
                  <Button
                    className="d-flex mx-1"
                    disabled={selectedUser?.length === 0}
                    onClick={() => handleLockStatus(true)}
                    color="success"
                  >
                    <HiLockClosed className="user-bigIcon" />
                    Lock User
                  </Button>
                  <Button
                    className="d-flex mx-1"
                    disabled={selectedUser?.length === 0}
                    onClick={() => handleLockStatus(false)}
                    color="success"
                  >
                    <HiLockOpen className="user-bigIcon" />
                    Unlock User
                  </Button>
                  <Button
                    className="d-flex mx-1"
                    disabled={selectedUser?.length === 0}
                    color="success"
                  >
                    <AiOutlineMail className="user-bigIcon" />
                    Send Logon Info
                  </Button>
                </div>
                <UserTable
                  handleUpdateRole={handleUpdateRole}
                  userList={userList}
                  handleRefreshList={handleRefreshList}
                  filterInput={filterInput}
                  setFilterInput={setFilterInput}
                  setSelectedUser={setSelectedUser}
                  selectedUser={selectedUser}
                />
                {userList.length > 0 && (
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
              </div>
              <div id="user-right" className="user-hide">
                {purpose === "add" && (
                  <AddNewUser
                    handleCloseRight={handleCloseRight}
                    fetchUsers={fetchUsers}
                    siteList={siteList}
                    roleList={roleList}
                    templateList={templateList}
                    setLoading={setLoading}
                  />
                )}
                {purpose === "update" && (
                  <UpdateUser
                    handleUpdateRole={handleUpdateRole}
                    handleCloseRight={handleCloseRight}
                    fetchUsers={fetchUsers}
                    userDetail={userDetail}
                    siteList={siteList}
                    roleList={roleList}
                    linkedRoles={linkedRoles}
                    setLoading={setLoading}
                    templateList={templateList}
                    updatedUserDetails={updateUserDetail}
                  />
                )}
              </div>
            </div>
            {loading && <LoadingPage />}
          </Card>
        </Container>
      </div>
    </Fragment>
  );
};

export default ManageUserPage;
