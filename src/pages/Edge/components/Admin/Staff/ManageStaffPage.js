import React, { Fragment, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
  allStaffMember,
  editStaffDetails,
  getMemberDetails,
} from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import StaffMemberDetails from "./StaffMemberDetails";
import "../../../stylesheets/ManageStaffPage.css";
import AddNewStaff from "./AddNewStaff";
import StaffTable from "./StaffTable";
import Pagination from "../../Pagination";
import { toast } from "react-toastify";
// Actions
import { resetCurrentRouterState } from "../../../../../slices/thunks";

const initialFilter = {
  emailId1: "",
  roleName: "",
  firstName: "",
  lastName: "",
  userName: "",
  phoneNumber1: "",
  staffActive: true,
  sortOn: "",
  sortType: "",
  pageNo: 0,
  pageSize: 25,
};

const ManageStaffPage = () => {
  document.title = "Staff | EdgeLegal";
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentRouterState } = useSelector((state) => state.Layout);
  const [staffList, setStaffList] = useState([]);
  const [memberDetails, setMemberDetails] = useState(null);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [filterInput, setFilterInput] = useState(initialFilter);
  const [peopleShow, setPeopleShow] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [boolVal, setBoolVal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMember = async () => {
    setLoading(true);
    try {
      const { data } = await allStaffMember(filterInput);
      if (data.success) {
        setStaffList(data?.data?.staffMemberList);
        setFilteredList(data?.data?.staffMemberList);
        setTotalPages(data?.metadata?.page?.totalPages);
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

  useEffect(() => {
    if (!boolVal) {
      fetchMember();
      setBoolVal(true);
    }
  }, [boolVal]);

  useEffect(() => {
    if (currentRouterState) {
      setMemberDetails(null);
      dispatch(resetCurrentRouterState());
    }
  }, [currentRouterState]);

  const showAddPeople = () => {
    setPeopleShow(true);
  };

  function handleClose() {
    setPeopleShow(false);
  }

  const handleShowDetail = (id) => {
    fetchMemberDetails(id);
  };

  const filterData = (search) => {
    const newData = staffList.filter((obj) =>
      `${obj.firstName} ${obj.lastName}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );
    setFilteredList(newData);
  };

  const handleRefreshList = async (filters = filterInput) => {
    setLoading(true);
    try {
      const { data } = await allStaffMember(filters);
      if (data.success) {
        setStaffList(data.data.staffMemberList);
        setFilteredList(data.data.staffMemberList);
        setTotalPages(data?.metadata?.page?.totalPages);
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

  const handleToggleState = async () => {
    try {
      setLoading(true);
      const formData = {
        ...memberDetails,
        staffActive: !memberDetails.staffActive,
      };
      const { data } = await editStaffDetails(formData);
      if (data.success) {
        fetchMemberDetails(formData.id);
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

  const fetchMemberDetails = async (id) => {
    setLoading(true);
    try {
      const { data } = await getMemberDetails(id);
      if (data.success) {
        setMemberDetails(data.data);
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

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Staff" pageTitle="Admin" />
          <Card>
            {memberDetails === null ? (
              <div className="">
                <div className="bg-light d-flex align-items-center justify-content-between p-2">
                  <h5 className="mb-0">Roles</h5>
                  <Button
                    color="success"
                    onClick={showAddPeople}
                    className="d-flex"
                  >
                    <span className="plusdiv">+</span> Add
                  </Button>
                </div>
                <StaffTable
                  staffList={staffList}
                  filterInput={filterInput}
                  setFilterInput={setFilterInput}
                  selectedStaff={selectedStaff}
                  setSelectedStaff={setSelectedStaff}
                  handleShow={handleShowDetail}
                  handleRefreshList={handleRefreshList}
                  initialFilter={initialFilter}
                />
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
              </div>
            ) : (
              <StaffMemberDetails
                memberDetails={memberDetails}
                handleClose={() => setMemberDetails(null)}
                handleToggleState={handleToggleState}
                setMemberDetails={setMemberDetails}
                fetchMember={fetchMember}
                fetchMemberDetails={fetchMemberDetails}
              />
            )}
            {loading && <LoadingPage />}
            <div>
              {peopleShow && (
                <Modal
                  isOpen={peopleShow}
                  toggle={() => handleClose()}
                  backdrop="static"
                  scrollable={true}
                  size="lg"
                  centered
                >
                  <ModalHeader
                    toggle={() => handleClose()}
                    className="bg-light p-3"
                  >
                    Add New Staff
                  </ModalHeader>
                  <ModalBody>
                    <AddNewStaff
                      close={handleClose}
                      allCountries={JSON.parse(
                        window.localStorage.getItem("countryList")
                      )}
                      postalList={JSON.parse(
                        window.localStorage.getItem("postalList")
                      )}
                      refresh={fetchMember}
                    />
                  </ModalBody>
                </Modal>
              )}
            </div>
          </Card>
        </Container>
      </div>
    </Fragment>
  );
};

export default ManageStaffPage;
