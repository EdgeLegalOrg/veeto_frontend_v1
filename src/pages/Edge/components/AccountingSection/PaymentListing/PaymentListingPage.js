import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import { allPaymentList } from "../../../apis";
import LoadingPage from "../../../utils/LoadingPage";
import { toast } from "react-toastify";
import PaymentTable from "./PaymentTable";
import Pagination from "../../Pagination";

const initialFilters = {
  paymentNumber: "",
  paymentType: "",
  createdOn: "",
  amount: "",
  status: "",
  matterNumber: "",
  createdBy: "",
  sortOn: "",
  sortType: "",
  pageNo: 0,
  pageSize: 25,
};

const PaymentListPage = (props) => {
  document.title = "Payments | EdgeLegal";
  const [list, setList] = useState([]);
  const [groupTotalAmountMap, setGroupTotalAmountMap] = useState({});
  const [groupSplitDetailsMap, setGroupSplitDetailsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterInput, setFilterInput] = useState(initialFilters);

  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async (filter = filterInput) => {
    try {
      setLoading(true);
      const { data } = await allPaymentList(filter);
      if (data.success) {
        setList(data?.data?.paymentList || []);
        setGroupTotalAmountMap(data?.data?.groupTotalAmountMap || {});
        setGroupSplitDetailsMap(data?.data?.groupSplitDetailsMap || {});
        setTotalPages(data?.metadata?.page?.totalPages || 1);
        setTotalRecords(data?.metadata?.page?.totalRecords || 0);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setPageNo(0);
    setPageSize(25);
    fetchList(initialFilters);
    setFilterInput(initialFilters);
  };

  const handlePreviousPage = () => {
    let pg = pageNo - 1;
    setPageNo(pg);
    fetchList({ ...filterInput, pageNo: pg });
  };

  const handleNextPage = () => {
    let pg = pageNo + 1;
    setPageNo(pg);
    fetchList({ ...filterInput, pageNo: pg });
  };

  const handleJumpToPage = (num) => {
    setPageNo(num - 1);
    fetchList({ ...filterInput, pageNo: num - 1 });
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

    fetchList({ ...filterInput, pageNo: tempPageNo, pageSize: currSize });
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Payments" pageTitle="Payments" />
        <Card>
          <div className="bg-light d-flex align-items-center justify-content-between p-2">
            <h5 className="mb-0">Payments</h5>
          </div>
          <PaymentTable
            list={list}
            groupTotalAmountMap={groupTotalAmountMap}
            groupSplitDetailsMap={groupSplitDetailsMap}
            filterInput={filterInput}
            setFilterInput={setFilterInput}
            handleRefresh={fetchList}
            handleResetFilter={handleResetFilter}
          />
          <div className="m-2">
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
          {loading && <LoadingPage />}
        </Card>
      </Container>
    </div>
  );
};

export default PaymentListPage;
